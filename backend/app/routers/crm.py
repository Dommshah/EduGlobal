"""Protected endpoints: applications, enquiries (CRM), tickets, contact inbox.

Authorization model:
- Students: see only their own applications; may add notes; cannot change
  application status or verify documents; cannot manage CRM enquiries.
- Employees: see applications assigned to them; manage their enquiry pipeline;
  update documents/status; answer tickets; handle contact inbox.
- Admins: full access.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_auth, require_role
from ..models import (
    Application,
    ApplicationEvent,
    ChatMessage,
    ContactMessage,
    Document,
    Enquiry,
    Ticket,
    User,
)
from ..ratelimit import limiter

router = APIRouter(tags=["protected"])

DOC_CHECKLIST = ["Passport", "Transcripts", "IELTS/TOEFL", "SOP", "LOR x2", "Resume", "Bank statement"]

# Legal application status transitions. Students may only move backwards-safe
# self-service states; staff have the full map.
APP_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted", "rejected"},
    "submitted": {"documents", "reviewing", "rejected"},
    "documents": {"reviewing", "rejected"},
    "reviewing": {"offer", "rejected"},
    "offer": {"visa", "rejected"},
    "visa": {"enrolled", "rejected"},
    "enrolled": set(),
    "rejected": set(),
}
STUDENT_ALLOWED_STATUSES = {"submitted"}  # a student may only submit a draft

APP_STATUSES = set(APP_TRANSITIONS.keys())
ENQUIRY_STATUSES = {"new", "contacted", "qualified", "converted", "closed"}
DOC_STATUSES = {"pending", "received", "verified"}


class ApplicationIn(BaseModel):
    university_id: int = Field(gt=0)
    course_id: int = Field(gt=0)
    student_id: int | None = Field(default=None, gt=0)
    notes: str | None = Field(default=None, max_length=2000)


class ApplicationPatch(BaseModel):
    status: str | None = None
    notes: str | None = Field(default=None, max_length=2000)
    counselor_id: int | None = Field(default=None, gt=0)

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str | None) -> str | None:
        if v is not None and v not in APP_STATUSES:
            raise ValueError("invalid application status")
        return v


class DocumentPatch(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in DOC_STATUSES:
            raise ValueError("invalid document status")
        return v


class EnquiryIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=320)
    phone: str | None = Field(default=None, max_length=40)
    country_interest: str | None = Field(default=None, max_length=120)
    level: str | None = Field(default=None, max_length=60)
    intake: str | None = Field(default=None, max_length=60)
    message: str | None = Field(default=None, max_length=2000)
    source: str = Field(default="dashboard", max_length=60)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class EnquiryPatch(BaseModel):
    status: str | None = None
    phone: str | None = Field(default=None, max_length=40)
    country_interest: str | None = Field(default=None, max_length=120)
    level: str | None = Field(default=None, max_length=60)
    intake: str | None = Field(default=None, max_length=60)
    message: str | None = Field(default=None, max_length=2000)
    claim: bool = False

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str | None) -> str | None:
        if v is not None and v not in ENQUIRY_STATUSES:
            raise ValueError("invalid enquiry status")
        return v


class TicketIn(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=5, max_length=4000)
    priority: str = Field(default="normal", max_length=20)

    @field_validator("priority")
    @classmethod
    def valid_priority(cls, v: str) -> str:
        if v not in {"low", "normal", "urgent"}:
            raise ValueError("invalid priority")
        return v


class TicketPatch(BaseModel):
    status: str | None = None
    response: str | None = Field(default=None, max_length=4000)

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str | None) -> str | None:
        if v is not None and v not in {"open", "pending", "resolved"}:
            raise ValueError("invalid ticket status")
        return v


def _is_staff(user: User) -> bool:
    return user.role in ("employee", "admin")


def _visible_application_or_403(app: Application | None, user: User) -> Application:
    if not app:
        raise HTTPException(404, "Application not found")
    if user.role == "student" and app.student_id != user.id:
        raise HTTPException(404, "Application not found")  # 404, not 403: no existence leak
    if user.role == "employee" and app.counselor_id != user.id:
        raise HTTPException(404, "Application not found")
    return app


# ---------- Applications (students see own; staff sees assigned/all) ----------
@router.get("/applications")
def list_applications(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    q = db.query(Application)
    if user.role == "student":
        q = q.filter(Application.student_id == user.id)
    elif user.role == "employee":
        q = q.filter(Application.counselor_id == user.id)
    return q.order_by(Application.updated_at.desc()).all()


@router.post("/applications")
def create_application(payload: ApplicationIn, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    from ..models import Course, University

    uni = db.get(University, payload.university_id)
    course = db.get(Course, payload.course_id)
    if not uni or not course or course.university_id != uni.id:
        raise HTTPException(404, "University or course not found")

    if user.role == "student":
        student_id = user.id
        counselor_id = None
    else:
        # Staff may file on behalf of a student; the student must exist and be a student.
        student_id = payload.student_id or user.id
        target = db.get(User, student_id)
        if not target or target.role != "student":
            raise HTTPException(400, "student_id must reference an existing student account")
        counselor_id = user.id

    app = Application(
        student_id=student_id,
        university_id=uni.id,
        course_id=course.id,
        counselor_id=counselor_id,
        status="submitted",
        notes=payload.notes,
    )
    db.add(app)
    db.flush()
    db.add(
        ApplicationEvent(
            application_id=app.id,
            label="Application submitted",
            detail=f"{course.name} at {uni.name}",
        )
    )
    for kind in DOC_CHECKLIST:
        db.add(Document(application_id=app.id, kind=kind, status="pending"))
    db.commit()
    db.refresh(app)
    return app


@router.get("/applications/{app_id}")
def get_application(app_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    app = _visible_application_or_403(db.get(Application, app_id), user)
    return {
        **{c.name: getattr(app, c.name) for c in app.__table__.columns},
        "student": {"id": app.student.id, "name": app.student.name, "email": app.student.email}
        if app.student
        else None,
        "university": {"id": app.university.id, "name": app.university.name} if app.university else None,
        "course": {"id": app.course.id, "name": app.course.name} if app.course else None,
        "documents": app.documents,
        "timeline": app.timeline,
    }


@router.patch("/applications/{app_id}")
def update_application(
    app_id: int, payload: ApplicationPatch, user: User = Depends(require_auth), db: Session = Depends(get_db)
):
    app = _visible_application_or_403(db.get(Application, app_id), user)

    # Students may only append notes — never touch status or counselor.
    if user.role == "student":
        if payload.status is not None or payload.counselor_id is not None:
            raise HTTPException(403, "Students cannot change application status or counselor")
    else:
        if payload.status and payload.status != app.status:
            allowed = APP_TRANSITIONS.get(app.status, set())
            if payload.status not in allowed:
                raise HTTPException(
                    422,
                    f"Cannot move from '{app.status}' to '{payload.status}'. "
                    f"Allowed: {sorted(allowed) or 'none (terminal state)'}",
                )
            app.status = payload.status
            db.add(ApplicationEvent(application_id=app.id, label=f"Status → {payload.status}"))
        if payload.counselor_id is not None:
            counselor = db.get(User, payload.counselor_id)
            if not counselor or counselor.role not in ("employee", "admin"):
                raise HTTPException(400, "counselor_id must reference a staff account")
            app.counselor_id = payload.counselor_id
    if payload.notes is not None:
        app.notes = payload.notes
    db.commit()
    db.refresh(app)
    return app


@router.post("/applications/{app_id}/documents/{doc_id}")
def update_document(
    app_id: int,
    doc_id: int,
    payload: DocumentPatch,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    app = _visible_application_or_403(db.get(Application, app_id), user)
    # Only staff verify/receive documents. Students cannot self-verify.
    if not _is_staff(user):
        raise HTTPException(403, "Only counselors can update document status")
    doc = db.get(Document, doc_id)
    if not doc or doc.application_id != app_id:
        raise HTTPException(404, "Document not found")
    doc.status = payload.status
    db.commit()
    db.refresh(doc)
    return doc


# ---------- Enquiries (CRM pipeline) ----------
@router.get("/enquiries")
def list_enquiries(
    status: str | None = None,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    if status and status not in ENQUIRY_STATUSES:
        return []
    q = db.query(Enquiry)
    if user.role == "employee":
        q = q.filter(Enquiry.owner_id == user.id)
    if status:
        q = q.filter(Enquiry.status == status)
    return q.order_by(Enquiry.created_at.desc()).limit(200).all()


@router.post("/enquiries", dependencies=[Depends(limiter("enquiry-create", 20, 3600))])
def create_enquiry(payload: EnquiryIn, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    eq = Enquiry(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone,
        country_interest=payload.country_interest,
        level=payload.level,
        intake=payload.intake,
        message=payload.message,
        source=payload.source,
        status="new",
        owner_id=user.id if user.role == "employee" else None,
    )
    db.add(eq)
    db.commit()
    db.refresh(eq)
    return eq


@router.patch("/enquiries/{enquiry_id}")
def update_enquiry(
    enquiry_id: int, payload: EnquiryPatch, user: User = Depends(require_auth), db: Session = Depends(get_db)
):
    if user.role == "student":
        # Enquiry management is a staff function (checked before existence to avoid leaks).
        raise HTTPException(403, "Only staff can manage enquiries")
    eq = db.get(Enquiry, enquiry_id)
    if not eq:
        raise HTTPException(404, "Enquiry not found")
    if user.role == "employee" and eq.owner_id not in (None, user.id):
        raise HTTPException(404, "Enquiry not found")  # no existence leak across counselors
    for field in ("status", "phone", "country_interest", "level", "intake", "message"):
        value = getattr(payload, field)
        if value is not None:
            setattr(eq, field, value)
    if payload.claim and eq.owner_id is None:
        eq.owner_id = user.id
    db.commit()
    db.refresh(eq)
    return eq


# ---------- CRM stats for dashboard ----------
@router.get("/crm/summary")
def crm_summary(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    eq_q = db.query(Enquiry)
    app_q = db.query(Application)
    if user.role == "employee":
        eq_q = eq_q.filter(Enquiry.owner_id == user.id)
        app_q = app_q.filter(Application.counselor_id == user.id)
    elif user.role == "student":
        eq_q = eq_q.filter(Enquiry.owner_id == user.id)
        app_q = app_q.filter(Application.student_id == user.id)

    by_status = dict(eq_q.with_entities(Enquiry.status, func.count()).group_by(Enquiry.status).all())
    app_by_status = dict(app_q.with_entities(Application.status, func.count()).group_by(Application.status).all())
    total_eq = sum(by_status.values()) or 1
    converted = by_status.get("converted", 0)
    return {
        "enquiries": {"total": sum(by_status.values()), "by_status": by_status},
        "conversion_rate": round(converted / total_eq * 100, 1),
        "applications": {"total": sum(app_by_status.values()), "by_status": app_by_status},
        "new_enquiries": by_status.get("new", 0),
    }


# ---------- Tickets (support) ----------
@router.get("/tickets")
def list_tickets(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    q = db.query(Ticket)
    if user.role == "student":
        q = q.filter(Ticket.user_id == user.id)
    return q.order_by(Ticket.created_at.desc()).all()


@router.post("/tickets", dependencies=[Depends(limiter("ticket-create", 5, 3600))])
def create_ticket(payload: TicketIn, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    t = Ticket(user_id=user.id, subject=payload.subject.strip(), message=payload.message.strip(), priority=payload.priority)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch(
    "/tickets/{ticket_id}",
    dependencies=[Depends(require_role("employee", "admin"))],
)
def update_ticket(ticket_id: int, payload: TicketPatch, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    t = db.get(Ticket, ticket_id)
    if not t:
        raise HTTPException(404, "Ticket not found")
    if payload.status:
        t.status = payload.status
    if payload.response is not None:
        t.response = payload.response.strip()
    db.commit()
    db.refresh(t)
    return t


# ---------- Contact inbox (staff) ----------
@router.get("/contacts")
def contact_inbox(user: User = Depends(require_role("employee", "admin")), db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(200).all()


@router.patch("/contacts/{contact_id}")
def handle_contact(
    contact_id: int, payload: dict, user: User = Depends(require_role("employee", "admin")), db: Session = Depends(get_db)
):
    cm = db.get(ContactMessage, contact_id)
    if not cm:
        raise HTTPException(404, "Message not found")
    cm.handled = bool(payload.get("handled", True))
    db.commit()
    return cm


# ---------- My chat history (logged-in users) ----------
@router.get("/chat/history")
def chat_history(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at)
        .limit(100)
        .all()
    )
    return [{"role": m.role, "content": m.content, "created_at": m.created_at} for m in msgs]

"""Admin-only endpoints: user management, university catalog, platform analytics."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_role
from ..models import Application, ContactMessage, Country, Enquiry, Ticket, University, User

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_role("admin"))])

VALID_ROLES = {"student", "employee", "admin"}


class UserIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    role: str = "student"
    phone: str | None = Field(default=None, max_length=40)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError("invalid role")
        return v


class UserPatch(BaseModel):
    role: str | None = None
    name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_ROLES:
            raise ValueError("invalid role")
        return v


class UniversityIn(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    country_id: int = Field(gt=0)
    city: str | None = Field(default=None, max_length=120)
    world_rank: int | None = Field(default=None, ge=1, le=2000)
    type: str = Field(default="Public", max_length=60)
    featured: bool = False

    @field_validator("type")
    @classmethod
    def valid_type(cls, v: str) -> str:
        if v not in {"Public", "Private"}:
            raise ValueError("type must be Public or Private")
        return v


class UniversityPatch(BaseModel):
    featured: bool | None = None
    city: str | None = Field(default=None, max_length=120)
    world_rank: int | None = Field(default=None, ge=1, le=2000)
    type: str | None = None

    @field_validator("type")
    @classmethod
    def valid_type(cls, v: str | None) -> str | None:
        if v is not None and v not in {"Public", "Private"}:
            raise ValueError("type must be Public or Private")
        return v


def _count_admins(db: Session) -> int:
    return db.query(User).filter(User.role == "admin").count()


@router.get("/users")
def list_users(db: Session = Depends(get_db), role: str | None = None, q: str | None = None):
    query = db.query(User)
    if role in VALID_ROLES:
        query = query.filter(User.role == role)
    if q:
        if len(q) > 100:
            q = q[:100]
        like = f"%{q}%"
        query = query.filter(User.name.ilike(like) | User.email.ilike(like))
    return (
        query.with_entities(
            User.id,
            User.name,
            User.email,
            User.phone,
            User.role,
            User.created_at,
        )
        .order_by(User.created_at.desc())
        .limit(300)
        .all()
    )


@router.post("/users")
def create_user(payload: UserIn, db: Session = Depends(get_db)):
    from ..auth_utils import hash_password

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "Email already exists")
    user = User(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: UserPatch, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if payload.role and payload.role != user.role:
        # Never allow the platform to end up with zero admins.
        if user.role == "admin" and _count_admins(db) <= 1:
            raise HTTPException(400, "Cannot demote the last admin")
        user.role = payload.role
    if payload.name:
        user.name = payload.name.strip()
    if payload.phone is not None:
        user.phone = payload.phone
    db.commit()
    return {"id": user.id, "name": user.name, "role": user.role}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "admin" and _count_admins(db) <= 1:
        raise HTTPException(400, "Cannot delete the last admin")
    # Detach references instead of cascading deletes.
    db.query(Application).filter(Application.student_id == user_id).update({"student_id": None})
    db.query(Application).filter(Application.counselor_id == user_id).update({"counselor_id": None})
    db.query(Enquiry).filter(Enquiry.owner_id == user_id).update({"owner_id": None})
    db.delete(user)
    db.commit()
    return {"ok": True}


# ---------- University management ----------
@router.post("/universities")
def create_university(payload: UniversityIn, db: Session = Depends(get_db)):
    from ..seed import slugify

    if not db.get(Country, payload.country_id):
        raise HTTPException(404, "Country not found")
    slug = slugify(payload.name.strip())
    if db.query(University).filter(University.slug == slug).first():
        raise HTTPException(409, "A university with this name already exists")
    uni = University(
        name=payload.name.strip(),
        slug=slug,
        country_id=payload.country_id,
        city=(payload.city or "").strip() or None,
        world_rank=payload.world_rank,
        type=payload.type,
        description=f"{payload.name.strip()} partners with Eduglobal to welcome international students across its programs.",
        image_gradient="from-blue-700 to-indigo-900",
        featured=payload.featured,
    )
    db.add(uni)
    db.commit()
    db.refresh(uni)
    return uni


@router.patch("/universities/{uni_id}")
def update_university(uni_id: int, payload: UniversityPatch, db: Session = Depends(get_db)):
    uni = db.get(University, uni_id)
    if not uni:
        raise HTTPException(404, "University not found")
    if payload.featured is not None:
        uni.featured = payload.featured
    if payload.city:
        uni.city = payload.city.strip()
    if payload.world_rank is not None:
        uni.world_rank = payload.world_rank
    if payload.type:
        uni.type = payload.type
    db.commit()
    db.refresh(uni)
    return uni


@router.delete("/universities/{uni_id}")
def delete_university(uni_id: int, db: Session = Depends(get_db)):
    uni = db.get(University, uni_id)
    if not uni:
        raise HTTPException(404, "University not found")
    app_count = db.query(Application).filter(Application.university_id == uni_id).count()
    if app_count:
        raise HTTPException(400, f"Cannot delete: {app_count} applications reference this university")
    db.delete(uni)
    db.commit()
    return {"ok": True}


@router.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    users_by_role = dict(db.query(User.role, func.count()).group_by(User.role).all())
    enquiries_by_status = dict(db.query(Enquiry.status, func.count()).group_by(Enquiry.status).all())
    apps_by_status = dict(db.query(Application.status, func.count()).group_by(Application.status).all())

    # Applications per university (top 8)
    rows = (
        db.query(Application.university_id, func.count(Application.id))
        .filter(Application.university_id.isnot(None))
        .group_by(Application.university_id)
        .order_by(func.count(Application.id).desc())
        .limit(8)
        .all()
    )
    top_universities = [
        {"name": db.get(University, uid).name if uid else "—", "count": count} for uid, count in rows
    ]

    # Enquiries per country interest
    country_rows = (
        db.query(Enquiry.country_interest, func.count(Enquiry.id))
        .filter(Enquiry.country_interest.isnot(None), Enquiry.country_interest != "")
        .group_by(Enquiry.country_interest)
        .order_by(func.count(Enquiry.id).desc())
        .limit(8)
        .all()
    )

    total_enquiries = sum(enquiries_by_status.values()) or 1
    converted = enquiries_by_status.get("converted", 0)

    # Weekly signup trend (last 8 weeks) + recent signups
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    weekly: list[dict] = []
    recent_users: list[dict] = []
    for i in range(7, -1, -1):
        start = now - timedelta(weeks=i + 1)
        end = now - timedelta(weeks=i)
        count = db.query(User).filter(User.created_at >= start, User.created_at < end).count()
        weekly.append({"label": f"W-{i}", "count": count})
    for u in db.query(User).order_by(User.created_at.desc()).limit(8).all():
        recent_users.append(
            {"id": u.id, "name": u.name, "email": u.email, "role": u.role, "created_at": str(u.created_at)}
        )

    return {
        "users_by_role": users_by_role,
        "enquiries_by_status": enquiries_by_status,
        "applications_by_status": apps_by_status,
        "top_universities": top_universities,
        "enquiries_by_country": [{"name": name or "Other", "count": c} for name, c in country_rows],
        "conversion_rate": round(converted / total_enquiries * 100, 1),
        "weekly_signups": weekly,
        "recent_users": recent_users,
        "totals": {
            "users": db.query(User).count(),
            "enquiries": sum(enquiries_by_status.values()),
            "applications": sum(apps_by_status.values()),
            "tickets": db.query(Ticket).count(),
            "contact_messages": db.query(ContactMessage).count(),
            "unread_contacts": db.query(ContactMessage).filter(ContactMessage.handled.is_(False)).count(),
        },
    }

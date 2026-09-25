"""Public catalog + content endpoints (no auth required)."""
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..ai import generate_reply
from ..database import get_db
from ..deps import get_current_user
from ..models import (
    BlogPost,
    ChatMessage,
    ContactMessage,
    Country,
    Course,
    Quote,
    Stat,
    Testimonial,
    University,
    User,
)
from ..ratelimit import limiter

router = APIRouter(tags=["public"])


# ---------- Countries ----------
@router.get("/countries")
def list_countries(db: Session = Depends(get_db)):
    return db.query(Country).order_by(Country.order_index).all()


@router.get("/countries/{slug}")
def get_country(slug: str, db: Session = Depends(get_db)):
    country = db.query(Country).filter(Country.slug == slug).first()
    if not country:
        raise HTTPException(404, "Country not found")
    universities = (
        db.query(University).filter(University.country_id == country.id).order_by(University.world_rank).all()
    )
    return {"country": country, "universities": universities}


# ---------- Universities ----------
@router.get("/universities")
def list_universities(
    country: str | None = None,
    q: str | None = None,
    featured: bool | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(University)
    if country:
        query = query.join(Country).filter(Country.slug == country)
    if featured is not None:
        query = query.filter(University.featured == featured)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(University.name.ilike(like), University.city.ilike(like)))
    return query.order_by(University.world_rank.is_(None), University.world_rank).limit(60).all()


@router.get("/universities/{slug}")
def get_university(slug: str, db: Session = Depends(get_db)):
    uni = db.query(University).filter(University.slug == slug).first()
    if not uni:
        raise HTTPException(404, "University not found")
    return uni


@router.get("/universities/{slug}/courses")
def university_courses(slug: str, db: Session = Depends(get_db)):
    uni = db.query(University).filter(University.slug == slug).first()
    if not uni:
        raise HTTPException(404, "University not found")
    return uni.courses


# ---------- Courses ----------
@router.get("/courses")
def list_courses(
    level: str | None = None,
    country: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Course).join(University)
    if level:
        query = query.filter(Course.level == level)
    if country:
        query = query.filter(University.country_id == Country.id).filter(Country.slug == country)
    if q:
        like = f"%{q}%"
        query = query.filter(Course.name.ilike(like))
    return query.limit(80).all()


# ---------- Content ----------
@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return db.query(Stat).order_by(Stat.order_index).all()


@router.get("/quotes")
def get_quotes(db: Session = Depends(get_db)):
    return db.query(Quote).order_by(Quote.order_index).all()


@router.get("/testimonials")
def list_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).order_by(Testimonial.featured.desc(), Testimonial.created_at.desc()).all()


@router.get("/blog")
def list_blog(db: Session = Depends(get_db), category: str | None = None):
    query = db.query(BlogPost).filter(BlogPost.published.is_(True))
    if category:
        query = query.filter(BlogPost.category == category)
    return query.order_by(BlogPost.created_at.desc()).all()


@router.get("/blog/{slug}")
def get_blog(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(404, "Post not found")
    return post


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    session_id: str = Field(default="anon", max_length=64)
    history: list[dict] | None = None

    @field_validator("session_id")
    @classmethod
    def clean_session(cls, v: str) -> str:
        # Only safe identifier characters allowed — session ids are stored verbatim.
        return re.sub(r"[^A-Za-z0-9_-]", "", v)[:64] or "anon"

    @field_validator("history")
    @classmethod
    def cap_history(cls, v: list[dict] | None) -> list[dict] | None:
        if v is None:
            return None
        return v[-10:]


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=320)
    subject: str | None = Field(default=None, max_length=200)
    message: str = Field(min_length=5, max_length=4000)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


# ---------- AI chat (public + authed in one endpoint) ----------
@router.post("/chat", dependencies=[Depends(limiter("chat", 30, 300))])
def public_chat(
    payload: ChatIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    message = payload.message.strip()[:1000]
    history = payload.history or []
    reply, suggestions = generate_reply(db, message, history)
    if user is not None:
        # persist against the user account so /chat/history can restore it
        db.add(ChatMessage(user_id=user.id, role="user", content=message))
        db.add(ChatMessage(user_id=user.id, role="assistant", content=reply))
    else:
        # anonymous visitor: keep a per-browser session transcript
        db.add(ChatMessage(session_id=payload.session_id, role="user", content=message))
        db.add(ChatMessage(session_id=payload.session_id, role="assistant", content=reply))
    db.commit()
    return {"reply": reply, "suggestions": suggestions}


# ---------- Contact ----------
@router.post("/contact", dependencies=[Depends(limiter("contact", 5, 3600))])
def contact(payload: ContactIn, db: Session = Depends(get_db)):
    cm = ContactMessage(
        name=payload.name.strip(),
        email=payload.email,
        subject=(payload.subject or "General enquiry").strip(),
        message=payload.message.strip(),
    )
    db.add(cm)
    db.commit()
    return {"ok": True, "message": "Thanks! Our counselors will reach out within 24 hours."}


# ---------- Contact ----------
@router.post("/contact")
def contact(payload: dict, db: Session = Depends(get_db)):
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    message = (payload.get("message") or "").strip()
    if not name or not email or not message:
        raise HTTPException(400, "name, email and message are required")
    cm = ContactMessage(
        name=name,
        email=email,
        subject=(payload.get("subject") or "General enquiry").strip(),
        message=message,
    )
    db.add(cm)
    db.commit()
    return {"ok": True, "message": "Thanks! Our counselors will reach out within 24 hours."}

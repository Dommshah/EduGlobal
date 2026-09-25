"""Authentication endpoints: register, login, me."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from ..auth_utils import create_access_token, hash_password, verify_password

# Pre-computed hash used to equalize timing when the account does not exist,
# so response latency never reveals which emails are registered.
_DUMMY_HASH = hash_password("timing-equalizer-dummy-password")
from ..database import get_db
from ..deps import require_auth
from ..models import User
from ..ratelimit import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

# Roles a member of the public may hold. Staff/admin accounts are provisioned
# internally (admin panel) — never via the public register endpoint.
PUBLIC_ROLES = {"student"}


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=40)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str | None) -> str | None:
        return v.strip()[:40] if v else None


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


def _token_payload(user: User) -> dict:
    return {
        "token": create_access_token(user.id, user.role),
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "avatar_color": user.avatar_color,
        },
    }


@router.post("/register", dependencies=[Depends(limiter("register", 5, 3600))])
def register(data: RegisterIn, db: Session = Depends(get_db)):
    # role is intentionally NOT accepted from the client: public signup is student-only
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(409, "An account with this email already exists")
    user = User(
        name=data.name.strip(),
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_payload(user)


@router.post("/login", dependencies=[Depends(limiter("login", 10, 300))])
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    # Uniform error + always run a hash comparison, so response timing does not
    # reveal whether the email exists.
    ok = verify_password(data.password, user.password_hash) if user else verify_password(data.password, _DUMMY_HASH)
    if not user or not ok:
        raise HTTPException(401, "Invalid email or password")
    return _token_payload(user)


@router.get("/me")
def me(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "avatar_color": user.avatar_color,
        "created_at": user.created_at,
    }

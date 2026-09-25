"""FastAPI dependencies for authentication."""
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .auth_utils import decode_token
from .database import get_db
from .models import User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    """Resolve the current user from the Authorization header (if any).

    Hardened against malformed/forged tokens: never raises, returns None instead.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    payload = decode_token(auth.removeprefix("Bearer ").strip())
    if not payload:
        return None
    sub = payload.get("sub")
    try:
        user_id = int(sub)  # forged/non-numeric sub → None, not a 500
    except (TypeError, ValueError):
        return None
    if user_id <= 0:
        return None
    return db.get(User, user_id)


def require_auth(user: User | None = Depends(get_current_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def require_role(*roles: str):
    def checker(user: User = Depends(require_auth)) -> User:
        # Role is re-checked against the live DB row, so demoted accounts
        # lose access immediately even if their token still carries an old claim.
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return checker

"""Simple in-memory sliding-window rate limiter.

Suitable for single-process deployments. For multi-worker/production setups,
swap the storage for Redis (the interface stays the same).
"""
import time
from collections import defaultdict, deque
from functools import wraps

from fastapi import HTTPException, Request

_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(key: str, max_requests: int, window_seconds: int) -> None:
    now = time.monotonic()
    bucket = _BUCKETS[key]
    while bucket and now - bucket[0] > window_seconds:
        bucket.popleft()
    if len(bucket) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many requests — please slow down and try again shortly.")
    bucket.append(now)


def limiter(name: str, max_requests: int, window_seconds: int):
    """FastAPI dependency factory: Depends(limiter("login", 10, 60))."""

    def dep(request: Request) -> None:
        rate_limit(f"{name}:{client_ip(request)}", max_requests, window_seconds)

    return dep

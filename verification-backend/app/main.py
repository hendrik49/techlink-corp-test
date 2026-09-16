import asyncio
import time
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings
from app.api.sessions import router as sessions_router, session_store
from app.api.websocket import router as ws_router
from app.services.face_comparison import warm_up_model
from app.services.antispoof import warm_up_antispoof
from app.utils.security import FrameRateLimiter


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(self), microphone=()"
        response.headers["Cache-Control"] = "no-store"
        return response

import logging

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.getLevelNamesMapping().get(get_settings().log_level.upper(), logging.INFO)
    ),
)

logger = structlog.get_logger()


async def _cleanup_expired_sessions() -> None:
    """Periodically remove expired sessions from the in-memory store."""
    settings = get_settings()
    while True:
        await asyncio.sleep(60)
        now = time.time()
        expired = [
            sid
            for sid, s in session_store.items()
            if s.is_expired(settings.session_ttl_seconds)
        ]
        for sid in expired:
            del session_store[sid]
        if expired:
            logger.info("cleaned_expired_sessions", count=len(expired))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("starting_up", msg="Pre-warming models...")
    warm_up_model()
    logger.info("model_ready", msg="Face recognition model loaded.")
    warm_up_antispoof()
    logger.info("antispoof_ready", msg="Anti-spoofing model loaded.")
    cleanup_task = asyncio.create_task(_cleanup_expired_sessions())
    yield
    cleanup_task.cancel()
    logger.info("shutting_down")


settings = get_settings()

app = FastAPI(
    title="Face-ID Verification Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.sessions import limiter as rate_limiter

app.state.limiter = rate_limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

frame_limiter = FrameRateLimiter(max_fps=settings.ws_frame_rate_limit)
app.state.frame_limiter = frame_limiter

app.include_router(sessions_router, prefix="/api")
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

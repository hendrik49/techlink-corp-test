import structlog
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings
from app.models.schemas import (
    AcknowledgeRequest,
    SessionCreate,
    SessionResponse,
    SessionStatus,
    VerificationSession,
)
from app.utils.security import sanitize_session_id

logger = structlog.get_logger()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["sessions"])

session_store: dict[str, VerificationSession] = {}


@router.post("/sessions", response_model=SessionResponse)
@limiter.limit("10/minute")
async def create_session(request: Request, body: SessionCreate | None = None):
    settings = get_settings()

    active_count = sum(
        1 for s in session_store.values() if s.status == SessionStatus.ACTIVE
    )
    if active_count > 1000:
        raise HTTPException(503, "Too many active sessions. Try again later.")

    session = VerificationSession()
    session_store[session.session_id] = session
    logger.info("session_created", session_id=session.session_id)
    return session.to_response()


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    if not sanitize_session_id(session_id):
        raise HTTPException(400, "Invalid session ID format")
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    settings = get_settings()
    if session.is_expired(settings.session_ttl_seconds):
        session.status = SessionStatus.EXPIRED
        raise HTTPException(410, "Session expired")

    return session.to_response()


@router.get("/sessions/{session_id}/result")
async def get_result(session_id: str):
    if not sanitize_session_id(session_id):
        raise HTTPException(400, "Invalid session ID format")
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status != SessionStatus.COMPLETED:
        raise HTTPException(400, "Verification not yet completed")
    return session.result or {"error": "No result available"}


@router.post("/sessions/{session_id}/acknowledge")
@limiter.limit("10/minute")
async def acknowledge_session(request: Request, session_id: str, body: AcknowledgeRequest):
    if not sanitize_session_id(session_id):
        raise HTTPException(400, "Invalid session ID format")
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    settings = get_settings()
    if session.is_expired(settings.session_ttl_seconds):
        session.status = SessionStatus.EXPIRED
        raise HTTPException(410, "Session expired")

    session.acknowledged = True
    session.acknowledgment_text = body.confirmation_text
    session.acknowledgment_email = body.email
    session.touch()
    logger.info("session_acknowledged", session_id=session_id, email=body.email)
    return {"acknowledged": True, "session_id": session_id}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if not sanitize_session_id(session_id):
        raise HTTPException(400, "Invalid session ID format")
    if session_id in session_store:
        del session_store[session_id]
        logger.info("session_deleted", session_id=session_id)
        return {"deleted": True}
    raise HTTPException(404, "Session not found")

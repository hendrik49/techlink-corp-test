from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
import time
import uuid


class VerificationStep(str, Enum):
    ID_CAPTURE = "id_capture"
    LIVE_FACE = "live_face"
    LIVENESS = "liveness"
    COMPARISON = "comparison"
    COMPLETED = "completed"


class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class FacePosition(BaseModel):
    x: int
    y: int
    w: int
    h: int


class WSClientMessage(BaseModel):
    type: str = "frame"
    session_id: str
    data: str  # base64-encoded JPEG
    step: VerificationStep


class WSFeedbackMessage(BaseModel):
    type: str = "feedback"
    step: VerificationStep
    face_detected: bool = False
    face_position: Optional[FacePosition] = None
    message: str = ""
    step_complete: bool = False


class WSResultMessage(BaseModel):
    type: str = "result"
    verified: bool
    confidence: float
    distance: float
    threshold: float
    message: str


class WSErrorMessage(BaseModel):
    type: str = "error"
    message: str
    code: str = "UNKNOWN"


class LivenessChallenge(BaseModel):
    type: str = "liveness_challenge"
    action: str  # "blink", "turn_left", "turn_right"
    message: str


class AcknowledgeRequest(BaseModel):
    confirmation_text: str
    email: str = ""


class SessionCreate(BaseModel):
    client_info: Optional[str] = None


class SessionResponse(BaseModel):
    session_id: str
    status: SessionStatus
    current_step: VerificationStep
    created_at: float


class VerificationSession:
    def __init__(self) -> None:
        self.session_id: str = str(uuid.uuid4())
        self.status: SessionStatus = SessionStatus.ACTIVE
        self.current_step: VerificationStep = VerificationStep.ID_CAPTURE
        self.created_at: float = time.time()
        self.last_activity: float = time.time()
        self.id_face_encoding: Optional[list] = None
        self.id_face_image: Optional[bytes] = None
        self.live_face_image: Optional[bytes] = None
        self.liveness_passed: bool = False
        self.liveness_challenge: Optional[str] = None
        self.liveness_frames: list = []
        self.result: Optional[dict] = None
        self.frame_timestamps: list[float] = []
        self.acknowledged: bool = False
        self.acknowledgment_text: Optional[str] = None
        self.acknowledgment_email: Optional[str] = None

    def touch(self) -> None:
        self.last_activity = time.time()

    def is_expired(self, ttl: int) -> bool:
        return time.time() - self.created_at > ttl

    def to_response(self) -> SessionResponse:
        return SessionResponse(
            session_id=self.session_id,
            status=self.status,
            current_step=self.current_step,
            created_at=self.created_at,
        )

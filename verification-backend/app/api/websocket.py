import asyncio
import json
import structlog
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import get_settings
from app.api.sessions import session_store
from app.models.schemas import (
    VerificationStep,
    SessionStatus,
    WSFeedbackMessage,
    WSResultMessage,
    WSErrorMessage,
    FacePosition,
)
from app.services.face_detection import extract_largest_face
from app.services.id_extraction import extract_face_from_id
from app.services.face_comparison import compare_faces
from app.services.liveness import (
    generate_challenge,
    verify_liveness_frames,
)
from app.utils.image import (
    decode_base64_image,
    validate_frame_size,
    resize_if_needed,
    numpy_to_jpeg_bytes,
)
from app.utils.security import sanitize_session_id

logger = structlog.get_logger()
router = APIRouter()


async def _send_json(ws: WebSocket, data: dict) -> None:
    await ws.send_text(json.dumps(data))


async def _handle_id_capture(
    ws: WebSocket, img: np.ndarray, session
) -> None:
    """Process a frame during the ID capture step."""
    result = extract_face_from_id(img)

    if result is None:
        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.ID_CAPTURE,
                face_detected=False,
                message="Hold your ID card steady in front of the camera",
            ).model_dump(),
        )
        return

    fa = result["facial_area"]
    session.id_face_image = numpy_to_jpeg_bytes(result["face_image"])
    session.current_step = VerificationStep.LIVE_FACE
    session.touch()

    await _send_json(
        ws,
        WSFeedbackMessage(
            step=VerificationStep.ID_CAPTURE,
            face_detected=True,
            face_position=FacePosition(x=fa["x"], y=fa["y"], w=fa["w"], h=fa["h"]),
            message="ID photo captured! Now remove the ID and look at the camera.",
            step_complete=True,
        ).model_dump(),
    )


LIVE_FACE_FRAMES_REQUIRED = 4
LIVE_FACE_MIN_AREA_RATIO = 0.04


async def _handle_live_face(
    ws: WebSocket, img: np.ndarray, session
) -> None:
    """Process a frame during the live face capture step.
    Requires multiple consecutive frames with a sufficiently large face."""
    face = extract_largest_face(img)

    if face is None:
        session.live_face_consecutive = 0
        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.LIVE_FACE,
                face_detected=False,
                message="Please look directly at the camera",
            ).model_dump(),
        )
        return

    fa = face["facial_area"]
    img_area = img.shape[0] * img.shape[1]
    face_area_ratio = (fa["w"] * fa["h"]) / img_area

    if face_area_ratio < LIVE_FACE_MIN_AREA_RATIO:
        session.live_face_consecutive = 0
        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.LIVE_FACE,
                face_detected=False,
                message="Please move closer to the camera",
            ).model_dump(),
        )
        return

    if not hasattr(session, "live_face_consecutive"):
        session.live_face_consecutive = 0
    session.live_face_consecutive += 1

    if session.live_face_consecutive < LIVE_FACE_FRAMES_REQUIRED:
        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.LIVE_FACE,
                face_detected=True,
                face_position=FacePosition(x=fa["x"], y=fa["y"], w=fa["w"], h=fa["h"]),
                message="Hold steady... detecting face",
            ).model_dump(),
        )
        return

    from app.services.face_detection import crop_face_region

    face_crop = crop_face_region(img, fa, padding=0.15)
    session.live_face_image = numpy_to_jpeg_bytes(face_crop)

    challenge = generate_challenge()
    session.liveness_challenge = challenge["action"]
    session.liveness_frames = []
    session.current_step = VerificationStep.LIVENESS
    session.touch()

    await _send_json(
        ws,
        WSFeedbackMessage(
            step=VerificationStep.LIVE_FACE,
            face_detected=True,
            face_position=FacePosition(x=fa["x"], y=fa["y"], w=fa["w"], h=fa["h"]),
            message="Face detected!",
            step_complete=True,
        ).model_dump(),
    )

    await _send_json(
        ws,
        {
            "type": "liveness_challenge",
            "action": challenge["action"],
            "message": challenge["message"],
        },
    )


async def _handle_liveness(
    ws: WebSocket, img: np.ndarray, session
) -> None:
    """Collect frames for the liveness challenge."""
    session.liveness_frames.append(img.copy())
    session.touch()

    frame_count = len(session.liveness_frames)

    if frame_count < 8:
        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.LIVENESS,
                face_detected=True,
                message=f"Keep going... ({frame_count}/8)",
            ).model_dump(),
        )
        return

    liveness_result = await asyncio.get_event_loop().run_in_executor(
        None,
        verify_liveness_frames,
        session.liveness_frames,
        session.liveness_challenge,
    )

    if liveness_result["passed"]:
        session.liveness_passed = True
        session.current_step = VerificationStep.COMPARISON
        session.touch()

        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.LIVENESS,
                face_detected=True,
                message="Liveness verified! Comparing faces...",
                step_complete=True,
            ).model_dump(),
        )

        await _run_comparison(ws, session)
    else:
        session.liveness_frames = []
        challenge = generate_challenge()
        session.liveness_challenge = challenge["action"]

        await _send_json(
            ws,
            WSFeedbackMessage(
                step=VerificationStep.LIVENESS,
                face_detected=True,
                message=f"Liveness check failed: {liveness_result.get('reason', 'Unknown')}. Let's try again.",
            ).model_dump(),
        )

        await _send_json(
            ws,
            {
                "type": "liveness_challenge",
                "action": challenge["action"],
                "message": challenge["message"],
            },
        )


async def _run_comparison(ws: WebSocket, session) -> None:
    """Run the final face comparison between ID and live face."""
    from app.utils.image import image_bytes_to_numpy

    id_img = image_bytes_to_numpy(session.id_face_image)
    live_img = image_bytes_to_numpy(session.live_face_image)

    if id_img is None or live_img is None:
        await _send_json(
            ws,
            WSErrorMessage(
                message="Failed to process captured images",
                code="IMAGE_ERROR",
            ).model_dump(),
        )
        return

    result = await asyncio.get_event_loop().run_in_executor(
        None, compare_faces, id_img, live_img
    )

    session.result = result
    session.current_step = VerificationStep.COMPLETED
    session.status = SessionStatus.COMPLETED
    session.touch()

    # Clean up image data from memory
    session.id_face_image = None
    session.live_face_image = None
    session.liveness_frames = []

    await _send_json(
        ws,
        WSResultMessage(
            verified=result["verified"],
            confidence=result["confidence"],
            distance=result["distance"],
            threshold=result["threshold"],
            message="Verification successful! Faces match."
            if result["verified"]
            else "Verification failed. Faces do not match.",
        ).model_dump(),
    )


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    settings = get_settings()
    frame_limiter = ws.app.state.frame_limiter
    current_session_id = None

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await _send_json(
                    ws, WSErrorMessage(message="Invalid JSON", code="PARSE_ERROR").model_dump()
                )
                continue

            session_id = msg.get("session_id", "")
            if not sanitize_session_id(session_id):
                await _send_json(
                    ws,
                    WSErrorMessage(
                        message="Invalid session ID", code="INVALID_SESSION"
                    ).model_dump(),
                )
                continue

            session = session_store.get(session_id)
            if not session:
                await _send_json(
                    ws,
                    WSErrorMessage(
                        message="Session not found", code="SESSION_NOT_FOUND"
                    ).model_dump(),
                )
                continue

            if session.is_expired(settings.session_ttl_seconds):
                session.status = SessionStatus.EXPIRED
                await _send_json(
                    ws,
                    WSErrorMessage(
                        message="Session expired", code="SESSION_EXPIRED"
                    ).model_dump(),
                )
                continue

            current_session_id = session_id

            if not frame_limiter.allow(session_id):
                continue  # silently skip rate-limited frames

            data = msg.get("data", "")
            if not data:
                continue

            if not validate_frame_size(data, settings.max_frame_size_kb):
                await _send_json(
                    ws,
                    WSErrorMessage(
                        message="Frame too large", code="FRAME_TOO_LARGE"
                    ).model_dump(),
                )
                continue

            img = decode_base64_image(data)
            if img is None:
                await _send_json(
                    ws,
                    WSErrorMessage(
                        message="Could not decode image", code="DECODE_ERROR"
                    ).model_dump(),
                )
                continue

            img = resize_if_needed(img, max_dim=1024)

            step = session.current_step

            if step == VerificationStep.ID_CAPTURE:
                await _handle_id_capture(ws, img, session)
            elif step == VerificationStep.LIVE_FACE:
                await _handle_live_face(ws, img, session)
            elif step == VerificationStep.LIVENESS:
                await _handle_liveness(ws, img, session)
            elif step == VerificationStep.COMPLETED:
                await _send_json(
                    ws,
                    WSFeedbackMessage(
                        step=VerificationStep.COMPLETED,
                        message="Verification already completed for this session.",
                    ).model_dump(),
                )

    except WebSocketDisconnect:
        logger.info("ws_disconnected", session_id=current_session_id)
    except Exception as e:
        logger.error("ws_error", error=str(e), session_id=current_session_id)
        try:
            await _send_json(
                ws,
                WSErrorMessage(message="Internal error", code="INTERNAL").model_dump(),
            )
        except Exception:
            pass
    finally:
        if current_session_id:
            frame_limiter.cleanup(current_session_id)

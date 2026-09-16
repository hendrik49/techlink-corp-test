"""
Face comparison using ArcFace ONNX model via ONNX Runtime.
Computes cosine distance between face embeddings.
"""

import numpy as np
import cv2
import onnxruntime as ort
import structlog
from typing import Optional

from app.config import get_settings
from app.services.model_manager import get_model_path

logger = structlog.get_logger()

_session: Optional[ort.InferenceSession] = None


def _get_session() -> ort.InferenceSession:
    global _session
    if _session is None:
        model_path = get_model_path("arcface")
        _session = ort.InferenceSession(
            model_path,
            providers=["CPUExecutionProvider"],
        )
        logger.info("arcface_session_created", model=model_path)
    return _session


def warm_up_model() -> None:
    """Pre-load the ArcFace ONNX model."""
    try:
        session = _get_session()
        inp = session.get_inputs()[0]
        dummy = np.random.randn(1, 3, 112, 112).astype(np.float32)
        session.run(None, {inp.name: dummy})
        logger.info("arcface_warmed_up")
    except Exception as e:
        logger.warning("warmup_failed", error=str(e))


def _preprocess_face(img: np.ndarray, target_size: tuple[int, int] = (112, 112)) -> np.ndarray:
    """
    Preprocess a face crop for ArcFace:
    resize to 112x112, normalize to [-1, 1], transpose to NCHW.
    """
    resized = cv2.resize(img, target_size)
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    normalized = (rgb.astype(np.float32) - 127.5) / 127.5
    transposed = np.transpose(normalized, (2, 0, 1))  # CHW
    return np.expand_dims(transposed, axis=0)  # NCHW


def get_embedding(img: np.ndarray) -> np.ndarray:
    """Extract the 512-d face embedding from a BGR face crop."""
    session = _get_session()
    inp_name = session.get_inputs()[0].name
    preprocessed = _preprocess_face(img)
    outputs = session.run(None, {inp_name: preprocessed})
    embedding = outputs[0].flatten()
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    return 1.0 - float(np.dot(a, b))


def compare_faces(
    id_face: np.ndarray,
    live_face: np.ndarray,
    threshold: Optional[float] = None,
) -> dict:
    """
    Compare two face images and return verification results.
    Both inputs should be BGR numpy arrays containing a face.
    """
    settings = get_settings()
    thresh = threshold or settings.face_match_threshold

    try:
        emb_id = get_embedding(id_face)
        emb_live = get_embedding(live_face)
        distance = cosine_distance(emb_id, emb_live)
        verified = distance <= thresh
        confidence = max(0.0, min(1.0, 1.0 - (distance / thresh)))

        logger.info(
            "face_comparison_done",
            verified=verified,
            distance=round(distance, 4),
            threshold=thresh,
        )

        return {
            "verified": verified,
            "confidence": round(confidence, 4),
            "distance": round(distance, 4),
            "threshold": thresh,
            "model": "ArcFace-w600k_r50",
        }
    except Exception as e:
        logger.error("face_comparison_error", error=str(e))
        return {
            "verified": False,
            "confidence": 0.0,
            "distance": 1.0,
            "threshold": thresh,
            "error": str(e),
        }

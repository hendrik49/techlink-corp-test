"""
Face anti-spoofing using MiniFASNet ONNX model.
Classifies face crops as real or spoof (printed photo, screen display).
"""

import numpy as np
import cv2
import onnxruntime as ort
import structlog
from typing import Optional

from app.services.model_manager import get_model_path

logger = structlog.get_logger()

_session: Optional[ort.InferenceSession] = None
_input_name: Optional[str] = None
_input_hw: Optional[tuple[int, int]] = None


def _get_session() -> tuple[ort.InferenceSession, str, tuple[int, int]]:
    global _session, _input_name, _input_hw
    if _session is None:
        model_path = get_model_path("antispoof")
        _session = ort.InferenceSession(
            model_path,
            providers=["CPUExecutionProvider"],
        )
        inp = _session.get_inputs()[0]
        _input_name = inp.name
        shape = inp.shape  # e.g. [1, 3, 80, 80] or [1, 3, 128, 128]
        _input_hw = (int(shape[2]), int(shape[3]))
        logger.info(
            "antispoof_session_created",
            model=model_path,
            input_shape=shape,
        )
    return _session, _input_name, _input_hw


def warm_up_antispoof() -> None:
    try:
        session, inp_name, hw = _get_session()
        dummy = np.random.randn(1, 3, hw[0], hw[1]).astype(np.float32)
        session.run(None, {inp_name: dummy})
        logger.info("antispoof_warmed_up")
    except Exception as e:
        logger.warning("antispoof_warmup_failed", error=str(e))


def _preprocess(img: np.ndarray, hw: tuple[int, int]) -> np.ndarray:
    """Resize to model input, BGR->RGB, normalize to [0,1], NCHW."""
    resized = cv2.resize(img, (hw[1], hw[0]))
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    normalized = rgb.astype(np.float32) / 255.0
    transposed = np.transpose(normalized, (2, 0, 1))
    return np.expand_dims(transposed, axis=0)


def check_antispoof(img: np.ndarray, threshold: float = 0.5) -> dict:
    """
    Run anti-spoofing on a face crop.
    Returns {"is_real": bool, "score": float, "label": str}
    """
    try:
        session, inp_name, hw = _get_session()
        preprocessed = _preprocess(img, hw)
        outputs = session.run(None, {inp_name: preprocessed})
        logits = outputs[0].flatten()

        exp_logits = np.exp(logits - np.max(logits))
        probs = exp_logits / exp_logits.sum()

        if len(probs) == 3:
            real_score = float(probs[1])
        elif len(probs) == 2:
            real_score = float(probs[1])
        else:
            real_score = float(probs[0])

        is_real = real_score > threshold

        return {
            "is_real": is_real,
            "score": round(real_score, 4),
            "label": "real" if is_real else "spoof",
        }
    except Exception as e:
        logger.error("antispoof_error", error=str(e))
        return {
            "is_real": True,
            "score": 0.0,
            "label": "error",
            "error": str(e),
        }

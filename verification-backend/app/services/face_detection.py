"""
Face detection using OpenCV's YuNet detector (ONNX).
No TensorFlow dependency required.
"""

import numpy as np
import cv2
import structlog
from typing import Optional

from app.services.model_manager import get_model_path

logger = structlog.get_logger()

_detector: Optional[cv2.FaceDetectorYN] = None


def _get_detector(width: int = 640, height: int = 480) -> cv2.FaceDetectorYN:
    global _detector
    model_path = get_model_path("yunet")
    _detector = cv2.FaceDetectorYN.create(model_path, "", (width, height), 0.6, 0.3, 5000)
    _detector.setInputSize((width, height))
    return _detector


def detect_faces(img: np.ndarray) -> list[dict]:
    """
    Detect faces using YuNet.
    Returns list of dicts with: facial_area, confidence, landmarks.
    """
    h, w = img.shape[:2]
    detector = _get_detector(w, h)

    _, raw = detector.detect(img)
    if raw is None:
        return []

    faces = []
    for det in raw:
        x, y, fw, fh = int(det[0]), int(det[1]), int(det[2]), int(det[3])
        conf = float(det[-1])
        if conf < 0.5:
            continue

        x = max(0, x)
        y = max(0, y)
        fw = min(fw, w - x)
        fh = min(fh, h - y)

        faces.append({
            "facial_area": {"x": x, "y": y, "w": fw, "h": fh},
            "confidence": round(conf, 4),
        })

    return faces


def extract_largest_face(img: np.ndarray) -> Optional[dict]:
    """Return the face with the largest bounding box area."""
    faces = detect_faces(img)
    if not faces:
        return None
    return max(faces, key=lambda f: f["facial_area"]["w"] * f["facial_area"]["h"])


def crop_face_region(
    img: np.ndarray, facial_area: dict, padding: float = 0.2
) -> np.ndarray:
    """Crop the face region from the original image with padding."""
    h, w = img.shape[:2]
    x, y, fw, fh = (
        facial_area["x"],
        facial_area["y"],
        facial_area["w"],
        facial_area["h"],
    )

    pad_x = int(fw * padding)
    pad_y = int(fh * padding)

    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + fw + pad_x)
    y2 = min(h, y + fh + pad_y)

    return img[y1:y2, x1:x2]

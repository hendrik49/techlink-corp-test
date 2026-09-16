import base64
import numpy as np
import cv2
from typing import Optional


def decode_base64_image(data: str) -> Optional[np.ndarray]:
    """Decode a base64-encoded JPEG/PNG string into an OpenCV BGR image."""
    try:
        if "," in data:
            data = data.split(",", 1)[1]

        raw = base64.b64decode(data)
        arr = np.frombuffer(raw, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None


def encode_image_to_base64(img: np.ndarray, fmt: str = ".jpg") -> str:
    """Encode an OpenCV BGR image to a base64 string."""
    _, buffer = cv2.imencode(fmt, img)
    return base64.b64encode(buffer).decode("utf-8")


def resize_if_needed(img: np.ndarray, max_dim: int = 1024) -> np.ndarray:
    """Resize image so its largest dimension does not exceed max_dim."""
    h, w = img.shape[:2]
    if max(h, w) <= max_dim:
        return img
    scale = max_dim / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def image_bytes_to_numpy(data: bytes) -> Optional[np.ndarray]:
    """Convert raw image bytes into an OpenCV BGR image."""
    arr = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def numpy_to_jpeg_bytes(img: np.ndarray, quality: int = 90) -> bytes:
    """Convert an OpenCV BGR image to JPEG bytes."""
    _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return buffer.tobytes()


def validate_frame_size(data: str, max_kb: int) -> bool:
    """Check that the base64 payload does not exceed the allowed size."""
    size_bytes = len(data) * 3 / 4
    return size_bytes <= max_kb * 1024

"""
Downloads and caches the ONNX models used for face detection and recognition.
Uses OpenCV's YuNet for detection and ArcFace (w600k_r50) for embeddings.
"""

import os
import urllib.request
import structlog

logger = structlog.get_logger()

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")

MODELS = {
    "yunet": {
        "url": "https://huggingface.co/opencv/face_detection_yunet/resolve/main/face_detection_yunet_2023mar.onnx",
        "filename": "face_detection_yunet_2023mar.onnx",
    },
    "arcface": {
        "url": "https://huggingface.co/maze/faceX/resolve/main/w600k_r50.onnx?download=true",
        "filename": "w600k_r50.onnx",
    },
    "antispoof": {
        "url": "https://huggingface.co/spaces/aaavvvrrr/face-anti-spoofing/resolve/main/weights/modelrgb.onnx",
        "filename": "antispoof_minifas.onnx",
    },
}


def ensure_model_dir() -> str:
    os.makedirs(MODEL_DIR, exist_ok=True)
    return MODEL_DIR


def get_model_path(name: str) -> str:
    info = MODELS[name]
    model_dir = ensure_model_dir()
    path = os.path.join(model_dir, info["filename"])

    if not os.path.exists(path):
        logger.info("downloading_model", name=name, url=info["url"])
        try:
            urllib.request.urlretrieve(info["url"], path)
            logger.info("model_downloaded", name=name, path=path)
        except Exception as e:
            logger.error("model_download_failed", name=name, error=str(e))
            raise RuntimeError(
                f"Failed to download model '{name}' from {info['url']}: {e}"
            )

    return path

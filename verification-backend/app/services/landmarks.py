"""
Face landmark detection using MediaPipe Face Mesh.
Provides 468 3D face landmarks and Eye Aspect Ratio (EAR) for blink detection.
"""

import numpy as np
import cv2
import structlog
from typing import Optional

import mediapipe as mp

logger = structlog.get_logger()

# 6 landmarks per eye defining the eyelid contour for EAR calculation.
# Order: outer corner, upper-1, upper-2, inner corner, lower-2, lower-1
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]

EAR_CLOSED_THRESHOLD = 0.21
EAR_OPEN_THRESHOLD = 0.25

_face_mesh: Optional[mp.solutions.face_mesh.FaceMesh] = None


def _get_face_mesh() -> mp.solutions.face_mesh.FaceMesh:
    global _face_mesh
    if _face_mesh is None:
        _face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
        )
        logger.info("mediapipe_face_mesh_initialized")
    return _face_mesh


def get_landmarks(img: np.ndarray) -> Optional[list]:
    """
    Extract 468 face landmarks from a BGR image.
    Returns list of (x, y, z) tuples in pixel coordinates, or None.
    """
    face_mesh = _get_face_mesh()
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if not results.multi_face_landmarks:
        return None

    h, w = img.shape[:2]
    return [
        (lm.x * w, lm.y * h, lm.z * w)
        for lm in results.multi_face_landmarks[0].landmark
    ]


def compute_ear(landmarks: list, eye_indices: list) -> float:
    """
    Eye Aspect Ratio from 6 landmarks.
    EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    """
    p = [np.array(landmarks[i][:2]) for i in eye_indices]

    A = np.linalg.norm(p[1] - p[5])
    B = np.linalg.norm(p[2] - p[4])
    C = np.linalg.norm(p[0] - p[3])

    if C == 0:
        return 0.0
    return float((A + B) / (2.0 * C))


def compute_avg_ear(landmarks: list) -> float:
    left_ear = compute_ear(landmarks, LEFT_EYE)
    right_ear = compute_ear(landmarks, RIGHT_EYE)
    return (left_ear + right_ear) / 2.0


def detect_blink_in_frames(frames: list[np.ndarray]) -> dict:
    """
    Detect a blink across a sequence of frames.
    A blink = EAR drops below closed threshold, then recovers above open threshold.
    """
    ear_values: list[Optional[float]] = []

    for frame in frames:
        landmarks = get_landmarks(frame)
        if landmarks is not None:
            ear_values.append(compute_avg_ear(landmarks))
        else:
            ear_values.append(None)

    valid_ears = [e for e in ear_values if e is not None]

    if len(valid_ears) < 3:
        return {
            "blink_detected": False,
            "reason": "Not enough face landmarks detected",
            "ear_values": ear_values,
        }

    found_closed = False
    found_reopen = False

    for ear in valid_ears:
        if not found_closed and ear < EAR_CLOSED_THRESHOLD:
            found_closed = True
        elif found_closed and ear > EAR_OPEN_THRESHOLD:
            found_reopen = True
            break

    blink_detected = found_closed and found_reopen

    logger.info(
        "blink_detection",
        blink_detected=blink_detected,
        found_closed=found_closed,
        found_reopen=found_reopen,
        ear_min=round(min(valid_ears), 3),
        ear_max=round(max(valid_ears), 3),
        ear_count=len(valid_ears),
    )

    if blink_detected:
        reason = "Blink detected"
    elif not found_closed:
        reason = "No eye closure detected"
    else:
        reason = "Eyes closed but did not reopen"

    return {
        "blink_detected": blink_detected,
        "reason": reason,
        "ear_values": [round(e, 3) if e is not None else None for e in ear_values],
    }


def get_nose_positions(frames: list[np.ndarray]) -> list[Optional[tuple]]:
    """
    Extract nose tip position (landmark index 1) from each frame.
    More accurate than face bounding box center for head turn tracking.
    """
    positions: list[Optional[tuple]] = []
    for frame in frames:
        landmarks = get_landmarks(frame)
        if landmarks is not None:
            nose = landmarks[1]
            positions.append((nose[0], nose[1]))
        else:
            positions.append(None)
    return positions

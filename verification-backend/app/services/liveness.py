"""
Liveness verification using real AI models:
  - MiniFASNetV2-SE  (ONNX)  for anti-spoofing on every frame
  - MediaPipe Face Mesh       for blink detection via EAR
  - Face center / nose tracking for head turn direction
"""

import random
import numpy as np
import structlog

from app.services.face_detection import detect_faces, crop_face_region
from app.services.antispoof import check_antispoof
from app.services.landmarks import detect_blink_in_frames, get_nose_positions

logger = structlog.get_logger()

CHALLENGES = ["blink", "turn_left", "turn_right"]
CHALLENGE_MESSAGES = {
    "blink": "Please blink your eyes slowly",
    "turn_left": "Please slowly turn your head to the left",
    "turn_right": "Please slowly turn your head to the right",
}

MIN_LIVENESS_FRAMES = 5
MIN_TURN_DISPLACEMENT = 12.0

# Non-mirrored camera:  turn_left → face moves right (+X), turn_right → left (-X)
TURN_DIRECTION_SIGN = {
    "turn_left": 1,
    "turn_right": -1,
}

ANTISPOOF_PASS_RATIO = 0.5

_last_challenge: str = ""


def generate_challenge() -> dict:
    """Pick a random liveness challenge, avoiding repeating the same one."""
    global _last_challenge
    available = [c for c in CHALLENGES if c != _last_challenge]
    action = random.choice(available)
    _last_challenge = action
    return {
        "action": action,
        "message": CHALLENGE_MESSAGES[action],
    }


# ── Anti-spoofing ───────────────────────────────────────────


def _run_antispoof(frames: list[np.ndarray]) -> dict:
    """Run MiniFASNet anti-spoofing model on face crops from each frame."""
    real_count = 0
    total = 0
    scores: list[float] = []

    for frame in frames:
        faces = detect_faces(frame)
        if not faces:
            continue

        best = max(faces, key=lambda f: f["confidence"])
        fa = best["facial_area"]
        face_crop = crop_face_region(frame, fa, padding=0.3)

        result = check_antispoof(face_crop)
        scores.append(result["score"])
        total += 1
        if result["is_real"]:
            real_count += 1

    if total == 0:
        return {"passed": False, "reason": "No faces detected for anti-spoof check"}

    ratio = real_count / total
    avg_score = sum(scores) / len(scores)

    logger.info(
        "antispoof_result",
        real_count=real_count,
        total=total,
        ratio=round(ratio, 2),
        avg_score=round(avg_score, 4),
    )

    passed = ratio >= ANTISPOOF_PASS_RATIO
    return {
        "passed": passed,
        "ratio": round(ratio, 2),
        "avg_score": round(avg_score, 4),
        "reason": "Live face verified"
        if passed
        else "Anti-spoofing failed — possible photo or screen detected",
    }


# ── Head turn direction ────────────────────────────────────


def _check_turn_direction(frames: list[np.ndarray], challenge: str) -> dict:
    """
    Verify head turn direction using MediaPipe nose landmark.
    Falls back to face bounding box center if landmarks aren't available.
    """
    nose_positions = get_nose_positions(frames)
    valid = [(i, p) for i, p in enumerate(nose_positions) if p is not None]

    if len(valid) >= 3:
        start_x = valid[0][1][0]
        displacements = [p[0] - start_x for _, p in valid]
    else:
        centers_x: list[float] = []
        for frame in frames:
            faces = detect_faces(frame)
            if faces:
                best = max(faces, key=lambda f: f["confidence"])
                fa = best["facial_area"]
                centers_x.append(fa["x"] + fa["w"] / 2)

        if len(centers_x) < 3:
            return {
                "passed": False,
                "reason": "Not enough face detections for direction check",
            }

        start_x = centers_x[0]
        displacements = [cx - start_x for cx in centers_x]

    peak_disp = max(displacements, key=abs)
    expected_sign = TURN_DIRECTION_SIGN.get(challenge, 0)

    if expected_sign == 0:
        return {"passed": True, "reason": "Non-turn challenge"}

    actual_sign = 1 if peak_disp > 0 else -1
    correct = (actual_sign == expected_sign) and abs(peak_disp) >= MIN_TURN_DISPLACEMENT

    logger.info(
        "turn_direction",
        challenge=challenge,
        peak_disp=round(peak_disp, 2),
        expected_sign=expected_sign,
        actual_sign=actual_sign,
        correct=correct,
    )

    if not correct:
        if abs(peak_disp) < MIN_TURN_DISPLACEMENT:
            return {"passed": False, "reason": "Head turn too small — please turn more"}
        direction = "left" if challenge == "turn_left" else "right"
        return {"passed": False, "reason": f"Wrong direction — please turn {direction}"}

    return {"passed": True, "reason": "Correct turn direction verified"}


# ── Main entry point ───────────────────────────────────────


def verify_liveness_frames(frames: list[np.ndarray], challenge: str) -> dict:
    """
    Verify liveness using real AI models:
      1. Anti-spoofing (MiniFASNet) on every frame
      2. Challenge-specific: blink via MediaPipe EAR, or turn direction
    """
    if len(frames) < MIN_LIVENESS_FRAMES:
        return {
            "passed": False,
            "reason": f"Insufficient frames: {len(frames)}/{MIN_LIVENESS_FRAMES}",
        }

    antispoof = _run_antispoof(frames)
    if not antispoof["passed"]:
        return {"passed": False, "reason": antispoof["reason"]}

    if challenge == "blink":
        blink_result = detect_blink_in_frames(frames)
        if not blink_result["blink_detected"]:
            return {
                "passed": False,
                "reason": f"Blink not detected: {blink_result['reason']}",
            }
    elif challenge in TURN_DIRECTION_SIGN:
        turn_result = _check_turn_direction(frames, challenge)
        if not turn_result["passed"]:
            return {"passed": False, "reason": turn_result["reason"]}

    return {
        "passed": True,
        "reason": "Liveness verified",
        "antispoof_score": antispoof.get("avg_score"),
    }

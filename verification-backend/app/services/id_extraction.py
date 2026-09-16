"""
ID card face extraction using perspective warp.
Detects a rectangular document, warps it to a flat image, then detects
faces on the card surface only -- eliminating the user's face behind the card.
"""

import numpy as np
import cv2
import structlog
from typing import Optional

from app.services.face_detection import detect_faces, crop_face_region

logger = structlog.get_logger()

MAX_FACE_TO_DOC_RATIO = 0.40
MIN_FACE_TO_DOC_RATIO = 0.005


def find_document_contour(img: np.ndarray) -> Optional[np.ndarray]:
    """
    Locate a rectangular document (ID card) in the image.
    Tries multiple edge detection strategies for robustness.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img_area = img.shape[0] * img.shape[1]

    strategies = [
        {"blur": (5, 5), "canny_low": 30, "canny_high": 150},
        {"blur": (5, 5), "canny_low": 50, "canny_high": 200},
        {"blur": (7, 7), "canny_low": 20, "canny_high": 100},
        {"blur": (3, 3), "canny_low": 40, "canny_high": 180},
    ]

    for strat in strategies:
        blurred = cv2.GaussianBlur(gray, strat["blur"], 0)
        edged = cv2.Canny(blurred, strat["canny_low"], strat["canny_high"])
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        edged = cv2.dilate(edged, kernel, iterations=2)

        contours, _ = cv2.findContours(
            edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        for c in contours[:10]:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.03 * peri, True)
            if 4 <= len(approx) <= 6:
                area = cv2.contourArea(approx)
                if area > img_area * 0.03:
                    x, y, w, h = cv2.boundingRect(approx)
                    aspect = w / h if h > 0 else 0
                    if 0.4 < aspect < 2.5:
                        return approx

    return None


def _order_points(pts: np.ndarray) -> np.ndarray:
    """Order 4 points as: top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype=np.float32)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    d = np.diff(pts, axis=1).flatten()
    rect[1] = pts[np.argmin(d)]
    rect[3] = pts[np.argmax(d)]

    return rect


def _get_four_corners(contour: np.ndarray) -> Optional[np.ndarray]:
    """Reduce a contour to exactly 4 ordered corner points."""
    pts = contour.reshape(-1, 2).astype(np.float32)

    if len(pts) == 4:
        return _order_points(pts)

    if len(pts) > 4:
        hull = cv2.convexHull(pts)
        hull_pts = hull.reshape(-1, 2).astype(np.float32)
        if len(hull_pts) >= 4:
            peri = cv2.arcLength(hull, True)
            approx = cv2.approxPolyDP(hull, 0.05 * peri, True)
            approx_pts = approx.reshape(-1, 2).astype(np.float32)
            if len(approx_pts) == 4:
                return _order_points(approx_pts)

    x, y, w, h = cv2.boundingRect(contour)
    return _order_points(
        np.array([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dtype=np.float32)
    )


def _perspective_warp(
    img: np.ndarray, contour: np.ndarray
) -> Optional[np.ndarray]:
    """Warp the document region to a flat rectangle, eliminating background."""
    corners = _get_four_corners(contour)
    if corners is None:
        return None

    w1 = np.linalg.norm(corners[1] - corners[0])
    w2 = np.linalg.norm(corners[2] - corners[3])
    h1 = np.linalg.norm(corners[3] - corners[0])
    h2 = np.linalg.norm(corners[2] - corners[1])

    out_w = int(max(w1, w2))
    out_h = int(max(h1, h2))

    if out_w < 50 or out_h < 50:
        return None

    dst = np.array(
        [[0, 0], [out_w - 1, 0], [out_w - 1, out_h - 1], [0, out_h - 1]],
        dtype=np.float32,
    )

    M = cv2.getPerspectiveTransform(corners, dst)
    return cv2.warpPerspective(img, M, (out_w, out_h))


def extract_face_from_id(img: np.ndarray) -> Optional[dict]:
    """
    Extract the face from an ID card using perspective warp.
      1. Find the document contour
      2. Perspective-warp to isolate only the card surface
      3. Detect faces on the flat warped card (background eliminated)
      4. Validate face is proportionally sized for an ID photo
    """
    doc_contour = find_document_contour(img)
    if doc_contour is None:
        return None

    dx, dy, dw, dh = cv2.boundingRect(doc_contour)
    logger.info("id_document_detected", x=dx, y=dy, w=dw, h=dh)

    warped = _perspective_warp(img, doc_contour)
    if warped is None:
        logger.info("id_warp_failed")
        return None

    warped_area = warped.shape[0] * warped.shape[1]
    logger.info("id_warped", width=warped.shape[1], height=warped.shape[0])

    faces = detect_faces(warped)
    if not faces:
        logger.info("id_no_face_on_card")
        return None

    valid_faces = []
    for face in faces:
        fa = face["facial_area"]
        face_area = fa["w"] * fa["h"]
        ratio = face_area / warped_area if warped_area > 0 else 0

        if not (MIN_FACE_TO_DOC_RATIO < ratio < MAX_FACE_TO_DOC_RATIO):
            logger.info("id_face_wrong_size", ratio=round(ratio, 4))
            continue

        valid_faces.append(face)

    if not valid_faces:
        logger.info("id_no_valid_face_on_card", total_detected=len(faces))
        return None

    best = max(
        valid_faces,
        key=lambda f: f["facial_area"]["w"] * f["facial_area"]["h"],
    )
    face_crop = crop_face_region(warped, best["facial_area"], padding=0.15)

    logger.info("id_face_extracted", confidence=best["confidence"])

    return {
        "face_image": face_crop,
        "facial_area": best["facial_area"],
        "confidence": best["confidence"],
        "document_detected": True,
    }

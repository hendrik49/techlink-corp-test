import time
import structlog

logger = structlog.get_logger()


class FrameRateLimiter:
    """Limits the number of frames processed per second for a session."""

    def __init__(self, max_fps: float = 5.0) -> None:
        self.max_fps = max_fps
        self.min_interval = 1.0 / max_fps
        self._last_frame: dict[str, float] = {}

    def allow(self, session_id: str) -> bool:
        now = time.time()
        last = self._last_frame.get(session_id, 0.0)
        if now - last < self.min_interval:
            return False
        self._last_frame[session_id] = now
        return True

    def cleanup(self, session_id: str) -> None:
        self._last_frame.pop(session_id, None)


def sanitize_session_id(session_id: str) -> bool:
    """Validate that a session ID looks like a UUID."""
    import re
    pattern = re.compile(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        re.IGNORECASE,
    )
    return bool(pattern.match(session_id))

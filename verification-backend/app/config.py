from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    session_ttl_seconds: int = 600
    max_frame_size_kb: int = 512
    face_match_threshold: float = 0.68
    face_model: str = "ArcFace"
    detector_backend: str = "retinaface"
    log_level: str = "INFO"
    ws_frame_rate_limit: float = 5.0  # max frames per second per session

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()

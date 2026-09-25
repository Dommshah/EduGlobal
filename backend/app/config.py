from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://eduglobal@localhost:5432/eduglobal"
    jwt_secret: str = "eduglobal-dev-secret"
    jwt_expires_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:4000,http://127.0.0.1:4000,http://localhost:3000,http://127.0.0.1:3000"
    openai_api_key: str = ""

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

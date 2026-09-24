from functools import lru_cache
from pydantic_settings import BaseSettings,SettingsConfigDict

class Settings(BaseSettings):
    database_url:str
    groq_api_key:str
    tavily_api_key:str
    groq_model: str = "openai/gpt-oss-120b"

    model_config=SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

@lru_cache
def get_settings()->Settings:
    return Settings()
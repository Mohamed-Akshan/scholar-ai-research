from datetime import datetime

from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    question: str = Field(
        min_length=3,
        max_length=2000,
        strip_whitespace=True,
    )


class ResearchHistoryItem(BaseModel):
    id: int
    question: str
    status: str
    created_at: datetime


class ResearchResponse(BaseModel):
    id: int
    question: str
    answer: str = ""
    sources: list[dict]
    status: str
    steps: list[str]
    created_at: datetime

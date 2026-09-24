import json
from collections.abc import Generator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.database import models
from app.database.connection import Base, engine, SessionLocal
from app.database.models import ResearchRun
from app.graph.research_graph import research_graph
from app.schemas.research import (
    ResearchHistoryItem,
    ResearchRequest,
    ResearchResponse,
)


# This function provides a database session to each endpoint.
def get_db() -> Generator[Session, None, None]:
    database = SessionLocal()

    try:
        yield database
    finally:
        database.close()


# This runs when FastAPI starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


# Create the FastAPI application.
app = FastAPI(
    title="Scholar AI Research API",
    description=(
        "A supervisor-based multi-agent academic research system."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# Allow the React frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Convert a database record into the response format.
def convert_record_to_response(
    record: ResearchRun,
    steps: list[str] | None = None,
) -> ResearchResponse:
    return ResearchResponse(
        id=record.id,
        question=record.question,
        answer=record.answer,
        sources=json.loads(record.sources_json),
        status=record.status,
        steps=steps or [],
        created_at=record.created_at,
    )


# A simple endpoint to check whether the backend is running.
@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "Scholar AI Research",
    }


# Run a new research request.
@app.post(
    "/api/research",
    response_model=ResearchResponse,
)
async def create_research(
    request: ResearchRequest,
    database: Session = Depends(get_db),
):
    question = request.question.strip()

    research_record = ResearchRun(
        question=question,
        answer="",
        status="pending",
    )

    database.add(research_record)
    database.commit()
    database.refresh(research_record)

    try:
        result = await run_in_threadpool(
            research_graph.invoke,
            {
                "question": question,
                "steps": [],
            },
        )

        answer = result.get(
            "answer",
            "The research workflow did not return an answer.",
        )

        sources = result.get("approved_sources", [])
        steps = result.get("steps", [])

        research_record.answer = answer
        research_record.sources_json = json.dumps(sources)
        if result.get("allowed") is False:
            research_record.status = "blocked"
        else:
            research_record.status = "completed"

        database.commit()
        database.refresh(research_record)

        return convert_record_to_response(
            record=research_record,
            steps=steps,
        )

    except Exception as error:
        database.rollback()

        failed_record = database.get(
            ResearchRun,
            research_record.id,
        )

        if failed_record is not None:
            failed_record.status = "failed"
            database.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Research failed: {str(error)}",
        ) from error


# Return the 20 most recent research requests.
@app.get(
    "/api/research/history",
    response_model=list[ResearchHistoryItem],
)
def get_research_history(
    database: Session = Depends(get_db),
):
    statement = (
        select(ResearchRun)
        .order_by(ResearchRun.created_at.desc())
        .limit(20)
    )

    records = database.scalars(statement).all()

    return [
        ResearchHistoryItem(
            id=record.id,
            question=record.question,
            status=record.status,
            created_at=record.created_at,
        )
        for record in records
    ]


# Delete one research run.
@app.delete("/api/research/history")
def clear_research_history(
    database: Session = Depends(get_db),
):
    deleted = database.query(ResearchRun).delete()
    database.commit()
    return {"deleted": deleted}


# Delete all research runs.
@app.delete("/api/research/{research_id}")
def delete_research(
    research_id: int,
    database: Session = Depends(get_db),
):
    record = database.get(
        ResearchRun,
        research_id,
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Research record was not found.",
        )

    database.delete(record)
    database.commit()
    return {"id": research_id, "deleted": True}


# Return one research result using its ID.
@app.get(
    "/api/research/{research_id}",
    response_model=ResearchResponse,
)
def get_research_by_id(
    research_id: int,
    database: Session = Depends(get_db),
):
    record = database.get(
        ResearchRun,
        research_id,
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Research record was not found.",
        )

    return convert_record_to_response(record)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import ResearchRun

MEMORY_LIMIT = 5
ANSWER_CHAR_LIMIT = 500


def get_memory_context(database: Session) -> str:
    """Return recent completed Q&A pairs as text for prompt injection."""
    statement = (
        select(ResearchRun)
        .where(ResearchRun.status == "completed")
        .order_by(ResearchRun.created_at.desc())
        .limit(MEMORY_LIMIT)
    )

    records = database.scalars(statement).all()
    if not records:
        return ""

    lines = []
    for record in reversed(records):
        answer = (record.answer or "")[:ANSWER_CHAR_LIMIT]
        lines.append(f"Q: {record.question}\nA: {answer}")

    return (
        "Long-term memory — recent conversation history "
        "(use only if relevant to the current question):\n\n"
        + "\n\n".join(lines)
    )

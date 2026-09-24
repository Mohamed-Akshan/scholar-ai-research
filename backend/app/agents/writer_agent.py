from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.state import ResearchState
from app.llm.client import get_llm
from app.prompts.writer import WRITER_SYSTEM_PROMPT


def writer_node(state: ResearchState) -> dict:
    question = state["question"]
    sources = state.get("approved_sources", [])
    steps = list(state.get("steps", []))

    if not sources:
        answer = (
            "I could not find enough verified sources to answer "
            f"this question confidently: {question}"
        )
        steps.append("No sources available — returned fallback answer")
        return {"answer": answer, "steps": steps}

    source_blocks = []
    for index, source in enumerate(sources, start=1):
        source_blocks.append(
            f"[{index}] {source.get('title', 'Untitled')}\n"
            f"URL: {source.get('url', '')}\n"
            f"{source.get('content', '')}"
        )

    prompt = (
        f"Question:\n{question}\n\n"
        f"Sources:\n\n" + "\n\n".join(source_blocks)
    )

    llm = get_llm()
    response = llm.invoke(
        [
            SystemMessage(content=WRITER_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
    )

    answer = response.content if isinstance(response.content, str) else str(response.content)
    steps.append("Wrote final cited answer")

    return {"answer": answer, "steps": steps}

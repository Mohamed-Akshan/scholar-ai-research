from app.graph.state import ResearchState
from app.tools.search import search_web


def search_node(state: ResearchState) -> dict:
    question = state["question"]
    steps = list(state.get("steps", []))

    steps.append(f"Searching the web for: {question}")
    results = search_web(question)
    steps.append(f"Found {len(results)} raw results")

    return {
        "search_results": results,
        "steps": steps,
    }

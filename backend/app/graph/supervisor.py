from app.graph.state import ResearchState


def supervisor(state: ResearchState) -> dict:
    steps = list(state.get("steps", []))
    steps.append("Supervisor dispatched research pipeline")
    return {"steps": steps}

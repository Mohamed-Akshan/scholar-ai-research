from app.graph.state import ResearchState


def source_node(state: ResearchState) -> dict:
    results = state.get("search_results", [])
    steps = list(state.get("steps", []))

    seen: set[str] = set()
    approved = []

    for item in results:
        url = (item.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        approved.append(item)

    approved = approved[:6]
    steps.append(f"Verified {len(approved)} unique sources")

    return {
        "approved_sources": approved,
        "steps": steps,
    }

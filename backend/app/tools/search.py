from app.config.settings import get_settings
from app.graph.state import Source
from tavily import TavilyClient


def search_web(query: str) -> list[Source]:
    api_key = get_settings().tavily_api_key

    if not api_key:
        raise ValueError("Tavily api_key not found")

    client = TavilyClient(api_key=api_key)

    response = client.search(
        query=query,
        max_results=5,
    )

    return [
        {
            "title": result.get("title", ""),
            "content": result.get("content", ""),
            "url": result.get("url", ""),
        }
        for result in response.get("results", [])
    ]

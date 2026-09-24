from typing import TypedDict


class Source(TypedDict):
    title: str
    content: str
    url: str


class ResearchState(TypedDict, total=False):
    question: str
    steps: list[str]
    search_results: list[Source]
    approved_sources: list[Source]
    answer: str

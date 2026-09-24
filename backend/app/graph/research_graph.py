from langgraph.graph import END, START, StateGraph

from app.agents.search_agent import search_node
from app.agents.source_agent import source_node
from app.agents.writer_agent import writer_node
from app.graph.state import ResearchState
from app.graph.supervisor import supervisor

workflow = StateGraph(ResearchState)

workflow.add_node("supervisor", supervisor)
workflow.add_node("search", search_node)
workflow.add_node("source", source_node)
workflow.add_node("writer", writer_node)

workflow.add_edge(START, "supervisor")
workflow.add_edge("supervisor", "search")
workflow.add_edge("search", "source")
workflow.add_edge("source", "writer")
workflow.add_edge("writer", END)

research_graph = workflow.compile()

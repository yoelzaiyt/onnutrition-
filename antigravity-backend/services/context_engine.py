from services.vector_memory import search_memory


class ContextEngine:
    def __init__(self):
        self.min_relevance_threshold = 0.7

    async def get_context(self, task: str, n_results: int = 5):
        related = search_memory(task, n_results)
        return self.format_context(task, related)

    def format_context(self, task: str, data: dict):
        related_memories = []
        relevance_scores = []

        for i, doc in enumerate(data.get("documents", [])):
            distance = data.get("distances", [1])[i]
            relevance = 1 - distance

            if relevance >= self.min_relevance_threshold:
                related_memories.append(doc)
                relevance_scores.append(relevance)

        context = "\n".join([f"- {item}" for item in related_memories])
        if not context:
            context = "* Nenhuma memória relevante encontrada."

        return {
            "task": task,
            "related_memories": related_memories,
            "context": context,
            "relevance_scores": relevance_scores
        }

    def set_threshold(self, threshold: float):
        self.min_relevance_threshold = threshold


async def get_context(task: str, n_results: int = 5):
    engine = ContextEngine()
    return await engine.get_context(task, n_results)
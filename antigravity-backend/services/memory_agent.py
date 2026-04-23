from datetime import datetime

from services.context_engine import get_context
from services.vector_memory import save_memory
from services.hybrid_memory import log_task


class MemoryAgent:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.auto_save = True

    async def execute(self, task: str, executor_fn):
        task_id = f"{self.agent_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        context_result = await get_context(task)
        
        task_with_context = self._build_contextual_task(task, context_result["context"])
        
        result = await executor_fn(task_with_context)
        
        if self.auto_save:
            await self._save_experience(task_id, task, result, context_result["context"])
        
        return {
            "success": True,
            "result": result,
            "context": context_result["context"],
            "metadata": {
                "task_id": task_id,
                "timestamp": datetime.now().isoformat()
            }
        }

    def _build_contextual_task(self, task: str, context: str) -> str:
        if not context or "Nenhuma memória" in context:
            return task
        return f"Contexto anterior:\n{context}\n---\nNova tarefa:\n{task}"

    async def _save_experience(self, task_id: str, task: str, result: str, context_used: str):
        full_content = f"{task}\n{result}\n\nContexto: {context_used}"
        await save_memory(task_id, full_content)
        await log_task(task_id, result)


async def run_with_memory(agent_name: str, task: str, executor_fn):
    agent = MemoryAgent(agent_name)
    return await agent.execute(task, executor_fn)
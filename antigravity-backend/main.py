from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import os

from services.obsidian_service import log_task, save_note, format_note
from services.vector_memory import save_memory, search_memory
from services.context_engine import ContextEngine, get_context
from services.hybrid_memory import log_task as hybrid_log_task
from services.security_filter import is_sensitive, save_memory_safe
from services.memory_agent import MemoryAgent

app = FastAPI(title="Antigravity API", version="1.0.0")

context_engine = ContextEngine()


class TaskRequest(BaseModel):
    task: str
    save_to_memory: bool = True


class TaskResponse(BaseModel):
    task: str
    result: str
    context: str | None = None
    saved: bool = False


@app.get("/")
def root():
    return {"message": "Antigravity API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/task", response_model=TaskResponse)
async def execute_task(request: TaskRequest):
    task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    context_result = await context_engine.get_context(request.task)
    
    result = f"Tarefa processada: {request.task}\nContexto: {context_result.context}"

    if request.save_to_memory:
        check = is_sensitive(request.task + result)
        if not check["is_sensitive"]:
            await save_memory(task_id, f"{request.task}\n{result}")
            await log_task(request.task, result)
            return TaskResponse(
                task=request.task,
                result=result,
                context=context_result.context,
                saved=True
            )
        else:
            await log_task(request.task, f"[FILTRADO] {result}")

    return TaskResponse(
        task=request.task,
        result=result,
        context=context_result.context,
        saved=False
    )


@app.post("/memory/save")
async def save_to_memory(id: str, content: str):
    check = is_sensitive(content)
    if check["is_sensitive"]:
        return {"saved": False, "reason": "content is sensitive"}
    
    await save_memory(id, content)
    return {"saved": True, "id": id}


@app.post("/memory/search")
async def search_in_memory(query: str, n_results: int = 5):
    results = await search_memory(query, n_results)
    return results


@app.post("/memory/safe")
async def save_memory_secure(id: str, content: str):
    return await save_memory_safe(id, content)


@app.get("/context/{task}")
async def get_task_context(task: str):
    return await get_context(task)
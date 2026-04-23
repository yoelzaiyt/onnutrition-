import os
from datetime import datetime

from services.vector_memory import save_memory, search_memory
from services.obsidian_service import save_note as obsidian_save_note, format_note


async def save_note(folder: str, title: str, content: str) -> dict:
    from services.obsidian_service import save_note as obsidian_save

    file_path = await obsidian_save(folder, title, content)
    await save_memory(f"{folder}/{title}", content)

    return {
        "id": f"{folder}/{title}",
        "folder": folder,
        "title": title,
        "file_path": file_path,
        "created_at": datetime.now().isoformat()
    }


async def log_task(task: str, result: str) -> dict:
    content = format_note(task, result)
    return await save_note("05-Logs", task, content)


async def search_both(query: str, n_results: int = 5):
    vector_results = await search_memory(query, n_results)
    return {
        "vector_results": vector_results,
        "notes": []
    }
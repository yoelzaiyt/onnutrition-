import os
from datetime import datetime

VAULT_PATH = os.getenv("OBSIDIAN_VAULT_PATH")

def save_note(folder, title, content):
    if not VAULT_PATH:
        raise ValueError("OBSIDIAN_VAULT_PATH não configurado")

    path = os.path.join(VAULT_PATH, folder)

    if not os.path.exists(path):
        os.makedirs(path)

    safe_title = "".join(c if c.isalnum() or c in "-_" else "_" for c in title)
    filename = f"{safe_title}.md"
    file_path = os.path.join(path, filename)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    return file_path


def format_note(task, result):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"""# {task}

## Data
{timestamp}

## Resultado

{result}
"""


def log_task(task, result):
    content = format_note(task, result)
    return save_note("05-Logs", task, content)
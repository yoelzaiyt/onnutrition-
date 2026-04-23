import re
import os
from typing import Optional

SENSITIVE_KEYWORDS = [
    "senha", "password", "passwd", "token", "api_key", "apikey", "secret",
    "cpf", "rg", "cartao", "credit_card", "cvv", "pix", "chave_pix",
    "biometria", "biometric", "jwt", "access_token", "refresh_token",
    "private_key", "chave_privada", "credentials", "login", "auth"
]

SENSITIVE_PATTERNS = [
    r"password[_\s]*[:=]\s*[^\s]+",
    r"api[_-]?key[_\s]*[:=]\s*[^\s]+",
    r"token[_\s]*[:=]\s*[a-zA-Z0-9_\-]+",
    r"bearer[_\s]+[a-zA-Z0-9_\-\.]+",
    r"sk-[a-zA-Z0-9]{20,}",
    r"cpf[:\s]*\d{3}\.?\d{3}\.?\d{3}-?\d{2}",
]


def is_sensitive(text: str) -> dict:
    if not text:
        return {"is_sensitive": False, "matched_keywords": [], "matched_patterns": 0}

    lower_text = text.lower()
    matched_keywords = [k for k in SENSITIVE_KEYWORDS if k in lower_text]
    matched_patterns = sum(1 for p in SENSITIVE_PATTERNS if re.search(p, text))

    is_sens = len(matched_keywords) > 0 or matched_patterns > 0

    return {
        "is_sensitive": is_sens,
        "matched_keywords": matched_keywords,
        "matched_patterns": matched_patterns
    }


def sanitize_for_memory(text: str) -> str:
    sanitized = text
    sanitized = re.sub(r"sk-[a-zA-Z0-9]{20,}", "[API_KEY_REDACTED]", sanitized)
    sanitized = re.sub(r"eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+", "[JWT_REDACTED]", sanitized)
    sanitized = re.sub(r"password[_\s]*[:=]\s*[^\s]+", "password: [REDACTED]", sanitized)
    sanitized = re.sub(r"api[_-]?key[_\s]*[:=]\s*[^\s]+", "api_key: [REDACTED]", sanitized)
    sanitized = re.sub(r"token[_\s]*[:=]\s*[a-zA-Z0-9_\-]+", "token: [REDACTED]", sanitized)
    return sanitized


async def save_memory_safe(id: str, content: str, folder: str = "05-Logs") -> dict:
    from services.obsidian_service import save_note
    from services.vector_memory import save_memory

    check = is_sensitive(content)
    if check["is_sensitive"]:
        await save_note(folder, id, f"🔒 [SENSÍVEL DETECTADO]\n\n{content}")
        return {
            "saved": False,
            "reason": f"Palavras-chave sensíveis detectadas: {check['matched_keywords']}"
        }

    sanitized = sanitize_for_memory(content)
    await save_memory(id, sanitized)
    await save_note(folder, id, sanitized)

    return {"saved": True, "id": id}
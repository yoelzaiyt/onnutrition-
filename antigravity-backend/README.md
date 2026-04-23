# Antigravity Backend

API de memória inteligente com integração Obsidian.

## Instalação

```bash
cd antigravity-backend
pip install -r requirements.txt
```

## Configuração

Copie `.env.example` para `.env` e configure:

```env
OBSIDIAN_VAULT_PATH=C:\Users\wordi\Documents\Obsidian\Antigravity
CHROMA_DB_PATH=./data/vector_db
```

## Executar

```bash
# ChromaDB já está incluso (modo persistente)
# Terminal: API
uvicorn main:app --reload --port 8001
```

## Endpoints

- `GET /` - Info
- `GET /health` - Health check
- `POST /task` - Executar tarefa
- `POST /memory/save` - Salvar memória
- `POST /memory/search` - Buscar memória
- `POST /memory/safe` - Salvar com filtro segurança
- `GET /context/{task}` - Obter contexto
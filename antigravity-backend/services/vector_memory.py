import os
from chromadb import Client
from chromadb.config import Settings

chroma_path = os.getenv("CHROMA_DB_PATH", "./data/vector_db")
client = Client(Settings(persist_directory=chroma_path))
collection_name = "antigravity_memory"


def save_memory(id: str, text: str):
    collection = client.get_or_create_collection(collection_name)
    collection.add(documents=[text], ids=[id])


def search_memory(query: str, n_results: int = 5):
    collection = client.get_or_create_collection(collection_name)
    results = collection.query(query_texts=[query], n_results=n_results)
    return {
        "ids": results.get("ids", [[]])[0],
        "documents": results.get("documents", [[]])[0],
        "distances": results.get("distances", [[]])[0]
    }


def delete_memory(id: str):
    collection = client.get_or_create_collection(collection_name)
    collection.delete(ids=[id])


def clear_memory():
    client.delete_collection(collection_name)
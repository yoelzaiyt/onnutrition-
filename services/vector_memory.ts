import { Client } from "chromadb";

let client: Client | null = null;
let collectionName = "antigravity_memory";

function getClient(): Client {
  if (!client) {
    client = new Client({
      path: "http://localhost:8000",
    });
  }
  return client;
}

export async function saveMemory(id: string, text: string): Promise<void> {
  const chroma = getClient();
  const collection = await chroma.getOrCreateCollection({
    name: collectionName,
  });

  await collection.add({
    documents: [text],
    ids: [id],
  });
}

export async function searchMemory(
  query: string,
  nResults: number = 5
): Promise<{ ids: string[]; documents: string[]; distances: number[] }> {
  const chroma = getClient();
  const collection = await chroma.getOrCreateCollection({
    name: collectionName,
  });

  const results = await collection.query({
    queryTexts: [query],
    nResults,
  });

  return {
    ids: results.ids[0] || [],
    documents: results.documents[0] || [],
    distances: results.distances?.[0] || [],
  };
}

export async function deleteMemory(id: string): Promise<void> {
  const chroma = getClient();
  const collection = await chroma.getOrCreateCollection({
    name: collectionName,
  });

  await collection.delete({ ids: [id] });
}

export interface MemorySearchResult {
  ids: string[];
  documents: string[];
  distances: number[];
}

export async function clearMemory(): Promise<void> {
  const chroma = getClient();
  await chroma.deleteCollection({ name: collectionName });
}
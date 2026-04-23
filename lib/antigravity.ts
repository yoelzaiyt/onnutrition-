const ANTIGRAVITY_API_URL = process.env.NEXT_PUBLIC_ANTIGRAVITY_API_URL || "http://localhost:8000";

export interface TaskRequest {
  task: string;
  save_to_memory?: boolean;
}

export interface TaskResponse {
  task: string;
  result: string;
  context?: string;
  saved: boolean;
}

export interface MemorySearchResult {
  ids: string[];
  documents: string[];
  distances: number[];
}

export interface ContextResult {
  task: string;
  related_memories: string[];
  context: string;
  relevance_scores: number[];
}

export async function sendTask(task: string, saveToMemory: boolean = true): Promise<TaskResponse> {
  const response = await fetch(`${ANTIGRAVITY_API_URL}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task,
      save_to_memory: saveToMemory,
    }),
  });

  if (!response.ok) {
    throw new Error(`Antigravity API error: ${response.statusText}`);
  }

  return response.json();
}

export async function saveMemory(id: string, content: string): Promise<{ saved: boolean }> {
  const response = await fetch(`${ANTIGRAVITY_API_URL}/memory/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, content }),
  });

  return response.json();
}

export async function searchMemory(
  query: string,
  nResults: number = 5
): Promise<MemorySearchResult> {
  const response = await fetch(
    `${ANTIGRAVITY_API_URL}/memory/search?query=${encodeURIComponent(query)}&n_results=${nResults}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}

export async function saveMemorySafe(
  id: string,
  content: string
): Promise<{ saved: boolean; reason?: string }> {
  const response = await fetch(`${ANTIGRAVITY_API_URL}/memory/safe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, content }),
  });

  return response.json();
}

export async function getContext(task: string): Promise<ContextResult> {
  const response = await fetch(
    `${ANTIGRAVITY_API_URL}/context/${encodeURIComponent(task)}`
  );

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${ANTIGRAVITY_API_URL}/health`);
  return response.json();
}
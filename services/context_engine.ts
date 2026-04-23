import { searchMemory, type MemorySearchResult } from "./vector_memory";

export interface ContextResult {
  task: string;
  relatedMemories: string[];
  context: string;
  relevanceScores: number[];
}

export class ContextEngine {
  private minRelevanceThreshold = 0.7;

  async getContext(task: string, nResults: number = 5): Promise<ContextResult> {
    const searchResult = await searchMemory(task, nResults);
    
    return this.formatContext(task, searchResult);
  }

  private formatContext(
    task: string,
    data: { ids: string[]; documents: string[]; distances: number[] }
  ): ContextResult {
    const relatedMemories: string[] = [];
    const relevanceScores: number[] = [];

    data.ids.forEach((id, index) => {
      const distance = data.distances[index] ?? 1;
      const relevance = 1 - distance;
      
      if (relevance >= this.minRelevanceThreshold) {
        relatedMemories.push(data.documents[index]);
        relevanceScores.push(relevance);
      }
    });

    let context = "";
    relatedMemories.forEach((item) => {
      context += `- ${item}\n`;
    });

    if (!context) {
      context = "* Nenhuma memória relevante encontrada.\n";
    }

    return {
      task,
      relatedMemories,
      context,
      relevanceScores,
    };
  }

  setThreshold(threshold: number): void {
    this.minRelevanceThreshold = threshold;
  }

  async getFullContext(task: string): Promise<string> {
    const context = await this.getContext(task);
    return context.context;
  }
}

export const contextEngine = new ContextEngine();

export async function getContext(task: string): Promise<ContextResult> {
  return contextEngine.getContext(task);
}

export async function getContextString(task: string): Promise<string> {
  return contextEngine.getFullContext(task);
}
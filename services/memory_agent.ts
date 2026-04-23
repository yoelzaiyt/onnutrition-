import { getContext } from "./context_engine";
import { saveMemory } from "./vector_memory";
import { logTask, formatNote, saveNote } from "./hybrid_memory";

export interface TaskResult {
  success: boolean;
  result: string;
  context: string;
  metadata: {
    taskId: string;
    timestamp: string;
    duration: number;
  };
}

export class MemoryAgent {
  private agentName: string;
  private autoSave: boolean = true;

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  async execute(
    task: string,
    executorFn: (taskWithContext: string) => Promise<string>
  ): Promise<TaskResult> {
    const startTime = Date.now();
    const taskId = `${this.agentName}_${Date.now()}`;

    const contextResult = await getContext(task);
    const taskWithContext = this.buildContextualTask(task, contextResult.context);

    let result: string;
    let success = true;

    try {
      result = await executorFn(taskWithContext);
    } catch (error) {
      result = `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
      success = false;
    }

    const duration = Date.now() - startTime;

    if (this.autoSave) {
      await this.saveExperience(taskId, task, result, taskWithContext, success);
    }

    return {
      success,
      result,
      context: contextResult.context,
      metadata: {
        taskId,
        timestamp: new Date().toISOString(),
        duration,
      },
    };
  }

  private buildContextualTask(task: string, context: string): string {
    if (!context || context.includes("Nenhuma memória")) {
      return task;
    }

    return `Contexto anterior:\n${context}\n---\nNova tarefa:\n${task}`;
  }

  private async saveExperience(
    taskId: string,
    originalTask: string,
    result: string,
    contextUsed: string,
    success: boolean
  ): Promise<void> {
    const fullContent = formatNote(originalTask, result);
    const logEntry = `${fullContent}\n\n---\n\n### Contexto utilizado:\n${contextUsed}\n\n### Sucesso: ${success}`;

    await saveMemory(taskId, `${originalTask}\n${result}\n${contextUsed}`);

    await saveNote(
      "05-Logs",
      taskId,
      logEntry
    );
  }

  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
  }

  async executeSimple(
    task: string,
    executorFn: (taskWithContext: string) => Promise<string>
  ): Promise<TaskResult> {
    return this.execute(task, executorFn);
  }
}

export async function runWithMemory(
  agentName: string,
  task: string,
  executorFn: (taskWithContext: string) => Promise<string>
): Promise<TaskResult> {
  const agent = new MemoryAgent(agentName);
  return agent.execute(task, executorFn);
}

export async function quickLog(task: string, result: string): Promise<void> {
  await logTask(task, result);
}
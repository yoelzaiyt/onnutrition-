import * as fs from "fs";
import * as path from "path";
import { saveMemory, searchMemory } from "./vector_memory";

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;

export interface NoteMetadata {
  id: string;
  folder: string;
  title: string;
  createdAt: string;
  filePath: string;
}

function sanitizeTitle(title: string): string {
  return title.replace(/[^a-zA-Z0-9-_]/g, "_");
}

export async function saveNote(
  folder: string,
  title: string,
  content: string
): Promise<NoteMetadata> {
  if (!VAULT_PATH) {
    throw new Error("OBSIDIAN_VAULT_PATH não configurado");
  }

  const folderPath = path.join(VAULT_PATH, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const safeTitle = sanitizeTitle(title);
  const filename = `${safeTitle}.md`;
  const filePath = path.join(folderPath, filename);

  fs.writeFileSync(filePath, content, "utf-8");

  const id = `${folder}/${safeTitle}`;
  
  await saveMemory(id, content);

  return {
    id,
    folder,
    title,
    createdAt: new Date().toISOString(),
    filePath,
  };
}

export function formatNote(task: string, result: string): string {
  const timestamp = new Date().toISOString();
  return `# ${task}

## Data
${timestamp}

## Resultado

${result}
`;
}

export async function logTask(task: string, result: string): Promise<NoteMetadata> {
  const content = formatNote(task, result);
  return saveNote("05-Logs", task, content);
}

export async function searchBoth(
  query: string,
  nResults: number = 5
): Promise<{
  vectorResults: { ids: string[]; documents: string[]; distances: number[] };
  notes: { path: string; content: string }[];
}> {
  const vectorResults = await searchMemory(query, nResults);

  const notes: { path: string; content: string }[] = [];
  
  if (VAULT_PATH && fs.existsSync(VAULT_PATH)) {
    function readDirRecursive(dir: string, depth: number = 0): void {
      if (depth > 3) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          readDirRecursive(fullPath, depth + 1);
        } else if (entry.name.endsWith(".md")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          notes.push({ path: fullPath, content });
        }
      }
    }
    
    readDirRecursive(VAULT_PATH);
  }

  return { vectorResults, notes };
}

export async function saveNoteOnly(
  folder: string,
  title: string,
  content: string
): Promise<NoteMetadata> {
  if (!VAULT_PATH) {
    throw new Error("OBSIDIAN_VAULT_PATH não configurado");
  }

  const folderPath = path.join(VAULT_PATH, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const safeTitle = sanitizeTitle(title);
  const filename = `${safeTitle}.md`;
  const filePath = path.join(folderPath, filename);

  fs.writeFileSync(filePath, content, "utf-8");

  return {
    id: `${folder}/${safeTitle}`,
    folder,
    title,
    createdAt: new Date().toISOString(),
    filePath,
  };
}
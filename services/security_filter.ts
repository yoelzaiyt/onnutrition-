import { saveMemory } from "./vector_memory";
import { saveNote } from "./hybrid_memory";

const SENSITIVE_KEYWORDS = [
  "senha",
  "password",
  "passwd",
  "token",
  "api_key",
  "apikey",
  "secret",
  "cpf",
  "rg",
  "cpf",
  "cartao",
  "credit_card",
  "cvv",
  "pix",
  "chave_pix",
  "biometria",
  "biometric",
  "jwt",
  "access_token",
  "refresh_token",
  "private_key",
  "chave_privada",
  "credentials",
  "login",
  "auth",
];

const SENSITIVE_PATTERNS = [
  /password[_\s]*[:=]\s*[^\s]+/i,
  /api[_-]?key[_\s]*[:=]\s*[^\s]+/i,
  /token[_\s]*[:=]\s*[a-zA-Z0-9_\-]+/i,
  /bearer[_\s]+[a-zA-Z0-9_\-\.]+/i,
  /sk-[a-zA-Z0-9]{20,}/i,
  /cpf[:\s]*\d{3}\.?\d{3}\.?\d{3}-?\d{2}/i,
  /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/i,
  /key[_\s]*[:=]\s*[a-zA-Z0-9_\-]{20,}/i,
];

export interface SensitiveCheckResult {
  isSensitive: boolean;
  matchedKeywords: string[];
  matchedPatterns: number;
}

export function isSensitive(text: string): SensitiveCheckResult {
  if (!text) {
    return { isSensitive: false, matchedKeywords: [], matchedPatterns: 0 };
  }

  const lowerText = text.toLowerCase();
  const matchedKeywords: string[] = [];

  for (const keyword of SENSITIVE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }

  let matchedPatterns = 0;
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns++;
    }
  }

  const isSensitive =
    matchedKeywords.length > 0 || matchedPatterns > 0;

  return { isSensitive, matchedKeywords, matchedPatterns };
}

export function sanitizeForMemory(text: string): string {
  let sanitized = text;

  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/gi, "[API_KEY_REDACTED]");
  sanitized = sanitized.replace(
    /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    "[JWT_REDACTED]"
  );
  sanitized = sanitized.replace(
    /password[_\s]*[:=]\s*[^\s]+/gi,
    "password: [REDACTED]"
  );
  sanitized = sanitized.replace(
    /api[_-]?key[_\s]*[:=]\s*[^\s]+/gi,
    "api_key: [REDACTED]"
  );
  sanitized = sanitized.replace(
    /token[_\s]*[:=]\s*[a-zA-Z0-9_\-]+/gi,
    "token: [REDACTED]"
  );
  sanitized = sanitized.replace(
    /bearer[_\s]+[a-zA-Z0-9_\-\.]+/gi,
    "bearer [REDACTED]"
  );

  return sanitized;
}

export function redactSensitive(text: string): string {
  let redacted = text;

  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  redacted = redacted.replace(emailPattern, "[EMAIL_REDACTED]");

  const cpfPattern = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
  redacted = redacted.replace(cpfPattern, "[CPF_REDACTED]");

  const phonePattern = /\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g;
  redacted = redacted.replace(phonePattern, "[PHONE_REDACTED]");

  return sanitizeForMemory(redacted);
}

export async function saveMemorySafe(
  id: string,
  content: string,
  folder: string = "05-Logs"
): Promise<{ saved: boolean; reason?: string }> {
  const check = isSensitive(content);

  if (check.isSensitive) {
    await saveNote(folder, id, `🔒 [SENSÍVEL DETECTADO]\n\n${content}`);
    return {
      saved: false,
      reason: `Palavras-chave detectadas: ${check.matchedKeywords.join(", ")}`,
    };
  }

  const sanitized = redactSensitive(content);
  await saveMemory(id, sanitized);
  await saveNote(folder, id, sanitized);

  return { saved: true };
}

export function addSensitiveKeyword(keyword: string): void {
  if (!SENSITIVE_KEYWORDS.includes(keyword.toLowerCase())) {
    SENSITIVE_KEYWORDS.push(keyword.toLowerCase());
  }
}

export function removeSensitiveKeyword(keyword: string): void {
  const index = SENSITIVE_KEYWORDS.indexOf(keyword.toLowerCase());
  if (index > -1) {
    SENSITIVE_KEYWORDS.splice(index, 1);
  }
}
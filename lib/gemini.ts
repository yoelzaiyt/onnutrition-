import { HarmBlockThreshold, HarmCategory } from '@google/genai';

const MODEL = 'gemini-1.5-flash-latest';

let cachedClient: any = null;

const getClient = (): any => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'SUA_CHAVE_GEMINI_AQUI') {
    console.warn('[Gemini] API key not configured — returning null');
    return null;
  }
  if (cachedClient) return cachedClient;
  
  try {
    const { ChatSession, GenerateContentResponse, GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    cachedClient = genAI.getGenerativeModel({ model: MODEL });
    return cachedClient;
  } catch (err) {
    console.error('[Gemini] Failed to initialize:', err);
    return null;
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────────
async function generateContent(prompt: string, jsonMode: boolean = true): Promise<any> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const result = await client.generateContent(prompt);
    const text = result.response.text();
    
    if (!jsonMode) return text;

    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : '{}');
  } catch (err) {
    console.error('[Gemini] generateContent error:', err);
    throw err;
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Resume um artigo científico em dois níveis (Simplificado e Técnico).
 */
export async function summarizeArticle(title: string, context: string = '') {
  const prompt = `Você é um robô de inteligência científica. 
Resuma o artigo acadêmico intitulado: "${title}".
Contexto adicional: ${context}

Retorne APENAS um JSON no formato:
{
  "simplificado": "Resumo em linguagem simples para leigos (1-2 frases)",
  "tecnico": "Resumo técnico detalhado com foco em mecanismos fisiológicos/bioquímicos (2-4 frases)",
  "nivel_evidencia": "alto" | "medio" | "baixo",
  "aplicacao_clinica": "Sugestão prática para o nutricionista"
}`;
  return generateContent(prompt, true);
}

/**
 * Resposta do IA Co-Piloto para suporte técnico profissional.
 */
export async function getAICopilotResponse(message: string, history: { role: string, content: string }[] = []) {
  const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');
  const prompt = `Você é o ON AI Co-Piloto, um assistente técnico de elite para nutricionistas.
Seu objetivo é fornecer embasamento científico, explicar mecanismos fisiológicos e sugerir condutas educacionais.

REGRAS CRÍTICAS:
1. NUNCA gere prescrições clínicas (dietas, dosagens de manipulados específicas para um paciente).
2. NUNCA dê diagnósticos médicos.
3. Se o usuário pedir uma dieta, explique que seu papel é técnico-educacional e sugira princípios teóricos em vez de um cardápio.
4. Use linguagem profissional e científica de alto nível.

Histórico:
${historyText}

Usuário: ${message}

Responda em Português (Brasil).`;

  return generateContent(prompt, false);
}

/**
 * Gera um plano alimentar personalizado via Gemini.
 * Retorna um JSON com chave `meals` ou lança erro em caso de falha.
 */
export async function generateDietPlan(params: {
  patientName: string;
  objective: string;
  targetCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  restrictions?: string;
  preferences?: string;
  mealsCount: number;
}) {
  const prompt = `Você é um nutricionista experiente e preciso.
Gere um plano alimentar com ${params.mealsCount} refeições para o paciente: ${params.patientName}.

Parâmetros obrigatórios:
- Objetivo: ${params.objective}
- Calorias totais: exatamente ${params.targetCalories} kcal (tolerância ±5%)
- Proteína: ${params.macros.protein}g | Carboidrato: ${params.macros.carbs}g | Gordura: ${params.macros.fats}g
- Restrições/Alergias: ${params.restrictions || 'Nenhuma'}
- Preferências: ${params.preferences || 'Nenhuma'}

Regras:
1. Alimentos realistas e de fácil acesso no Brasil.
2. Quantidades variadas (gramas, ml, unidades).
3. Macros totais DEVEM bater com os valores fornecidos.
4. Retorne APENAS JSON válido, sem texto adicional, sem markdown.

Formato de saída:
{
  "meals": [
    {
      "name": "Nome da Refeição",
      "time": "HH:MM",
      "foods": [
        { "name": "Alimento", "quantity": 100, "unit": "g", "calories": 150, "protein": 20, "carbs": 10, "fats": 5 }
      ]
    }
  ],
  "nutritional_summary": {
    "total_calories": 2000,
    "total_protein": 150,
    "total_carbs": 200,
    "total_fats": 60
  }
}`;

  return generateContent(prompt);
}

/**
 * Analisa respostas de anamnese e retorna diagnóstico + recomendações.
 */
export async function analyzeAnamnesis(responses: Record<string, any>) {
  const prompt = `Analise as respostas de anamnese nutricional abaixo e gere um diagnóstico clínico resumido e recomendações iniciais prioritárias. Responda em português do Brasil.

Dados do paciente:
${JSON.stringify(responses, null, 2)}

Retorne APENAS JSON válido no formato:
{
  "diagnosis": "Resumo clínico objetivo em 2-3 frases",
  "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"],
  "critical_alerts": ["Alerta de risco se houver, vazio se não houver"]
}`;

  return generateContent(prompt);
}

/**
 * Verifica se a API Gemini está configurada.
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'SUA_CHAVE_GEMINI_AQUI' && apiKey.length > 10);
}

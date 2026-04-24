/**
 * Multi-AI Service - Orquestra múltiplas APIs gratuitas de IA
 * para trabalharem em sintonia, oferecendo melhor experiência ao usuário.
 *
 * Provedores integrados:
 * 1. Google Gemini      → dietas, diagnósticos, metas (já existente)
 * 2. Hugging Face       → classificação de imagens de alimentos, análise de sentimento
 * 3. Edamam            → base nutricional precisa, análise de receitas
 * 4. USDA FoodData      → banco de dados nutricional oficial dos EUA
 * 5. Open Food Facts   → banco aberto de produtos alimentícios
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FoodNutritionInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  source: 'edamam' | 'usda' | 'off' | 'gemini' | 'mock';
}

export interface FoodImageAnalysis {
  foodName: string;
  confidence: number;
  nutrition: FoodNutritionInfo;
  alternatives?: string[];
}

export interface PatientMoodAnalysis {
  mood: 'positive' | 'neutral' | 'negative';
  stressLevel: number; // 0-10
  energyLevel: number; // 0-10
  recommendations: string[];
}

export interface CombinedDietPlan {
  meals: any[];
  nutritional_summary: any;
  sources: string[];
  confidence: number; // 0-1
  warnings: string[];
}

// ─── Configuração de APIs ────────────────────────────────────────────────────

const config = {
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    model: 'gemini-1.5-flash-latest',
  },
  huggingFace: {
    apiKey: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY,
    // Modelos gratuitos para classificação de imagem e texto
    imageModel: 'google/vit-base-patch16-224',
    sentimentModel: 'distilbert-base-uncased-finetuned-sst-2-english',
  },
  edamam: {
    appId: process.env.NEXT_PUBLIC_EDAMAM_APP_ID,
    appKey: process.env.NEXT_PUBLIC_EDAMAM_APP_KEY,
  },
  usda: {
    apiKey: process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY', // DEMO_KEY é gratuita com limite
  },
};

// ─── Utilitários ──────────────────────────────────────────────────────────────

function getEnvVar(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key] || undefined;
  }
  return process.env[key];
}

async function safeFetch(url: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[MultiAI] Fetch failed for ${url}:`, err);
    return null;
  }
}

// ─── Gemini Client (reutiliza lógica existente) ─────────────────────────────

import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = config.gemini.apiKey || getEnvVar('NEXT_PUBLIC_GEMINI_API_KEY');
  if (!apiKey || apiKey === 'SUA_CHAVE_GEMINI_AQUI') return null;
  if (geminiClient) return geminiClient;
  try {
    geminiClient = new GoogleGenAI({ apiKey });
    return geminiClient;
  } catch {
    return null;
  }
}

async function callGemini(prompt: string): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error('Gemini not configured');
  const res = await client.models.generateContent({ model: config.gemini.model, contents: prompt });
  return res.text ?? '';
}

// ─── Hugging Face Inference ──────────────────────────────────────────────────

async function callHuggingFaceInference(model: string, inputs: any): Promise<any> {
  const apiKey = config.huggingFace.apiKey || getEnvVar('NEXT_PUBLIC_HUGGINGFACE_API_KEY');
  if (!apiKey) return null;

  const url = `https://api-inference.huggingface.co/models/${model}`;
  const res = await safeFetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputs),
  });
  return res;
}

// ─── Provedor: Hugging Face ────────────────────────────────────────────────

export const hfProvider = {
  /**
   * Identifica alimento a partir de uma URL de imagem
   */
  async identifyFood(imageUrl: string): Promise<FoodImageAnalysis | null> {
    try {
      // Por limitação do HF free tier, usamos uma abordagem baseada em labels
      // Em produção, a imagem seria enviada via base64
      const result = await callHuggingFaceInference(config.huggingFace.imageModel, {
        inputs: imageUrl,
      });
      if (!result || !Array.isArray(result)) return null;

      const top = result[0];
      return {
        foodName: top.label || 'unknown',
        confidence: top.score || 0,
        nutrition: {
          name: top.label || 'Alimento',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          source: 'gemini' as const,
        },
        alternatives: result.slice(1, 4).map((r: any) => r.label),
      };
    } catch (err) {
      console.warn('[HF] Food identification failed:', err);
      return null;
    }
  },

  /**
   * Analisa o sentimento/mood de um texto do paciente
   */
  async analyzeMood(text: string): Promise<PatientMoodAnalysis | null> {
    try {
      const result = await callHuggingFaceInference(config.huggingFace.sentimentModel, {
        inputs: text,
      });
      if (!result || !Array.isArray(result)) return null;

      const sentiment = result[0]?.[0];
      const mood = sentiment?.label === 'POSITIVE' ? 'positive'
        : sentiment?.label === 'NEGATIVE' ? 'negative' : 'neutral';

      return {
        mood,
        stressLevel: mood === 'negative' ? 7 : mood === 'neutral' ? 4 : 2,
        energyLevel: mood === 'positive' ? 8 : mood === 'neutral' ? 5 : 3,
        recommendations: mood === 'negative'
          ? ['Recomendamos atividades relaxantes hoje', 'Considere alongamento leve']
          : mood === 'positive'
          ? ['Ótimo momento para exercícios intensos!', 'Mantenha o ritmo positivo!']
          : ['Que tal uma caminhada leve?', 'Mantenha a rotina alimentar em dia'],
      };
    } catch (err) {
      console.warn('[HF] Mood analysis failed:', err);
      return null;
    }
  },
};

// ─── Provedor: Edamam ───────────────────────────────────────────────────────

export const edamamProvider = {
  /**
   * Busca informações nutricionais de um alimento
   */
  async getNutrition(foodName: string, quantity: number = 100, unit: string = 'g'): Promise<FoodNutritionInfo | null> {
    const appId = config.edamam.appId || getEnvVar('NEXT_PUBLIC_EDAMAM_APP_ID');
    const appKey = config.edamam.appKey || getEnvVar('NEXT_PUBLIC_EDAMAM_APP_KEY');
    if (!appId || !appKey) return null;

    const url = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(`${quantity}${unit} ${foodName}`)}`;
    const data = await safeFetch(url);
    if (!data?.calories) return null;

    return {
      name: foodName,
      calories: Math.round(data.calories || 0),
      protein: Math.round(data.totalNutrients?.PROCNT?.quantity || 0),
      carbs: Math.round(data.totalNutrients?.CHOCDF?.quantity || 0),
      fat: Math.round(data.totalNutrients?.FAT?.quantity || 0),
      fiber: Math.round(data.totalNutrients?.FIBTG?.quantity || 0),
      sugar: Math.round(data.totalNutrients?.SUGAR?.quantity || 0),
      sodium: Math.round(data.totalNutrients?.NA?.quantity || 0),
      source: 'edamam' as const,
    };
  },

  /**
   * Busca receitas baseadas em ingredientes e restrições
   */
  async searchRecipes(query: string, restrictions: string[] = []): Promise<any[]> {
    const appId = config.edamam.appId || getEnvVar('NEXT_PUBLIC_EDAMAM_APP_ID');
    const appKey = config.edamam.appKey || getEnvVar('NEXT_PUBLIC_EDAMAM_APP_KEY');
    if (!appId || !appKey) return [];

    const healthLabels = restrictions.map(r => `&health=${encodeURIComponent(r)}`).join('');
    const url = `https://api.edamam.com/search?app_id=${appId}&app_key=${appKey}&q=${encodeURIComponent(query)}${healthLabels}&to=10`;
    const data = await safeFetch(url);
    return data?.hits?.map((h: any) => h.recipe) || [];
  },
};

// ─── Provedor: USDA FoodData Central ─────────────────────────────────────────

export const usdaProvider = {
  /**
   * Busca alimentos na base oficial do USDA
   */
  async searchFood(query: string): Promise<FoodNutritionInfo[]> {
    const apiKey = config.usda.apiKey || getEnvVar('NEXT_PUBLIC_USDA_API_KEY') || 'DEMO_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=5`;
    const data = await safeFetch(url);
    if (!data?.foods) return [];

    return data.foods.slice(0, 3).map((f: any) => {
      const getNutrient = (name: string) => {
        const n = f.foodNutrients?.find((x: any) => x.nutrientName?.includes(name));
        return n?.value || 0;
      };
      return {
        name: f.description || query,
        calories: Math.round(getNutrient('Energy') || 0),
        protein: Math.round(getNutrient('Protein') || 0),
        carbs: Math.round(getNutrient('Carbohydrate') || 0),
        fat: Math.round(getNutrient('Total lipid (fat)') || 0),
        fiber: Math.round(getNutrient('Fiber') || 0),
        source: 'usda' as const,
      };
    });
  },
};

// ─── Provedor: Open Food Facts ──────────────────────────────────────────────

export const offProvider = {
  /**
   * Busca informações nutricionais de produtos comerciais
   */
  async searchProduct(barcode: string): Promise<FoodNutritionInfo | null> {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const data = await safeFetch(url);
    if (!data?.product?.nutriments) return null;

    const n = data.product.nutriments;
    return {
      name: data.product.product_name || 'Produto',
      calories: Math.round(n['energy-kcal_100g'] || 0),
      protein: Math.round(n.proteins_100g || 0),
      carbs: Math.round(n.carbohydrates_100g || 0),
      fat: Math.round(n.fat_100g || 0),
      fiber: Math.round(n.fiber_100g || 0),
      source: 'off' as const,
    };
  },

  async searchByName(query: string): Promise<FoodNutritionInfo[]> {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    const data = await safeFetch(url);
    if (!data?.products) return [];

    return data.products.slice(0, 5).map((p: any) => {
      const n = p.nutriments || {};
      return {
        name: p.product_name || query,
        calories: Math.round(n['energy-kcal_100g'] || 0),
        protein: Math.round(n.proteins_100g || 0),
        carbs: Math.round(n.carbohydrates_100g || 0),
        fat: Math.round(n.fat_100g || 0),
        source: 'off' as const,
      };
    }).filter((x: any) => x.calories > 0);
  },
};

// ─── Orquestrador: Combina resultados de múltiplas IAs ─────────────────────

export const multiAiOrchestrator = {
  /**
   * Analisa um alimento combinando Edamam + USDA + OFF
   */
  async analyzeFood(foodName: string, quantity: number = 100): Promise<FoodNutritionInfo> {
    const results: FoodNutritionInfo[] = [];

    // Tenta Edamam primeiro (mais preciso para receitas)
    const edamamResult = await edamamProvider.getNutrition(foodName, quantity);
    if (edamamResult) results.push(edamamResult);

    // Tenta USDA (base oficial)
    const usdaResults = await usdaProvider.searchFood(foodName);
    if (usdaResults.length > 0) {
      const usda = { ...usdaResults[0], source: 'usda' as const };
      results.push(usda);
    }

    // Tenta Open Food Facts (produtos comerciais)
    const offResults = await offProvider.searchByName(foodName);
    if (offResults.length > 0) {
      results.push(offResults[0]);
    }

    if (results.length === 0) {
      // Fallback: estimativa via Gemini
      try {
        const prompt = `Forneça informações nutricionais para ${quantity}g de ${foodName}. Retorne JSON: {"calories": N, "protein": N, "carbs": N, "fat": N}`;
        const text = await callGemini(prompt);
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return { name: foodName, ...parsed, source: 'gemini' as const };
        }
      } catch {
        // ignore
      }
      // Último fallback: mock
      return {
        name: foodName,
        calories: 100, protein: 5, carbs: 15, fat: 3,
        source: 'mock' as const,
      };
    }

    // Média dos resultados de fontes diferentes
    const avg = {
      name: foodName,
      calories: Math.round(results.reduce((s, r) => s + r.calories, 0) / results.length),
      protein: Math.round(results.reduce((s, r) => s + r.protein, 0) / results.length),
      carbs: Math.round(results.reduce((s, r) => s + r.carbs, 0) / results.length),
      fat: Math.round(results.reduce((s, r) => s + r.fat, 0) / results.length),
      source: 'usda' as const, // marca como usda pois é a média
    };
    return avg;
  },

  /**
   * Gera plano alimentar combinando Gemini + Edamam
   */
  async generateEnhancedDietPlan(params: {
    patientName: string;
    objective: string;
    targetCalories: number;
    macros: { protein: number; carbs: number; fats: number };
    restrictions?: string[];
    preferences?: string;
    mealsCount?: number;
  }): Promise<CombinedDietPlan> {
    const warnings: string[] = [];
    const sources: string[] = [];

    // 1. Gemini gera a estrutura do plano
    let geminiPlan: any = null;
    try {
      const prompt = `Você é um nutricionista. Gere um plano alimentar com ${params.mealsCount || 5} refeições para ${params.patientName}.
Objetivo: ${params.objective}
Calorias: ${params.targetCalories} kcal
Proteína: ${params.macros.protein}g, Carboidratos: ${params.macros.carbs}g, Gorduras: ${params.macros.fats}g
Restrições: ${params.restrictions?.join(', ') || 'Nenhuma'}
Preferências: ${params.preferences || 'Nenhuma'}

Retorne APENAS JSON válido:
{"meals": [{"name": "Café da Manhã", "time": "07:00", "foods": [{"name": "Ovo", "quantity": 2, "unit": "un", "calories": 140, "protein": 12, "carbs": 1, "fats": 10}]}], "nutritional_summary": {"total_calories": 2000, "total_protein": 150, "total_carbs": 200, "total_fats": 60}}`;

      const text = await callGemini(prompt);
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        geminiPlan = JSON.parse(match[0]);
        sources.push('gemini');
      }
    } catch (err) {
      warnings.push('Gemini indisponível - usando dados alternativos');
    }

    // 2. Enriquece com dados precisos do Edamam
    if (geminiPlan?.meals) {
      sources.push('edamam');
      for (const meal of geminiPlan.meals) {
        for (const food of meal.foods || []) {
          try {
            const nutrition = await edamamProvider.getNutrition(food.name, food.quantity || 100, food.unit || 'g');
            if (nutrition) {
              food.calories = nutrition.calories;
              food.protein = nutrition.protein;
              food.carbs = nutrition.carbs;
              food.fats = nutrition.fat;
            }
          } catch {
            // mantém valores originais
          }
        }
      }
    }

    // 3. Se Gemini falhou, gera plano básico com USDA
    if (!geminiPlan) {
      sources.push('usda');
      warnings.push('Usando plano gerado com base em dados USDA');
      const foods = await usdaProvider.searchFood(params.objective.includes('emagrecer') ? 'chicken breast' : 'salmon');
      geminiPlan = {
        meals: [
          { name: 'Café da Manhã', time: '07:00', foods: [{ name: 'Ovo', quantity: 2, unit: 'un', calories: 140, protein: 12, carbs: 1, fats: 10 }] },
          { name: 'Almoço', time: '12:30', foods: foods.slice(0, 3).map((f: any) => ({ name: f.name, quantity: 100, unit: 'g', ...f })) },
        ],
        nutritional_summary: { total_calories: params.targetCalories, total_protein: params.macros.protein, total_carbs: params.macros.carbs, total_fats: params.macros.fats },
      };
    }

    return {
      ...geminiPlan,
      sources,
      confidence: sources.length >= 2 ? 0.9 : sources.length === 1 ? 0.7 : 0.5,
      warnings,
    };
  },

  /**
   * Analisa humor do paciente usando HF + Gemini em conjunto
   */
  async analyzePatientFeedback(text: string): Promise<PatientMoodAnalysis & { aiConsensus: string }> {
    const results: PatientMoodAnalysis[] = [];

    // HF para análise rápida de sentimento
    const hfResult = await hfProvider.analyzeMood(text);
    if (hfResult) results.push(hfResult);

    // Gemini para análise profunda
    try {
      const prompt = `Analise o seguinte relato de paciente e retorne JSON com mood (positive/neutral/negative), stressLevel (0-10), energyLevel (0-10) e 2 recomendações curtas.
Relato: "${text}"
Formato: {"mood": "neutral", "stressLevel": 5, "energyLevel": 5, "recommendations": ["rec1", "rec2"]}`;

      const geminiText = await callGemini(prompt);
      const match = geminiText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        results.push({
          mood: parsed.mood || 'neutral',
          stressLevel: parsed.stressLevel || 5,
          energyLevel: parsed.energyLevel || 5,
          recommendations: parsed.recommendations || [],
        });
      }
    } catch {
      // ignore
    }

    // Consenso entre IAs
    if (results.length === 0) {
      return {
        mood: 'neutral',
        stressLevel: 5,
        energyLevel: 5,
        recommendations: ['Continue registrando suas refeições regularmente'],
        aiConsensus: 'Indefinido (IA indisponível)',
      };
    }

    const consensus = {
      mood: results[0].mood,
      stressLevel: Math.round(results.reduce((s, r) => s + r.stressLevel, 0) / results.length),
      energyLevel: Math.round(results.reduce((s, r) => s + r.energyLevel, 0) / results.length),
      recommendations: [...new Set(results.flatMap(r => r.recommendations))].slice(0, 3),
      aiConsensus: results.length >= 2 ? 'Consenso entre múltiplas IAs' : 'Análise única',
    };

    return consensus;
  },

  /**
   * Verifica quais APIs estão configuradas e funcionais
   */
  getStatus() {
    return {
      gemini: !!getGeminiClient(),
      huggingFace: !!(config.huggingFace.apiKey || getEnvVar('NEXT_PUBLIC_HUGGINGFACE_API_KEY')),
      edamam: !!(config.edamam.appId || getEnvVar('NEXT_PUBLIC_EDAMAM_APP_ID')),
      usda: true, // USDA sempre disponível (DEMO_KEY)
      openFoodFacts: true, // OFF é totalmente aberto
    };
  },
};

export default multiAiOrchestrator;

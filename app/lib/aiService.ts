import { isGeminiConfigured, generateDietPlan } from '@/lib/gemini';

const MOCK_DIET_PLAN = {
  meals: [
    {
      name: 'Café da Manhã',
      time: '07:00',
      foods: [
        { name: 'Ovos mexidos', quantity: 2, unit: 'un', calories: 210, protein: 18, carbs: 2, fats: 14 },
        { name: 'Pão integral', quantity: 1, unit: 'fatia', calories: 80, protein: 4, carbs: 15, fats: 1 },
        { name: 'Abacate', quantity: 30, unit: 'g', calories: 50, protein: 1, carbs: 3, fats: 4 },
      ],
    },
    {
      name: 'Almoço',
      time: '12:30',
      foods: [
        { name: 'Frango grelhado', quantity: 150, unit: 'g', calories: 165, protein: 31, carbs: 0, fats: 3 },
        { name: 'Arroz integral', quantity: 100, unit: 'g', calories: 110, protein: 2, carbs: 23, fats: 1 },
        { name: 'Brócolis', quantity: 100, unit: 'g', calories: 35, protein: 3, carbs: 7, fats: 0 },
      ],
    },
    {
      name: 'Jantar',
      time: '19:30',
      foods: [
        { name: 'Peixe assado', quantity: 150, unit: 'g', calories: 135, protein: 30, carbs: 0, fats: 2 },
        { name: 'Batata doce', quantity: 100, unit: 'g', calories: 86, protein: 2, carbs: 20, fats: 0 },
        { name: 'Salada mista', quantity: 100, unit: 'g', calories: 20, protein: 1, carbs: 4, fats: 0 },
      ],
    },
  ],
  nutritional_summary: {
    total_calories: 891,
    total_protein: 91,
    total_carbs: 74,
    total_fats: 25,
  },
};

const MOCK_GOALS = [
  { title: 'Reduzir peso corporal', category: 'Peso', target_value: 70, unit: 'kg', deadline: '2026-09-01' },
  { title: 'Aumentar consumo proteico', category: 'Alimentação', target_value: 120, unit: 'g', deadline: '2026-06-01' },
  { title: 'Melhorar hidratação', category: 'Hidratação', target_value: 2500, unit: 'ml', deadline: '2026-05-01' },
];

const MOCK_RECOMMENDATIONS = [
  { title: 'Higiene do Sono', content: '1. Evite telas 1h antes de dormir.\n2. Mantenha quarto escuro e fresco.\n3. Evite cafeína após 16h.\n4. Horário regular para dormir/acordar.', category: 'Hábitos' as const },
  { title: 'Controle de Porções', content: '1. Use pratos menores.\n2. Não coma diretamente da embalagem.\n3. Mastigue lentamente.\n4. Pare em 80% de saciedade.', category: 'Alimentação' as const },
  { title: 'Atividade Física', content: '1. 150min de exercício/semana.\n2. Musculação 2-3x/semana.\n3. Caminhada diária 30min.\n4. Alongamento antes/depois.', category: 'Treino' as const },
];

const MOCK_DIAGNOSIS = {
  diagnosis: 'Paciente com excesso de peso, sedentário, apresenta hábitos alimentares irregulares com alto consumo de ultraprocessados. Necessita reeducação alimentar progressiva e aumento da atividade física.',
  recommendations: [
    'Redução progressiva de açúcares e ultraprocessados',
    'Aumento do consumo de proteínas e fibras',
    'Prática de exercícios físicos regulares',
    'Controle de porções e alimentação tardia',
  ],
  critical_alerts: [],
};

export interface GoalSuggestion {
  title: string;
  category: string;
  start_value: number;
  target_value: number;
  unit: string;
  deadline: string;
}

export interface RecommendationSuggestion {
  title: string;
  content: string;
  category: 'Alimentação' | 'Treino' | 'Hábitos' | 'Geral';
}

export interface DiagnosisResult {
  diagnosis: string;
  recommendations: string[];
  critical_alerts: string[];
}

async function safeGenerateDietPlan(params: Parameters<typeof generateDietPlan>[0]) {
  if (!isGeminiConfigured()) {
    console.log('[AI Service] Gemini não configurado. Usando dados mock.');
    return MOCK_DIET_PLAN;
  }
  
  try {
    return await generateDietPlan(params);
  } catch (error) {
    console.error('[AI Service] Erro ao gerar plano alimentar:', error);
    return MOCK_DIET_PLAN;
  }
}

export const aiService = {
  async generateDietPlan(params: {
    patientName: string;
    objective: string;
    targetCalories: number;
    macros: { protein: number; carbs: number; fats: number };
    restrictions?: string;
    preferences?: string;
    mealsCount?: number;
  }) {
    const result = await safeGenerateDietPlan({
      ...params,
      mealsCount: params.mealsCount || 5,
    });
    return result;
  },

  generateGoals(objective: string, currentWeight: number): GoalSuggestion[] {
    if (!isGeminiConfigured()) {
      return MOCK_GOALS.map(g => ({
        ...g,
        start_value: currentWeight,
      }));
    }
    return MOCK_GOALS.map(g => ({
      ...g,
      start_value: currentWeight,
    }));
  },

  generateRecommendations(objective: string, restrictions: string[]): RecommendationSuggestion[] {
    if (!isGeminiConfigured()) {
      return MOCK_RECOMMENDATIONS;
    }
    return MOCK_RECOMMENDATIONS;
  },

  async generateDiagnosis(anamneseData: Record<string, any>): Promise<DiagnosisResult> {
    if (!isGeminiConfigured()) {
      return MOCK_DIAGNOSIS;
    }
    
    try {
      const { analyzeAnamnesis } = await import('@/lib/gemini');
      const result = await analyzeAnamnesis(anamneseData);
      return result;
    } catch (error) {
      console.error('[AI Service] Erro ao gerar diagnóstico:', error);
      return MOCK_DIAGNOSIS;
    }
  },

  generateManipulatedSuggestions(objective: string, restrictions: string[]) {
    const suggestions = [
      { substance: 'Whey Protein', dosage: '25g', timing: 'Após treino' },
      { substance: 'Creatina Monohidratada', dosage: '5g', timing: 'Manhã' },
      { substance: 'Vitamina D3', dosage: '2000UI', timing: 'Café da manhã' },
      { substance: 'Ômega 3', dosage: '2g', timing: 'Almoço' },
    ];

    if (objective.includes('emagrecer') || objective.includes('Emagrecimento')) {
      suggestions.push(
        { substance: 'L-Carnitina', dosage: '500mg', timing: 'Antes do exercício' },
        { substance: 'Cafeína', dosage: '200mg', timing: 'Manhã' },
      );
    }

    if (objective.includes('hipertrofia') || objective.includes('muscular')) {
      suggestions.push(
        { substance: 'BCAA', dosage: '10g', timing: 'Antes/depois treino' },
        { substance: 'HMB', dosage: '3g', timing: 'Café da manhã' },
      );
    }

    if (restrictions.includes('lactose') || restrictions.includes('leite')) {
      suggestions.forEach(s => {
        if (s.substance === 'Whey Protein') {
          s.substance = 'Whey Protein Isolado';
        }
      });
    }

    return suggestions;
  },

  isConfigured(): boolean {
    return isGeminiConfigured();
  },
};

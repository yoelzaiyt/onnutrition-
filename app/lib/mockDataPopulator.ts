/**
 * mockDataPopulator.ts
 * Utilitário para popular dados de demonstração via Supabase (ou em memória no modo Demo).
 */
import { dietPlanService } from './dietPlanService';
import { goalService } from './goalService';
import { prescriptionService } from './prescriptionService';
import { recommendationService } from './recommendationService';
import { medicalRecordService } from './medicalRecordService';
import { financeService } from './financeService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─── Helper ───────────────────────────────────────────────
const getNutriId = async (): Promise<string> => {
  if (!isSupabaseConfigured) return 'demo-nutri-id';
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || 'demo-nutri-id';
};

// ─── Diet Plans ───────────────────────────────────────────
export const populateMockDietPlans = async (patientId: string) => {
  const nutriId = await getNutriId();

  const mockPlan = {
    patient_id: patientId,
    nutri_id: nutriId,
    name: 'Plano de Emagrecimento Fase 1',
    objective: 'Emagrecimento',
    target_calories: 1800,
    target_protein: 140,
    target_carbs: 160,
    target_fats: 50,
    hydration_goal: 2500,
    status: 'Ativo' as const,
    meals: [
      {
        name: 'Café da Manhã', time: '08:00', order_index: 1,
        foods: [
          { name: 'Ovo Cozido',    quantity: 2,   unit: 'unid',  calories: 140, protein: 12, carbs: 1,  fats: 10 },
          { name: 'Pão Integral',  quantity: 2,   unit: 'fatias',calories: 120, protein: 6,  carbs: 22, fats: 2  },
          { name: 'Mamão Papaia',  quantity: 100, unit: 'g',     calories: 40,  protein: 0,  carbs: 10, fats: 0  },
        ],
      },
      {
        name: 'Almoço', time: '12:30', order_index: 2,
        foods: [
          { name: 'Arroz Integral',  quantity: 100, unit: 'g',     calories: 110, protein: 3,  carbs: 23, fats: 1 },
          { name: 'Feijão Carioca',  quantity: 100, unit: 'g',     calories: 76,  protein: 5,  carbs: 14, fats: 0 },
          { name: 'Frango Grelhado', quantity: 120, unit: 'g',     calories: 190, protein: 36, carbs: 0,  fats: 4 },
          { name: 'Salada Verde',    quantity: 1,   unit: 'prato', calories: 20,  protein: 1,  carbs: 4,  fats: 0 },
        ],
      },
      {
        name: 'Lanche da Tarde', time: '16:00', order_index: 3,
        foods: [
          { name: 'Iogurte Natural',  quantity: 170, unit: 'g', calories: 100, protein: 7, carbs: 10, fats: 4 },
          { name: 'Aveia em Flocos',  quantity: 20,  unit: 'g', calories: 70,  protein: 3, carbs: 12, fats: 1 },
        ],
      },
      {
        name: 'Jantar', time: '20:00', order_index: 4,
        foods: [
          { name: 'Omelete (2 ovos)', quantity: 1,   unit: 'unid', calories: 140, protein: 12, carbs: 1,  fats: 10 },
          { name: 'Legumes Cozidos',  quantity: 150, unit: 'g',    calories: 60,  protein: 2,  carbs: 12, fats: 0  },
        ],
      },
    ],
  };

  try {
    await dietPlanService.create(mockPlan as any);
    console.log('[Seed] Diet plan created:', patientId);
  } catch (error) {
    console.error('[Seed] Error creating diet plan:', error);
  }
};

// ─── Goals ────────────────────────────────────────────────
export const populateMockGoals = async (patientId: string) => {
  const nutriId = await getNutriId();

  const goals = [
    { patient_id: patientId, nutri_id: nutriId, title: 'Redução de Peso Corporal', category: 'Peso',    start_value: 85.5, target_value: 78.0, current_value: 83.2, unit: 'kg', deadline: '2026-06-30', status: 'Em progresso' as const },
    { patient_id: patientId, nutri_id: nutriId, title: 'Diminuição de Gordura',    category: 'Gordura', start_value: 12,   target_value: 9,    current_value: 11,   unit: '%',  deadline: '2026-05-15', status: 'Em progresso' as const },
  ];

  try {
    for (const goal of goals) {
      const created = await goalService.create(goal);
      await goalService.addProgress({ goal_id: created.id!, value: goal.current_value, date: new Date().toISOString().split('T')[0], notes: 'Medição inicial' });
    }
    console.log('[Seed] Goals created:', patientId);
  } catch (error) {
    console.error('[Seed] Error creating goals:', error);
  }
};

// ─── Prescriptions ────────────────────────────────────────
export const populateMockPrescriptions = async (patientId: string) => {
  const nutriId = await getNutriId();

  const list = [
    {
      prescription: { patient_id: patientId, nutri_id: nutriId, title: 'Fórmula Termogênica', posology: '2 cápsulas 30min antes do treino', observations: 'Evitar após 17h', status: 'Ativo' as const },
      items: [
        { substance: 'Cafeína Anidra', dosage: '200mg' },
        { substance: 'L-Teanina',      dosage: '100mg' },
        { substance: 'Extrato de Chá Verde', dosage: '300mg' },
      ],
    },
  ];

  try {
    for (const p of list) await prescriptionService.create(p.prescription as any, p.items);
    console.log('[Seed] Prescriptions created:', patientId);
  } catch (error) {
    console.error('[Seed] Error creating prescriptions:', error);
  }
};

// ─── Recommendations ──────────────────────────────────────
export const populateMockRecommendations = async (patientId: string) => {
  const nutriId = await getNutriId();

  const recs = [
    { patient_id: patientId, nutri_id: nutriId, title: 'Higiene do Sono', content: 'Evite telas 1h antes de dormir. Mantenha o quarto escuro.', category: 'Hábitos' as const, status: 'Ativo' as const },
    { patient_id: patientId, nutri_id: nutriId, title: 'Hidratação no Treino', content: 'Beba 500ml 2h antes. 150-200ml a cada 15 min durante.', category: 'Treino' as const, status: 'Ativo' as const },
  ];

  try {
    for (const r of recs) await recommendationService.create(r);
    console.log('[Seed] Recommendations created:', patientId);
  } catch (error) {
    console.error('[Seed] Error creating recommendations:', error);
  }
};

// ─── Medical Records ──────────────────────────────────────
export const populateMockMedicalRecords = async (patientId: string) => {
  const nutriId = await getNutriId();

  try {
    await medicalRecordService.upsertMedicalRecord({
      patient_id: patientId,
      nutri_id: nutriId,
      clinical_history: 'Histórico de hipertensão leve controlada. Sem alergias. Pratica caminhada 2x/semana.',
      nutritional_diagnosis: 'Sobrepeso grau I (IMC 27.5). Hábitos alimentares inadequados.',
    });
    await medicalRecordService.createClinicalNote({
      patient_id: patientId, nutri_id: nutriId,
      content: 'Primeira consulta. Paciente motivado. Meta inicial: aumentar água e reduzir açúcar.',
      date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    });
    console.log('[Seed] Medical records created:', patientId);
  } catch (error) {
    console.error('[Seed] Error creating medical records:', error);
  }
};

// ─── Payments ─────────────────────────────────────────────
export const populateMockPayments = async () => {
  const nutriId = await getNutriId();
  const methods = ['PIX', 'Cartão', 'Dinheiro', 'Transferência'];
  const now = new Date();

  try {
    for (let i = 5; i >= 0; i--) {
      const count = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, Math.floor(Math.random() * 28) + 1);
        await financeService.create({
          nutri_id: nutriId,
          patient_id: String(Math.ceil(Math.random() * 8)),
          patient_name: `Paciente ${Math.ceil(Math.random() * 8)}`,
          amount: Math.floor(Math.random() * 150) + 150,
          date: date.toISOString().split('T')[0],
          status: Math.random() > 0.25 ? 'pago' : 'pendente',
          method: methods[Math.floor(Math.random() * methods.length)],
          description: 'Consulta Nutricional',
        });
      }
    }
    console.log('[Seed] Payments created');
  } catch (error) {
    console.error('[Seed] Error creating payments:', error);
  }
};

// ─── Full Seed ────────────────────────────────────────────
export const seedFullDatabase = async (nutriId: string): Promise<boolean> => {
  console.log('[Seed] Starting full database seed for nutri:', nutriId);
  const patientIds = ['1', '2', '3', '4', '5', '6', '7', '8'];

  try {
    for (const id of patientIds) {
      await populateMockDietPlans(id);
      await populateMockGoals(id);
      await populateMockPrescriptions(id);
      await populateMockRecommendations(id);
      await populateMockMedicalRecords(id);
    }
    await populateMockPayments();
    console.log('[Seed] Full database seed completed!');
    return true;
  } catch (error) {
    console.error('[Seed] Error during full seed:', error);
    return false;
  }
};

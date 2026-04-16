import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TestPatient {
  name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  objective: string;
  activity_level: string;
  food_restrictions: string;
  history: string;
}

export interface TestDietPlan {
  name: string;
  objective: string;
  type: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  meals: {
    name: string;
    time: string;
    foods: { name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fats: number }[];
  }[];
}

export interface TestGoal {
  title: string;
  category: string;
  start_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  status: 'Em progresso' | 'Atrasado' | 'Concluído';
}

export interface TestMedicalRecord {
  clinical_history: string;
  nutritional_diagnosis: string;
}

export interface TestRecommendation {
  title: string;
  content: string;
  category: 'Alimentação' | 'Treino' | 'Hábitos' | 'Geral';
}

export interface TestPrescription {
  title: string;
  posology: string;
  observations: string;
  items: { substance: string; dosage: string }[];
}

const TEST_PATIENTS: TestPatient[] = [
  { name: 'Maria Oliveira', email: 'maria.oliveira@email.com', phone: '(11) 98888-0001', gender: 'Feminino', birth_date: '1992-05-15', objective: 'Emagrecimento Saudável', activity_level: 'Moderado', food_restrictions: 'Lactose', history: 'Paciente com histórico de ganho de peso nos últimos 2 anos. Já tentou dieta Low Carb por conta própria sem sucesso.' },
  { name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 98888-0002', gender: 'Masculino', birth_date: '1985-08-22', objective: 'Hipertrofia Muscular', activity_level: 'Ativo', food_restrictions: '', history: 'Praticante de musculação há 3 anos. Busca orientação para ganho de massa magra.' },
  { name: 'Ana Costa', email: 'ana.costa@email.com', phone: '(11) 98888-0003', gender: 'Feminino', birth_date: '1990-03-10', objective: 'Manutenção de Peso', activity_level: 'Leve', food_restrictions: 'Glúten', history: 'Paciente celíaca. Busca manutenção do peso atual com alimentação balanceada.' },
  { name: 'Roberto Lima', email: 'roberto.lima@email.com', phone: '(11) 98888-0004', gender: 'Masculino', birth_date: '1978-11-25', objective: 'Controle de Diabetes', activity_level: 'Sedentário', food_restrictions: 'Açúcar', history: 'Diabetes Tipo 2 diagnosticado há 1 ano. Necessita controle glicêmico via alimentação.' },
  { name: 'Luciana Alves', email: 'luciana.alves@email.com', phone: '(11) 98888-0005', gender: 'Feminino', birth_date: '1995-01-30', objective: 'Emagrecimento Rápido', activity_level: 'Moderado', food_restrictions: '', history: 'Jornalista com rotina estressante. Dificuldade em manter alimentação equilibrada.' },
  { name: 'Carlos Souza', email: 'carlos.souza@email.com', phone: '(11) 98888-0006', gender: 'Masculino', birth_date: '1982-07-18', objective: 'Hipertrofia Muscular', activity_level: 'Muito Ativo', food_restrictions: 'Proteína do leite', history: 'Atleta amador de crossfit. Necessita orientação para suplementação e alimentação.' },
  { name: 'Beatriz Fernandes', email: 'beatriz.fernandes@email.com', phone: '(11) 98888-0007', gender: 'Feminino', birth_date: '1988-04-12', objective: 'Gestação Saudável', activity_level: 'Leve', food_restrictions: '', history: 'Gestante de 20 semanas. Busca alimentação adequada para gestação.' },
  { name: 'Felipe Rocha', email: 'felipe.rocha@email.com', phone: '(11) 98888-0008', gender: 'Masculino', birth_date: '1993-09-05', objective: 'Melhora de Performance', activity_level: 'Muito Ativo', food_restrictions: '', history: 'Corredor amador. Preparação para maratona. Necessita otimização energética.' },
];

const DIET_PLANS: Record<string, TestDietPlan> = {
  'Emagrecimento Saudável': {
    name: 'Plano Emagrecimento',
    objective: 'Emagrecimento Saudável',
    type: 'Hipocalórica Balanceada',
    target_calories: 1800,
    target_protein: 120,
    target_carbs: 180,
    target_fats: 60,
    meals: [
      { name: 'Café da Manhã', time: '07:00', foods: [{ name: 'Ovos mexidos', quantity: 2, unit: 'un', calories: 210, protein: 18, carbs: 2, fats: 14 }, { name: 'Pão integral', quantity: 1, unit: 'fatia', calories: 80, protein: 4, carbs: 15, fats: 1 }, { name: 'Abacate', quantity: 50, unit: 'g', calories: 80, protein: 1, carbs: 4, fats: 7 }] },
      { name: 'Lanche da Manhã', time: '10:00', foods: [{ name: 'Iogurte natural', quantity: 150, unit: 'g', calories: 90, protein: 6, carbs: 12, fats: 2 }, { name: 'Castanhas', quantity: 20, unit: 'g', calories: 130, protein: 4, carbs: 3, fats: 13 }] },
      { name: 'Almoço', time: '12:30', foods: [{ name: 'Frango grelhado', quantity: 150, unit: 'g', calories: 165, protein: 31, carbs: 0, fats: 3 }, { name: 'Arroz integral', quantity: 100, unit: 'g', calories: 110, protein: 2, carbs: 23, fats: 1 }, { name: 'Brócolis', quantity: 100, unit: 'g', calories: 35, protein: 3, carbs: 7, fats: 0 }] },
      { name: 'Lanche da Tarde', time: '16:00', foods: [{ name: 'Maçã', quantity: 1, unit: 'un', calories: 95, protein: 0, carbs: 25, fats: 0 }, { name: 'Amendoim', quantity: 20, unit: 'g', calories: 110, protein: 5, carbs: 4, fats: 9 }] },
      { name: 'Jantar', time: '19:30', foods: [{ name: 'Peixe assado', quantity: 150, unit: 'g', calories: 135, protein: 30, carbs: 0, fats: 2 }, { name: 'Batata doce', quantity: 100, unit: 'g', calories: 86, protein: 2, carbs: 20, fats: 0 }, { name: 'Salada verde', quantity: 100, unit: 'g', calories: 20, protein: 1, carbs: 4, fats: 0 }] },
    ],
  },
  'Hipertrofia Muscular': {
    name: 'Plano Hipertrofia',
    objective: 'Hipertrofia Muscular',
    type: 'Hipercalórica Proteica',
    target_calories: 2800,
    target_protein: 200,
    target_carbs: 350,
    target_fats: 80,
    meals: [
      { name: 'Café da Manhã', time: '07:00', foods: [{ name: 'Omelete', quantity: 4, unit: 'un', calories: 420, protein: 36, carbs: 4, fats: 28 }, { name: 'Aveia', quantity: 80, unit: 'g', calories: 300, protein: 10, carbs: 54, fats: 5 }, { name: 'Banana', quantity: 2, unit: 'un', calories: 210, protein: 2, carbs: 54, fats: 0 }] },
      { name: 'Lanche', time: '10:00', foods: [{ name: 'Whey Protein', quantity: 30, unit: 'g', calories: 120, protein: 24, carbs: 3, fats: 1 }, { name: 'Pão integral', quantity: 2, unit: 'fatia', calories: 160, protein: 8, carbs: 30, fats: 2 }] },
      { name: 'Almoço', time: '12:30', foods: [{ name: 'Carne vermelha', quantity: 200, unit: 'g', calories: 540, protein: 44, carbs: 0, fats: 36 }, { name: 'Arroz branco', quantity: 150, unit: 'g', calories: 195, protein: 4, carbs: 45, fats: 0 }, { name: 'Feijão', quantity: 100, unit: 'g', calories: 140, protein: 8, carbs: 25, fats: 1 }] },
      { name: 'Lanche', time: '16:00', foods: [{ name: 'Arroz doce', quantity: 200, unit: 'g', calories: 260, protein: 6, carbs: 58, fats: 1 }, { name: 'Frango', quantity: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fats: 3 }] },
      { name: 'Jantar', time: '19:30', foods: [{ name: 'Salmão', quantity: 200, unit: 'g', calories: 416, protein: 46, carbs: 0, fats: 22 }, { name: 'Macarrão', quantity: 150, unit: 'g', calories: 210, protein: 7, carbs: 42, fats: 1 }, { name: 'Azeite', quantity: 15, unit: 'ml', calories: 120, protein: 0, carbs: 0, fats: 14 }] },
    ],
  },
  'Manutenção de Peso': {
    name: 'Plano Manutenção',
    objective: 'Manutenção de Peso',
    type: 'Equilibrada',
    target_calories: 2200,
    target_protein: 100,
    target_carbs: 250,
    target_fats: 75,
    meals: [
      { name: 'Café da Manhã', time: '07:00', foods: [{ name: 'Leite desnatado', quantity: 250, unit: 'ml', calories: 85, protein: 8, carbs: 12, fats: 0 }, { name: 'Cereal matinal', quantity: 40, unit: 'g', calories: 150, protein: 3, carbs: 33, fats: 1 }, { name: 'Frutas vermelhas', quantity: 100, unit: 'g', calories: 50, protein: 1, carbs: 12, fats: 0 }] },
      { name: 'Lanche', time: '10:00', foods: [{ name: 'Biscoito wafer', quantity: 2, unit: 'un', calories: 100, protein: 1, carbs: 15, fats: 4 }] },
      { name: 'Almoço', time: '12:30', foods: [{ name: 'Filé de peixe', quantity: 150, unit: 'g', calories: 135, protein: 30, carbs: 0, fats: 2 }, { name: 'Salada completa', quantity: 200, unit: 'g', calories: 80, protein: 3, carbs: 15, fats: 2 }, { name: 'Arroz e feijão', quantity: 150, unit: 'g', calories: 250, protein: 10, carbs: 45, fats: 3 }] },
      { name: 'Lanche', time: '16:00', foods: [{ name: 'Sanduíche natural', quantity: 1, unit: 'un', calories: 320, protein: 18, carbs: 35, fats: 12 }] },
      { name: 'Jantar', time: '19:30', foods: [{ name: 'Sopa de legumes', quantity: 300, unit: 'ml', calories: 180, protein: 8, carbs: 30, fats: 3 }, { name: 'Torrada', quantity: 2, unit: 'un', calories: 120, protein: 4, carbs: 22, fats: 1 }] },
    ],
  },
  'Controle de Diabetes': {
    name: 'Plano Diabetes',
    objective: 'Controle de Diabetes',
    type: 'Low Carb',
    target_calories: 1800,
    target_protein: 120,
    target_carbs: 120,
    target_fats: 100,
    meals: [
      { name: 'Café da Manhã', time: '07:00', foods: [{ name: 'Ovos', quantity: 3, unit: 'un', calories: 215, protein: 19, carbs: 1, fats: 15 }, { name: 'Queijo coalho', quantity: 50, unit: 'g', calories: 140, protein: 12, carbs: 1, fats: 10 }, { name: 'Abacate', quantity: 50, unit: 'g', calories: 80, protein: 1, carbs: 4, fats: 7 }] },
      { name: 'Lanche', time: '10:00', foods: [{ name: 'Castanha-do-pará', quantity: 30, unit: 'g', calories: 200, protein: 4, carbs: 4, fats: 20 }] },
      { name: 'Almoço', time: '12:30', foods: [{ name: 'Frango', quantity: 180, unit: 'g', calories: 200, protein: 40, carbs: 0, fats: 4 }, { name: 'Vegetais folhosos', quantity: 200, unit: 'g', calories: 40, protein: 3, carbs: 8, fats: 0 }, { name: 'Azeite', quantity: 20, unit: 'ml', calories: 180, protein: 0, carbs: 0, fats: 20 }] },
      { name: 'Lanche', time: '16:00', foods: [{ name: 'Iogurte natural', quantity: 150, unit: 'g', calories: 90, protein: 6, carbs: 12, fats: 2 }, { name: 'Semente de chia', quantity: 15, unit: 'g', calories: 75, protein: 4, carbs: 6, fats: 5 }] },
      { name: 'Jantar', time: '19:30', foods: [{ name: 'Peixe', quantity: 180, unit: 'g', calories: 180, protein: 38, carbs: 0, fats: 2 }, { name: 'Brócolis', quantity: 150, unit: 'g', calories: 50, protein: 4, carbs: 10, fats: 0 }] },
    ],
  },
};

const TEST_GOALS: Record<string, TestGoal[]> = {
  'Emagrecimento Saudável': [
    { title: 'Reduzir peso corporal', category: 'Peso', start_value: 85, target_value: 70, current_value: 80, unit: 'kg', deadline: '2026-09-01', status: 'Em progresso' },
    { title: 'Aumentar consumo de proteínas', category: 'Alimentação', start_value: 60, target_value: 120, current_value: 90, unit: 'g', deadline: '2026-06-01', status: 'Em progresso' },
    { title: 'Reducão de perímetro abdominal', category: 'Medidas', start_value: 95, target_value: 80, current_value: 88, unit: 'cm', deadline: '2026-09-01', status: 'Em progresso' },
  ],
  'Hipertrofia Muscular': [
    { title: 'Ganhar massa muscular', category: 'Peso', start_value: 75, target_value: 85, current_value: 80, unit: 'kg', deadline: '2026-12-01', status: 'Em progresso' },
    { title: 'Aumentar consumo proteico', category: 'Alimentação', start_value: 120, target_value: 200, current_value: 160, unit: 'g', deadline: '2026-08-01', status: 'Em progresso' },
    { title: 'Ganhar força - supino', category: 'Força', start_value: 60, target_value: 100, current_value: 75, unit: 'kg', deadline: '2026-12-01', status: 'Em progresso' },
  ],
  'Manutenção de Peso': [
    { title: 'Manter peso atual', category: 'Peso', start_value: 62, target_value: 62, current_value: 62, unit: 'kg', deadline: '2026-12-01', status: 'Concluído' },
    { title: 'Estabelecer rotina alimentar', category: 'Hábitos', start_value: 0, target_value: 100, current_value: 80, unit: '%', deadline: '2026-06-01', status: 'Em progresso' },
  ],
  'Controle de Diabetes': [
    { title: 'Normalizar glicemia de jejum', category: 'Exames', start_value: 180, target_value: 100, current_value: 130, unit: 'mg/dL', deadline: '2026-09-01', status: 'Em progresso' },
    { title: 'Reduzir peso corporal', category: 'Peso', start_value: 90, target_value: 80, current_value: 86, unit: 'kg', deadline: '2026-09-01', status: 'Em progresso' },
    { title: 'Diminuir HbA1c', category: 'Exames', start_value: 8.5, target_value: 6.5, current_value: 7.2, unit: '%', deadline: '2026-12-01', status: 'Em progresso' },
  ],
};

const TEST_RECOMMENDATIONS: Record<string, TestRecommendation[]> = {
  default: [
    { title: 'Higiene do Sono', content: '1. Evite telas 1h antes de dormir.\n2. Mantenha o quarto escuro e fresco (18-21°C).\n3. Evite cafeína após as 16h.\n4. Tente dormir e acordar no mesmo horário todos os dias.\n5. Evite refeições pesadas à noite.', category: 'Hábitos' },
    { title: 'Hidratação Adequada', content: '1. Beba pelo menos 2L de água por dia.\n2. Comece o dia com 1 copo de água morna.\n3. Carry uma garrafa de água sempre com você.\n4. Aumentar ingestão em dias de exercício.\n5. Substitua refrigerantes por água com limão.', category: 'Alimentação' },
    { title: 'Controle de Porções', content: '1. Use pratos menores para porções controladas.\n2. Evite comer diretamente da embalagem.\n3. Mastigue lentamente (mínimo 20x por mordida).\n4. Pare quando sentir 80% de saciedade.\n5. Não pule refeições principais.', category: 'Alimentação' },
    { title: 'Atividade Física', content: '1. Pratique pelo menos 150min de exercício por semana.\n2. Inclua musculação 2-3x por semana.\n3. Adicione caminhada diária de 30min.\n4. Alongue-se antes e depois dos exercícios.\n5. Descanse adequadamente entre treinos.', category: 'Treino' },
  ],
};

const TEST_PRESCRIPTIONS: Record<string, TestPrescription> = {
  default: {
    title: 'Suplementação Básica',
    posology: 'Tomar pela manhã junto com o café da manhã',
    observations: 'Manter hidratação adequada durante o uso. Repetir avaliação em 30 dias.',
    items: [
      { substance: 'Whey Protein', dosage: '25g' },
      { substance: 'Creatina Monohidratada', dosage: '5g' },
      { substance: 'Vitamina D3', dosage: '2000UI' },
      { substance: 'Ômega 3', dosage: '2g' },
    ],
  },
};

async function createPatient(nutriId: string, patientData: TestPatient): Promise<string> {
  if (!isSupabaseConfigured) {
    return `demo-patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      nutri_id: nutriId,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      gender: patientData.gender,
      birth_date: patientData.birth_date,
      objective: patientData.objective,
      activity_level: patientData.activity_level,
      food_restrictions: patientData.food_restrictions,
      history: patientData.history,
      status: 'Ativo',
      current_status: 'Em Consulta',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating patient:', error);
    throw error;
  }

  return data.id;
}

async function createDietPlan(nutriId: string, patientId: string, objective: string) {
  const planData = DIET_PLANS[objective] || DIET_PLANS['Manutenção de Peso'];
  const planObjective = objective || 'Manutenção de Peso';

  if (!isSupabaseConfigured) {
    return `demo-dietplan-${Date.now()}`;
  }

  const { data: dietPlan, error: planError } = await supabase
    .from('diet_plans')
    .insert({
      patient_id: patientId,
      nutri_id: nutriId,
      name: planData.name,
      objective: planObjective,
      type: planData.type,
      target_calories: planData.target_calories,
      target_protein: planData.target_protein,
      target_carbs: planData.target_carbs,
      target_fats: planData.target_fats,
      hydration_goal: 2500,
      status: 'Ativo',
    })
    .select('id')
    .single();

  if (planError) throw planError;

  for (const meal of planData.meals) {
    const { data: mealData, error: mealError } = await supabase
      .from('meals')
      .insert({
        diet_plan_id: dietPlan.id,
        name: meal.name,
        time: meal.time,
      })
      .select('id')
      .single();

    if (mealError) throw mealError;

    for (const food of meal.foods) {
      await supabase.from('meal_foods').insert({
        meal_id: mealData.id,
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
      });
    }
  }

  return dietPlan.id;
}

async function createGoals(nutriId: string, patientId: string, objective: string) {
  const goalsData = TEST_GOALS[objective] || TEST_GOALS['Manutenção de Peso'];

  if (!isSupabaseConfigured) return;

  for (const goal of goalsData) {
    await supabase.from('goals').insert({
      patient_id: patientId,
      nutri_id: nutriId,
      title: goal.title,
      category: goal.category,
      start_value: goal.start_value,
      target_value: goal.target_value,
      current_value: goal.current_value,
      unit: goal.unit,
      deadline: goal.deadline,
      status: goal.status,
    });
  }
}

async function createMedicalRecord(nutriId: string, patientId: string, patientData: TestPatient) {
  if (!isSupabaseConfigured) return;

  await supabase.from('medical_records').insert({
    patient_id: patientId,
    nutri_id: nutriId,
    clinical_history: `Paciente ${patientData.name}, ${patientData.gender.toLowerCase()}, ${new Date().getFullYear() - new Date(patientData.birth_date).getFullYear()} anos.\n\nObjetivo: ${patientData.objective}\n\nHistórico: ${patientData.history}\n\nAtividade Física: ${patientData.activity_level}\n\nRestrições: ${patientData.food_restrictions || 'Nenhuma'}`,
    nutritional_diagnosis: `Paciente apresenta necessidade de intervenção nutricional para ${patientData.objective.toLowerCase()}. Avaliar resposta ao tratamento em 30 dias.`,
  });
}

async function createRecommendations(nutriId: string, patientId: string) {
  if (!isSupabaseConfigured) return;

  for (const rec of TEST_RECOMMENDATIONS.default) {
    await supabase.from('recommendations').insert({
      patient_id: patientId,
      nutri_id: nutriId,
      title: rec.title,
      content: rec.content,
      category: rec.category,
    });
  }
}

async function createPrescriptions(nutriId: string, patientId: string) {
  const prescriptData = TEST_PRESCRIPTIONS.default;

  if (!isSupabaseConfigured) return;

  const { data, error } = await supabase
    .from('compounded_prescriptions')
    .insert({
      patient_id: patientId,
      nutri_id: nutriId,
      title: prescriptData.title,
      posology: prescriptData.posology,
      observations: prescriptData.observations,
      status: 'Ativa',
    })
    .select('id')
    .single();

  if (error) throw error;

  for (const item of prescriptData.items) {
    await supabase.from('prescription_items').insert({
      prescription_id: data.id,
      substance: item.substance,
      dosage: item.dosage,
    });
  }
}

export async function generateTestData(nutriId?: string): Promise<{ success: boolean; patients: number; errors: string[] }> {
  const errors: string[] = [];
  let patientCount = 0;

  const userId = nutriId || 'demo-nutri-id';

  console.log('🔄 Gerando dados de teste para ONNUTRITION...');

  for (const patientData of TEST_PATIENTS) {
    try {
      console.log(`  📋 Criando paciente: ${patientData.name}`);
      
      const patientId = await createPatient(userId, patientData);
      patientCount++;

      console.log(`  🍽️ Criando plano alimentar...`);
      await createDietPlan(userId, patientId, patientData.objective);

      console.log(`  🎯 Criando metas...`);
      await createGoals(userId, patientId, patientData.objective);

      console.log(`  📝 Criando prontuário...`);
      await createMedicalRecord(userId, patientId, patientData);

      console.log(`  💡 Criando recomendações...`);
      await createRecommendations(userId, patientId);

      console.log(`  💊 Criando prescrição de manipulados...`);
      await createPrescriptions(userId, patientId);

      console.log(`  ✅ Paciente ${patientData.name} completo!\n`);
    } catch (error) {
      const msg = `Erro ao criar ${patientData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  console.log(`\n🎉 Dados de teste gerados! ${patientCount} pacientes criados.`);

  return {
    success: errors.length === 0,
    patients: patientCount,
    errors,
  };
}

export async function generatePatientData(nutriId: string, patientId: string, objective: string): Promise<void> {
  const patientData = TEST_PATIENTS.find(p => p.objective === objective) || TEST_PATIENTS[0];

  await createDietPlan(nutriId, patientId, objective);
  await createGoals(nutriId, patientId, objective);
  await createMedicalRecord(nutriId, patientId, patientData);
  await createRecommendations(nutriId, patientId);
  await createPrescriptions(nutriId, patientId);
}

export interface TestChild {
  name: string;
  birth_date: string;
  sex: 'male' | 'female';
  parent_email: string;
}

const TEST_CHILDREN: TestChild[] = [
  { name: 'Pedro', birth_date: '2023-01-15', sex: 'male', parent_email: 'maria.oliveira@email.com' },
  { name: 'Luna', birth_date: '2024-03-20', sex: 'female', parent_email: 'ana.costa@email.com' },
  { name: 'Sofia', birth_date: '2024-06-10', sex: 'female', parent_email: 'luciana.alves@email.com' },
];

export async function generateChildTestData(nutriId: string): Promise<{ success: boolean; children: number; errors: string[] }> {
  const errors: string[] = [];
  let childCount = 0;

  if (!isSupabaseConfigured) {
    console.log('📱 Modo demo: dados infantis simulados');
    console.log('  👶 Pedro (3 anos) - masculino');
    console.log('  👧 Luna (2 anos) - feminino');
    console.log('  👧 Sofia (1 ano) - feminino');
    return { success: true, children: 3, errors: [] };
  }

  console.log('🔄 Gerando dados de teste infantis...');

  for (const childData of TEST_CHILDREN) {
    try {
      console.log(`  👶 Criando criança: ${childData.name}`);
      
      const { data: parentData, error: parentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', childData.parent_email)
        .single();

      if (parentError || !parentData) {
        const demoParentId = 'demo-parent-id';
        
        const { data: childProfile, error: childError } = await supabase
          .from('child_profiles')
          .insert({
            name: childData.name,
            birth_date: childData.birth_date,
            sex: childData.sex,
            parent_id: demoParentId
          })
          .select()
          .single();

        if (childError) throw childError;
        
        await createChildGrowthRecords(childProfile.id, childData.birth_date, childData.sex);
        await createChildDiet(childProfile.id, childData.birth_date);
        
        childCount++;
        console.log(`  ✅ ${childData.name} criado!\n`);
        continue;
      }

      const parentId = parentData.id;

      const { data: existingChild } = await supabase
        .from('child_profiles')
        .select('id')
        .eq('parent_id', parentId)
        .eq('name', childData.name)
        .maybeSingle();

      if (existingChild) {
        console.log(`  ⏭️ ${childData.name} já existe, pulando...`);
        continue;
      }

      const { data: childProfile, error: childError } = await supabase
        .from('child_profiles')
        .insert({
          name: childData.name,
          birth_date: childData.birth_date,
          sex: childData.sex,
          parent_id: parentId
        })
        .select()
        .single();

      if (childError) throw childError;

      await createChildGrowthRecords(childProfile.id, childData.birth_date, childData.sex);
      await createChildDiet(childProfile.id, childData.birth_date);

      childCount++;
      console.log(`  ✅ ${childData.name} criado!\n`);
    } catch (error) {
      const msg = `Erro ao criar ${childData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  console.log(`\n🎉 Dados infantis gerados! ${childCount} crianças criadas.`);
  return { success: errors.length === 0, children: childCount, errors };
}

async function createChildGrowthRecords(childId: string, birthDate: string, sex: 'male' | 'female') {
  const birth = new Date(birthDate);
  const measurements = [
    { months: 6, weight: sex === 'male' ? 7.5 : 7.0, height: 65, head: 42 },
    { months: 12, weight: sex === 'male' ? 9.5 : 8.8, height: 75, head: 46 },
    { months: 18, weight: sex === 'male' ? 11.0 : 10.5, height: 82, head: 47 },
    { months: 24, weight: sex === 'male' ? 12.5 : 12.0, height: 87, head: 48 },
  ];

  for (const m of measurements) {
    const measureDate = new Date(birth);
    measureDate.setMonth(measureDate.getMonth() + m.months);

    const imi = (m.weight / Math.pow(m.height / 100, 2));
    const weightP = 50 + Math.random() * 30 - 15;
    const heightP = 50 + Math.random() * 30 - 15;
    const imiP = 50 + Math.random() * 30 - 15;
    const classification = (weightP + heightP + imiP) / 3 < 15 ? 'Risco de Baixo Peso' : 
                          (weightP + heightP + imiP) / 3 > 85 ? 'Sobrepeso' : 'Adequado';

    await supabase.from('child_growth').insert({
      child_id: childId,
      measurement_date: measureDate.toISOString().split('T')[0],
      weight_kg: m.weight,
      height_cm: m.height,
      head_circumference_cm: m.head,
      imi,
      percentile_weight_age: weightP,
      percentile_height_age: heightP,
      percentile_imc_age: imiP,
      classification
    });
  }
}

async function createChildDiet(childId: string, birthDate: string) {
  const birth = new Date(birthDate);
  const months = Math.floor((new Date().getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));

  const calories = months < 12 ? 800 : months < 24 ? 1000 : months < 36 ? 1200 : 1400;
  
  const meals = months < 12 ? {
    'Café da Manhã': { time: '07:00', foods: [{ name: 'Leite materno', quantity: 150, unit: 'ml', calories: 100, protein: 3, carbs: 12, fat: 4 }] },
    'Lanche da Manhã': { time: '09:30', foods: [{ name: 'Fruta amassada', quantity: 50, unit: 'g', calories: 40 }] },
    'Almoço': { time: '12:00', foods: [{ name: 'Papinha de legumes', quantity: 100, unit: 'g', calories: 60 }] },
    'Lanche da Tarde': { time: '15:30', foods: [{ name: 'Leite', quantity: 100, unit: 'ml', calories: 70 }] },
    'Jantar': { time: '18:30', foods: [{ name: 'Papinha de frutas', quantity: 80, unit: 'g', calories: 50 }] }
  } : {
    'Café da Manhã': { time: '07:00', foods: [{ name: 'Leite', quantity: 200, unit: 'ml', calories: 130 }, { name: 'Pão', quantity: 1, unit: 'fatia', calories: 80 }] },
    'Lanche da Manhã': { time: '09:30', foods: [{ name: 'Banana', quantity: 1, unit: 'un', calories: 90 }] },
    'Almoço': { time: '12:00', foods: [{ name: 'Arroz', quantity: 50, unit: 'g', calories: 65 }, { name: 'Feijão', quantity: 40, unit: 'g', calories: 40 }, { name: 'Frango', quantity: 60, unit: 'g', calories: 100 }] },
    'Lanche da Tarde': { time: '15:30', foods: [{ name: 'Iogurte', quantity: 1, unit: 'un', calories: 80 }] },
    'Jantar': { time: '18:30', foods: [{ name: 'Sopa', quantity: 200, unit: 'ml', calories: 100 }] }
  };

  await supabase.from('child_diet').insert({
    child_id: childId,
    diet_type: 'Alimentação Complementar',
    feeding_frequency: '5 refeições por dia',
    breastfeeding: months < 6,
    introduced_foods: ['Cereais', 'Leguminosas', 'Carnes', 'Frutas', 'Legumes'],
    start_date: new Date().toISOString().split('T')[0],
    meals,
    nutritional_targets: { calories, protein: 30, carbs: 120, fat: 35 },
    status: 'active'
  });
}

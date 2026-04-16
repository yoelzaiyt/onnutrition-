import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DEMO_PLAN: DietPlan = {
  id: 'demo-plan-1',
  patient_id: 'demo',
  nutri_id: 'demo',
  name: 'Plano Demo — Emagrecimento',
  target_calories: 1800,
  target_protein: 140,
  target_carbs: 160,
  target_fats: 50,
  hydration_goal: 2500,
  status: 'Ativo',
  meals: [
    {
      id: 'm1', name: 'Café da Manhã', time: '08:00', order_index: 1,
      foods: [
        { id: 'f1', name: 'Ovo Cozido',   quantity: 2,   unit: 'unid',  calories: 140, protein: 12, carbs: 1,  fats: 10 },
        { id: 'f2', name: 'Pão Integral', quantity: 2,   unit: 'fatias',calories: 120, protein: 6,  carbs: 22, fats: 2 },
      ],
    },
    {
      id: 'm2', name: 'Almoço', time: '12:30', order_index: 2,
      foods: [
        { id: 'f3', name: 'Arroz Integral',  quantity: 100, unit: 'g', calories: 110, protein: 3,  carbs: 23, fats: 1 },
        { id: 'f4', name: 'Frango Grelhado', quantity: 120, unit: 'g', calories: 190, protein: 36, carbs: 0,  fats: 4 },
      ],
    },
    {
      id: 'm3', name: 'Jantar', time: '20:00', order_index: 3,
      foods: [
        { id: 'f5', name: 'Omelete', quantity: 1, unit: 'unid', calories: 140, protein: 12, carbs: 1, fats: 10 },
      ],
    },
  ],
};

export interface MealFood {
  id?: string;
  meal_id?: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  substitutions?: string[];
}

export interface Meal {
  id?: string;
  diet_plan_id?: string;
  name: string;
  time: string;
  notes?: string;
  order_index?: number;
  foods: MealFood[];
}

export interface DietPlan {
  id?: string;
  patient_id: string;
  nutri_id: string;
  name: string;
  objective?: string;
  type?: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  hydration_goal: number;
  observations?: string;
  status: 'Ativo' | 'Rascunho' | 'Arquivado';
  meals?: Meal[];
  created_at?: string;
}

export const dietPlanService = {
  async getAll(patientId: string): Promise<DietPlan[]> {
    if (!isSupabaseConfigured) return [DEMO_PLAN];

    const { data, error } = await supabase
      .from('diet_plans')
      .select(`
        *,
        meals:meals(
          *,
          foods:meal_foods(*)
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) { console.error('dietPlanService.getAll:', error); return []; }
    return (data as DietPlan[]) || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('diet_plans')
      .select(`
        *,
        meals:meals(
          *,
          foods:meal_foods(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DietPlan;
  },

  async create(plan: DietPlan) {
    const { meals, ...planData } = plan;

    // 1. Create Diet Plan
    const { data: newPlan, error: planError } = await supabase
      .from('diet_plans')
      .insert([planData])
      .select()
      .single();

    if (planError) throw planError;

    // 2. Create Meals and Foods
    if (meals && meals.length > 0) {
      for (const meal of meals) {
        const { foods, ...mealData } = meal;
        const { data: newMeal, error: mealError } = await supabase
          .from('meals')
          .insert([{ ...mealData, diet_plan_id: newPlan.id }])
          .select()
          .single();

        if (mealError) throw mealError;

        if (foods && foods.length > 0) {
          const foodsWithMealId = foods.map(f => ({ ...f, meal_id: newMeal.id }));
          const { error: foodsError } = await supabase
            .from('meal_foods')
            .insert(foodsWithMealId);

          if (foodsError) throw foodsError;
        }
      }
    }

    return newPlan;
  },

  async update(id: string, plan: Partial<DietPlan>) {
    const { meals, ...planData } = plan;

    // Update Plan
    const { error: planError } = await supabase
      .from('diet_plans')
      .update(planData)
      .eq('id', id);

    if (planError) throw planError;

    // Note: Updating meals/foods normalized is complex. 
    // Usually we delete and recreate or diff them.
    // For simplicity in this SaaS, we'll implement a full sync if meals are provided.
    if (meals) {
      // Delete existing meals (cascade will delete foods)
      await supabase.from('meals').delete().eq('diet_plan_id', id);

      // Recreate
      for (const meal of meals) {
        const { foods, ...mealData } = meal;
        const { data: newMeal, error: mealError } = await supabase
          .from('meals')
          .insert([{ ...mealData, diet_plan_id: id }])
          .select()
          .single();

        if (mealError) throw mealError;

        if (foods && foods.length > 0) {
          const foodsWithMealId = foods.map(f => ({ ...f, meal_id: newMeal.id }));
          const { error: foodsError } = await supabase
            .from('meal_foods')
            .insert(foodsWithMealId);

          if (foodsError) throw foodsError;
        }
      }
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('diet_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export type MealTime = 'Café da Manhã' | 'Lanche da Manhã' | 'Almoço' | 'Lanche da Tarde' | 'Jantar' | 'Ceia';

export interface MealPlanItem {
  id: string;
  food_name: string;
  quantity: string;
  unit: string;
  substitutions?: string[];
  notes?: string;
}

export interface MealPlanSection {
  id: string;
  time: string;
  meal_type: MealTime;
  items: MealPlanItem[];
  instructions?: string;
}

export interface MealPlan {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  created_at: string;
  active: boolean;
  sections: MealPlanSection[];
}

import { supabase } from '@/lib/supabase';
import { MealPlan } from './mealPlan.types';

export const mealPlanService = {
  async getActiveMealPlan(patientId: string): Promise<MealPlan | null> {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        sections:meal_plan_sections(
          *,
          items:meal_plan_items(*)
        )
      `)
      .eq('patient_id', patientId)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Error fetching active meal plan:', error);
      return null;
    }

    return data as MealPlan;
  },

  async createMealPlan(mealPlan: Partial<MealPlan>): Promise<MealPlan | null> {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert(mealPlan)
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan:', error);
      return null;
    }

    return data as MealPlan;
  }
};

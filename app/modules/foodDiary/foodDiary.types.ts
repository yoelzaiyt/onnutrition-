export type MealType =
  | "breakfast"
  | "morning_snack"
  | "lunch"
  | "afternoon_snack"
  | "dinner"
  | "supper";

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  user_id: string;
  date: string;
  type: MealType;
  time: string;
  foods: FoodItem[];
  consumed: boolean;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface DaySummary {
  date: string;
  patientId: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  observations?: string;
  createdBy: string;
}

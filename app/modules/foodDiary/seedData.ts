import { addMeal, updateDaySummary } from "./foodDiary.service";
import { Meal, DaySummary } from "./foodDiary.types";

export async function seedFoodDiaryData(patientId: string, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const testMeals: Omit<Meal, 'id'>[] = [
    {
      type: 'breakfast',
      date: today,
      time: '08:00',
      foods: [
        { id: 'f1', name: 'Ovo Cozido', quantity: 2, unit: 'unidade', calories: 140, protein: 12, carbs: 1, fat: 10 },
        { id: 'f2', name: 'Pão Integral', quantity: 2, unit: 'fatia', calories: 120, protein: 4, carbs: 24, fat: 2 },
        { id: 'f3', name: 'Café com Leite', quantity: 200, unit: 'ml', calories: 60, protein: 3, carbs: 5, fat: 3 }
      ],
      consumed: true,
      user_id: userId,
      createdAt: new Date().toISOString()
    },
    {
      type: 'lunch',
      date: today,
      time: '12:30',
      foods: [
        { id: 'f4', name: 'Arroz Integral', quantity: 100, unit: 'g', calories: 110, protein: 2, carbs: 23, fat: 1 },
        { id: 'f5', name: 'Feijão Preto', quantity: 80, unit: 'g', calories: 100, protein: 7, carbs: 18, fat: 0.5 },
        { id: 'f6', name: 'Peito de Frango Grelhado', quantity: 150, unit: 'g', calories: 240, protein: 45, carbs: 0, fat: 5 },
        { id: 'f7', name: 'Salada de Alface e Tomate', quantity: 1, unit: 'porção', calories: 20, protein: 1, carbs: 4, fat: 0 }
      ],
      consumed: true,
      user_id: userId,
      createdAt: new Date().toISOString()
    },
    {
      type: 'afternoon_snack',
      date: today,
      time: '16:00',
      foods: [
        { id: 'f8', name: 'Iogurte Natural', quantity: 170, unit: 'g', calories: 100, protein: 9, carbs: 12, fat: 3 },
        { id: 'f9', name: 'Granola', quantity: 30, unit: 'g', calories: 120, protein: 3, carbs: 18, fat: 4 }
      ],
      consumed: true,
      user_id: userId,
      createdAt: new Date().toISOString()
    }
  ];

  for (const meal of testMeals) {
    await addMeal(patientId, meal);
  }

  const summary: DaySummary = {
    date: today,
    patientId: patientId,
    totalCalories: 1010,
    totalProtein: 86,
    totalCarbs: 105,
    totalFat: 28.5,
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 65,
    observations: "Ótimo começo de dia! Mantenha o foco nas proteínas e hidratação.",
    createdBy: userId
  };

  await updateDaySummary(patientId, today, summary);
}

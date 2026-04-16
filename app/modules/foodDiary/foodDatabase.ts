export interface FoodDatabaseItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultUnit: string;
  defaultQuantity: number;
}

export const foodDatabase: FoodDatabaseItem[] = [
  { name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Arroz Integral Cozido', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 14, fat: 0.5, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Peito de Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, defaultUnit: 'un', defaultQuantity: 1 },
  { name: 'Banana Prata', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultUnit: 'un', defaultQuantity: 1 },
  { name: 'Maçã Fuji', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultUnit: 'un', defaultQuantity: 1 },
  { name: 'Pão de Forma Integral', calories: 247, protein: 9.4, carbs: 43, fat: 3.4, defaultUnit: 'fatia', defaultQuantity: 1 },
  { name: 'Leite Desnatado', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, defaultUnit: 'ml', defaultQuantity: 100 },
  { name: 'Iogurte Natural', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Azeite de Oliva', calories: 884, protein: 0, carbs: 0, fat: 100, defaultUnit: 'colher de sopa', defaultQuantity: 1 },
  { name: 'Alface Crespa', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Tomate Saladete', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Carne Moída Patinho', calories: 219, protein: 26, carbs: 0, fat: 12, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Aveia em Flocos', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Castanha do Pará', calories: 656, protein: 14, carbs: 12, fat: 66, defaultUnit: 'un', defaultQuantity: 1 },
  { name: 'Suco de Laranja Natural', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, defaultUnit: 'ml', defaultQuantity: 100 },
  { name: 'Tapioca (Goma)', calories: 240, protein: 0, carbs: 60, fat: 0, defaultUnit: 'g', defaultQuantity: 100 },
  { name: 'Queijo Minas Frescal', calories: 264, protein: 17, carbs: 3.2, fat: 20, defaultUnit: 'g', defaultQuantity: 100 },
];

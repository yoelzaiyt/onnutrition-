export interface ProgressEntry {
  id: string;
  patient_id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  body_fat_percentage?: number;
  lean_mass_percentage?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  chest_circumference?: number;
  notes?: string;
  photo_front_url?: string;
  photo_side_url?: string;
  photo_back_url?: string;
}

export interface Goal {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  completed: boolean;
}

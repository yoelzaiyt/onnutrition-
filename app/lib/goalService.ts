import { supabase } from '@/lib/supabase';

export interface Goal {
  id?: string;
  patient_id: string;
  nutri_id: string;
  title: string;
  category: string;
  start_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  status: 'Em progresso' | 'Atrasado' | 'Concluído' | 'Cancelado';
  created_at?: string;
  updated_at?: string;
  progress?: GoalProgress[];
}

export interface GoalProgress {
  id?: string;
  goal_id: string;
  value: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export const goalService = {
  async getAllByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        progress:goal_progress(*)
      `)
      .eq('patient_id', patientId)
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data as Goal[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        progress:goal_progress(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'progress'>) {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async update(id: string, updates: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addProgress(progress: Omit<GoalProgress, 'id' | 'created_at'>) {
    // 1. Add progress entry
    const { data, error: progressError } = await supabase
      .from('goal_progress')
      .insert(progress)
      .select()
      .single();

    if (progressError) throw progressError;

    // 2. Update current_value in goal
    const { error: goalError } = await supabase
      .from('goals')
      .update({ 
        current_value: progress.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', progress.goal_id);

    if (goalError) throw goalError;

    return data as GoalProgress;
  }
};

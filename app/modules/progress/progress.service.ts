import { supabase } from '@/lib/supabase';
import { ProgressEntry, Goal } from './progress.types';

export const progressService = {
  async getProgressEntries(patientId: string): Promise<ProgressEntry[]> {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching progress entries:', error);
      return [];
    }

    return data as ProgressEntry[];
  },

  async addProgressEntry(entry: Partial<ProgressEntry>): Promise<ProgressEntry | null> {
    const { data, error } = await supabase
      .from('progress_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Error adding progress entry:', error);
      return null;
    }

    return data as ProgressEntry;
  },

  async getGoals(patientId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return data as Goal[];
  }
};

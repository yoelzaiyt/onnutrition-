import { supabase } from '@/lib/supabase';

export interface Recommendation {
  id?: string;
  patient_id: string;
  nutri_id: string;
  title: string;
  content: string;
  category: 'Alimentação' | 'Treino' | 'Hábitos' | 'Geral';
  status: 'Ativo' | 'Arquivado';
  created_at?: string;
  updated_at?: string;
}

export const recommendationService = {
  async getAllByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Recommendation[];
  },

  async create(recommendation: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single();

    if (error) throw error;
    return data as Recommendation;
  },

  async update(id: string, recommendation: Partial<Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('recommendations')
      .update({ ...recommendation, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Recommendation;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async archive(id: string) {
    const { error } = await supabase
      .from('recommendations')
      .update({ status: 'Arquivado', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
};

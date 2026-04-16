import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Patient {
  id: string;
  nutri_id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  birth_date?: string;
  cpf?: string;
  instagram?: string;
  objective?: string;
  activity_level?: string;
  food_restrictions?: string;
  history?: string;
  tags?: string[];
  status: string;
  current_status: string;
  last_contact?: string;
  photo_url?: string;
  age?: number;
  current_weight?: number;
  target_weight?: number;
  height?: number;
  created_at?: string;
  updated_at?: string;
}

export const patientService = {
  async getAll(nutriId: string): Promise<Patient[]> {
    if (!isSupabaseConfigured) {
      return [
        { id: '1', nutri_id: nutriId, name: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 98888-7777', status: 'Ativo', current_status: 'Em Consulta', last_contact: '2026-03-28', age: 34, current_weight: 68, target_weight: 62, height: 1.65, objective: 'Emagrecimento Saudável', tags: ['Emagrecimento', 'Hipertensa'] },
        { id: '2', nutri_id: nutriId, name: 'João Silva', email: 'joao@email.com', phone: '(11) 97777-6666', status: 'Ativo', current_status: 'Aguardando', last_contact: '2026-03-25', age: 28, current_weight: 85, target_weight: 80, height: 1.80, objective: 'Hipertrofia', tags: ['Hipertrofia', 'Atleta'] },
        { id: '3', nutri_id: nutriId, name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 96666-5555', status: 'Inativo', current_status: 'Ausente', last_contact: '2026-02-15', age: 42, current_weight: 75, target_weight: 70, height: 1.60, objective: 'Diabetes Tipo 2', tags: ['Diabetes'] },
        { id: '4', nutri_id: nutriId, name: 'Roberto Santos', email: 'roberto@email.com', phone: '(11) 95555-4444', status: 'Ativo', current_status: 'Em Consulta', last_contact: '2026-03-30', age: 31, current_weight: 92, target_weight: 88, height: 1.85, objective: 'Performance Esportiva', tags: ['CrossFit', 'Alimentação'] },
        { id: '5', nutri_id: nutriId, name: 'Luciana Lima', email: 'luciana@email.com', phone: '(11) 94444-3333', status: 'Ativo', current_status: 'Aguardando', last_contact: '2026-03-29', age: 29, current_weight: 64, target_weight: 66, height: 1.62, objective: 'Gestação (24 semanas)', tags: ['Gestante', 'Suplementação'] },
        { id: '6', nutri_id: nutriId, name: 'Carlos Eduardo', email: 'cadu@email.com', phone: '(11) 93333-2222', status: 'Ativo', current_status: 'Retorno', last_contact: '2026-03-20', age: 55, current_weight: 78, target_weight: 75, height: 1.74, objective: 'Longevidade', tags: ['Check-up', 'Saúde'] },
        { id: '7', nutri_id: nutriId, name: 'Beatriz Rocha', email: 'bia@email.com', phone: '(11) 92222-1111', status: 'Ativo', current_status: 'Faltou', last_contact: '2026-03-10', age: 24, current_weight: 56, target_weight: 58, height: 1.68, objective: 'Transição ao Vegetarianismo', tags: ['Vegetariano'] },
        { id: '8', nutri_id: nutriId, name: 'Felipe Mendes', email: 'felipe@email.com', phone: '(11) 91111-0000', status: 'Ativo', current_status: 'Aguardando', last_contact: '2026-03-31', age: 38, current_weight: 124, target_weight: 95, height: 1.82, objective: 'Pré-operatório Bariátrica', tags: ['Bariátrica', 'Ansiedade'] },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('nutri_id', nutriId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar pacientes do Supabase:', err);
      return [
        { id: '1', nutri_id: nutriId, name: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 98888-7777', status: 'Ativo', current_status: 'Em Consulta', last_contact: '2026-03-28', age: 34, current_weight: 68, target_weight: 62, height: 1.65, objective: 'Emagrecimento Saudável', tags: ['Emagrecimento'] },
        { id: '2', nutri_id: nutriId, name: 'João Silva', email: 'joao@email.com', phone: '(11) 97777-6666', status: 'Ativo', current_status: 'Aguardando', last_contact: '2026-03-25', age: 28, current_weight: 85, target_weight: 80, height: 1.80, objective: 'Hipertrofia', tags: ['Hipertrofia'] },
      ];
    }
  },

  async getById(id: string): Promise<Patient | null> {
    if (!isSupabaseConfigured) {
      const demoPatients = await patientService.getAll('demo');
      return demoPatients.find(p => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    if (!isSupabaseConfigured) {
      return { ...patient, id: Math.random().toString(36).substr(2, 9) } as Patient;
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    if (!isSupabaseConfigured) {
      return { id, ...updates } as Patient;
    }

    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

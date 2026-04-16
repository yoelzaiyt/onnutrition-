import { supabase } from '@/lib/supabase';

export interface MedicalRecord {
  id?: string;
  patient_id: string;
  nutri_id: string;
  clinical_history: string;
  nutritional_diagnosis: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicalNote {
  id?: string;
  patient_id: string;
  nutri_id: string;
  content: string;
  date: string;
  created_at?: string;
}

export const medicalRecordService = {
  async getMedicalRecord(patientId: string) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) throw error;
    return data as MedicalRecord | null;
  },

  async upsertMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('medical_records')
      .upsert(record, { onConflict: 'patient_id' })
      .select()
      .single();

    if (error) throw error;
    return data as MedicalRecord;
  },

  async getClinicalNotes(patientId: string) {
    const { data, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as ClinicalNote[];
  },

  async createClinicalNote(note: Omit<ClinicalNote, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clinical_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data as ClinicalNote;
  },

  async updateClinicalNote(id: string, content: string) {
    const { data, error } = await supabase
      .from('clinical_notes')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ClinicalNote;
  },

  async deleteClinicalNote(id: string) {
    const { error } = await supabase
      .from('clinical_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

import { supabase } from '@/lib/supabase';

export interface PrescriptionItem {
  id?: string;
  prescription_id?: string;
  substance: string;
  dosage: string;
  created_at?: string;
}

export interface CompoundedPrescription {
  id?: string;
  patient_id: string;
  nutri_id: string;
  title: string;
  posology: string;
  observations?: string;
  status: 'Ativo' | 'Arquivado';
  created_at?: string;
  updated_at?: string;
  items?: PrescriptionItem[];
}

export const prescriptionService = {
  async getAllByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('compounded_prescriptions')
      .select(`
        *,
        items:prescription_items(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CompoundedPrescription[];
  },

  async create(prescription: Omit<CompoundedPrescription, 'id' | 'created_at' | 'updated_at' | 'items'>, items: Omit<PrescriptionItem, 'id' | 'prescription_id' | 'created_at'>[]) {
    // 1. Create prescription
    const { data: prescriptionData, error: prescriptionError } = await supabase
      .from('compounded_prescriptions')
      .insert(prescription)
      .select()
      .single();

    if (prescriptionError) throw prescriptionError;

    // 2. Create items
    const itemsToInsert = items.map(item => ({
      ...item,
      prescription_id: prescriptionData.id
    }));

    const { error: itemsError } = await supabase
      .from('prescription_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return { ...prescriptionData, items: itemsToInsert } as CompoundedPrescription;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('compounded_prescriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async archive(id: string) {
    const { error } = await supabase
      .from('compounded_prescriptions')
      .update({ status: 'Arquivado', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
};

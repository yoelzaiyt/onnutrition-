import { supabase } from '@/lib/supabase';
import { Appointment, AvailableSlot } from './schedule.types';

export const scheduleService = {
  async getAppointments(userId: string, role: 'patient' | 'nutri'): Promise<Appointment[]> {
    const query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (role === 'patient') {
      query.eq('patient_id', userId);
    } else {
      query.eq('nutritionist_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }

    return data as Appointment[];
  },

  async scheduleAppointment(appointment: Partial<Appointment>): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) {
      console.error('Error scheduling appointment:', error);
      return null;
    }

    return data as Appointment;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<boolean> {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }

    return true;
  }
};

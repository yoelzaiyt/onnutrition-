export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  patient_name: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  type: 'initial' | 'follow-up' | 'return';
}

export interface AvailableSlot {
  date: string;
  times: string[];
}

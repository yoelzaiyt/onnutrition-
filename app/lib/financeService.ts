/**
 * financeService.ts
 * Camada de dados para o módulo Financeiro.
 * Persistência via Supabase. Modo Demo com dados mock quando não configurado.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Payment {
  id?: string;
  nutri_id: string;
  patient_id: string;
  patient_name?: string;
  amount: number;
  date: string;
  status: 'pago' | 'pendente' | 'atrasado';
  method?: string;
  description?: string;
  created_at?: string;
}

// ---------- Demo data ----------
const MOCK_PAYMENTS: Payment[] = [
  { id: '1', nutri_id: 'demo', patient_id: '1', patient_name: 'Maria Oliveira',  amount: 250, date: '2026-03-05', status: 'pago',     method: 'PIX',         description: 'Consulta inicial' },
  { id: '2', nutri_id: 'demo', patient_id: '2', patient_name: 'João Silva',      amount: 250, date: '2026-03-12', status: 'pago',     method: 'Cartão',      description: 'Retorno' },
  { id: '3', nutri_id: 'demo', patient_id: '3', patient_name: 'Ana Costa',       amount: 250, date: '2026-03-20', status: 'pendente', method: 'Transferência',description: 'Plano alimentar' },
  { id: '4', nutri_id: 'demo', patient_id: '4', patient_name: 'Roberto Santos',  amount: 350, date: '2026-03-28', status: 'pago',     method: 'PIX',         description: 'Pacote 3 meses' },
  { id: '5', nutri_id: 'demo', patient_id: '5', patient_name: 'Luciana Lima',    amount: 250, date: '2026-04-01', status: 'atrasado', method: 'Boleto',      description: 'Retorno mensal' },
  { id: '6', nutri_id: 'demo', patient_id: '6', patient_name: 'Carlos Eduardo',  amount: 450, date: '2026-04-05', status: 'pendente', method: 'PIX',         description: 'Pacote 6 meses' },
];

// ---------- Service ----------
export const financeService = {
  async getAll(nutriId: string): Promise<Payment[]> {
    if (!isSupabaseConfigured) return MOCK_PAYMENTS;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('nutri_id', nutriId)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Supabase error, falling back to demo data:', error.message);
        return MOCK_PAYMENTS;
      }
      return (data as Payment[]) || MOCK_PAYMENTS;
    } catch (err) {
      console.warn('Error fetching payments, using demo data:', err);
      return MOCK_PAYMENTS;
    }
  },

  async create(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    if (!isSupabaseConfigured) {
      const mock: Payment = { ...payment, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString() };
      MOCK_PAYMENTS.unshift(mock);
      return mock;
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...payment, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async update(id: string, updates: Partial<Payment>): Promise<Payment> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_PAYMENTS.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_PAYMENTS[idx] = { ...MOCK_PAYMENTS[idx], ...updates };
      return MOCK_PAYMENTS[idx];
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_PAYMENTS.findIndex(p => p.id === id);
      if (idx !== -1) MOCK_PAYMENTS.splice(idx, 1);
      return;
    }

    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },

  /** Calcula métricas para o dashboard financeiro */
  getMetrics(payments: Payment[]) {
    const totalReceived = payments.filter(p => p.status === 'pago').reduce((s, p) => s + p.amount, 0);
    const totalPending  = payments.filter(p => p.status === 'pendente').reduce((s, p) => s + p.amount, 0);
    const totalLate     = payments.filter(p => p.status === 'atrasado').reduce((s, p) => s + p.amount, 0);
    const conversionRate = payments.length > 0
      ? Math.round((payments.filter(p => p.status === 'pago').length / payments.length) * 100)
      : 0;

    return { totalReceived, totalPending, totalLate, conversionRate };
  },
};

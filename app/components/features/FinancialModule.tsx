'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Plus,
  X,
  Calendar,
  User,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { financeService, Payment } from '@/app/lib/financeService';
import { patientService } from '@/app/lib/patientService';
import { supabase } from '@/lib/supabase';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
type StatusFilter = 'todos' | 'pago' | 'pendente' | 'atrasado';

const PAYMENT_METHODS = ['PIX', 'Cartão', 'Dinheiro', 'Transferência', 'Boleto'];

const EMPTY_FORM = {
  patient_id: '',
  patient_name: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  status: 'pendente' as Payment['status'],
  method: 'PIX',
  description: '',
};

// ───────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────
const FinancialModule: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [nutriId, setNutriId] = useState('demo-nutri-id');

  // Fetch logged user id
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setNutriId(data.user.id);
    });
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financeService.getAll(nutriId);
      setPayments(data);
    } catch (err) {
      console.warn('FinancialModule: Using demo payments:', err);
    } finally {
      setLoading(false);
    }
  }, [nutriId]);

  const fetchPatients = useCallback(async () => {
    try {
      const data = await patientService.getAll(nutriId);
      setPatients(data.map(p => ({ id: p.id, name: p.name })));
    } catch (err) {
      console.error('FinancialModule: Error fetching patients:', err);
    }
  }, [nutriId]);

  useEffect(() => {
    fetchPayments();
    fetchPatients();
  }, [fetchPayments, fetchPatients]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const selectedPatient = patients.find(p => p.id === formData.patient_id);
      await financeService.create({
        nutri_id: nutriId,
        patient_id: formData.patient_id,
        patient_name: selectedPatient?.name || formData.patient_name || 'Desconhecido',
        amount: parseFloat(formData.amount),
        date: formData.date,
        status: formData.status,
        method: formData.method,
        description: formData.description,
      });
      setShowAddModal(false);
      setFormData(EMPTY_FORM);
      fetchPayments();
    } catch (err) {
      console.error('FinancialModule: Error adding payment:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Payment['status']) => {
    try {
      await financeService.update(id, { status });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      console.error('FinancialModule: Error updating payment status:', err);
    }
  };

  // Metrics
  const metrics = financeService.getMetrics(payments);

  const filtered = statusFilter === 'todos'
    ? payments
    : payments.filter(p => p.status === statusFilter);

  // Chart data — last 6 months
  const monthlyData = React.useMemo(() => {
    const months: Record<string, { month: string; received: number; pending: number }> = {};
    payments.forEach(p => {
      const d = new Date(p.date);
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { month: key, received: 0, pending: 0 };
      if (p.status === 'pago') months[key].received += p.amount;
      else months[key].pending += p.amount;
    });
    return Object.values(months).slice(-6);
  }, [payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#22B391] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Financeiro</h1>
          <p className="text-sm text-slate-500 font-medium">Gerencie receitas, cobranças e fluxo de caixa.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-[#22B391] rounded-xl transition-all"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl text-sm font-black hover:bg-[#1DA081] transition-all shadow-xl shadow-[#22B391]/20"
          >
            <Plus className="w-4 h-4" />
            Nova Cobrança
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Recebido"
          value={`R$ ${metrics.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <MetricCard
          label="Pendente"
          value={`R$ ${metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <MetricCard
          label="Em Atraso"
          value={`R$ ${metrics.totalLate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={AlertTriangle}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <MetricCard
          label="Taxa Conversão"
          value={`${metrics.conversionRate}%`}
          icon={CheckCircle2}
          color="text-[#22B391]"
          bg="bg-[#22B391]/10"
        />
      </div>

      {/* Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <h3 className="font-black text-[#0B2B24] mb-6">Evolução Financeira</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip
                  formatter={(val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="received" name="Recebido" fill="#22B391" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending"  name="Pendente"  fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-black text-[#0B2B24]">Lançamentos</h3>
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100 gap-1">
            {(['todos', 'pago', 'pendente', 'atrasado'] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === f ? 'bg-white text-[#0B2B24] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['Paciente', 'Data', 'Valor', 'Método', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0B2B24] text-sm">{payment.patient_name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(payment.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-black text-[#0B2B24]">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{payment.method || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {payment.status !== 'pago' && (
                          <button
                            onClick={() => handleUpdateStatus(payment.id!, 'pago')}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all text-xs font-bold"
                            title="Marcar como pago"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {payment.status === 'pendente' && (
                          <button
                            onClick={() => handleUpdateStatus(payment.id!, 'atrasado')}
                            className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title="Marcar como atrasado"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#0B2B24]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#22B391]/10 p-2.5 rounded-xl">
                    <DollarSign className="w-5 h-5 text-[#22B391]" />
                  </div>
                  <h2 className="text-xl font-black text-[#0B2B24]">Nova Cobrança</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="p-8 space-y-5">
                {/* Patient */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Paciente</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      required
                      value={formData.patient_id}
                      onChange={e => {
                        const p = patients.find(p => p.id === e.target.value);
                        setFormData({ ...formData, patient_id: e.target.value, patient_name: p?.name || '' });
                      }}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] outline-none appearance-none"
                    >
                      <option value="">Selecione um paciente</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Valor (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required type="number" step="0.01" min="0" placeholder="0,00"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] outline-none"
                      />
                    </div>
                  </div>
                  {/* Date */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Data</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Method */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Método</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={formData.method}
                        onChange={e => setFormData({ ...formData, method: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] outline-none appearance-none"
                      >
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                    <div className="flex gap-2">
                      {(['pago', 'pendente'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: s })}
                          className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                            formData.status === s
                              ? s === 'pago' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Descrição (Opcional)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      placeholder="Ex: Consulta de retorno, Plano Trimestral..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] outline-none min-h-[90px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-2 flex-[2] py-4 bg-[#22B391] text-white rounded-2xl text-sm font-black hover:bg-[#1DA081] transition-all shadow-xl shadow-[#22B391]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Salvar Cobrança
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ───────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: any; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
      <div className={`w-10 h-10 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-black text-[#0B2B24]">{value}</h4>
    </div>
  );
}

function StatusBadge({ status }: { status: Payment['status'] }) {
  const styles: Record<Payment['status'], string> = {
    pago:     'bg-emerald-100 text-emerald-700',
    pendente: 'bg-amber-100 text-amber-700',
    atrasado: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}

export default FinancialModule;

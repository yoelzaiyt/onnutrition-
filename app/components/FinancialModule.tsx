'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  X, 
  Calendar, 
  User, 
  CreditCard, 
  FileText,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { financeService, Payment } from '@/app/lib/financeService';
import { populateMockPayments } from '@/app/lib/mockDataPopulator';
import FinancialDashboard from './FinancialDashboard';
import PaymentTable from './PaymentTable';
import { supabase } from '@/lib/supabase';

const FinancialModule: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pendente' as 'pago' | 'pendente',
    method: 'Pix',
    description: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await financeService.getAll('mock-nutri-id'); // Id mock provisório
        setPayments(data);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('id, name');
    if (data) setPatients(data);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      
      await financeService.create({
        nutri_id: 'mock-nutri-id',
        patient_id: formData.patientId,
        patient_name: selectedPatient?.name || 'Desconhecido',
        amount: parseFloat(formData.amount),
        date: formData.date,
        status: formData.status,
        method: formData.method,
        description: formData.description
      });

      setShowAddModal(false);
      setFormData({
        patientId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pendente',
        method: 'Pix',
        description: ''
      });
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#22B391] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Financeiro</h1>
          <p className="text-sm text-slate-500 font-medium">Gerencie suas receitas, cobranças e fluxo de caixa.</p>
        </div>
        <div className="flex items-center gap-3">
          {payments.length === 0 && (
            <button 
              onClick={async () => {
                await populateMockPayments();
              }}
              className="px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
            >
              Gerar Dados Mock
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl text-sm font-black hover:bg-[#1DA081] transition-all shadow-xl shadow-[#22B391]/20 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Nova Cobrança
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <FinancialDashboard payments={payments} />

      {/* Main Table */}
      <PaymentTable 
        payments={payments} 
        onAddPayment={() => setShowAddModal(true)} 
      />

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
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#22B391]/10 p-2 rounded-xl">
                    <DollarSign className="w-5 h-5 text-[#22B391]" />
                  </div>
                  <h2 className="text-xl font-black text-[#0B2B24]">Nova Cobrança</h2>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Paciente</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        required
                        value={formData.patientId}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] transition-all appearance-none"
                      >
                        <option value="">Selecione um paciente</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Valor (R$)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Data</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Método</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                          value={formData.method}
                          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] transition-all appearance-none"
                        >
                          <option value="Pix">Pix</option>
                          <option value="Cartão">Cartão</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Transferência">Transferência</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, status: 'pago' })}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                            formData.status === 'pago' 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          Pago
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, status: 'pendente' })}
                          className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                            formData.status === 'pendente' 
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          Pendente
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Descrição (Opcional)</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                      <textarea 
                        placeholder="Ex: Consulta de retorno, Plano Trimestral..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391] transition-all min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#22B391] text-white rounded-2xl text-sm font-black hover:bg-[#1DA081] transition-all shadow-xl shadow-[#22B391]/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
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

export default FinancialModule;

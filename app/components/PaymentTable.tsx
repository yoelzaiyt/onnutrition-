'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  Download,
  Calendar,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Payment, financeService } from '@/app/lib/financeService';

interface PaymentTableProps {
  payments: Payment[];
  onAddPayment: () => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onAddPayment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || payment.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'todos') {
      const paymentDate = new Date(payment.date);
      const now = new Date();
      if (dateFilter === 'hoje') {
        matchesDate = paymentDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = paymentDate >= weekAgo;
      } else if (dateFilter === 'mes') {
        matchesDate = paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este pagamento?')) {
      try {
        await financeService.deletePayment(id);
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const toggleStatus = async (payment: Payment) => {
    try {
      const newStatus = payment.status === 'pago' ? 'pendente' : 'pago';
      await financeService.updatePayment(payment.id!, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-[#0B2B24]">Cobranças</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button 
              onClick={onAddPayment}
              className="flex items-center gap-2 px-4 py-2 bg-[#22B391] text-white rounded-xl text-xs font-bold hover:bg-[#1DA081] transition-all shadow-lg shadow-[#22B391]/20"
            >
              <Plus className="w-4 h-4" />
              Nova Cobrança
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por paciente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#22B391] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-600 px-4 py-3 focus:ring-2 focus:ring-[#22B391]"
            >
              <option value="todos">Todos Status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-600 px-4 py-3 focus:ring-2 focus:ring-[#22B391]"
            >
              <option value="todos">Qualquer Data</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Este Mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Paciente</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Método</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode='popLayout'>
              {filteredPayments.map((payment) => (
                <motion.tr 
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#0B2B24]">{payment.patientName || 'Paciente não identificado'}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{payment.description || 'Sem descrição'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(payment.date).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#0B2B24]">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {payment.method || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(payment)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                        payment.status === 'pago' 
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                          : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      }`}
                    >
                      {payment.status === 'pago' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {payment.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-[#22B391] hover:bg-slate-100 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(payment.id!)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Search className="w-8 h-8 opacity-20" />
                    <p className="text-sm font-bold">Nenhum pagamento encontrado</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;

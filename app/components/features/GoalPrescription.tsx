'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  ChevronRight,
  ArrowRight,
  History,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { goalService, Goal, GoalProgress } from '@/app/lib/goalService';
import { supabase } from '@/lib/supabase';

interface GoalPrescriptionProps {
  patientId: string;
  patientName: string;
}

const GoalPrescription: React.FC<GoalPrescriptionProps> = ({ patientId, patientName }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddProgress, setShowAddProgress] = useState(false);

  // Form states
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'Peso',
    start_value: '',
    target_value: '',
    unit: 'kg',
    deadline: ''
  });

  const [newProgress, setNewProgress] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchGoals();
  }, [patientId]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getAllByPatient(patientId);
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await goalService.create({
        patient_id: patientId,
        nutri_id: user.id,
        title: newGoal.title,
        category: newGoal.category,
        start_value: Number(newGoal.start_value),
        target_value: Number(newGoal.target_value),
        current_value: Number(newGoal.start_value),
        unit: newGoal.unit,
        deadline: newGoal.deadline,
        status: 'Em progresso'
      });

      setShowAddGoal(false);
      setNewGoal({
        title: '',
        category: 'Peso',
        start_value: '',
        target_value: '',
        unit: 'kg',
        deadline: ''
      });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await goalService.addProgress({
        goal_id: selectedGoal.id!,
        value: Number(newProgress.value),
        date: newProgress.date,
        notes: newProgress.notes
      });

      setShowAddProgress(false);
      setNewProgress({
        value: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchGoals();
      
      // Update selected goal to show new progress
      const updatedGoal = await goalService.getById(selectedGoal.id!);
      setSelectedGoal(updatedGoal);
    } catch (error) {
      console.error('Error adding progress:', error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
    try {
      await goalService.delete(id);
      if (selectedGoal?.id === id) setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const calculateProgress = (goal: Goal) => {
    const total = Math.abs(goal.target_value - goal.start_value);
    const current = Math.abs(goal.current_value - goal.start_value);
    const percentage = (current / total) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'Atrasado': return 'text-rose-500 bg-rose-50 border-rose-100';
      case 'Cancelado': return 'text-slate-400 bg-slate-50 border-slate-100';
      default: return 'text-blue-500 bg-blue-50 border-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído': return <CheckCircle2 className="w-4 h-4" />;
      case 'Atrasado': return <AlertCircle className="w-4 h-4" />;
      case 'Cancelado': return <Trash2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const chartData = useMemo(() => {
    if (!selectedGoal || !selectedGoal.progress) return [];
    
    const data = [
      { date: 'Início', value: selectedGoal.start_value },
      ...selectedGoal.progress
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(p => ({
          date: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          value: p.value
        }))
    ];
    return data;
  }, [selectedGoal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22B391]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0B2B24]">Metas & Objetivos</h2>
          <p className="text-slate-500 font-medium">Acompanhamento de progresso para {patientName}</p>
        </div>
        <button 
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goals List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#22B391]" />
            <h3 className="font-black text-[#0B2B24]">Metas Ativas</h3>
          </div>
          
          {goals.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center">
              <p className="text-slate-400 font-bold">Nenhuma meta definida ainda.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <motion.div
                key={goal.id}
                layoutId={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
                  selectedGoal?.id === goal.id 
                    ? 'bg-white border-[#22B391] shadow-xl shadow-[#22B391]/10' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(goal.status)}`}>
                      {getStatusIcon(goal.status)}
                      {goal.status}
                    </span>
                    <h4 className="font-black text-[#0B2B24] mt-2 group-hover:text-[#22B391] transition-colors">{goal.title}</h4>
                    <p className="text-xs text-slate-400 font-bold">{goal.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#0B2B24]">{goal.current_value}<span className="text-xs ml-1">{goal.unit}</span></p>
                    <p className="text-[10px] text-slate-400 font-bold">Meta: {goal.target_value}{goal.unit}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400">
                    <span>Progresso</span>
                    <span>{calculateProgress(goal).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(goal)}%` }}
                      className={`h-full rounded-full ${
                        goal.status === 'Atrasado' ? 'bg-rose-500' : 'bg-[#22B391]'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                  <Calendar className="w-3 h-3" />
                  Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Goal Details & Evolution */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedGoal ? (
              <motion.div
                key={selectedGoal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#22B391]/10 rounded-3xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-[#22B391]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#0B2B24]">{selectedGoal.title}</h3>
                      <p className="text-slate-500 font-bold flex items-center gap-2">
                        {selectedGoal.category} • {selectedGoal.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAddProgress(true)}
                      className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all"
                      title="Registrar Evolução"
                    >
                      <Activity className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(selectedGoal.id!)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
                      title="Excluir Meta"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Inicial</p>
                    <p className="text-2xl font-black text-[#0B2B24]">{selectedGoal.start_value}<span className="text-xs ml-1">{selectedGoal.unit}</span></p>
                  </div>
                  <div className="p-6 bg-[#22B391]/5 rounded-[2rem] border border-[#22B391]/10">
                    <p className="text-[10px] font-black text-[#22B391] uppercase tracking-wider mb-1">Atual</p>
                    <p className="text-2xl font-black text-[#22B391]">{selectedGoal.current_value}<span className="text-xs ml-1">{selectedGoal.unit}</span></p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Objetivo</p>
                    <p className="text-2xl font-black text-[#0B2B24]">{selectedGoal.target_value}<span className="text-xs ml-1">{selectedGoal.unit}</span></p>
                  </div>
                </div>

                {/* Chart */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-[#0B2B24] flex items-center gap-2">
                      <History className="w-4 h-4 text-[#22B391]" />
                      Histórico de Evolução
                    </h4>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22B391" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#22B391" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontWeight: 800,
                            fontSize: '12px'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#22B391" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="space-y-4">
                  <h4 className="font-black text-[#0B2B24]">Registros Recentes</h4>
                  <div className="space-y-3">
                    {selectedGoal.progress?.slice().reverse().map((p, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                          <Activity className="w-5 h-5 text-[#22B391]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#0B2B24]">{p.value} {selectedGoal.unit}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        {p.notes && (
                          <p className="text-xs text-slate-500 italic font-medium max-w-[200px] truncate">{p.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                  <Target className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-[#0B2B24] mb-2">Selecione uma meta</h3>
                <p className="text-slate-400 font-bold max-w-xs">Escolha uma meta da lista ao lado para ver os detalhes e o histórico de evolução.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#0B2B24]">Nova Meta</h3>
                <button onClick={() => setShowAddGoal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <Plus className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Título da Meta</label>
                  <input 
                    type="text" 
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Ex: Redução de Gordura Corporal"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Categoria</label>
                    <select 
                      value={newGoal.category}
                      onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                    >
                      <option>Peso</option>
                      <option>Gordura</option>
                      <option>Músculo</option>
                      <option>Calorias</option>
                      <option>Hidratação</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Unidade</label>
                    <input 
                      type="text" 
                      required
                      value={newGoal.unit}
                      onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                      placeholder="kg, %, kcal..."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Valor Inicial</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={newGoal.start_value}
                      onChange={e => setNewGoal({...newGoal, start_value: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Valor Alvo</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={newGoal.target_value}
                      onChange={e => setNewGoal({...newGoal, target_value: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Prazo Final</label>
                  <input 
                    type="date" 
                    required
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20 mt-4"
                >
                  Criar Meta
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Progress Modal */}
      <AnimatePresence>
        {showAddProgress && selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0B2B24]">Registrar Evolução</h3>
                  <p className="text-xs text-slate-400 font-bold">{selectedGoal.title}</p>
                </div>
                <button onClick={() => setShowAddProgress(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <Plus className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddProgress} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Novo Valor ({selectedGoal.unit})</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    autoFocus
                    value={newProgress.value}
                    onChange={e => setNewProgress({...newProgress, value: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-2xl text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Data do Registro</label>
                  <input 
                    type="date" 
                    required
                    value={newProgress.date}
                    onChange={e => setNewProgress({...newProgress, date: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Observações (Opcional)</label>
                  <textarea 
                    value={newProgress.notes}
                    onChange={e => setNewProgress({...newProgress, notes: e.target.value})}
                    placeholder="Ex: Medição em jejum..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20 mt-4"
                >
                  Salvar Evolução
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalPrescription;

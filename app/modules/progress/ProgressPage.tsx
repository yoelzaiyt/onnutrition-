'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  TrendingUp, 
  Scale, 
  Target, 
  Camera, 
  Plus,
  Calendar,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
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
import { ProgressEntry, Goal } from './progress.types';
import { progressService } from './progress.service';

interface ProgressPageProps {
  patientId: string;
  onBack: () => void;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ patientId, onBack }) => {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'photos' | 'goals'>('stats');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [entriesData, goalsData] = await Promise.all([
          progressService.getProgressEntries(patientId),
          progressService.getGoals(patientId)
        ]);

        if (entriesData.length > 0) {
          setEntries(entriesData);
        } else {
          // Demo entries
          const demoEntries: ProgressEntry[] = [
            { id: '1', patient_id: patientId, date: '2025-10-01', weight: 85.5, height: 1.75, bmi: 27.9, body_fat_percentage: 25, lean_mass_percentage: 75 },
            { id: '2', patient_id: patientId, date: '2025-11-01', weight: 83.2, height: 1.75, bmi: 27.2, body_fat_percentage: 24, lean_mass_percentage: 76 },
            { id: '3', patient_id: patientId, date: '2025-12-01', weight: 81.5, height: 1.75, bmi: 26.6, body_fat_percentage: 23, lean_mass_percentage: 77 },
            { id: '4', patient_id: patientId, date: '2026-01-01', weight: 79.8, height: 1.75, bmi: 26.1, body_fat_percentage: 22, lean_mass_percentage: 78 },
            { id: '5', patient_id: patientId, date: '2026-02-01', weight: 78.5, height: 1.75, bmi: 25.6, body_fat_percentage: 21, lean_mass_percentage: 79 },
            { id: '6', patient_id: patientId, date: '2026-03-01', weight: 77.2, height: 1.75, bmi: 25.2, body_fat_percentage: 20, lean_mass_percentage: 80 }
          ];
          setEntries(demoEntries);
        }

        if (goalsData.length > 0) {
          setGoals(goalsData);
        } else {
          // Demo goals
          const demoGoals: Goal[] = [
            { id: 'g1', patient_id: patientId, title: 'Meta de Peso', target_value: 75, current_value: 77.2, unit: 'kg', completed: false },
            { id: 'g2', patient_id: patientId, title: 'Gordura Corporal', target_value: 18, current_value: 20, unit: '%', completed: false },
            { id: 'g3', patient_id: patientId, title: 'Ingestão de Água', target_value: 3, current_value: 2.5, unit: 'L', completed: false }
          ];
          setGoals(demoGoals);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestEntry = entries[entries.length - 1];
  const previousEntry = entries[entries.length - 2];
  const weightDiff = latestEntry && previousEntry ? latestEntry.weight - previousEntry.weight : 0;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-[#22B391] transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Evolução e Progresso</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Acompanhe seus resultados</p>
          </div>
        </div>
        <button className="bg-[#22B391] text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#22B391]/20 hover:scale-105 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Medição
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
              <Scale className="w-5 h-5" />
            </div>
            {weightDiff !== 0 && (
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${weightDiff < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {weightDiff < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {Math.abs(weightDiff).toFixed(1)}kg
              </div>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Atual</p>
          <p className="text-3xl font-black text-[#0B2B24]">{latestEntry?.weight} <span className="text-sm text-slate-400">kg</span></p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#22B391] w-fit mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IMC</p>
          <p className="text-3xl font-black text-[#0B2B24]">{latestEntry?.bmi.toFixed(1)}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-500 w-fit mb-4">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gordura Corporal</p>
          <p className="text-3xl font-black text-[#0B2B24]">{latestEntry?.body_fat_percentage}%</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-500 w-fit mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metas Batidas</p>
          <p className="text-3xl font-black text-[#0B2B24]">{goals.filter(g => g.completed).length}/{goals.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
        {[
          { id: 'stats', label: 'Estatísticas', icon: TrendingUp },
          { id: 'photos', label: 'Fotos', icon: Camera },
          { id: 'goals', label: 'Metas', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-[#0B2B24] text-white shadow-lg shadow-[#0B2B24]/20' 
                : 'text-slate-400 hover:text-[#22B391] hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-black text-[#0B2B24] mb-8 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-[#22B391]" />
                  Histórico de Peso
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={entries}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22B391" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22B391" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { month: 'short' })}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 900, color: '#0B2B24' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#22B391" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-black text-[#0B2B24] mb-8 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  Composição Corporal
                </h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={entries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { month: 'short' })}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="body_fat_percentage" name="Gordura (%)" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                      <Line type="monotone" dataKey="lean_mass_percentage" name="Massa Magra (%)" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-[#0B2B24]">Antes</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outubro 2025</span>
                </div>
                <div className="aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                  <img 
                    src="https://picsum.photos/seed/before/600/800" 
                    alt="Antes"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button className="p-4 bg-white rounded-2xl text-[#0B2B24] font-black text-sm">Ver Detalhes</button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-[#0B2B24]">Depois</h3>
                  <span className="text-[10px] font-black text-[#22B391] uppercase tracking-widest">Março 2026</span>
                </div>
                <div className="aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                  <img 
                    src="https://picsum.photos/seed/after/600/800" 
                    alt="Depois"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button className="p-4 bg-white rounded-2xl text-[#0B2B24] font-black text-sm">Ver Detalhes</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress = (goal.current_value / goal.target_value) * 100;
                return (
                  <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${goal.completed ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-[#0B2B24]">{goal.title}</h3>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Meta: {goal.target_value}{goal.unit}</p>
                        </div>
                      </div>
                      {goal.completed && (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          Concluída
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progresso</span>
                        <span className="text-[#0B2B24]">{goal.current_value}{goal.unit} / {goal.target_value}{goal.unit}</span>
                      </div>
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          className={`h-full rounded-full ${goal.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <div className="bg-[#0B2B24] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#0B2B24]/40">
            <h4 className="text-lg font-black mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#22B391]" />
              Último Registro
            </h4>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-[#22B391] uppercase tracking-widest mb-1">Data</p>
                <p className="font-black text-lg">{new Date(latestEntry?.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso</p>
                  <p className="font-black">{latestEntry?.weight}kg</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gordura</p>
                  <p className="font-black">{latestEntry?.body_fat_percentage}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40">
            <h4 className="text-lg font-black text-[#0B2B24] mb-6">Próximos Passos</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-xl text-[#22B391] shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2B24] mb-1">Manter hidratação</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Você está quase batendo sua meta de água hoje!</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2B24] mb-1">Nova avaliação</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Sua próxima avaliação física é em 15 dias.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;

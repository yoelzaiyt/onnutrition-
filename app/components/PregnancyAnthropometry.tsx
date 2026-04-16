'use client';

import React, { useState, useMemo } from 'react';
import { 
  Baby, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Scale, 
  Activity, 
  Zap, 
  Brain, 
  ShieldAlert,
  Info,
  ArrowRight,
  Heart,
  Stethoscope
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
  Area,
  ReferenceLine
} from 'recharts';

interface PregnancyEntry {
  id: string;
  date: string;
  week: number;
  weight: number;
  abdominalCircumference?: number;
  notes?: string;
}

interface PregnancyAnthropometryProps {
  patientId: string;
}

const PregnancyAnthropometry: React.FC<PregnancyAnthropometryProps> = ({ patientId }) => {
  const [view, setView] = useState<'dashboard' | 'new_entry' | 'evolution'>('dashboard');

  // Mock Pregnancy Data
  const pregnancyData = {
    dum: '2025-11-15',
    dpp: '2026-08-22',
    type: 'Única',
    prePregnancyWeight: 62.0,
    height: 1.65,
    prePregnancyBmi: 22.8,
    bmiClassification: 'Adequado',
    recommendedGain: { min: 11.5, max: 16.0 }
  };

  const [history] = useState<PregnancyEntry[]>([
    { id: '1', date: '2026-03-30', week: 19, weight: 67.5, abdominalCircumference: 88 },
    { id: '2', date: '2026-03-02', week: 15, weight: 65.2, abdominalCircumference: 82 },
    { id: '3', date: '2026-02-02', week: 11, weight: 63.5, abdominalCircumference: 78 },
    { id: '4', date: '2026-01-05', week: 7, weight: 62.5, abdominalCircumference: 75 },
  ]);

  const current = history[0];
  const totalGain = current.weight - pregnancyData.prePregnancyWeight;

  const getStatus = () => {
    if (totalGain > 8) return { label: 'Ganho Excessivo', color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertCircle };
    if (totalGain < 3) return { label: 'Ganho Insuficiente', color: 'text-amber-500', bg: 'bg-amber-50', icon: Info };
    return { label: 'Adequado', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 };
  };

  const status = getStatus();

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0B2B24] mb-2">Antropometria Gestantes</h2>
          <p className="text-slate-500 font-medium">Monitoramento especializado da evolução gestacional.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('evolution')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <TrendingUp className="w-5 h-5" />
            Evolução
          </button>
          <button 
            onClick={() => setView('new_entry')}
            className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20"
          >
            <Plus className="w-5 h-5" />
            Nova Avaliação
          </button>
        </div>
      </div>

      {/* Gestational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
              <Baby className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Semanas</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idade Gestacional</p>
          <p className="text-2xl font-black text-[#0B2B24]">{current.week} Semanas</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">DPP: 22/08/2026</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Peso</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso Atual</p>
          <p className="text-2xl font-black text-[#0B2B24]">{current.weight} kg</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Pré: {pregnancyData.prePregnancyWeight} kg</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ganho</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ganho Total</p>
          <p className="text-2xl font-black text-[#0B2B24]">+{totalGain.toFixed(1)} kg</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Meta: {pregnancyData.recommendedGain.min}-{pregnancyData.recommendedGain.max} kg</p>
        </div>

        <div className={`p-6 rounded-[2rem] border border-slate-100 shadow-sm ${status.bg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center ${status.color}`}>
              <status.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Situação Atual</p>
          <p className={`text-2xl font-black ${status.color}`}>{status.label}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Baseado no IMC Pré</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pregnancy Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-[#0B2B24] mb-8 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" />
              Dados da Gestação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DUM (Última Menstruação)</p>
                  <p className="text-slate-900 font-bold">15/11/2025</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DPP (Provável do Parto)</p>
                  <p className="text-slate-900 font-bold">22/08/2026</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo de Gestação</p>
                  <p className="text-slate-900 font-bold">Única</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Pré-Gestacional</p>
                  <p className="text-slate-900 font-bold">{pregnancyData.prePregnancyWeight} kg</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IMC Pré-Gestacional</p>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 font-bold">{pregnancyData.prePregnancyBmi}</p>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase">Adequado</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ganho Recomendado</p>
                  <p className="text-slate-900 font-bold">{pregnancyData.recommendedGain.min} a {pregnancyData.recommendedGain.max} kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-[#0B2B24] mb-6">Histórico de Avaliações</h3>
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                      {entry.week}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0B2B24]">Semana {entry.week}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0B2B24]">{entry.weight} kg</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peso</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#0B2B24]">{entry.abdominalCircumference} cm</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Circ. Abd.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI & Alerts */}
        <div className="space-y-6">
          <div className="bg-[#0B2B24] p-8 rounded-[3rem] text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#22B391] rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-black text-lg">IA ONNutrition</h4>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22B391] shrink-0" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Evolução Positiva</p>
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Ganho de peso acumulado (+5.5kg) está perfeitamente alinhado com a curva recomendada para a 19ª semana.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex gap-3 mb-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Risco Gestacional</p>
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Atenção ao consumo de carboidratos simples. Risco moderado de Diabetes Gestacional devido ao histórico familiar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-lg font-black text-[#0B2B24] mb-6 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#22B391]" />
              Alertas Clínicos
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-xs font-bold text-rose-800">Acompanhar pressão arterial (Pré-eclâmpsia)</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-xs font-bold text-blue-800">Suplementação de Ácido Fólico em dia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewEntry = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => setView('dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black text-sm uppercase tracking-widest"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
        <div>
          <h3 className="text-2xl font-black text-[#0B2B24] mb-2">Nova Avaliação Gestacional</h3>
          <p className="text-slate-500 font-medium">Registre o progresso da gestante na consulta de hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Semana Gestacional</label>
              <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="00" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Peso Atual (kg)</label>
              <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="00.0" />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Circunferência Abdominal (cm)</label>
              <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="00" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observações Clínicas</label>
              <textarea className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold h-24 resize-none" placeholder="Ex: Edema em membros inferiores..." />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
          <button onClick={() => setView('dashboard')} className="px-8 py-4 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-600">Cancelar</button>
          <button className="px-10 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] shadow-lg shadow-[#22B391]/20">Salvar Avaliação</button>
        </div>
      </div>
    </div>
  );

  const renderEvolution = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-[#0B2B24] mb-8">Curva de Ganho de Peso</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...history].reverse()}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22B391" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22B391" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} label={{ value: 'Semanas', position: 'insideBottom', offset: -5 }} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} domain={['dataMin - 2', 'dataMax + 5']} label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <ReferenceLine y={pregnancyData.prePregnancyWeight + pregnancyData.recommendedGain.max} label="Limite Superior" stroke="#f43f5e" strokeDasharray="3 3" />
              <ReferenceLine y={pregnancyData.prePregnancyWeight + pregnancyData.recommendedGain.min} label="Limite Inferior" stroke="#3b82f6" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="weight" stroke="#22B391" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
          <Info className="w-5 h-5 text-blue-500" />
          <p className="text-xs font-medium text-slate-500">
            As linhas pontilhadas representam a faixa de ganho de peso recomendada pelo IOM (Institute of Medicine) com base no IMC pré-gestacional.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 rounded-[3rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'dashboard' && renderDashboard()}
          {view === 'new_entry' && renderNewEntry()}
          {view === 'evolution' && renderEvolution()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PregnancyAnthropometry;

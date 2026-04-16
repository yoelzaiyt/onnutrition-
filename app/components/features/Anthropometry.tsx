'use client';

import React, { useState } from 'react';
import { 
  Ruler, 
  Plus, 
  TrendingUp, 
  Camera, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Upload, 
  Scale, 
  Activity, 
  Zap, 
  Brain, 
  ShieldAlert,
  Calendar,
  Maximize2,
  Image as LucideImage,
  ArrowRight,
  Info
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
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface Measurement {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  waist: number;
  abdomen: number;
  hip: number;
  chest: number;
  arm: number;
  thigh: number;
  calf: number;
  rcq: number;
  skinfolds?: {
    triceps: number;
    subscapular: number;
    suprailiac: number;
    abdominal: number;
  };
}

interface PhotoEntry {
  id: string;
  date: string;
  front: string;
  side: string;
  back: string;
}

interface AnthropometryProps {
  patientId: string;
  onBack?: () => void;
}

const Anthropometry: React.FC<AnthropometryProps> = ({ patientId, onBack }) => {
  const [view, setView] = useState<'dashboard' | 'new_entry' | 'evolution' | 'photos' | 'goals'>('dashboard');
  const [selectedEntry, setSelectedEntry] = useState<Measurement | null>(null);

  // Mock Data
  const [history] = useState<Measurement[]>([
    {
      id: '1',
      date: '2026-03-15',
      weight: 78.5,
      height: 1.75,
      bmi: 25.6,
      bodyFat: 22.4,
      muscleMass: 35.2,
      waist: 88,
      abdomen: 92,
      hip: 102,
      chest: 100,
      arm: 34,
      thigh: 58,
      calf: 38,
      rcq: 0.86,
      skinfolds: { triceps: 12, subscapular: 15, suprailiac: 18, abdominal: 22 }
    },
    {
      id: '2',
      date: '2026-02-10',
      weight: 81.2,
      height: 1.75,
      bmi: 26.5,
      bodyFat: 24.1,
      muscleMass: 34.8,
      waist: 92,
      abdomen: 96,
      hip: 104,
      chest: 102,
      arm: 33,
      thigh: 57,
      calf: 37,
      rcq: 0.88
    },
    {
      id: '3',
      date: '2026-01-05',
      weight: 83.5,
      height: 1.75,
      bmi: 27.3,
      bodyFat: 25.8,
      muscleMass: 34.2,
      waist: 95,
      abdomen: 100,
      hip: 106,
      chest: 104,
      arm: 32,
      thigh: 56,
      calf: 36,
      rcq: 0.90
    }
  ]);

  const [photos] = useState<PhotoEntry[]>([
    {
      id: 'p1',
      date: '2026-03-15',
      front: 'https://picsum.photos/seed/front1/400/600',
      side: 'https://picsum.photos/seed/side1/400/600',
      back: 'https://picsum.photos/seed/back1/400/600',
    },
    {
      id: 'p2',
      date: '2026-01-05',
      front: 'https://picsum.photos/seed/front2/400/600',
      side: 'https://picsum.photos/seed/side2/400/600',
      back: 'https://picsum.photos/seed/back2/400/600',
    }
  ]);

  const current = history[0];
  const previous = history[1];

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Magreza', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Obesidade', color: 'text-rose-500', bg: 'bg-rose-50' };
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0B2B24] mb-2">Antropometria Geral</h2>
          <p className="text-slate-500 font-medium">Acompanhe a composição corporal e evolução física.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('photos')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <Camera className="w-5 h-5" />
            Fotos
          </button>
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

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Peso Atual', value: `${current.weight} kg`, trend: current.weight - previous.weight, icon: Scale, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'IMC', value: current.bmi, sub: getBMICategory(current.bmi).label, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Gordura Corporal', value: `${current.bodyFat}%`, trend: current.bodyFat - previous.bodyFat, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Massa Muscular', value: `${current.muscleMass} kg`, trend: current.muscleMass - previous.muscleMass, icon: Maximize2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend !== undefined && (
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.trend <= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#0B2B24]">{stat.value}</p>
              {stat.sub && <span className={`text-[10px] font-black uppercase ${getBMICategory(current.bmi).color}`}>{stat.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Measurements Table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-[#0B2B24] flex items-center gap-2">
              <Ruler className="w-6 h-6 text-[#22B391]" />
              Medidas Corporais (cm)
            </h3>
            <span className="text-xs font-bold text-slate-400">Última: {current.date}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Cintura', value: current.waist, prev: previous.waist },
              { label: 'Abdômen', value: current.abdomen, prev: previous.abdomen },
              { label: 'Quadril', value: current.hip, prev: previous.hip },
              { label: 'Peito', value: current.chest, prev: previous.chest },
              { label: 'Braço', value: current.arm, prev: previous.arm },
              { label: 'Coxa', value: current.thigh, prev: previous.thigh },
              { label: 'Panturrilha', value: current.calf, prev: previous.calf },
              { label: 'RCQ', value: current.rcq, prev: previous.rcq, isRCQ: true },
            ].map((m, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-black text-[#0B2B24]">{m.value}</p>
                  <span className={`text-[10px] font-bold ${m.value < m.prev ? 'text-emerald-500' : m.value > m.prev ? 'text-rose-500' : 'text-slate-400'}`}>
                    {m.value - m.prev > 0 ? '+' : ''}{(m.value - m.prev).toFixed(m.isRCQ ? 2 : 1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights & Goals */}
        <div className="space-y-6">
          <div className="bg-[#0B2B24] p-8 rounded-[3rem] text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#22B391] rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-black text-lg">IA ONNutrition</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#22B391] shrink-0" />
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Redução de gordura eficiente detectada (-1.7% no último mês).
                </p>
              </div>
              <div className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <TrendingUp className="w-5 h-5 text-[#22B391] shrink-0" />
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Ganho de massa muscular consistente (+0.4 kg).
                </p>
              </div>
              <div className="flex gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs font-medium text-amber-200 leading-relaxed">
                  RCQ limítrofe (0.86). Atenção ao acúmulo de gordura abdominal.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-[#22B391]" />
              <h4 className="font-black text-lg text-[#0B2B24]">Metas</h4>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-black mb-2">
                  <span className="text-slate-400 uppercase tracking-widest">Peso Alvo: 72 kg</span>
                  <span className="text-[#22B391]">65%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#22B391]" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black mb-2">
                  <span className="text-slate-400 uppercase tracking-widest">Gordura: 18%</span>
                  <span className="text-[#22B391]">48%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#22B391]" style={{ width: '48%' }} />
                </div>
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
          <h3 className="text-2xl font-black text-[#0B2B24] mb-2">Nova Avaliação</h3>
          <p className="text-slate-500 font-medium">Insira as medidas coletadas hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Scale className="w-4 h-4" /> Dados Básicos
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Peso (kg)</label>
                <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="00.0" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Altura (m)</label>
                <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Circunferências (cm)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {['Cintura', 'Abdômen', 'Quadril', 'Peito', 'Braço', 'Coxa'].map(label => (
                <div key={label}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
                  <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="00" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" /> Dobras (mm)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {['Tríceps', 'Subescap.', 'Suprail.', 'Abdom.'].map(label => (
                <div key={label}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
                  <input type="number" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="00" />
                </div>
              ))}
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

  const renderPhotos = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20">
          <Upload className="w-5 h-5" />
          Upload de Fotos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {photos.map((entry, idx) => (
          <div key={entry.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#0B2B24]">{idx === 0 ? 'Atual' : 'Anterior'}</h3>
              <span className="text-xs font-bold text-slate-400">{entry.date}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="aspect-[2/3] bg-slate-100 rounded-2xl overflow-hidden relative group">
                  <img src={entry.front} alt="Frente" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest">Frente</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-[2/3] bg-slate-100 rounded-2xl overflow-hidden relative group">
                  <img src={entry.side} alt="Lado" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest">Lado</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-[2/3] bg-slate-100 rounded-2xl overflow-hidden relative group">
                  <img src={entry.back} alt="Costas" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest">Costas</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0B2B24] p-10 rounded-[3rem] text-center space-y-6">
        <h3 className="text-2xl font-black text-white">Comparação Antes e Depois</h3>
        <p className="text-slate-400 font-medium max-w-md mx-auto">Visualize sua evolução estética comparando as fotos de diferentes períodos.</p>
        <button className="px-10 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all">
          Iniciar Comparação
        </button>
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

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-[#0B2B24] mb-8">Evolução do Peso</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...history].reverse()}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-[#0B2B24] mb-8">Composição Corporal (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...history].reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="bodyFat" name="Gordura" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                <Line type="monotone" dataKey="muscleMass" name="Massa Muscular" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
          {view === 'photos' && renderPhotos()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Anthropometry;

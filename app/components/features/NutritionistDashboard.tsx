'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Utensils, 
  MessageSquare, 
  Plus, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Scale,
  Activity,
  Target,
  Zap,
  ChevronRight,
  Bell,
  FileText,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { patientService, Patient } from '@/app/lib/patientService';
import Image from 'next/image';

interface NutritionistDashboardProps {
  user: any;
  setView: (view: string) => void;
}

// ---------- Static Chart Data ----------
const weightData = [
  { name: 'Jan', weight: 85 },
  { name: 'Fev', weight: 83.5 },
  { name: 'Mar', weight: 82 },
  { name: 'Abr', weight: 81.2 },
  { name: 'Mai', weight: 80.5 },
  { name: 'Jun', weight: 79.8 },
];

const calorieData = [
  { name: 'Seg', target: 2000, actual: 1950 },
  { name: 'Ter', target: 2000, actual: 2100 },
  { name: 'Qua', target: 2000, actual: 1800 },
  { name: 'Qui', target: 2000, actual: 2050 },
  { name: 'Sex', target: 2000, actual: 1900 },
  { name: 'Sáb', target: 2000, actual: 2500 },
  { name: 'Dom', target: 2000, actual: 2200 },
];

const adherenceData = [
  { name: 'Seg', value: 85 },
  { name: 'Ter', value: 92 },
  { name: 'Qua', value: 78 },
  { name: 'Qui', value: 88 },
  { name: 'Sex', value: 95 },
  { name: 'Sáb', value: 65 },
  { name: 'Dom', value: 72 },
];

// ---------- Component ----------
export default function NutritionistDashboard({ user, setView }: NutritionistDashboardProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Em dia' | 'Atrasado'>('Todos');

  const nutriId = user?.id || 'demo-nutri-id';

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll(nutriId);
      setPatients(data);
    } catch (err) {
      console.error('Dashboard: Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }, [nutriId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const patientsWithStatus = patients.map(p => ({
    ...p,
    displayStatus: p.current_status === 'Em Consulta' ? 'Em dia' : 
                   p.current_status === 'Faltou' || p.current_status === 'Ausente' ? 'Atrasado' : 'Em dia',
    adherence: Math.floor(Math.random() * 40 + 60) + '%',
  }));

  const filteredPatients = patientsWithStatus.filter(p =>
    statusFilter === 'Todos' || p.displayStatus === statusFilter
  );

  const stats = [
    { title: 'Total Pacientes', value: patients.length.toString(), trend: '+2', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Ativos', value: patients.filter(p => p.status === 'Ativo').length.toString(), trend: 'Ativo', icon: Activity, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: '% Gordura (Ref)', value: '18.5%', trend: '-0.5%', icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Calorias Alvo (Ref)', value: '2150 kcal', trend: 'Meta', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Aderência Média', value: '88%', trend: '+5%', icon: CheckCircle2, color: 'text-[#22B391]', bgColor: 'bg-[#22B391]/10' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0B2B24]">Dashboard do Nutricionista</h1>
          <p className="text-[#0B2B24]/50 font-medium">Central de comando para acompanhamento profissional.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button 
            onClick={() => setView('patients')}
            className="flex items-center gap-2 bg-[#22B391] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20"
          >
            <Plus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Evolution */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[#0B2B24]">Evolução de Peso</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos 6 meses</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Calorie Evolution */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[#0B2B24]">Evolução Calórica</h3>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#22B391]" /> Meta</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Real</div>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="target" fill="#22B391" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Adherence Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#0B2B24]">Aderência Semanal (%)</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22B391]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média: 82%</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {adherenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value < 70 ? '#ef4444' : entry.value < 85 ? '#f59e0b' : '#22B391'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-black text-[#0B2B24]">Status dos Pacientes</h3>
              <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
                {(['Todos', 'Em dia', 'Atrasado'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === filter ? 'bg-white text-[#0B2B24] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-6 h-6 text-[#22B391] animate-spin" />
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aderência</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPatients.slice(0, 6).map((patient) => (
                      <StatusRow
                        key={patient.id}
                        name={patient.name}
                        status={patient.displayStatus}
                        adherence={patient.adherence}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-6 border-t border-slate-50">
              <button
                onClick={() => setView('patients')}
                className="w-full py-3 text-center text-xs font-black text-slate-400 hover:text-[#22B391] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Ver Todos os Pacientes <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Alerts */}
          <div className="bg-[#0B2B24] p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-[#0B2B24]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22B391] rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs">Alertas Críticos</h3>
            </div>
            <div className="space-y-3">
              <AlertItem title="Baixa Adesão" desc="Ana Costa não registra refeições há 3 dias." type="warning" />
              <AlertItem title="Consumo Errado" desc="João Oliveira excedeu macros de gordura em 40%." type="error" />
              <AlertItem title="Risco Metabólico" desc="Exames de Ricardo Santos mostram glicemia alterada." type="critical" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-black text-[#0B2B24]">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              <ActionButton icon={Edit3} label="Ajustar Dieta" color="text-blue-600" bgColor="bg-blue-50" onClick={() => setView('patients')} />
              <ActionButton icon={Zap} label="Recalcular Calorias" color="text-orange-600" bgColor="bg-orange-50" onClick={() => setView('patients')} />
              <ActionButton icon={RefreshCw} label="Atualizar Plano" color="text-emerald-600" bgColor="bg-emerald-50" onClick={() => setView('patients')} />
              <ActionButton icon={FileText} label="Gerar Relatório" color="text-purple-600" bgColor="bg-purple-50" onClick={() => setView('patients')} />
            </div>
          </div>

          {/* Today Appointments */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#0B2B24]">Agenda de Hoje</h3>
              <Calendar className="w-5 h-5 text-slate-300" />
            </div>
            <div className="space-y-3">
              <AppointmentItem name="Maria Silva" time="09:00" type="Retorno" />
              <AppointmentItem name="João Oliveira" time="10:30" type="Primeira Consulta" />
              <AppointmentItem name="Ana Costa" time="14:00" type="Avaliação" />
            </div>
            <button
              onClick={() => setView('calendar')}
              className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              Ver Agenda Completa <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------
function StatCard({ title, value, trend, icon: Icon, color, bgColor }: any) {
  const isNegative = typeof trend === 'string' && trend.startsWith('-');
  return (
    <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 ${bgColor} ${color} rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-black text-[#0B2B24]">{value}</h4>
        <span className={`text-[10px] font-bold ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>{trend}</span>
      </div>
    </div>
  );
}

function StatusRow({ name, status, adherence }: { name: string; status: string; adherence: string }) {
  const isLate = status === 'Atrasado';
  return (
    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm">
            {name.charAt(0)}
          </div>
          <span className="text-sm font-bold text-[#0B2B24] group-hover:text-[#22B391] transition-colors">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isLate ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
            <div
              className={`h-full ${parseInt(adherence) > 80 ? 'bg-emerald-500' : parseInt(adherence) > 60 ? 'bg-orange-500' : 'bg-red-500'}`}
              style={{ width: adherence }}
            />
          </div>
          <span className="text-xs font-bold text-[#0B2B24]">{adherence}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-300 hover:text-[#22B391]">
          <ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function AlertItem({ title, desc, type }: { title: string; desc: string; type: 'warning' | 'error' | 'critical' }) {
  const colors = { warning: 'text-orange-400', error: 'text-red-400', critical: 'text-purple-400' };
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
      <h4 className={`text-xs font-bold uppercase tracking-wider ${colors[type]}`}>{title}</h4>
      <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, bgColor, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-[#22B391]/30 hover:shadow-md transition-all group w-full text-left"
    >
      <div className={`${bgColor} ${color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-bold text-slate-500 group-hover:text-[#0B2B24]">{label}</span>
    </button>
  );
}

function AppointmentItem({ name, time, type }: { name: string; time: string; type: string }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
      <div className="w-12 h-12 bg-[#22B391]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-black text-[#22B391]">{time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-[#0B2B24] truncate">{name}</h4>
        <p className="text-xs text-slate-400">{type}</p>
      </div>
    </div>
  );
}

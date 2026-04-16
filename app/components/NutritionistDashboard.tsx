'use client';

import React, { useState, useEffect } from 'react';
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
  Shield,
  Scale,
  Activity,
  Target,
  Zap,
  ChevronRight,
  Bell,
  Send,
  FileText,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebase } from './FirebaseProvider';
import { useSupabase } from './SupabaseProvider';
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
  PieChart,
  Pie
} from 'recharts';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import Image from 'next/image';

interface NutritionistDashboardProps {
  user: any;
  setView: (view: string) => void;
}

const weightData = [
  { name: 'Jan', weight: 85 },
  { name: 'Feb', weight: 83.5 },
  { name: 'Mar', weight: 82 },
  { name: 'Apr', weight: 81.2 },
  { name: 'May', weight: 80.5 },
  { name: 'Jun', weight: 79.8 },
];

const calorieData = [
  { name: 'Seg', target: 2000, actual: 1950 },
  { name: 'Ter', target: 2000, actual: 2100 },
  { name: 'Qua', target: 2000, actual: 1800 },
  { name: 'Qui', target: 2000, actual: 2050 },
  { name: 'Sex', target: 2000, actual: 1900 },
  { name: 'Sab', target: 2000, actual: 2500 },
  { name: 'Dom', target: 2000, actual: 2200 },
];

const macroData = [
  { name: 'Proteína', value: 30, color: '#4F46E5' },
  { name: 'Carboidrato', value: 45, color: '#27B494' },
  { name: 'Gordura', value: 25, color: '#F59E0B' },
];

export default function NutritionistDashboard({ user, setView }: NutritionistDashboardProps) {
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Em dia' | 'Atrasado'>('Todos');

  const { logout: firebaseLogout, user: firebaseUser, syncStatus, syncError } = useFirebase();
  const { logout: supabaseLogout, user: supabaseUser } = useSupabase();

  const logout = async () => {
    console.log('NutritionistDashboard: Logging out...');
    if (supabaseUser) {
      await supabaseLogout();
    }
    if (firebaseUser) {
      await firebaseLogout();
    }
    window.location.reload();
  };

  // Dados de exemplo para o protótipo que incluem os status solicitados
  const mockPatientsData = [
    { id: '1', name: "Maria Silva", status: "Em dia", color: "text-green-600", bgColor: "bg-green-50", adherence: "95%" },
    { id: '2', name: "João Oliveira", status: "Em dia", color: "text-green-600", bgColor: "bg-green-50", adherence: "82%" },
    { id: '3', name: "Ana Costa", status: "Atrasado", color: "text-red-600", bgColor: "bg-red-50", adherence: "45%" },
    { id: '4', name: "Ricardo Santos", status: "Em dia", color: "text-green-600", bgColor: "bg-green-50", adherence: "88%" },
    { id: '5', name: "Lucas Ferreira", status: "Atrasado", color: "text-red-600", bgColor: "bg-red-50", adherence: "30%" },
  ];

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'patients'), orderBy('updatedAt', 'desc'), limit(5));
    const timeoutId = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          console.warn('NutritionistDashboard: Firestore onSnapshot timed out');
          return false;
        }
        return currentLoading;
      });
    }, 1000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeoutId);
      const patients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentPatients(patients);
      setLoading(false);
    }, (error) => {
      console.error('NutritionistDashboard: Error fetching patients:', error);
      // Trigger global error event for FirebaseProvider to catch
      window.dispatchEvent(new CustomEvent('firestore-error', { 
        detail: { error: error.message, operation: 'list', path: 'patients' } 
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtra os dados com base no status selecionado
  const displayPatients = recentPatients.length > 0 ? recentPatients : mockPatientsData;
  const filteredPatients = displayPatients.filter(p => 
    statusFilter === 'Todos' || p.status === statusFilter
  );

  const adherenceData = [
    { name: 'Seg', value: 85 },
    { name: 'Ter', value: 92 },
    { name: 'Qua', value: 78 },
    { name: 'Qui', value: 88 },
    { name: 'Sex', value: 95 },
    { name: 'Sab', value: 65 },
    { name: 'Dom', value: 72 },
  ];

  return (
    <div className="space-y-8 pb-12 relative">
      {typeof window !== 'undefined' && localStorage.getItem('onnutrition_emergency_bypass') === 'true' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => {
              localStorage.removeItem('onnutrition_emergency_bypass');
              localStorage.removeItem('onnutrition_force_admin');
              window.location.reload();
            }}
            className="bg-yellow-400 text-black text-[10px] px-3 py-1 rounded-full font-bold hover:bg-yellow-500 transition-all shadow-lg"
          >
            Sair do Modo de Segurança
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0B2B24]">Dashboard do Nutricionista</h1>
          <p className="text-[#0B2B24]/50 font-medium">Central de comando para acompanhamento profissional e tomada de decisão.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2.5 rounded-xl text-sm font-black hover:bg-red-500/20 transition-all active:scale-95"
          >
            Sair
          </button>
          <button className="p-3 bg-white border border-[#0B2B24]/10 rounded-2xl text-[#0B2B24]/60 hover:bg-gray-50 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => setView('patient_profile')}
            className="flex items-center gap-2 bg-[#22B391] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20"
          >
            <Plus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Peso Atual" value="82.4 kg" trend="-1.2%" icon={Scale} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard title="IMC" value="24.8" trend="Normal" icon={Activity} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard title="% Gordura" value="18.5%" trend="-0.5%" icon={Zap} color="text-orange-600" bgColor="bg-orange-50" />
        <StatCard title="Calorias Alvo" value="2150 kcal" trend="Meta" icon={Target} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard title="Aderência" value="88%" trend="+5%" icon={CheckCircle2} color="text-[#22B391]" bgColor="bg-[#22B391]/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Evolution */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#0B2B24]/10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[#0B2B24]">Evolução de Peso</h3>
                <select className="text-[10px] font-black text-[#0B2B24]/40 bg-transparent outline-none uppercase tracking-widest">
                  <option>Últimos 6 meses</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Calorie Evolution */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#0B2B24]/10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[#0B2B24]">Evolução Calórica</h3>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#22B391]" /> Meta</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Real</div>
                </div>
              </div>
              <div className="h-64">
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
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#0B2B24]/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#0B2B24]">Aderência Semanal (%)</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22B391]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média: 82%</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="value" fill="#22B391" radius={[8, 8, 0, 0]}>
                    {adherenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value < 70 ? '#ef4444' : entry.value < 85 ? '#f59e0b' : '#22B391'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Status Table */}
          <div className="bg-white rounded-[2.5rem] border border-[#0B2B24]/10 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-[#0B2B24]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-black text-[#0B2B24]">Status dos Pacientes</h3>
              
              <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
                {(['Todos', 'Em dia', 'Atrasado'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === filter
                        ? 'bg-white text-[#0B2B24] shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-[#0B2B24]/40 uppercase tracking-widest">Paciente</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#0B2B24]/40 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#0B2B24]/40 uppercase tracking-widest">Aderência</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#0B2B24]/40 uppercase tracking-widest">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B2B24]/5">
                  {filteredPatients.map((patient) => (
                    <StatusRow 
                      key={patient.id}
                      name={patient.name || 'Sem Nome'} 
                      status={patient.status || 'Em dia'} 
                      color={patient.color || (patient.status === 'Atrasado' ? 'text-red-600' : 'text-green-600')} 
                      bgColor={patient.bgColor || (patient.status === 'Atrasado' ? 'bg-red-50' : 'bg-green-50')} 
                      adherence={patient.adherence || '0%'} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Alerts Section */}
          <div className="bg-[#0B2B24] p-10 rounded-[3rem] text-white space-y-8 shadow-2xl shadow-[#0B2B24]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22B391] rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs">Alertas Críticos</h3>
            </div>
            <div className="space-y-4">
              <AlertItem 
                title="Baixa Adesão" 
                desc="Ana Costa não registra refeições há 3 dias." 
                type="warning"
              />
              <AlertItem 
                title="Consumo Errado" 
                desc="João Oliveira excedeu macros de gordura em 40%." 
                type="error"
              />
              <AlertItem 
                title="Risco Metabólico" 
                desc="Exames de Ricardo Santos mostram glicemia alterada." 
                type="critical"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#0B2B24]/10 shadow-sm space-y-6">
            <h3 className="font-black text-[#0B2B24]">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              <ActionButton icon={Edit3} label="Ajustar Dieta" color="text-blue-600" bgColor="bg-blue-50" />
              <ActionButton icon={Zap} label="Recalcular Calorias" color="text-orange-600" bgColor="bg-orange-50" />
              <ActionButton icon={RefreshCw} label="Atualizar Plano" color="text-emerald-600" bgColor="bg-emerald-50" />
              <ActionButton icon={FileText} label="Gerar Relatório" color="text-purple-600" bgColor="bg-purple-50" />
            </div>
          </div>

          {/* Chat Preview */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#0B2B24]/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#0B2B24]">Interações Recentes</h3>
              <MessageSquare className="w-5 h-5 text-[#0B2B24]/20" />
            </div>
            <div className="space-y-4">
              <ChatItem name="Maria Silva" msg="Dra, posso trocar o arroz por batata?" time="10:30" />
              <ChatItem name="João Oliveira" msg="Esqueci de registrar o almoço..." time="Ontem" />
            </div>
            <button className="w-full py-4 bg-slate-50 text-[#0B2B24]/60 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              Ver Todas Mensagens
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#0B2B24]/10 shadow-sm">
      <div className={`w-10 h-10 ${bgColor} ${color} rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-[#0B2B24]/40 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-bold text-[#0B2B24]">{value}</h4>
        <span className={`text-[10px] font-bold ${trend.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>{trend}</span>
      </div>
    </div>
  );
}

function StatusRow({ name, status, color, bgColor, adherence }: any) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
            <Image src={`https://picsum.photos/seed/${name}/100/100`} alt={name} width={32} height={32} referrerPolicy="no-referrer" />
          </div>
          <span className="text-sm font-bold text-[#0B2B24] group-hover:text-[#27B494] transition-colors">{name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${bgColor} ${color}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
            <div className={`h-full ${parseInt(adherence) > 80 ? 'bg-emerald-500' : parseInt(adherence) > 60 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: adherence }} />
          </div>
          <span className="text-xs font-bold text-[#0B2B24]">{adherence}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button className="p-2 hover:bg-white rounded-xl transition-all text-[#0B2B24]/20 hover:text-[#27B494]">
          <ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function AlertItem({ title, desc, type }: any) {
  const colors = {
    warning: 'text-orange-400',
    error: 'text-red-400',
    critical: 'text-purple-400'
  };
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
      <h4 className={`text-xs font-bold uppercase tracking-wider ${colors[type as keyof typeof colors]}`}>{title}</h4>
      <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, bgColor }: any) {
  return (
    <button className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#0B2B24]/5 hover:border-[#27B494]/30 hover:shadow-md transition-all group w-full text-left">
      <div className={`${bgColor} ${color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-bold text-[#0B2B24]/70 group-hover:text-[#0B2B24]">{label}</span>
    </button>
  );
}

function ChatItem({ name, msg, time }: any) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
        <Image src={`https://picsum.photos/seed/${name}/100/100`} alt={name} width={40} height={40} referrerPolicy="no-referrer" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-bold text-[#0B2B24] truncate">{name}</h4>
          <span className="text-[10px] text-[#0B2B24]/30">{time}</span>
        </div>
        <p className="text-xs text-[#0B2B24]/50 truncate">{msg}</p>
      </div>
    </div>
  );
}

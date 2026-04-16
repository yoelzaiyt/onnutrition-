'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Zap, Calendar, Users, ClipboardList, AlertCircle, ChevronRight, Search, UserPlus, ListTodo, FolderOpen, FileText, Video, Activity, Utensils } from 'lucide-react';
import PatientManagement from './PatientManagement';
import PatientFlowManager from './PatientFlowManager';
import { seedFullDatabase } from '@/app/lib/mockDataPopulator';
import { toast } from 'react-hot-toast';

interface DashboardProps {
  user: any;
  userRole: string | null;
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, userRole, onNavigate }) => {
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    alerts: 0
  });
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isSupabaseConfigured || !user) {
        // Demo Data
        setStats({ patients: 42, appointments: 12, alerts: 3 });
        setNextAppointment({
          patient_name: 'Maria Oliveira',
          time: '14:30',
          date: new Date().toISOString().split('T')[0]
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch Patient Count
        const { count: patientCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('nutri_id', user.id);

        // Fetch Today's Appointments
        const today = new Date().toISOString().split('T')[0];
        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('nutri_id', user.id)
          .eq('date', today);

        // Fetch Next Appointment
        const { data: nextApp } = await supabase
          .from('appointments')
          .select('*')
          .eq('nutri_id', user.id)
          .gte('date', today)
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .limit(1)
          .single();

        setStats({
          patients: patientCount || 0,
          appointments: appointmentCount || 0,
          alerts: 0 // Placeholder for now
        });
        setNextAppointment(nextApp);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#22B391] rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistema Ativo</span>
        </div>
        <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Consultório</h1>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B2B24] via-[#1C9A7D] to-[#22B391] p-4 rounded-2xl text-center shadow-lg">
        <p className="text-white font-black text-sm uppercase tracking-widest">
          ASSINE AQUI O ONNUTRITION e tenha todos os recursos disponíveis agora mesmo!
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-[#E9F7F4] text-[#22B391] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total de Pacientes</span>
          </div>
          <p className="text-3xl font-black text-[#0B2B24] tracking-tighter">{stats.patients}</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#22B391]">
            <ChevronRight className="w-3 h-3 rotate-[-90deg]" />
            <span>+12% este mês</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-[#EEF2FF] text-[#4F46E5] rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pacientes Ativos</span>
          </div>
          <p className="text-3xl font-black text-[#0B2B24] tracking-tighter">38</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#4F46E5]">
            <span>90% de engajamento</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-[#FFF7ED] text-[#F97316] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Evolução Semanal</span>
          </div>
          <p className="text-3xl font-black text-[#0B2B24] tracking-tighter">+8.4%</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#F97316]">
            <span>Média de perda de peso</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Alerts Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <h3 className="text-xl font-black text-[#0B2B24] tracking-tight">Alertas Inteligentes</h3>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">IA Engine v2.5</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-rose-900">Paciente Maria Oliveira está 3 dias sem registrar refeições</p>
                  <p className="text-xs text-rose-700 mt-1">Sugerimos enviar um lembrete via WhatsApp para manter o engajamento.</p>
                  <button className="mt-3 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline">Enviar Lembrete</button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-amber-900">João Silva excedeu a meta de sódio em 40% ontem</p>
                  <p className="text-xs text-amber-700 mt-1">A IA detectou consumo excessivo de embutidos. Ajustar plano?</p>
                  <button className="mt-3 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">Ajustar Plano</button>
                </div>
              </div>
            </div>
          </div>

          {/* Últimos Pacientes Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-[#0B2B24] tracking-tight">Últimos pacientes</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Total cadastrados: {stats.patients}</p>
              </div>
              <div className="flex gap-4 text-[10px] font-black text-[#22B391] uppercase tracking-widest">
                <button 
                  onClick={async () => {
                    if (!user?.id) return;
                    setIsSeeding(true);
                    const success = await seedFullDatabase(user.id);
                    setIsSeeding(false);
                    if (success) {
                      toast?.success('Dados de teste gerados com sucesso!');
                      window.location.reload(); // Reload to refresh all data
                    } else {
                      toast?.error('Erro ao gerar dados de teste.');
                    }
                  }}
                  disabled={isSeeding}
                  className="hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Zap className={`w-3 h-3 ${isSeeding ? 'animate-spin' : ''}`} />
                  {isSeeding ? 'Gerando...' : 'Gerar dados de teste'}
                </button>
                <span className="text-slate-200">|</span>
                <button className="hover:underline">Ver todos</button>
                <span className="text-slate-200">|</span>
                <button className="hover:underline">Aniversariantes</button>
              </div>
            </div>

            <button 
              onClick={() => onNavigate?.('patients')}
              className="w-full py-5 bg-[#22B391] text-white rounded-2xl font-black text-lg hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20 flex items-center justify-center gap-3 mb-6"
            >
              <UserPlus className="w-6 h-6" />
              Adicionar novo paciente
            </button>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                placeholder="Busque pelo nome ou pela tag do paciente"
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Acesso Rápido Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-[#0B2B24] mb-2 tracking-tight">Acesso rápido</h3>
            <p className="text-xs font-bold text-slate-400 mb-8">Atalhos para áreas do sistema</p>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Pacientes', icon: Users, color: 'bg-[#22B391]', shadow: 'shadow-[#22B391]/20', view: 'patients' },
                { label: 'Anamnese Geral', icon: ClipboardList, color: 'bg-[#22B391]', shadow: 'shadow-[#22B391]/20', view: 'anamnesis' },
                { label: 'Planos Alimentares', icon: Utensils, color: 'bg-[#22B391]', shadow: 'shadow-[#22B391]/20', view: 'diary' },
                { label: 'Agenda', icon: Calendar, color: 'bg-[#22B391]', shadow: 'shadow-[#22B391]/20', view: 'calendar' },
                { label: 'Relatórios', icon: Activity, color: 'bg-[#22B391]', shadow: 'shadow-[#22B391]/20', view: 'medical' }
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => onNavigate?.(item.view)}
                  className={`${item.color} p-5 rounded-3xl text-white flex items-center gap-4 hover:opacity-90 transition-all shadow-lg ${item.shadow} group`}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Next Appointment Card */}
          <div className="bg-[#0B2B24] p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-[#0B2B24]/20">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Zap className="w-16 h-16 text-[#22B391]" />
            </div>
            <h4 className="text-lg font-black mb-6 tracking-tight">Próxima Consulta</h4>
            {nextAppointment ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#22B391]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm">{nextAppointment.patient_name}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      {nextAppointment.date === new Date().toISOString().split('T')[0] ? 'Hoje' : nextAppointment.date} • {nextAppointment.time.substring(0, 5)}
                    </p>
                  </div>
                </div>
                <button className="w-full py-4 bg-[#22B391] text-white rounded-xl font-black text-xs hover:bg-[#1C9A7D] transition-all flex items-center justify-center gap-2">
                  Iniciar Teleconsulta
                  <Video className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-white/40 font-bold italic text-center py-4 text-sm">Nenhuma consulta agendada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

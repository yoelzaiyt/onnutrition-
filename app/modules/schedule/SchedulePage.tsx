'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronRight, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  MapPin,
  User
} from 'lucide-react';
import { Appointment, AppointmentStatus } from './schedule.types';
import { scheduleService } from './schedule.service';

interface SchedulePageProps {
  userId: string;
  userRole: 'patient' | 'nutri';
  onBack: () => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ userId, userRole, onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await scheduleService.getAppointments(userId, userRole);
        if (data.length > 0) {
          setAppointments(data);
        } else {
          // Demo appointments
          const demoAppointments: Appointment[] = [
            {
              id: 'a1',
              patient_id: 'p1',
              nutritionist_id: 'n1',
              patient_name: 'João Silva',
              date: new Date().toISOString().split('T')[0],
              time: '14:30',
              status: 'scheduled',
              type: 'follow-up',
              notes: 'Avaliação de resultados do primeiro mês.'
            },
            {
              id: 'a2',
              patient_id: 'p2',
              nutritionist_id: 'n1',
              patient_name: 'Maria Oliveira',
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              time: '10:00',
              status: 'scheduled',
              type: 'initial',
              notes: 'Primeira consulta, foco em emagrecimento.'
            },
            {
              id: 'a3',
              patient_id: 'p1',
              nutritionist_id: 'n1',
              patient_name: 'João Silva',
              date: new Date(Date.now() - 2592000000).toISOString().split('T')[0],
              time: '15:00',
              status: 'completed',
              type: 'initial'
            }
          ];
          setAppointments(demoAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [userId, userRole]);

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status !== 'scheduled');

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'text-blue-500 bg-blue-50';
      case 'completed': return 'text-emerald-500 bg-emerald-50';
      case 'cancelled': return 'text-rose-500 bg-rose-50';
      case 'no-show': return 'text-amber-500 bg-amber-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'no-show': return 'Não Compareceu';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
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
            <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Agenda de Consultas</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gerencie seus horários</p>
          </div>
        </div>
        <button className="bg-[#22B391] text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#22B391]/20 hover:scale-105 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agendar Consulta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === 'upcoming' 
                  ? 'bg-[#0B2B24] text-white shadow-lg shadow-[#0B2B24]/20' 
                  : 'text-slate-400 hover:text-[#22B391] hover:bg-slate-50'
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === 'history' 
                  ? 'bg-[#0B2B24] text-white shadow-lg shadow-[#0B2B24]/20' 
                  : 'text-slate-400 hover:text-[#22B391] hover:bg-slate-50'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* Appointment List */}
          <div className="space-y-4">
            {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map((appointment) => (
              <motion.div 
                key={appointment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:border-[#22B391]/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-[#22B391]/5 group-hover:border-[#22B391]/20 transition-all">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-black text-[#0B2B24]">
                        {new Date(appointment.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-[#0B2B24]">{appointment.patient_name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" />
                          Teleconsulta
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] uppercase tracking-widest">
                          {appointment.type === 'initial' ? 'Primeira Vez' : 'Retorno'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {appointment.status === 'scheduled' && (
                      <>
                        <button className="px-6 py-3 bg-[#22B391] text-white rounded-xl font-black text-xs hover:scale-105 transition-all shadow-lg shadow-[#22B391]/20">
                          Entrar na Sala
                        </button>
                        <button className="p-3 text-slate-400 hover:text-rose-500 transition-all">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button className="p-3 text-slate-400 hover:text-[#0B2B24] transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="mt-6 pt-6 border-t border-slate-50 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    <p className="text-xs text-slate-500 font-medium italic">&ldquo;{appointment.notes}&rdquo;</p>
                  </div>
                )}
              </motion.div>
            ))}

            {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <CalendarIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-[#0B2B24] mb-2">Nenhum agendamento</h3>
                <p className="text-slate-400 text-sm font-bold">Você não possui consultas {activeTab === 'upcoming' ? 'futuras' : 'no histórico'}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-[#0B2B24] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#0B2B24]/40 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <CalendarIcon className="w-40 h-40" />
            </div>
            <h4 className="text-lg font-black mb-8 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#22B391]" />
              Resumo Mensal
            </h4>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Consultas</p>
                <p className="text-xl font-black">24</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Concluídas</p>
                <p className="text-xl font-black text-[#22B391]">18</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Canceladas</p>
                <p className="text-xl font-black text-rose-400">2</p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs hover:bg-white/20 transition-all border border-white/10">
                  Ver Relatório Completo
                </button>
              </div>
            </div>
          </div>

          {/* Tips/Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40">
            <h4 className="text-lg font-black text-[#0B2B24] mb-6">Informações Úteis</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2B24] mb-1">Teleconsultas</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">O link da sala é liberado 15 minutos antes do horário marcado.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2B24] mb-1">Cancelamentos</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Devem ser feitos com no mínimo 24h de antecedência.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;

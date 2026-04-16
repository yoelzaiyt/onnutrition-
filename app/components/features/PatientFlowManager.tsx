'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  LogIn, 
  LogOut, 
  Search,
  UserPlus,
  MoreVertical,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientFlowManagerProps {
  nutriId: string;
  onSelectPatient?: (id: string) => void;
  onBack?: () => void;
}

interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  time: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
}

const PatientFlowManager: React.FC<PatientFlowManagerProps> = ({ nutriId, onSelectPatient, onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTodayAppointments = React.useCallback(async () => {
    if (!isSupabaseConfigured) {
      // Demo Data
      setAppointments([
        { id: '1', patient_id: 'p1', patient_name: 'Maria Oliveira', time: '09:00', status: 'Concluído', check_in_time: '2026-03-21T08:55:00Z', check_out_time: '2026-03-21T09:45:00Z' },
        { id: '2', patient_id: 'p2', patient_name: 'João Silva', time: '10:30', status: 'Em Consulta', check_in_time: '2026-03-21T10:25:00Z' },
        { id: '3', patient_id: 'p3', patient_name: 'Ana Costa', time: '14:00', status: 'Aguardando', check_in_time: '2026-03-21T13:50:00Z' },
        { id: '4', patient_id: 'p4', patient_name: 'Carlos Pereira', time: '15:30', status: 'Agendado' },
        { id: '5', patient_id: 'p5', patient_name: 'Lucia Santos', time: '17:00', status: 'Agendado' },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('nutri_id', nutriId)
        .eq('date', today)
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [nutriId]);

  useEffect(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);

  const handleCheckIn = async (appointmentId: string) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status: 'Aguardando', 
            check_in_time: now 
          })
          .eq('id', appointmentId);
        if (error) throw error;
      } catch (err) {
        console.error('Error checking in:', err);
        return;
      }
    }

    setAppointments(prev => prev.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'Aguardando', check_in_time: now } 
        : app
    ));
  };

  const handleStartConsultation = async (appointmentId: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'Em Consulta' })
          .eq('id', appointmentId);
        if (error) throw error;
      } catch (err) {
        console.error('Error starting consultation:', err);
        return;
      }
    }

    setAppointments(prev => prev.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'Em Consulta' } 
        : app
    ));
  };

  const handleCheckOut = async (appointmentId: string) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status: 'Concluído', 
            check_out_time: now 
          })
          .eq('id', appointmentId);
        if (error) throw error;
      } catch (err) {
        console.error('Error checking out:', err);
        return;
      }
    }

    setAppointments(prev => prev.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'Concluído', check_out_time: now } 
        : app
    ));
  };

  const filteredAppointments = appointments.filter(app => 
    app.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': return 'bg-slate-100 text-slate-500';
      case 'Aguardando': return 'bg-amber-100 text-amber-600';
      case 'Em Consulta': return 'bg-blue-100 text-blue-600';
      case 'Concluído': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Hoje', value: appointments.length, icon: Calendar, color: 'text-blue-500' },
          { label: 'Aguardando', value: appointments.filter(a => a.status === 'Aguardando').length, icon: Clock, color: 'text-amber-500' },
          { label: 'Em Atendimento', value: appointments.filter(a => a.status === 'Em Consulta').length, icon: Users, color: 'text-emerald-500' },
          { label: 'Concluídos', value: appointments.filter(a => a.status === 'Concluído').length, icon: CheckCircle2, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-0.5 truncate md:whitespace-normal">
                {stat.label}
              </span>
              <span className="text-xl md:text-2xl font-black text-[#0B2B24] leading-none">
                {stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente pelo nome..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20">
            <UserPlus className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Paciente</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Horário</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.map((app) => (
                  <motion.tr 
                    key={app.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black">
                          {app.patient_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button 
                            onClick={() => onSelectPatient?.(app.patient_id)}
                            className="font-black text-[#0B2B24] leading-tight hover:text-[#22B391] transition-colors text-left block"
                          >
                            {app.patient_name}
                          </button>
                          {app.check_in_time && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter leading-none mt-0.5">
                              Chegou às {new Date(app.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Clock className="w-4 h-4 text-slate-300" />
                        {app.time.substring(0, 5)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'Agendado' && (
                          <button 
                            onClick={() => handleCheckIn(app.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-black text-xs hover:bg-amber-100 transition-all leading-none"
                          >
                            <LogIn className="w-4 h-4" />
                            Check-in
                          </button>
                        )}
                        {app.status === 'Aguardando' && (
                          <button 
                            onClick={() => handleStartConsultation(app.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-100 transition-all leading-none"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Atender
                          </button>
                        )}
                        {app.status === 'Em Consulta' && (
                          <button 
                            onClick={() => handleCheckOut(app.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all leading-none"
                          >
                            <LogOut className="w-4 h-4" />
                            Finalizar
                          </button>
                        )}
                        {app.status === 'Concluído' && (
                          <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            Finalizado
                          </div>
                        )}
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                <Search className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold">Nenhum paciente encontrado para hoje.</p>
            </div>
          )}
        </div>
      </div>
      {onBack && (
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 px-8 py-4 text-slate-400 hover:text-[#22B391] hover:bg-[#22B391]/5 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Painel
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientFlowManager;

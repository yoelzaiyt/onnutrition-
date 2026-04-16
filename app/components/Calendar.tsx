'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Video, 
  MapPin, 
  User, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Phone,
  ArrowRight,
  Settings,
  Bell,
  Check,
  X,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Brain,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  duration: number;
  type: 'presencial' | 'online' | 'retorno';
  status: 'confirmado' | 'pendente' | 'cancelado' | 'realizado' | 'falta';
  value: number;
  paid: boolean;
  link?: string;
}

const Calendar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  // Mock Data
  const appointments: Appointment[] = [
    { id: '1', patientName: 'Maria Oliveira', patientId: 'p1', time: '08:00', duration: 60, type: 'presencial', status: 'confirmado', value: 250, paid: true },
    { id: '2', patientName: 'João Silva', patientId: 'p2', time: '09:30', duration: 30, type: 'retorno', status: 'realizado', value: 0, paid: true },
    { id: '3', patientName: 'Ana Costa', patientId: 'p3', time: '11:00', duration: 60, type: 'online', status: 'pendente', value: 200, paid: false, link: 'https://meet.google.com/abc-defg-hij' },
    { id: '4', patientName: 'Pedro Santos', patientId: 'p4', time: '14:00', duration: 60, type: 'presencial', status: 'falta', value: 250, paid: false },
    { id: '5', patientName: 'Carla Lima', patientId: 'p5', time: '15:30', duration: 60, type: 'online', status: 'confirmado', value: 200, paid: true, link: 'https://meet.google.com/xyz-uvwx-yz' },
  ];

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pendente': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelado': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'realizado': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'falta': return 'bg-slate-50 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const renderDayView = () => (
    <div className="space-y-4">
      {appointments.map((app) => (
        <motion.div 
          key={app.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xl font-black text-[#0B2B24]">{app.time}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.duration} min</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-black text-[#0B2B24]">{app.patientName}</h4>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-1 text-xs font-bold">
                  {app.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  <span className="capitalize">{app.type}</span>
                </div>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1 text-xs font-bold">
                  <User className="w-3 h-3" />
                  <span>Nutricionista Responsável</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {app.type === 'online' && app.status === 'confirmado' && (
              <button className="flex items-center gap-2 px-6 py-3 bg-[#0B2B24] text-white rounded-2xl font-black text-xs hover:bg-[#1a3d34] transition-all">
                <Video className="w-4 h-4" />
                Entrar na Consulta
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[#22B391] transition-all">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-blue-500 transition-all">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-[#0B2B24] transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <button className="ml-4 p-3 bg-[#22B391]/10 text-[#22B391] rounded-xl hover:bg-[#22B391] hover:text-white transition-all group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0B2B24] mb-2">Agenda & Consultas</h2>
          <p className="text-slate-500 font-medium">Gerencie seus horários e atendimentos de forma inteligente.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowNewAppointment(true)}
            className="flex items-center gap-2 px-8 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20"
          >
            <Plus className="w-5 h-5" />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Hoje', value: '12', sub: 'Consultas', icon: CalendarIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Confirmadas', value: '8', sub: 'Pacientes', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Realizadas', value: '4', sub: 'Atendimentos', icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Faltas', value: '1', sub: 'No-show', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Stats</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-[#0B2B24]">{stat.value}</p>
              <span className="text-xs font-bold text-slate-400">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'day' ? 'bg-white text-[#22B391] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white text-[#22B391] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white text-[#22B391] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mês
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-[#22B391] transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-black text-[#0B2B24] min-w-[150px] text-center">30 de Março, 2026</h3>
            <button className="p-2 text-slate-400 hover:text-[#22B391] transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-sm w-64"
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Agenda Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {viewMode === 'day' && renderDayView()}
          {viewMode !== 'day' && (
            <div className="bg-white p-20 rounded-[4rem] text-center space-y-6 border border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200">
                <CalendarIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-[#0B2B24]">Módulo em Desenvolvimento</h3>
              <p className="text-slate-400 font-medium max-w-md mx-auto">
                As visualizações semanal e mensal estarão disponíveis em breve.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: Mini Calendar & Quick Alerts */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Mini Calendário</h4>
            {/* Simple Mini Calendar Placeholder */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={`${d}-${i}`} className="text-[10px] font-black text-slate-300">{d}</span>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <button 
                  key={i} 
                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${i + 1 === 30 ? 'bg-[#22B391] text-white shadow-lg shadow-[#22B391]/20' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

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
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Alerta de Retorno</p>
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  5 pacientes estão há mais de 45 dias sem consulta. Sugerimos envio de lembrete.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#22B391] shrink-0" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Otimização</p>
                </div>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  Sua taxa de comparecimento aumentou 12% após os novos lembretes de WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Próximos Dias</h4>
            <div className="space-y-4">
              {[
                { date: 'Amanhã', count: 8, color: 'bg-blue-500' },
                { date: 'Quarta', count: 10, color: 'bg-emerald-500' },
                { date: 'Quinta', count: 6, color: 'bg-indigo-500' },
              ].map((day, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-sm font-bold text-slate-600">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0B2B24]">{day.count} consultas</span>
                    <div className={`w-2 h-2 rounded-full ${day.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal Placeholder */}
      <AnimatePresence>
        {showNewAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewAppointment(false)}
              className="absolute inset-0 bg-[#0B2B24]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#0B2B24]">Novo Agendamento</h3>
                    <p className="text-slate-500 font-medium">Preencha os dados da nova consulta.</p>
                  </div>
                  <button onClick={() => setShowNewAppointment(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Paciente</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" placeholder="Buscar paciente..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data</label>
                        <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hora</label>
                        <input type="time" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Consulta</label>
                      <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-slate-600">
                        <option>Presencial</option>
                        <option>Online</option>
                        <option>Retorno</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Duração</label>
                      <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-slate-600">
                        <option>30 minutos</option>
                        <option selected>60 minutos</option>
                        <option>90 minutos</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
                  <button onClick={() => setShowNewAppointment(false)} className="px-8 py-4 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-600">Cancelar</button>
                  <button className="px-10 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] shadow-lg shadow-[#22B391]/20">Confirmar Agendamento</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;

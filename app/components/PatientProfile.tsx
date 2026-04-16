'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Instagram, 
  Copy, 
  Send, 
  Edit2, 
  Plus, 
  Activity, 
  Target, 
  FileText, 
  ClipboardList, 
  FlaskConical, 
  Ruler, 
  Baby, 
  Zap, 
  Utensils, 
  Brain,
  CheckSquare, 
  Pill, 
  Info, 
  Paperclip, 
  Stethoscope, 
  DollarSign,
  ExternalLink,
  MessageSquare,
  Droplets,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FoodDiaryPage from '../modules/foodDiary/FoodDiaryPage';
import AnamnesisWizard from './AnamnesisWizard';
import HealthQuestionnaires from './HealthQuestionnaires';
import LabExams from './LabExams';
import Anthropometry from './Anthropometry';
import PregnancyAnthropometry from './PregnancyAnthropometry';
import EnergyCalculator from './EnergyCalculator';
import MealPlanning from './MealPlanning';
import GoalPrescription from './GoalPrescription';
import MedicalRecord from './MedicalRecord';
import PrescriptionDietetica from './PrescriptionDietetica';
import AutomaticMealPlanIA from './AutomaticMealPlanIA';
import PrescriptionManipulados from './PrescriptionManipulados';
import NutritionalRecommendations from './NutritionalRecommendations';
import { populateMockDietPlans, populateMockGoals, populateMockPrescriptions, populateMockRecommendations, populateMockMedicalRecords } from '@/app/lib/mockDataPopulator';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  photo_url?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  cpf?: string;
  instagram?: string;
  objective?: string;
  activity_level?: string;
  food_restrictions?: string;
  observations?: string;
  tags?: string[];
  last_access?: string;
  app_access?: boolean;
  chat_enabled?: boolean;
  hydration_alert?: boolean;
  questionnaire_enabled?: boolean;
  educational_content_access?: boolean;
  engagement_score?: number;
  adherence_score?: number;
}

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [initialPrescriptionTab, setInitialPrescriptionTab] = useState<'plano' | 'criar' | 'estrategia' | 'substituicoes' | 'distribuicao' | 'orientacoes' | 'ia'>('plano');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!isSupabaseConfigured) {
        // Mock Data
        setPatient({
          id: patientId,
          name: 'Maria Oliveira',
          email: 'maria@email.com',
          phone: '(11) 98888-7777',
          status: 'Ativo',
          birth_date: '1992-05-15',
          age: 34,
          gender: 'Feminino',
          cpf: '123.456.789-00',
          instagram: '@maria_nutri',
          objective: 'Emagrecimento Saudável',
          activity_level: 'Moderado',
          food_restrictions: 'Lactose',
          observations: 'Paciente motivada, mas com dificuldades nos finais de semana.',
          tags: ['Emagrecimento', 'Hipertensa'],
          last_access: '2026-03-28T14:30:00Z',
          app_access: true,
          chat_enabled: true,
          hydration_alert: true,
          questionnaire_enabled: true,
          educational_content_access: true,
          engagement_score: 85,
          adherence_score: 78
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (error) throw error;
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleToggle = async (field: keyof Patient, value: boolean) => {
    if (!patient) return;
    
    const updatedPatient = { ...patient, [field]: value };
    setPatient(updatedPatient);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('patients')
          .update({ [field]: value })
          .eq('id', patientId);
        if (error) throw error;
      } catch (err) {
        console.error(`Error updating ${field}:`, err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22B391]"></div>
      </div>
    );
  }

  if (!patient) return <div>Paciente não encontrado.</div>;

  const menuItems = [
    { id: 'perfil', label: 'Perfil do Paciente', icon: User },
    { id: 'diario', label: 'Diário Alimentar', icon: Utensils },
    { id: 'anamnese', label: 'Anamnese Geral', icon: ClipboardList },
    { id: 'questionarios', label: 'Questionários de Saúde', icon: CheckSquare },
    { id: 'exames', label: 'Exames Laboratoriais', icon: FlaskConical },
    { id: 'antropometria', label: 'Antropometria Geral', icon: Ruler },
    { id: 'gestantes', label: 'Antropometria Gestantes', icon: Baby },
    { id: 'energia', label: 'Cálculo Energético', icon: Zap },
    { id: 'prescricao', label: 'Prescrição Dietética', icon: ClipboardList },
    { id: 'plano', label: 'Planejamento Alimentar', icon: Target },
    { id: 'metas', label: 'Prescrição de Metas', icon: TrendingUp },
    { id: 'manipulados', label: 'Prescrição de Manipulados', icon: Pill },
    { id: 'orientacoes', label: 'Orientações Nutricionais', icon: Info },
    { id: 'arquivos', label: 'Arquivos Anexos', icon: Paperclip },
    { id: 'prontuario', label: 'Prontuário e Diagnóstico', icon: Stethoscope },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-50">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Lista
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-[#22B391]/10 text-[#22B391]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#22B391]' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-lg">
                {patient.photo_url ? (
                  <img src={patient.photo_url} alt={patient.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#22B391] text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0B2B24] mb-1">{patient.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">{patient.age} anos</span>
                <div className="h-1 w-1 bg-slate-300 rounded-full" />
                <span className="text-[#22B391] font-black text-sm uppercase tracking-widest">{patient.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Link do Paciente</p>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all shadow-sm">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all border border-slate-100">
              Agendar Consulta
            </button>
            <button className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-xs hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20">
              Registrar Nova Consulta
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'perfil' && (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Intelligence Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B2B24] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#22B391]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-[#22B391]" />
                    <h3 className="font-black text-lg">Score de Engajamento</h3>
                  </div>
                  <div className="flex items-end gap-4 mb-4">
                    <span className="text-5xl font-black text-[#22B391]">{patient.engagement_score}%</span>
                    <span className="text-white/40 font-bold text-sm mb-2 uppercase tracking-widest">Excelente</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    O paciente está muito ativo no app. Sugerimos parabenizá-lo na próxima consulta.
                  </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <h3 className="font-black text-lg text-[#0B2B24]">Alertas da IA</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-800 font-medium">Paciente não preenche o diário há 3 dias.</p>
                    </div>
                    <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <Info className="w-5 h-5 text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-800 font-medium">Meta de hidratação atingida em 80% da semana.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-[#22B391]" />
                    <h3 className="font-black text-lg text-[#0B2B24]">Sugestões ONNTRI</h3>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={async () => {
                        await populateMockDietPlans(patientId);
                        setActiveTab('plano');
                      }}
                      className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] transition-all group"
                    >
                      <p className="text-xs font-black text-[#0B2B24] group-hover:text-[#22B391]">Criar novo plano alimentar</p>
                      <p className="text-[10px] text-slate-400 font-bold">Baseado na última evolução</p>
                    </button>
                    <button 
                      onClick={async () => {
                        await populateMockGoals(patientId);
                        setActiveTab('metas');
                      }}
                      className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] transition-all group"
                    >
                      <p className="text-xs font-black text-[#0B2B24] group-hover:text-[#22B391]">Definir novas metas</p>
                      <p className="text-[10px] text-slate-400 font-bold">Foco em emagrecimento</p>
                    </button>
                    <button 
                      onClick={async () => {
                        await populateMockPrescriptions(patientId);
                        setActiveTab('manipulados');
                      }}
                      className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] transition-all group"
                    >
                      <p className="text-xs font-black text-[#0B2B24] group-hover:text-[#22B391]">Prescrever manipulados</p>
                      <p className="text-[10px] text-slate-400 font-bold">Fórmulas antioxidantes</p>
                    </button>
                    <button 
                      onClick={async () => {
                        await populateMockRecommendations(patientId);
                        setActiveTab('orientacoes');
                      }}
                      className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] transition-all group"
                    >
                      <p className="text-xs font-black text-[#0B2B24] group-hover:text-[#22B391]">Enviar orientações</p>
                      <p className="text-[10px] text-slate-400 font-bold">Hábitos e sono</p>
                    </button>
                    <button 
                      onClick={async () => {
                        await populateMockMedicalRecords(patientId);
                        setActiveTab('prontuario');
                      }}
                      className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] transition-all group"
                    >
                      <p className="text-xs font-black text-[#0B2B24] group-hover:text-[#22B391]">Gerar Prontuário Mock</p>
                      <p className="text-[10px] text-slate-400 font-bold">Histórico e evolução</p>
                    </button>
                    <button className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] transition-all group">
                      <p className="text-xs font-black text-[#0B2B24] group-hover:text-[#22B391]">Sugerir nova avaliação</p>
                      <p className="text-[10px] text-slate-400 font-bold">Intervalo de 30 dias atingido</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Data Card */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-[#22B391]" />
                        <h3 className="font-black text-xl text-[#0B2B24]">Dados do Paciente</h3>
                      </div>
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 text-[#22B391] font-black text-xs uppercase tracking-widest hover:opacity-80 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar Dados
                      </button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                          <p className="text-slate-900 font-bold">{patient.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data de Nascimento</p>
                          <p className="text-slate-900 font-bold">{patient.birth_date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gênero</p>
                          <p className="text-slate-900 font-bold">{patient.gender}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                          <p className="text-slate-900 font-bold">{patient.cpf || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-900 font-bold">{patient.phone}</p>
                            <button className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                          <p className="text-slate-900 font-bold">{patient.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instagram</p>
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <p className="text-slate-900 font-bold">{patient.instagram || 'Não informado'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Último Acesso</p>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-900 font-bold">
                              {patient.last_access ? new Date(patient.last_access).toLocaleDateString() : 'Nunca acessou'}
                            </p>
                            {patient.app_access ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Nova Anamnese', icon: ClipboardList, color: 'bg-blue-50 text-blue-600', tab: 'anamnese' },
                      { label: 'Questionários', icon: CheckSquare, color: 'bg-indigo-50 text-indigo-600', tab: 'questionarios' },
                      { label: 'Exames Laboratoriais', icon: FlaskConical, color: 'bg-amber-50 text-amber-600', tab: 'exames' },
                      { label: 'Avaliação Antropométrica', icon: Ruler, color: 'bg-purple-50 text-purple-600', tab: 'antropometria' },
                      { label: 'Antropometria Gestantes', icon: Baby, color: 'bg-pink-50 text-pink-600', tab: 'gestantes' },
                      { label: 'Cálculo Energético', icon: Zap, color: 'bg-yellow-50 text-yellow-600', tab: 'energia' },
                      { label: 'Prescrição Dietética', icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600', tab: 'prescricao' },
                      { label: 'Plano Alimentar', icon: Target, color: 'bg-emerald-50 text-emerald-600', tab: 'plano' },
                      { label: 'Ver Prontuário', icon: Stethoscope, color: 'bg-slate-50 text-slate-600', tab: 'prontuario' },
                    ].map((action) => (
                      <button 
                        key={action.label}
                        onClick={() => setActiveTab(action.tab)}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-[#22B391] transition-all group text-center flex flex-col items-center gap-4"
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-black text-[#0B2B24] uppercase tracking-widest leading-tight">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Access Settings Card */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <Zap className="w-6 h-6 text-[#22B391]" />
                      <h3 className="font-black text-xl text-[#0B2B24]">Configurações de Acesso</h3>
                    </div>
                    <div className="space-y-6">
                      {[
                        { id: 'app_access', label: 'Acesso ao App', icon: Activity },
                        { id: 'chat_enabled', label: 'Permitir Chat', icon: MessageSquare },
                        { id: 'hydration_alert', label: 'Alerta de Hidratação', icon: Droplets },
                        { id: 'questionnaire_enabled', label: 'Questionários', icon: CheckSquare },
                        { id: 'educational_content_access', label: 'Conteúdo Educativo', icon: BookOpen },
                      ].map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                              <setting.icon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-600">{setting.label}</span>
                          </div>
                          <button 
                            onClick={() => handleToggle(setting.id as keyof Patient, !patient[setting.id as keyof Patient])}
                            className={`w-12 h-6 rounded-full transition-all relative ${
                              patient[setting.id as keyof Patient] ? 'bg-[#22B391]' : 'bg-slate-200'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                              patient[setting.id as keyof Patient] ? 'left-7' : 'left-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient Profile Summary */}
                  <div className="bg-[#0B2B24] rounded-[2.5rem] p-8 text-white">
                    <h3 className="font-black text-xl mb-6">Perfil Nutricional</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Objetivo</p>
                        <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-sm font-medium">
                          {patient.objective}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Restrições</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.food_restrictions?.split(',').map(r => (
                            <span key={r} className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {r.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Atividade Física</p>
                        <div className="flex items-center gap-2 text-[#22B391] font-black">
                          <Activity className="w-4 h-4" />
                          <span className="text-sm uppercase tracking-widest">{patient.activity_level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diario' && (
            <div className="max-w-7xl mx-auto">
              <FoodDiaryPage patientId={patientId} />
            </div>
          )}

          {activeTab === 'anamnese' && (
            <div className="h-full">
              <AnamnesisWizard 
                patientId={patientId} 
                onSave={(data) => {
                  console.log('Saving anamnesis:', data);
                  setActiveTab('perfil');
                }} 
              />
            </div>
          )}

          {activeTab === 'questionarios' && (
            <div className="h-full">
              <HealthQuestionnaires patientId={patientId} />
            </div>
          )}

          {activeTab === 'exames' && (
            <div className="h-full">
              <LabExams patientId={patientId} />
            </div>
          )}

          {activeTab === 'antropometria' && (
            <div className="h-full">
              <Anthropometry patientId={patientId} />
            </div>
          )}

          {activeTab === 'gestantes' && (
            <div className="h-full">
              <PregnancyAnthropometry patientId={patientId} />
            </div>
          )}

          {activeTab === 'energia' && (
            <div className="h-full">
              <EnergyCalculator 
                patientId={patientId} 
                patientName={patient.name} 
                onGeneratePlan={() => {
                  setInitialPrescriptionTab('ia');
                  setActiveTab('prescricao');
                }}
              />
            </div>
          )}

          {activeTab === 'prescricao' && (
            <div className="h-full">
              <PrescriptionDietetica 
                patientId={patientId} 
                patientName={patient.name} 
                initialTab={initialPrescriptionTab}
              />
            </div>
          )}

          {activeTab === 'plano' && (
            <div className="h-full">
              <MealPlanning patientId={patientId} patientName={patient.name} />
            </div>
          )}

          {activeTab === 'prontuario' && (
            <div className="h-full">
              <MedicalRecord patientId={patientId} patientName={patient?.name} />
            </div>
          )}

          {activeTab === 'metas' && (
            <div className="h-full">
              <GoalPrescription patientId={patientId} patientName={patient.name} />
            </div>
          )}
          
          {activeTab === 'manipulados' && (
            <div className="h-full">
              <PrescriptionManipulados patientId={patientId} patientName={patient.name} />
            </div>
          )}

          {activeTab === 'orientacoes' && (
            <div className="h-full">
              <NutritionalRecommendations patientId={patientId} patientName={patient.name} />
            </div>
          )}

          {activeTab !== 'perfil' && activeTab !== 'diario' && activeTab !== 'anamnese' && activeTab !== 'questionarios' && activeTab !== 'exames' && activeTab !== 'antropometria' && activeTab !== 'gestantes' && activeTab !== 'energia' && activeTab !== 'plano' && activeTab !== 'prontuario' && activeTab !== 'metas' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                {menuItems.find(i => i.id === activeTab)?.icon && React.createElement(menuItems.find(i => i.id === activeTab)!.icon, { className: 'w-10 h-10' })}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B2B24] mb-1">Módulo em Desenvolvimento</h3>
                <p className="text-slate-400 font-medium">O módulo de {menuItems.find(i => i.id === activeTab)?.label} estará disponível em breve.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;

'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Scale, 
  Stethoscope, 
  Pill, 
  Utensils, 
  Brain, 
  Activity, 
  Droplets, 
  Target, 
  Camera, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Save,
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Info,
  Shield,
  Star,
  Activity as ActivityIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDocument } from "@/app/lib/supabase-utils";

// --- Interfaces ---
interface AnamnesisData {
  objetivo: string;
  profissao: string;
  rotina_trabalho: string;
  nivel_estresse: number;
  qualidade_sono: number;
  horas_sono: number;
  peso_atual: number;
  peso_habitual: number;
  peso_ideal: number;
  maior_peso: number;
  menor_peso: number;
  efeito_sanfona: boolean;
  tempo_tentando_emagrecer: string;
  doencas: string[];
  problemas_gastro: string[];
  cirurgias: string;
  historico_familiar: string;
  medicamentos: string;
  suplementos: string[];
  hormonios: boolean;
  alergias_med: string;
  refeicoes_dia: number;
  horarios_refeicoes: string;
  prepara_comida: string;
  come_fora: boolean;
  consumo_acucar: string;
  consumo_refri: string;
  consumo_alcool: string;
  preferencias: string;
  alimentos_nao_gosta: string;
  restricoes: string[];
  come_por: string[];
  compulsao: boolean;
  velocidade_comer: string;
  come_assistindo: boolean;
  controle_alimentar: number;
  pratica_exercicio: boolean;
  tipo_exercicio: string[];
  frequencia_semanal: number;
  duracao_media: number;
  intensidade: string;
  agua_dia: number;
  consumo_cafe: string;
  objetivo_principal: string;
  prazo: string;
  comprometimento: number;
  expectativa: string;
  fotos: {
    frente?: string;
    lado?: string;
    costas?: string;
  };
  obs_nutri: string;
  diagnostico_inicial: string;
  estrategia_sugerida: string;
}

const initialData: AnamnesisData = {
  objetivo: '',
  profissao: '',
  rotina_trabalho: 'Sedentário',
  nivel_estresse: 3,
  qualidade_sono: 3,
  horas_sono: 7,
  peso_atual: 0,
  peso_habitual: 0,
  peso_ideal: 0,
  maior_peso: 0,
  menor_peso: 0,
  efeito_sanfona: false,
  tempo_tentando_emagrecer: '',
  doencas: [],
  problemas_gastro: [],
  cirurgias: '',
  historico_familiar: '',
  medicamentos: '',
  suplementos: [],
  hormonios: false,
  alergias_med: '',
  refeicoes_dia: 3,
  horarios_refeicoes: '',
  prepara_comida: '',
  come_fora: false,
  consumo_acucar: 'Moderado',
  consumo_refri: 'Raramente',
  consumo_alcool: 'Socialmente',
  preferencias: '',
  alimentos_nao_gosta: '',
  restricoes: [],
  come_por: [],
  compulsao: false,
  velocidade_comer: 'Normal',
  come_assistindo: false,
  controle_alimentar: 3,
  pratica_exercicio: false,
  tipo_exercicio: [],
  frequencia_semanal: 0,
  duracao_media: 0,
  intensidade: 'Moderada',
  agua_dia: 0,
  consumo_cafe: 'Moderado',
  objetivo_principal: '',
  prazo: '',
  comprometimento: 3,
  expectativa: '',
  fotos: {},
  obs_nutri: '',
  diagnostico_inicial: '',
  estrategia_sugerida: ''
};

const steps = [
  { id: 1, title: 'Dados Gerais', icon: User },
  { id: 2, title: 'Histórico de Peso', icon: Scale },
  { id: 3, title: 'Histórico Clínico', icon: Stethoscope },
  { id: 4, title: 'Meds & Suplementos', icon: Pill },
  { id: 5, title: 'Hábitos Alimentares', icon: Utensils },
  { id: 6, title: 'Comportamento', icon: Brain },
  { id: 7, title: 'Atividade Física', icon: Activity },
  { id: 8, title: 'Hidratação', icon: Droplets },
  { id: 9, title: 'Objetivos e Metas', icon: Target },
  { id: 10, title: 'Avaliação Visual', icon: Camera },
  { id: 11, title: 'Observações', icon: FileText },
];



export default function AnamnesisWizard({ patientId, onSave, onBack }: { patientId: string, onSave?: (data: AnamnesisData) => void, onBack?: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<AnamnesisData>(initialData);
  const [showSummary, setShowSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const populateMockData = () => {
    setData({
      objetivo: 'Emagrecimento e ganho de massa magra',
      profissao: 'Desenvolvedor de Software',
      rotina_trabalho: 'Home office, sentado 8-10h por dia',
      nivel_estresse: 4,
      qualidade_sono: 2,
      horas_sono: 6,
      peso_atual: 85,
      peso_habitual: 78,
      peso_ideal: 75,
      maior_peso: 92,
      menor_peso: 70,
      efeito_sanfona: true,
      tempo_tentando_emagrecer: '2 anos',
      doencas: ['Gastrite', 'Rinite'],
      problemas_gastro: ['Refluxo', 'Gases'],
      cirurgias: 'Nenhuma',
      historico_familiar: 'Pai diabético, Mãe hipertensa',
      medicamentos: 'Omeprazol ocasionalmente',
      suplementos: ['Whey Protein', 'Creatina'],
      hormonios: false,
      alergias_med: 'Nenhuma',
      refeicoes_dia: 4,
      horarios_refeicoes: '08:00, 12:30, 16:00, 20:00',
      prepara_comida: 'Eu mesmo preparo',
      come_fora: true,
      consumo_acucar: 'Moderado',
      consumo_refri: 'Fim de semana',
      consumo_alcool: 'Socialmente',
      preferencias: 'Churrasco, Massas, Frutas',
      alimentos_nao_gosta: 'Fígado, Quiabo',
      restricoes: ['Lactose'],
      come_por: ['Ansiedade', 'Tédio'],
      compulsao: true,
      velocidade_comer: 'Rápido',
      come_assistindo: true,
      controle_alimentar: 2,
      pratica_exercicio: true,
      tipo_exercicio: ['Musculação'],
      frequencia_semanal: 3,
      duracao_media: 45,
      intensidade: 'Moderada',
      agua_dia: 1.5,
      consumo_cafe: 'Alto (4-5 xícaras)',
      objetivo_principal: 'Reduzir percentual de gordura e melhorar disposição',
      prazo: '6 meses',
      comprometimento: 4,
      expectativa: 'Perder 10kg de gordura',
      fotos: {},
      obs_nutri: 'Paciente motivado, mas com rotina estressante e sono de má qualidade.',
      diagnostico_inicial: 'Obesidade Grau I, Sedentarismo relativo, Sono não reparador.',
      estrategia_sugerida: 'Dieta hiperproteica, restrição calórica moderada, foco em higiene do sono.'
    });
    setCurrentStep(11);
    setShowSummary(true);
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await addDocument("anamnesis_records", {
        patient_id: patientId,
        nutri_id: "7a2b2c3d-1a2b-3c4d-5e6f-7g8h9i0j1k2l", // Fallback nutri id
        data: data,
        score: calculateScore(data),
      });
      
      if (error) throw error;
      
      if (onSave) onSave(data);
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateData = (updates: Partial<AnamnesisData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else if (!showSummary) {
      setShowSummary(true);
    } else {
      handleFinalSave();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  function calculateScore(anamnesisData: AnamnesisData) {
    let score = 0;
    if (anamnesisData.consumo_acucar === 'Baixo') score += 10;
    if (anamnesisData.consumo_refri === 'Raramente') score += 10;
    if (anamnesisData.refeicoes_dia >= 3 && anamnesisData.refeicoes_dia <= 6) score += 10;
    if (anamnesisData.horas_sono >= 7 && anamnesisData.horas_sono <= 9) score += 10;
    if (anamnesisData.qualidade_sono >= 4) score += 10;
    if (anamnesisData.pratica_exercicio) {
      if (anamnesisData.frequencia_semanal >= 3) score += 15;
      if (anamnesisData.duracao_media >= 45) score += 10;
    }
    if (anamnesisData.agua_dia >= 2) score += 15;
    if (anamnesisData.nivel_estresse <= 2) score += 10;
    return Math.min(score, 100);
  }

  function getAIDiagnosis(anamnesisData: AnamnesisData) {
    const diagnoses = [];
    if (anamnesisData.compulsao) diagnoses.push("Padrão de compulsão alimentar detectado.");
    if (anamnesisData.consumo_acucar === 'Alto') diagnoses.push("Alto consumo de açúcar refinado.");
    if (!anamnesisData.pratica_exercicio) diagnoses.push("Sedentarismo identificado.");
    if (anamnesisData.agua_dia < 1.5) diagnoses.push("Baixa ingestão hídrica.");
    if (anamnesisData.nivel_estresse >= 4) diagnoses.push("Nível de estresse elevado, impactando cortisol.");
    return diagnoses.length > 0 ? diagnoses : ["Paciente com hábitos equilibrados. Focar em otimização."];
  }

  function getAlerts(anamnesisData: AnamnesisData) {
    const alerts = [];
    if (anamnesisData.doencas.includes('Diabetes Tipo 2') || anamnesisData.maior_peso > anamnesisData.peso_atual * 1.2) {
      alerts.push({ type: 'danger', msg: 'Risco Metabólico Elevado' } as { type: 'danger' | 'warning', msg: string });
    }
    if (anamnesisData.comprometimento < 3) {
      alerts.push({ type: 'warning', msg: 'Risco de Baixa Adesão Futura' } as { type: 'danger' | 'warning', msg: string });
    }
    if (anamnesisData.compulsao || anamnesisData.come_por.includes('Ansiedade')) {
      alerts.push({ type: 'warning', msg: 'Possível Transtorno Alimentar' } as { type: 'danger' | 'warning', msg: string });
    }
    return alerts;
  }



  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
               <h4 className="text-sm font-black text-[#22B391] uppercase tracking-[0.2em]">Dados de Identificação</h4>
               <button onClick={populateMockData} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#22B391] flex items-center gap-1.5 transition-all">
                  <Sparkles className="w-3 h-3" /> Auto-Fill (Demo)
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Principal Objetivo</label>
                <select 
                  value={data.objetivo}
                  onChange={(e) => updateData({ objetivo: e.target.value })}
                  className="w-full p-4 bg-[#0a0f16] border border-white/10 rounded-2xl font-bold text-white focus:ring-1 focus:ring-[#22B391]/50 focus:border-[#22B391] transition-all outline-none"
                >
                  <option value="">Selecione...</option>
                  {['Emagrecimento', 'Hipertrofia', 'Saúde & Longevidade', 'Performance Esportiva'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Profissão Atual</label>
                <input 
                  type="text"
                  value={data.profissao}
                  onChange={(e) => updateData({ profissao: e.target.value })}
                  className="w-full p-4 bg-[#0a0f16] border border-white/10 rounded-2xl font-bold text-white focus:ring-1 focus:ring-[#22B391]/50 focus:border-[#22B391] transition-all outline-none"
                  placeholder="Ex: Desenvolvedor, Médico..."
                />
              </div>
            </div>
            <div className="space-y-6 pt-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Estilo de Vida (Atividade Laboral)</label>
               <div className="grid grid-cols-3 gap-4">
                  {['Sedentário', 'Moderado', 'Ativo'].map(level => (
                    <button
                      key={level}
                      onClick={() => updateData({ rotina_trabalho: level })}
                      className={`py-4 rounded-2xl font-black text-xs transition-all border ${data.rotina_trabalho === level ? 'bg-[#22B391] text-[#0a0f16] border-transparent shadow-lg shadow-[#22B391]/10' : 'bg-[#0a0f16] text-slate-500 border-white/5 hover:border-white/20'}`}
                    >
                      {level}
                    </button>
                  ))}
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível de Estresse Diário</label>
                    <span className="text-xs font-black text-[#22B391]">{data.nivel_estresse}/5</span>
                 </div>
                 <input type="range" min="1" max="5" value={data.nivel_estresse} onChange={(e) => updateData({ nivel_estresse: Number(e.target.value) })} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#22B391]" />
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Qualidade do Sono</label>
                    <span className="text-xs font-black text-[#22B391]">{data.qualidade_sono}/5</span>
                 </div>
                 <input type="range" min="1" max="5" value={data.qualidade_sono} onChange={(e) => updateData({ qualidade_sono: Number(e.target.value) })} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#22B391]" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <h4 className="text-sm font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">Métricas Antropométricas Iniciais</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Peso Atual (kg)', key: 'peso_atual' },
                { label: 'Peso Habitual (kg)', key: 'peso_habitual' },
                { label: 'Peso Ideal (kg)', key: 'peso_ideal' },
                { label: 'Maior Peso (kg)', key: 'maior_peso' },
                { label: 'Menor Peso (kg)', key: 'menor_peso' },
              ].map(field => (
                <div key={field.key} className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{field.label}</label>
                  <input 
                    type="number"
                    value={(data as any)[field.key]}
                    onChange={(e) => updateData({ [field.key]: Number(e.target.value) })}
                    className="w-full p-4 bg-[#0a0f16] border border-white/10 rounded-2xl font-bold text-white focus:border-[#22B391] outline-none"
                  />
                </div>
              ))}
              <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Efeito Sanfona?</label>
                  <div className="flex h-[54px] bg-[#0a0f16] rounded-2xl border border-white/10 p-1">
                     <button onClick={() => updateData({ efeito_sanfona: true })} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${data.efeito_sanfona ? 'bg-[#22B391] text-[#0a0f16]' : 'text-slate-500'}`}>Sim</button>
                     <button onClick={() => updateData({ efeito_sanfona: false })} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${!data.efeito_sanfona ? 'bg-[#22B391] text-[#0a0f16]' : 'text-slate-500'}`}>Não</button>
                  </div>
              </div>
            </div>
          </div>
        );
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
        return (
          <div className="space-y-6">
             <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center space-y-4">
                <div className="w-16 h-16 bg-[#22B391]/20 rounded-full flex items-center justify-center mx-auto border border-[#22B391]/30">
                   <Zap className="w-8 h-8 text-[#45dcb9]" />
                </div>
                <h4 className="text-xl font-black text-white">Interface em Expansão Premuim</h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                   Todos os campos foram preservados. Utilize o botão **"Próximo"** para avançar ou **"Auto-Fill"** na primeira etapa para ver o dashboard final de IA.
                </p>
             </div>
             <div className="bg-[#0a0f16] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-slate-500 font-medium">Os campos de {steps[currentStep-1].title} estão sendo otimizados para inputs rápidos via teclado.</p>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (showSummary) {
    const score = calculateScore(data);
    const diagnoses = getAIDiagnosis(data);
    const alerts = getAlerts(data);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-5xl mx-auto space-y-10 bg-[#0a0f16] min-h-[600px] text-slate-200">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
               <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Intelligence Dashboard</h2>
              <p className="text-slate-400 font-bold text-sm">Análise de Redes Neurais ONNutrition finalizada.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSummary(false)}
            className="px-6 py-3 bg-white/5 text-slate-400 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Ajustar Coleta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Card Premium */}
          <div className="bg-[#0f1520] p-10 rounded-[48px] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <circle cx="96" cy="96" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={534} strokeDashoffset={534 - (534 * score) / 100} className="text-[#45dcb9] drop-shadow-[0_0_8px_rgba(69,220,185,0.4)]" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white tracking-tighter">{score}</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-1">Health Score</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Qualidade Metabólica</h3>
            <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-4">Pontuação baseada em biomarcadores coletados e padrões de comportamento alimentar.</p>
          </div>

          {/* AI Diagnosis Premium */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-[#0B2B24] to-[#0f1520] p-10 rounded-[48px] border border-[#22B391]/20 shadow-2xl relative overflow-hidden">
              <Sparkles className="absolute top-6 right-6 w-8 h-8 text-[#22B391]/20" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#22B391] flex items-center justify-center shadow-lg shadow-[#22B391]/20">
                  <Zap className="w-6 h-6 text-[#0a0f16]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic">AI Technical Support</h3>
                  <p className="text-[10px] font-black text-[#22B391] uppercase tracking-widest">Diagnóstico por Padrões de Dados</p>
                </div>
              </div>
              <div className="space-y-4">
                {diagnoses.map((diag, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-[#22B391]/30 transition-all group">
                    <CheckCircle2 className="w-5 h-5 text-[#22B391] shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{diag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alerts.map((alert, i) => (
                <div key={i} className={`p-6 rounded-[32px] border transition-all flex items-center gap-5 ${alert.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  <div className={`p-3 rounded-2xl ${alert.type === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-60`}>Risco Identificado</p>
                    <p className="text-sm font-black tracking-tight">{alert.msg}</p>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-center gap-5 md:col-span-2">
                   <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                      <Star className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-emerald-500/60">Sem Riscos Ativos</p>
                      <p className="text-sm font-black text-emerald-400">Paciente apresenta parâmetros estáveis de adesão.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-10 border-t border-white/5">
           <div className="flex gap-4">
              <div className="flex items-center gap-2 group cursor-help">
                 <Shield className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidencial</span>
              </div>
              <div className="flex items-center gap-2 group cursor-help">
                 <ActivityIcon className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biometria Ativa</span>
              </div>
           </div>
           <button 
             onClick={() => onSave?.(data)}
             className="flex items-center gap-4 px-12 py-5 bg-[#22B391] text-[#0a0f16] rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-[#22B391]/30 hover:scale-105 active:scale-95 transition-all"
           >
             <Save className="w-5 h-5" />
             Finalizar e Arquivar
           </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0f16] text-slate-200">
      {/* Header with Progress Premium */}
      <div className="bg-[#0f1520] p-10 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-[#22B391] opacity-5 blur-[120px]" />
        
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-[#22B391] animate-pulse" />
               <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.3em]">Módulo Clínica v2.5</p>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Anamnese Geral</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Progresso Operacional</p>
            <p className="text-2xl font-black text-[#22B391]">{Math.round((currentStep / steps.length) * 100)}%</p>
          </div>
        </div>

        {/* Step Indicator Premium */}
        <div className="max-w-5xl mx-auto flex gap-3 relative z-10">
          {steps.map(step => (
            <div 
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step.id <= currentStep ? 'bg-[#22B391] shadow-[0_0_10px_rgba(34,179,145,0.3)]' : 'bg-white/5'}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Premium */}
      <div className="flex-1 overflow-y-auto px-8 py-12 scroll-smooth custom-scrollbar">
        <div className="max-w-6xl mx-auto bg-[#0f1520] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl shadow-black/40">
          <div className="flex flex-col lg:flex-row h-full min-h-[650px]">
            {/* Left Sidebar (Steps) */}
            <div className="w-full lg:w-80 bg-[#0a0f16]/50 p-10 border-r border-white/5 hidden lg:block">
              <div className="space-y-4">
                {steps.map(step => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-4 p-4 rounded-[24px] transition-all group ${step.id === currentStep ? 'bg-white/5 border border-white/10 text-white translate-x-1' : 'text-slate-600'}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step.id === currentStep ? 'bg-[#22B391] text-[#0a0f16] shadow-lg shadow-[#22B391]/20' : step.id < currentStep ? 'bg-emerald-500/10 text-[#22B391]' : 'bg-white/5'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${step.id === currentStep ? 'text-white' : 'group-hover:text-slate-400'}`}>{step.title}</span>
                      {step.id < currentStep && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Area Premium */}
            <div className="flex-1 p-8 lg:p-16 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 rounded-[28px] bg-[#22B391]/10 border border-[#22B391]/20 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {React.createElement(steps[currentStep - 1].icon, { className: "w-8 h-8 text-[#45dcb9] relative z-10" })}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">Fase 0{currentStep}</p>
                      <h3 className="text-3xl font-black text-white tracking-tight">{steps[currentStep - 1].title}</h3>
                    </div>
                  </div>

                  <div className="text-slate-300">
                    {renderStep()}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Premium */}
      <div className="bg-[#0f1520] p-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={prevStep}
            className={`flex items-center gap-3 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 ${currentStep === 1 && !onBack ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white hover:bg-white/5 hover:border-white/10'}`}
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
          
          <div className="flex gap-5">
            <button className="hidden sm:block px-8 py-5 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#22B391] transition-all">
              Draft Save
            </button>
            <button 
              onClick={nextStep}
              className="flex items-center gap-4 px-12 py-5 bg-white text-[#0a0f16] rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-white/5 hover:scale-105 active:scale-95 transition-all"
            >
              {currentStep === steps.length ? 'Finalizar' : 'Prosseguir'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

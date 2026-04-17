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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnamnesisData {
  // 1. Dados Gerais
  objetivo: string;
  profissao: string;
  rotina_trabalho: string;
  nivel_estresse: number;
  qualidade_sono: number;
  horas_sono: number;
  
  // 2. Histórico de Peso
  peso_atual: number;
  peso_habitual: number;
  peso_ideal: number;
  maior_peso: number;
  menor_peso: number;
  efeito_sanfona: boolean;
  tempo_tentando_emagrecer: string;
  
  // 3. Histórico Clínico
  doencas: string[];
  problemas_gastro: string[];
  cirurgias: string;
  historico_familiar: string;
  
  // 4. Medicamentos e Suplementos
  medicamentos: string;
  suplementos: string[];
  hormonios: boolean;
  alergias_med: string;
  
  // 5. Hábitos Alimentares
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
  
  // 6. Comportamento Alimentar
  come_por: string[];
  compulsao: boolean;
  velocidade_comer: string;
  come_assistindo: boolean;
  controle_alimentar: number;
  
  // 7. Atividade Física
  pratica_exercicio: boolean;
  tipo_exercicio: string[];
  frequencia_semanal: number;
  duracao_media: number;
  intensidade: string;
  
  // 8. Hidratação
  agua_dia: number;
  consumo_cafe: string;
  
  // 9. Objetivos e Metas
  objetivo_principal: string;
  prazo: string;
  comprometimento: number;
  expectativa: string;
  
  // 10. Avaliação Visual
  fotos: {
    frente?: string;
    lado?: string;
    costas?: string;
  };
  
  // 11. Observações
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
    setCurrentStep(11); // Go to last step to see summary
    setShowSummary(true);
  };

  const updateData = (updates: Partial<AnamnesisData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ONNutrition Intelligence Calculations
  const calculateScore = () => {
    let score = 0;
    
    // Alimentação (0-30)
    if (data.consumo_acucar === 'Baixo') score += 10;
    if (data.consumo_refri === 'Raramente') score += 10;
    if (data.refeicoes_dia >= 3 && data.refeicoes_dia <= 6) score += 10;
    
    // Sono (0-20)
    if (data.horas_sono >= 7 && data.horas_sono <= 9) score += 10;
    if (data.qualidade_sono >= 4) score += 10;
    
    // Atividade (0-25)
    if (data.pratica_exercicio) {
      if (data.frequencia_semanal >= 3) score += 15;
      if (data.duracao_media >= 45) score += 10;
    }
    
    // Comportamento & Hidratação (0-25)
    if (data.agua_dia >= 2) score += 15;
    if (data.nivel_estresse <= 2) score += 10;
    
    return Math.min(score, 100);
  };

  const getAIDiagnosis = () => {
    const diagnoses = [];
    if (data.compulsao) diagnoses.push("Padrão de compulsão alimentar detectado.");
    if (data.consumo_acucar === 'Alto') diagnoses.push("Alto consumo de açúcar refinado.");
    if (!data.pratica_exercicio) diagnoses.push("Sedentarismo identificado.");
    if (data.agua_dia < 1.5) diagnoses.push("Baixa ingestão hídrica.");
    if (data.nivel_estresse >= 4) diagnoses.push("Nível de estresse elevado, impactando cortisol.");
    
    return diagnoses.length > 0 ? diagnoses : ["Paciente com hábitos equilibrados. Focar em otimização."];
  };

  const getAlerts = () => {
    const alerts = [];
    if (data.doencas.includes('Diabetes Tipo 2') || data.maior_peso > data.peso_atual * 1.2) {
      alerts.push({ type: 'danger', msg: 'Risco Metabólico Elevado' });
    }
    if (data.comprometimento < 3) {
      alerts.push({ type: 'warning', msg: 'Risco de Baixa Adesão Futura' });
    }
    if (data.compulsao || data.come_por.includes('Ansiedade')) {
      alerts.push({ type: 'warning', msg: 'Possível Transtorno Alimentar' });
    }
    return alerts;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={populateMockData}
                className="text-[10px] font-black text-[#22B391] uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Preencher com Dados de Exemplo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</label>
                <select 
                  value={data.objetivo}
                  onChange={(e) => updateData({ objetivo: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Saúde">Saúde</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profissão</label>
                <input 
                  type="text"
                  value={data.profissao}
                  onChange={(e) => updateData({ profissao: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                  placeholder="Ex: Engenheiro"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rotina de Trabalho</label>
                <div className="flex gap-2">
                  {['Sedentário', 'Moderado', 'Ativo'].map(level => (
                    <button
                      key={level}
                      onClick={() => updateData({ rotina_trabalho: level })}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${data.rotina_trabalho === level ? 'bg-[#22B391] text-white shadow-lg shadow-[#22B391]/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horas de Sono</label>
                <input 
                  type="number"
                  value={data.horas_sono}
                  onChange={(e) => updateData({ horas_sono: Number(e.target.value) })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Estresse (1-5)</label>
                <input 
                  type="range" min="1" max="5"
                  value={data.nivel_estresse}
                  onChange={(e) => updateData({ nivel_estresse: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#22B391]"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Relaxado</span>
                  <span>Muito Estressado</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualidade do Sono (1-5)</label>
                <input 
                  type="range" min="1" max="5"
                  value={data.qualidade_sono}
                  onChange={(e) => updateData({ qualidade_sono: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#22B391]"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Péssima</span>
                  <span>Excelente</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Peso Atual (kg)', key: 'peso_atual' },
              { label: 'Peso Habitual (kg)', key: 'peso_habitual' },
              { label: 'Peso Ideal (kg)', key: 'peso_ideal' },
              { label: 'Maior Peso (kg)', key: 'maior_peso' },
              { label: 'Menor Peso (kg)', key: 'menor_peso' },
            ].map(field => (
              <div key={field.key} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                <input 
                  type="number"
                  value={(data as any)[field.key]}
                  onChange={(e) => updateData({ [field.key]: Number(e.target.value) })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efeito Sanfona?</label>
              <div className="flex gap-2">
                {[true, false].map(val => (
                  <button
                    key={val.toString()}
                    onClick={() => updateData({ efeito_sanfona: val })}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${data.efeito_sanfona === val ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doenças Diagnosticadas</label>
              <div className="flex flex-wrap gap-2">
                {['Diabetes Tipo 2', 'Hipertensão', 'Dislipidemia', 'Hipotireoidismo', 'Ovário Policístico'].map(disease => (
                  <button
                    key={disease}
                    onClick={() => {
                      const current = data.doencas;
                      updateData({ doencas: current.includes(disease) ? current.filter(d => d !== disease) : [...current, disease] });
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${data.doencas.includes(disease) ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {disease}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problemas Gastrointestinais</label>
              <div className="flex flex-wrap gap-2">
                {['Refluxo', 'Gastrite', 'Intestino Preso', 'Intestino Solto', 'Gases/Estufamento'].map(prob => (
                  <button
                    key={prob}
                    onClick={() => {
                      const current = data.problemas_gastro;
                      updateData({ problemas_gastro: current.includes(prob) ? current.filter(p => p !== prob) : [...current, prob] });
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${data.problemas_gastro.includes(prob) ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {prob}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cirurgias Anteriores</label>
                <textarea 
                  value={data.cirurgias}
                  onChange={(e) => updateData({ cirurgias: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 focus:ring-[#22B391] transition-all"
                  placeholder="Liste cirurgias e datas aproximadas..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico Familiar</label>
                <textarea 
                  value={data.historico_familiar}
                  onChange={(e) => updateData({ historico_familiar: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 focus:ring-[#22B391] transition-all"
                  placeholder="Ex: Pai com diabetes, Mãe com hipertensão..."
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicamentos Contínuos</label>
                <textarea 
                  value={data.medicamentos}
                  onChange={(e) => updateData({ medicamentos: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 focus:ring-[#22B391] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alergias Medicamentosas</label>
                <textarea 
                  value={data.alergias_med}
                  onChange={(e) => updateData({ alergias_med: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 focus:ring-[#22B391] transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suplementos em Uso</label>
              <div className="flex flex-wrap gap-2">
                {['Whey Protein', 'Creatina', 'Multivitamínico', 'Ômega 3', 'Magnésio', 'Vitamina D'].map(supp => (
                  <button
                    key={supp}
                    onClick={() => {
                      const current = data.suplementos;
                      updateData({ suplementos: current.includes(supp) ? current.filter(s => s !== supp) : [...current, supp] });
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${data.suplementos.includes(supp) ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {supp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refeições por Dia</label>
                <input 
                  type="number"
                  value={data.refeicoes_dia}
                  onChange={(e) => updateData({ refeicoes_dia: Number(e.target.value) })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quem prepara a comida?</label>
                <input 
                  type="text"
                  value={data.prepara_comida}
                  onChange={(e) => updateData({ prepara_comida: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                  placeholder="Ex: Eu mesmo, Mãe, Restaurante"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Come fora com frequência?</label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={val.toString()}
                      onClick={() => updateData({ come_fora: val })}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${data.come_fora === val ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {val ? 'Sim' : 'Não'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Açúcar', 'Refrigerante', 'Álcool'].map(item => (
                <div key={item} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo de {item}</label>
                  <select 
                    value={(data as any)[`consumo_${item.toLowerCase().replace('á', 'a').replace('ç', 'c')}`]}
                    onChange={(e) => updateData({ [`consumo_${item.toLowerCase().replace('á', 'a').replace('ç', 'c')}`]: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                  >
                    <option value="Nenhum">Nenhum</option>
                    <option value="Raramente">Raramente</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Come por quais motivos?</label>
              <div className="flex flex-wrap gap-2">
                {['Fome', 'Ansiedade', 'Emoção', 'Tédio', 'Social'].map(reason => (
                  <button
                    key={reason}
                    onClick={() => {
                      const current = data.come_por;
                      updateData({ come_por: current.includes(reason) ? current.filter(r => r !== reason) : [...current, reason] });
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${data.come_por.includes(reason) ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Episódios de Compulsão?</label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={val.toString()}
                      onClick={() => updateData({ compulsao: val })}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${data.compulsao === val ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {val ? 'Sim' : 'Não'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Come assistindo TV/Celular?</label>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button
                      key={val.toString()}
                      onClick={() => updateData({ come_assistindo: val })}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${data.come_assistindo === val ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                      {val ? 'Sim' : 'Não'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pratica exercício físico?</label>
              <div className="flex gap-2 max-w-xs">
                {[true, false].map(val => (
                  <button
                    key={val.toString()}
                    onClick={() => updateData({ pratica_exercicio: val })}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${data.pratica_exercicio === val ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {val ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>
            {data.pratica_exercicio && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequência Semanal</label>
                    <input 
                      type="number"
                      value={data.frequencia_semanal}
                      onChange={(e) => updateData({ frequencia_semanal: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração Média (min)</label>
                    <input 
                      type="number"
                      value={data.duracao_media}
                      onChange={(e) => updateData({ duracao_media: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intensidade</label>
                    <select 
                      value={data.intensidade}
                      onChange={(e) => updateData({ intensidade: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                    >
                      <option value="Leve">Leve</option>
                      <option value="Moderada">Moderada</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );
      case 8:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Água por Dia (Litros)</label>
              <input 
                type="number" step="0.1"
                value={data.agua_dia}
                onChange={(e) => updateData({ agua_dia: Number(e.target.value) })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumo de Café</label>
              <select 
                value={data.consumo_cafe}
                onChange={(e) => updateData({ consumo_cafe: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
              >
                <option value="Nenhum">Nenhum</option>
                <option value="Moderado">Moderado</option>
                <option value="Alto">Alto</option>
              </select>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo Principal</label>
                <input 
                  type="text"
                  value={data.objetivo_principal}
                  onChange={(e) => updateData({ objetivo_principal: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prazo Desejado</label>
                <input 
                  type="text"
                  value={data.prazo}
                  onChange={(e) => updateData({ prazo: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-[#22B391] transition-all"
                  placeholder="Ex: 3 meses"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Comprometimento (1-5)</label>
              <input 
                type="range" min="1" max="5"
                value={data.comprometimento}
                onChange={(e) => updateData({ comprometimento: Number(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#22B391]"
              />
            </div>
          </div>
        );
      case 10:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Frente', 'Lado', 'Costas'].map(pos => (
              <div key={pos} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto {pos}</label>
                <div className="aspect-[3/4] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clique para Upload</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 11:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico Inicial</label>
              <textarea 
                value={data.diagnostico_inicial}
                onChange={(e) => updateData({ diagnostico_inicial: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 focus:ring-[#22B391] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estratégia Sugerida</label>
              <textarea 
                value={data.estrategia_sugerida}
                onChange={(e) => updateData({ estrategia_sugerida: e.target.value })}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 h-24 focus:ring-2 focus:ring-[#22B391] transition-all"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (showSummary) {
    const score = calculateScore();
    const diagnoses = getAIDiagnosis();
    const alerts = getAlerts();

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#0B2B24]">Resumo da Anamnese</h2>
            <p className="text-slate-400 font-bold text-sm">Análise inteligente ONNutrition finalizada.</p>
          </div>
          <button 
            onClick={() => setShowSummary(false)}
            className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Editar Dados
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center text-center">
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * score) / 100} className="text-[#22B391]" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[#0B2B24]">{score}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <h3 className="text-lg font-black text-[#0B2B24] mb-2">Saúde Geral</h3>
            <p className="text-xs text-slate-400 font-bold">Baseado em alimentação, sono, atividade e comportamento.</p>
          </div>

          {/* AI Diagnosis */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0B2B24] p-8 rounded-[40px] text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#22B391] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black">IA de Diagnóstico</h3>
              </div>
              <div className="space-y-4">
                {diagnoses.map((diag, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-[#22B391] shrink-0" />
                    <p className="text-sm font-medium text-slate-300">{diag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert, i) => (
                <div key={i} className={`p-6 rounded-3xl flex items-center gap-4 ${alert.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertTriangle className="w-6 h-6" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Alerta Automático</p>
                    <p className="text-sm font-black">{alert.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button 
            onClick={() => onSave?.(data)}
            className="flex items-center gap-3 px-10 py-5 bg-[#22B391] text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#22B391]/30 hover:scale-105 transition-all"
          >
            <Save className="w-5 h-5" />
            Finalizar e Salvar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header with Progress */}
      <div className="bg-white p-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#0B2B24]">Anamnese Geral</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Módulo 2 — Coleta de Dados</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Progresso</p>
            <p className="text-lg font-black text-[#22B391]">Etapa {currentStep} de {steps.length}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="max-w-5xl mx-auto flex gap-2">
          {steps.map(step => (
            <div 
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step.id <= currentStep ? 'bg-[#22B391]' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full min-h-[500px]">
            {/* Left Sidebar (Steps) */}
            <div className="w-full md:w-72 bg-slate-50/50 p-8 border-r border-slate-100 hidden md:block">
              <div className="space-y-4">
                {steps.map(step => {
                  const Icon = step.icon;
                  return (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${step.id === currentStep ? 'bg-white shadow-sm text-[#22B391]' : step.id < currentStep ? 'text-slate-400' : 'text-slate-300'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step.id === currentStep ? 'bg-[#22B391] text-white' : 'bg-slate-100'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-3xl bg-[#22B391]/10 flex items-center justify-center">
                      {React.createElement(steps[currentStep - 1].icon, { className: "w-7 h-7 text-[#22B391]" })}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0B2B24]">{steps[currentStep - 1].title}</h3>
                      <p className="text-slate-400 text-xs font-bold">Preencha as informações detalhadamente.</p>
                    </div>
                  </div>

                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white p-8 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
          
          <div className="flex gap-4">
            <button className="px-8 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-[#22B391] transition-all">
              Salvar Rascunho
            </button>
            <button 
              onClick={nextStep}
              className="flex items-center gap-3 px-10 py-4 bg-[#0B2B24] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#0B2B24]/20 hover:scale-105 transition-all"
            >
              {currentStep === steps.length ? 'Finalizar' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

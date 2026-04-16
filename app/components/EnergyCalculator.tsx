'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  User, 
  Activity, 
  Target, 
  AlertTriangle, 
  Brain, 
  Save, 
  RefreshCw,
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  LayoutDashboard,
  PlusCircle,
  Settings,
  PieChart as PieChartIcon,
  History,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calculator,
  Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { subscribeToCollection, addDocument } from '@/app/lib/firestore-utils';
import { db } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface EnergyCalculatorProps {
  patientId: string;
  patientName?: string;
  onGeneratePlan?: () => void;
}

type Sex = 'Masculino' | 'Feminino';
type Goal = 'Emagrecimento' | 'Manutenção' | 'Hipertrofia';
type ActivityLevel = 'Sedentário' | 'Leve' | 'Moderado' | 'Intenso' | 'Muito intenso';
type Formula = 'Mifflin-St Jeor' | 'Harris-Benedict';
type Strategy = 'Déficit leve' | 'Déficit moderado' | 'Superávit controlado' | 'Ciclagem de carboidrato';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  'Sedentário': 1.2,
  'Leve': 1.375,
  'Moderado': 1.55,
  'Intenso': 1.725,
  'Muito intenso': 1.9
};

const STRATEGY_ADJUSTMENTS: Record<Strategy, number> = {
  'Déficit leve': -300,
  'Déficit moderado': -500,
  'Superávit controlado': 300,
  'Ciclagem de carboidrato': 0 
};

interface CalculationEntry {
  id?: string;
  date: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  goal: Goal;
  strategy: Strategy;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  params: {
    weight: number;
    height: number;
    age: number;
    sex: Sex;
    activityLevel: ActivityLevel;
    formula: Formula;
  };
}

export default function EnergyCalculator({ patientId, patientName, onGeneratePlan }: EnergyCalculatorProps) {
  const [activeSubTab, setActiveSubTab] = useState<'resumo' | 'novo' | 'parametros' | 'objetivo' | 'macros' | 'historico' | 'ia'>('resumo');
  
  // Input State
  const [sex, setSex] = useState<Sex>('Masculino');
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(80);
  const [height, setHeight] = useState<number>(175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('Moderado');
  const [goal, setGoal] = useState<Goal>('Emagrecimento');
  const [strategy, setStrategy] = useState<Strategy>('Déficit moderado');
  const [formula, setFormula] = useState<Formula>('Mifflin-St Jeor');
  const [proteinPerKg, setProteinPerKg] = useState<number>(2.0);
  const [fatPercentage, setFatPercentage] = useState<number>(25);
  
  // Data State
  const [history, setHistory] = useState<CalculationEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const populateMockData = async () => {
    if (!patientId) return;
    
    const mockHistory: Omit<CalculationEntry, 'id'>[] = [
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        bmr: 1850,
        tdee: 2867,
        targetCalories: 2367,
        goal: 'Emagrecimento',
        strategy: 'Déficit moderado',
        macros: { protein: 160, carbs: 250, fat: 81, proteinPct: 27, carbsPct: 42, fatPct: 31 },
        params: { weight: 85, height: 175, age: 30, sex: 'Masculino', activityLevel: 'Moderado', formula: 'Mifflin-St Jeor' }
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        bmr: 1820,
        tdee: 2821,
        targetCalories: 2321,
        goal: 'Emagrecimento',
        strategy: 'Déficit moderado',
        macros: { protein: 156, carbs: 245, fat: 79, proteinPct: 27, carbsPct: 42, fatPct: 31 },
        params: { weight: 82.5, height: 175, age: 30, sex: 'Masculino', activityLevel: 'Moderado', formula: 'Mifflin-St Jeor' }
      },
      {
        date: new Date().toISOString(),
        bmr: 1800,
        tdee: 2790,
        targetCalories: 2290,
        goal: 'Emagrecimento',
        strategy: 'Déficit moderado',
        macros: { protein: 152, carbs: 240, fat: 78, proteinPct: 27, carbsPct: 42, fatPct: 31 },
        params: { weight: 80, height: 175, age: 30, sex: 'Masculino', activityLevel: 'Moderado', formula: 'Mifflin-St Jeor' }
      }
    ];

    for (const entry of mockHistory) {
      await addDocument(`patients/${patientId}/energy_calculations`, entry);
    }
  };

  // Load History and Latest Anthropometry
  useEffect(() => {
    const unsubscribe = subscribeToCollection<CalculationEntry>(
      `patients/${patientId}/energy_calculations`,
      (data) => setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      [orderBy('date', 'desc')]
    );

    const fetchLatestMetrics = async () => {
      try {
        const q = query(
          collection(db, `patients/${patientId}/anthropometry`),
          orderBy('date', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const latest = snapshot.docs[0].data();
          if (latest.weight) setWeight(latest.weight);
          if (latest.height) setHeight(latest.height * (latest.height < 3 ? 100 : 1)); 
        }
      } catch (err) {
        console.warn('Could not fetch latest anthropometry:', err);
      }
    };

    fetchLatestMetrics();
    return () => unsubscribe();
  }, [patientId]);

  // Calculations
  const results = useMemo(() => {
    let bmr = 0;
    if (formula === 'Mifflin-St Jeor') {
      bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr += (sex === 'Masculino' ? 5 : -161);
    } else {
      if (sex === 'Masculino') {
        bmr = 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
      } else {
        bmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
      }
    }

    const tdee = bmr * ACTIVITY_FACTORS[activityLevel];
    
    let adjustment = STRATEGY_ADJUSTMENTS[strategy];
    if (goal === 'Manutenção') adjustment = 0;
    if (goal === 'Hipertrofia' && adjustment < 0) adjustment = 300;
    if (goal === 'Emagrecimento' && adjustment > 0) adjustment = -500;

    const targetCalories = tdee + adjustment;

    const proteinGrams = weight * proteinPerKg;
    const proteinCalories = proteinGrams * 4;
    const fatCalories = targetCalories * (fatPercentage / 100);
    const fatGrams = fatCalories / 9;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = Math.max(0, carbCalories / 4);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinGrams: Math.round(proteinGrams),
      proteinCalories: Math.round(proteinCalories),
      fatGrams: Math.round(fatGrams),
      fatCalories: Math.round(fatCalories),
      carbGrams: Math.round(carbGrams),
      carbCalories: Math.round(carbCalories),
      proteinPct: Math.round((proteinCalories / targetCalories) * 100),
      fatPct: Math.round((fatCalories / targetCalories) * 100),
      carbPct: Math.round((carbCalories / targetCalories) * 100)
    };
  }, [sex, age, weight, height, activityLevel, goal, strategy, formula, proteinPerKg, fatPercentage]);

  // Alerts
  const alerts = useMemo(() => {
    const list = [];
    if (results.targetCalories < 1200) list.push({ type: 'error', message: 'Calorias muito baixas (< 1200 kcal). Risco de redução metabólica e deficiências.' });
    if (proteinPerKg < 1.6) list.push({ type: 'warning', message: 'Proteína abaixo do recomendado para preservação de massa magra (1.6g/kg).' });
    if (goal === 'Emagrecimento' && (results.tdee - results.targetCalories) > 700) list.push({ type: 'error', message: 'Déficit agressivo detectado. Considere uma abordagem mais moderada.' });
    if (fatPercentage < 20) list.push({ type: 'warning', message: 'Gordura abaixo de 20%. Pode impactar a produção hormonal.' });
    return list;
  }, [results, proteinPerKg, goal, fatPercentage]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry: Omit<CalculationEntry, 'id'> = {
        date: new Date().toISOString(),
        bmr: results.bmr,
        tdee: results.tdee,
        targetCalories: results.targetCalories,
        goal,
        strategy,
        macros: {
          protein: results.proteinGrams,
          carbs: results.carbGrams,
          fat: results.fatGrams,
          proteinPct: results.proteinPct,
          carbsPct: results.carbPct,
          fatPct: results.fatPct
        },
        params: {
          weight,
          height,
          age,
          sex,
          activityLevel,
          formula
        }
      };
      await addDocument(`patients/${patientId}/energy_calculations`, entry);
      setActiveSubTab('resumo');
    } catch (error) {
      console.error('Error saving calculation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getAiInsight = async () => {
    setIsLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise estrategicamente os dados nutricionais deste paciente:
        Paciente: ${sex}, ${age} anos, ${weight}kg, ${height}cm.
        Nível de Atividade: ${activityLevel}. Objetivo: ${goal}. Estratégia: ${strategy}.
        TMB: ${results.bmr} kcal. GET: ${results.tdee} kcal. Alvo: ${results.targetCalories} kcal.
        Macros: P:${results.proteinGrams}g (${results.proteinPct}%), C:${results.carbGrams}g (${results.carbPct}%), G:${results.fatGrams}g (${results.fatPct}%).
        
        Forneça:
        1. Avaliação da viabilidade da estratégia.
        2. Sugestão de divisão de refeições (ex: 4 ou 5 refeições).
        3. Previsão estimada de perda/ganho de peso semanal.
        4. Um "pulo do gato" nutricional para este caso específico.
        Responda em português, tom profissional e direto.`,
      });
      setAiInsight(response.text);
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      setAiInsight("Não foi possível gerar a análise da IA agora.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const chartData = [
    { name: 'Proteína', value: results.proteinPct, color: '#3b82f6' },
    { name: 'Carboidrato', value: results.carbPct, color: '#10b981' },
    { name: 'Gordura', value: results.fatPct, color: '#f59e0b' },
  ];

  const subMenuItems = [
    { id: 'resumo', label: 'Resumo do cálculo', icon: LayoutDashboard },
    { id: 'novo', label: 'Novo cálculo', icon: PlusCircle },
    { id: 'parametros', label: 'Parâmetros', icon: Settings },
    { id: 'objetivo', label: 'Objetivo e estratégia', icon: Target },
    { id: 'macros', label: 'Distribuição de macros', icon: PieChartIcon },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'ia', label: 'Análise inteligente (IA)', icon: Sparkles },
  ];

  return (
    <div className="flex h-full bg-[#F8FAFC] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl">
      {/* Module Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 space-y-2">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="font-black text-[#0B2B24] text-sm uppercase tracking-widest">Cálculo Energético</h2>
        </div>
        {subMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === item.id 
                ? 'bg-[#22B391] text-white shadow-lg shadow-emerald-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeSubTab === item.id ? 'text-white' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={populateMockData}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-[#22B391] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Dados de Exemplo
          </button>
        </div>
      </aside>

      {/* Module Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <AnimatePresence mode="wait">
          {activeSubTab === 'resumo' && (
            <motion.div 
              key="resumo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest">Paciente</span>
                    <span className="text-sm font-bold text-slate-500">{patientName}</span>
                  </div>
                  <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Resumo Energético</h1>
                  <p className="text-slate-400 font-medium text-sm">Visão geral das necessidades e metas calóricas.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveSubTab('novo')}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recalcular
                  </button>
                  <button 
                    onClick={onGeneratePlan}
                    className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1C9A7D] transition-all shadow-xl shadow-emerald-200 flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Gerar Plano
                  </button>
                </div>
              </div>

              {/* Main Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TMB</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0B2B24]">{results.bmr}</span>
                    <span className="text-[10px] font-bold text-slate-400">kcal/dia</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">GET</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#0B2B24]">{results.tdee}</span>
                    <span className="text-[10px] font-bold text-slate-400">kcal/dia</span>
                  </div>
                </div>
                <div className="bg-[#0B2B24] p-6 rounded-[2rem] shadow-xl shadow-slate-900/20 text-white">
                  <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-2">Calorias Alvo</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{results.targetCalories}</span>
                    <span className="text-[10px] font-bold text-emerald-400/60">kcal/dia</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Macros (g)</p>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <p className="text-xs font-black text-blue-600">{results.proteinGrams}g</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Prot</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-emerald-600">{results.carbGrams}g</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Carb</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-amber-600">{results.fatGrams}g</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Gord</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-[#0B2B24] mb-6 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-[#22B391]" />
                    Distribuição Calórica
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Meta Calórica</span>
                      <span>{results.targetCalories} kcal</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${results.proteinPct}%` }} className="h-full bg-blue-500" />
                      <div style={{ width: `${results.carbPct}%` }} className="h-full bg-emerald-500" />
                      <div style={{ width: `${results.fatPct}%` }} className="h-full bg-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Alerts & Strategy */}
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-[#0B2B24] mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Alertas Estratégicos
                    </h3>
                    <div className="space-y-3">
                      {alerts.length > 0 ? (
                        alerts.map((alert, idx) => (
                          <div key={idx} className={`p-4 rounded-2xl flex items-start gap-3 border ${
                            alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}>
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="text-xs font-bold">{alert.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4" />
                          <p className="text-xs font-bold">Plano nutricional equilibrado e seguro.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0B2B24] p-8 rounded-[2.5rem] text-white">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#22B391]" />
                      Objetivo Atual
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{goal}</p>
                        <p className="text-sm font-bold text-[#22B391]">{strategy}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ajuste</p>
                        <p className="text-sm font-black">{STRATEGY_ADJUSTMENTS[strategy]} kcal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'novo' && (
            <motion.div 
              key="novo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-[#0B2B24] tracking-tight">Novo Cálculo Energético</h1>
                <p className="text-slate-400 font-medium">Configure os parâmetros para uma nova prescrição.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-black text-lg text-[#0B2B24] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#22B391]" />
                    Dados do Paciente
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sexo</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Masculino', 'Feminino'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSex(s as Sex)}
                            className={`py-3 rounded-xl font-bold text-sm transition-all ${
                              sex === s ? 'bg-[#22B391] text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Idade</label>
                      <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-[#22B391]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Peso (kg)</label>
                      <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-[#22B391]" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Altura (cm)</label>
                      <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-[#22B391]" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-4">
                    <h3 className="font-black text-lg text-[#0B2B24] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#22B391]" />
                      Atividade
                    </h3>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nível de Atividade</label>
                      <select 
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                        className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-[#22B391]"
                      >
                        {Object.keys(ACTIVITY_FACTORS).map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview & Save */}
                <div className="space-y-8">
                  <div className="bg-[#0B2B24] p-8 rounded-[2.5rem] text-white shadow-2xl">
                    <h3 className="font-black text-xl mb-8">Prévia do Cálculo</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">TMB Estimada</span>
                        <span className="text-xl font-black text-[#22B391]">{results.bmr} kcal</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">GET Estimado</span>
                        <span className="text-xl font-black text-[#22B391]">{results.tdee} kcal</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Calorias Alvo</span>
                        <span className="text-3xl font-black text-white">{results.targetCalories} kcal</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-6 bg-[#22B391] text-white rounded-[2rem] font-black text-lg hover:bg-[#1C9A7D] transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Salvar e Aplicar Cálculo
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'parametros' && (
            <motion.div 
              key="parametros"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <h2 className="text-2xl font-black text-[#0B2B24]">Parâmetros de Cálculo</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Fórmula de TMB</label>
                    <div className="space-y-3">
                      {[
                        { id: 'Mifflin-St Jeor', desc: 'Padrão ouro atual para indivíduos saudáveis e obesos.' },
                        { id: 'Harris-Benedict', desc: 'Fórmula clássica, tende a superestimar em alguns casos.' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFormula(f.id as Formula)}
                          className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${
                            formula === f.id 
                              ? 'border-[#22B391] bg-emerald-50' 
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-[#0B2B24]">{f.id}</span>
                            {formula === f.id && <CheckCircle2 className="w-5 h-5 text-[#22B391]" />}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'objetivo' && (
            <motion.div 
              key="objetivo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-[#0B2B24]">Objetivo Principal</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {['Emagrecimento', 'Manutenção', 'Hipertrofia'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGoal(g as Goal)}
                        className={`p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                          goal === g ? 'border-[#22B391] bg-emerald-50' : 'border-slate-50 hover:border-slate-100'
                        }`}
                      >
                        <span className="font-black text-sm">{g}</span>
                        {goal === g && <CheckCircle2 className="w-5 h-5 text-[#22B391]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-[#0B2B24]">Estratégia Nutricional</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.keys(STRATEGY_ADJUSTMENTS).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStrategy(s as Strategy)}
                        className={`p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                          strategy === s ? 'border-[#22B391] bg-emerald-50' : 'border-slate-50 hover:border-slate-100'
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm">{s}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {STRATEGY_ADJUSTMENTS[s as Strategy] > 0 ? '+' : ''}{STRATEGY_ADJUSTMENTS[s as Strategy]} kcal/dia
                          </p>
                        </div>
                        {strategy === s && <CheckCircle2 className="w-5 h-5 text-[#22B391]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'macros' && (
            <motion.div 
              key="macros"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-[#0B2B24]">Distribuição de Macronutrientes</h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#22B391] rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Configuração Inteligente
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* Controls */}
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Proteína (g/kg)</label>
                      <input 
                        type="range" 
                        min="1.2" 
                        max="3.0" 
                        step="0.1" 
                        value={proteinPerKg} 
                        onChange={e => setProteinPerKg(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#22B391]"
                      />
                      <div className="flex justify-between mt-2 text-xs font-black text-[#22B391]">
                        <span>1.2g</span>
                        <span>{proteinPerKg}g/kg</span>
                        <span>3.0g</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Gordura (%)</label>
                      <input 
                        type="range" 
                        min="15" 
                        max="40" 
                        step="1" 
                        value={fatPercentage} 
                        onChange={e => setFatPercentage(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#22B391]"
                      />
                      <div className="flex justify-between mt-2 text-xs font-black text-[#22B391]">
                        <span>15%</span>
                        <span>{fatPercentage}%</span>
                        <span>40%</span>
                      </div>
                    </div>
                  </div>

                  {/* Visuals */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Proteína', g: results.proteinGrams, kcal: results.proteinCalories, pct: results.proteinPct, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Carboidrato', g: results.carbGrams, kcal: results.carbCalories, pct: results.carbPct, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Gordura', g: results.fatGrams, kcal: results.fatCalories, pct: results.fatPct, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((m) => (
                      <div key={m.label} className={`${m.bg} p-6 rounded-3xl border border-slate-100 text-center space-y-2`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${m.color}`}>{m.label}</p>
                        <p className="text-3xl font-black text-[#0B2B24]">{m.g}g</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.kcal} kcal • {m.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'historico' && (
            <motion.div 
              key="historico"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black text-[#0B2B24]">Histórico de Cálculos</h2>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">TMB/GET</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alvo</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Macros (P/C/G)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-900">{new Date(entry.date).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-[#0B2B24]">{entry.params.weight} kg</td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-600">{entry.bmr} / {entry.tdee}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">kcal</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-[#0B2B24] text-white rounded-full text-xs font-black">{entry.targetCalories} kcal</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-[#22B391] uppercase tracking-widest">{entry.goal}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{entry.strategy}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-2">
                            <span className="text-[10px] font-black text-blue-600">{entry.macros.protein}g</span>
                            <span className="text-[10px] font-black text-emerald-600">{entry.macros.carbs}g</span>
                            <span className="text-[10px] font-black text-amber-600">{entry.macros.fat}g</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <p className="text-slate-400 font-medium">Nenhum cálculo registrado ainda.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'ia' && (
            <motion.div 
              key="ia"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-[#0B2B24] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Brain className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#22B391] rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black tracking-tight">IA Nutricional</h2>
                        <p className="text-emerald-400/60 font-bold uppercase tracking-widest text-xs">Análise Estratégica Avançada</p>
                      </div>
                    </div>
                    <button 
                      onClick={getAiInsight}
                      disabled={isLoadingAi}
                      className="px-8 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1C9A7D] transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      {isLoadingAi ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Gerar Análise
                    </button>
                  </div>

                  <div className="min-h-[300px] bg-white/5 rounded-[2rem] border border-white/10 p-8">
                    {isLoadingAi ? (
                      <div className="space-y-6">
                        <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-white/10 rounded-full w-5/6 animate-pulse" />
                        <div className="h-4 bg-white/10 rounded-full w-4/6 animate-pulse" />
                        <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" />
                        <div className="h-4 bg-white/10 rounded-full w-3/6 animate-pulse" />
                      </div>
                    ) : aiInsight ? (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-lg leading-relaxed text-emerald-50/90 font-medium whitespace-pre-wrap">
                          {aiInsight}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                          <Brain className="w-10 h-10" />
                        </div>
                        <p className="text-white/40 font-bold max-w-sm">A nossa IA analisa todos os parâmetros calculados para sugerir a melhor estratégia de adesão e resultados.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <h4 className="font-black text-sm mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#22B391]" />
                        Previsão de Resultado
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed">Com base no déficit de {results.tdee - results.targetCalories} kcal, a perda estimada é de ~{( (results.tdee - results.targetCalories) * 7 / 7700 ).toFixed(2)} kg por semana.</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <h4 className="font-black text-sm mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[#22B391]" />
                        Sugestão de Divisão
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed">Para {results.targetCalories} kcal, sugerimos 4 refeições principais de ~{Math.round(results.targetCalories/4)} kcal cada.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  ShoppingCart, 
  RefreshCw, 
  Zap, 
  Brain, 
  Clock,
  MoreVertical,
  Search,
  Trash2,
  Edit2,
  FileText,
  Share2,
  ChevronDown,
  ChevronUp,
  Info,
  Flame,
  Dna,
  Wheat,
  Droplets,
  Settings,
  MessageSquare,
  ClipboardList,
  Scale,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { db } from '@/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  substitutions?: string[];
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: Food[];
  notes?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  name: string;
  date: string;
  status: 'active' | 'draft' | 'archived';
  objective: string;
  type: 'Low Carb' | 'Hipercalórica' | 'Cetogênica' | 'Balanceada' | 'Personalizada';
  targetCalories: number;
  targetMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  observations: string;
  hydrationGoal: number; // ml/day
}

import AutomaticMealPlanIA from './AutomaticMealPlanIA';

interface PrescriptionDieteticaProps {
  patientId: string;
  patientName: string;
  targetCalories?: number;
  targetMacros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  initialTab?: 'plano' | 'criar' | 'estrategia' | 'substituicoes' | 'distribuicao' | 'orientacoes' | 'ia';
}

const PrescriptionDietetica: React.FC<PrescriptionDieteticaProps> = ({ 
  patientId, 
  patientName,
  targetCalories = 2000,
  targetMacros = { protein: 150, carbs: 200, fats: 60 },
  initialTab = 'plano'
}) => {
  const [activeTab, setActiveTab] = useState<'plano' | 'criar' | 'estrategia' | 'substituicoes' | 'distribuicao' | 'orientacoes' | 'ia'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [energyData, setEnergyData] = useState<{ targetCalories: number; targetMacros: { protein: number; carbs: number; fats: number } } | null>(null);

  // Fetch latest energy calculation
  useEffect(() => {
    const q = query(
      collection(db, `patients/${patientId}/energy_calculations`),
      orderBy('date', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();
        setEnergyData({
          targetCalories: latest.targetCalories,
          targetMacros: {
            protein: latest.macros.protein,
            carbs: latest.macros.carbs,
            fats: latest.macros.fat
          }
        });
      }
    });

    return () => unsubscribe();
  }, [patientId]);

  const currentCalories = energyData?.targetCalories || targetCalories;
  const currentMacros = energyData?.targetMacros || targetMacros;

  const populateMockData = async () => {
    const mockPrescription: Prescription = {
      id: `presc-${Date.now()}`,
      patientId,
      name: 'Plano Alimentar - Exemplo',
      date: new Date().toISOString(),
      status: 'active',
      objective: 'Emagrecimento e Definição',
      type: 'Low Carb',
      targetCalories: 1800,
      targetMacros: { protein: 150, carbs: 100, fats: 80 },
      hydrationGoal: 3000,
      observations: 'Focar em proteínas de alto valor biológico e vegetais verdes escuros.',
      meals: [
        {
          id: 'm1',
          name: 'Café da Manhã',
          time: '08:00',
          foods: [
            { id: 'f1', name: 'Ovos Mexidos', quantity: 3, unit: 'unid', calories: 210, protein: 18, carbs: 2, fats: 15 },
            { id: 'f2', name: 'Abacate', quantity: 100, unit: 'g', calories: 160, protein: 2, carbs: 9, fats: 15 },
          ]
        },
        {
          id: 'm2',
          name: 'Almoço',
          time: '12:30',
          foods: [
            { id: 'f3', name: 'Salmão Grelhado', quantity: 150, unit: 'g', calories: 310, protein: 35, carbs: 0, fats: 18 },
            { id: 'f4', name: 'Brócolis no Vapor', quantity: 200, unit: 'g', calories: 70, protein: 5, carbs: 12, fats: 0 },
          ]
        },
        {
          id: 'm3',
          name: 'Jantar',
          time: '19:30',
          foods: [
            { id: 'f5', name: 'Peito de Frango', quantity: 150, unit: 'g', calories: 240, protein: 45, carbs: 0, fats: 5 },
            { id: 'f6', name: 'Salada Mix', quantity: 1, unit: 'prato', calories: 50, protein: 2, carbs: 10, fats: 0 },
          ]
        }
      ]
    };

    try {
      await addDoc(collection(db, 'patients', patientId, 'prescriptions'), {
        ...mockPrescription,
        createdAt: serverTimestamp()
      });
      setPrescriptions([mockPrescription, ...prescriptions]);
      setActivePrescription(mockPrescription);
    } catch (error) {
      console.error("Error saving mock prescription:", error);
    }
  };

  const handleSaveAIPlan = (plan: any) => {
    // Transform AI plan to Prescription format
    const newPrescription: Prescription = {
      id: `presc-${Date.now()}`,
      patientId,
      name: `Plano IA - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      status: 'active',
      objective: 'Gerado por IA',
      type: 'Personalizada',
      targetCalories: currentCalories,
      targetMacros: currentMacros,
      hydrationGoal: 3000,
      observations: 'Plano gerado automaticamente por Inteligência Artificial.',
      meals: plan.meals.map((m: any, idx: number) => ({
        id: `m-${idx}`,
        name: m.name,
        time: m.time,
        foods: m.foods.map((f: any, fIdx: number) => ({
          id: `f-${idx}-${fIdx}`,
          ...f
        }))
      }))
    };

    setPrescriptions([newPrescription, ...prescriptions]);
    setActivePrescription(newPrescription);
    setActiveTab('plano');
  };

  // Mock initial data if none found
  useEffect(() => {
    // In a real app, we'd fetch from Firestore
    const mockPrescription: Prescription = {
      id: 'presc-1',
      patientId,
      name: 'Plano Alimentar - Fase 1',
      date: new Date().toISOString(),
      status: 'active',
      objective: 'Hipertrofia',
      type: 'Balanceada',
      targetCalories: 2800,
      targetMacros: { protein: 180, carbs: 350, fats: 80 },
      hydrationGoal: 3500,
      observations: 'Priorizar alimentos integrais e hidratação constante.',
      meals: [
        {
          id: 'm1',
          name: 'Café da Manhã',
          time: '07:30',
          foods: [
            { id: 'f1', name: 'Ovo Mexido', quantity: 3, unit: 'unid', calories: 210, protein: 18, carbs: 2, fats: 15 },
            { id: 'f2', name: 'Pão Integral', quantity: 2, unit: 'fatias', calories: 140, protein: 6, carbs: 24, fats: 2 },
          ]
        },
        {
          id: 'm2',
          name: 'Almoço',
          time: '12:30',
          foods: [
            { id: 'f3', name: 'Frango Grelhado', quantity: 150, unit: 'g', calories: 240, protein: 45, carbs: 0, fats: 5 },
            { id: 'f4', name: 'Arroz Integral', quantity: 200, unit: 'g', calories: 220, protein: 5, carbs: 45, fats: 2 },
          ]
        }
      ]
    };
    setPrescriptions([mockPrescription]);
    setActivePrescription(mockPrescription);
  }, [patientId]);

  const totals = useMemo(() => {
    if (!activePrescription) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return activePrescription.meals.reduce((acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fats += food.fats;
      });
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [activePrescription]);

  const sidebarItems = [
    { id: 'plano', label: 'Plano Alimentar', icon: ClipboardList },
    { id: 'criar', label: 'Criar Prescrição', icon: Plus },
    { id: 'estrategia', label: 'Estratégia Nutricional', icon: Settings },
    { id: 'substituicoes', label: 'Substituições', icon: RefreshCw },
    { id: 'distribuicao', label: 'Distribuição', icon: PieChart },
    { id: 'orientacoes', label: 'Orientações', icon: Info },
    { id: 'ia', label: 'IA de Prescrição', icon: Brain },
  ];

  const renderPlanoAlimentar = () => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#22B391]/10 rounded-2xl flex items-center justify-center text-[#22B391]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-[#0B2B24]">{patientName}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Objetivo: {activePrescription?.objective}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-sm font-black text-[#0B2B24]">{activePrescription?.targetCalories} kcal</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calorias Alvo</p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="text-center">
            <p className="text-sm font-black text-[#22B391]">{totals.calories} kcal</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calorias Prescritas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 gap-6">
        {activePrescription?.meals.map((meal, idx) => (
          <motion.div 
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0B2B24]">
                  {meal.name.toLowerCase().includes('café') ? <Flame className="w-6 h-6 text-orange-400" /> : 
                   meal.name.toLowerCase().includes('almoço') ? <Utensils className="w-6 h-6 text-blue-400" /> :
                   <Clock className="w-6 h-6 text-emerald-400" />}
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0B2B24]">{meal.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{meal.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-[#0B2B24]">{meal.foods.reduce((s, f) => s + f.calories, 0)} kcal</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alimento</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medida</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prot</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Carb</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gord</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Kcal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {meal.foods.map((food) => (
                    <tr key={food.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-4 font-bold text-slate-700">{food.name}</td>
                      <td className="py-4 font-black text-[#0B2B24]">{food.quantity}</td>
                      <td className="py-4 text-sm font-bold text-slate-400">{food.unit}</td>
                      <td className="py-4 text-sm font-bold text-blue-500">{food.protein}g</td>
                      <td className="py-4 text-sm font-bold text-emerald-500">{food.carbs}g</td>
                      <td className="py-4 text-sm font-bold text-orange-500">{food.fats}g</td>
                      <td className="py-4 text-sm font-black text-[#0B2B24] text-right">{food.calories}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderCriarPrescricao = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#22B391]/10 rounded-2xl flex items-center justify-center text-[#22B391]">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#0B2B24]">Nova Prescrição</h3>
            <p className="text-slate-400 font-medium">Configure a base da dieta do paciente.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Plano</label>
            <input type="text" placeholder="Ex: Fase de Cutting" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Dieta</label>
            <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-slate-600">
              <option>Balanceada</option>
              <option>Low Carb</option>
              <option>Cetogênica</option>
              <option>Hipercalórica</option>
              <option>Jejum Intermitente</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nº de Refeições/Dia</label>
            <input type="number" defaultValue={5} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Meta de Hidratação (ml)</label>
            <input type="number" defaultValue={3000} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold" />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <button className="w-full py-5 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20 flex items-center justify-center gap-3">
            <Zap className="w-5 h-5" />
            Iniciar Estrutura do Plano
          </button>
        </div>
      </div>
    </div>
  );

  const renderIA = () => (
    <div className="space-y-8">
      <AutomaticMealPlanIA 
        patientId={patientId}
        patientName={patientName}
        targetCalories={currentCalories}
        targetMacros={currentMacros}
        onSave={handleSaveAIPlan}
      />
    </div>
  );

  const renderEstrategia = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0B2B24]">Estratégia Nutricional</h2>
          <p className="text-slate-400 font-medium">Defina a abordagem para este período.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Dieta</label>
          <div className="grid grid-cols-1 gap-2">
            {['Low Carb', 'Hipercalórica', 'Cetogênica', 'Balanceada', 'Jejum Intermitente'].map(type => (
              <button key={type} className={`p-4 rounded-2xl text-left border-2 transition-all font-bold text-sm ${activePrescription?.type === type ? 'border-[#22B391] bg-emerald-50 text-[#22B391]' : 'border-slate-50 hover:border-slate-100 text-slate-600'}`}>
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-[#0B2B24] text-sm mb-4 uppercase tracking-widest">Metas Atuais</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Calorias</span>
                <span className="text-sm font-black text-[#0B2B24]">{currentCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Proteína</span>
                <span className="text-sm font-black text-blue-600">{currentMacros.protein}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Carboidrato</span>
                <span className="text-sm font-black text-emerald-600">{currentMacros.carbs}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Gordura</span>
                <span className="text-sm font-black text-amber-600">{currentMacros.fats}g</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-[#0B2B24] rounded-3xl text-white">
            <h4 className="font-black text-emerald-400 text-sm mb-2 uppercase tracking-widest">Observações Estratégicas</h4>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-medium text-white/80 focus:outline-none focus:border-emerald-500/50 min-h-[120px]"
              placeholder="Digite aqui as orientações estratégicas..."
              defaultValue={activePrescription?.observations}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubstituicoes = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0B2B24]">Lista de Substituições</h2>
            <p className="text-slate-400 font-medium">Gerencie equivalências alimentares.</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Lista
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Proteínas', 'Carboidratos', 'Gorduras', 'Vegetais A', 'Vegetais B', 'Frutas'].map(group => (
          <div key={group} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-[#22B391]/30 transition-all">
            <h4 className="font-black text-[#0B2B24] text-sm mb-4 uppercase tracking-widest flex items-center justify-between">
              {group}
              <span className="text-[10px] bg-white px-2 py-1 rounded-lg text-slate-400">10 itens</span>
            </h4>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                  <span>Alimento Exemplo {i}</span>
                  <span className="text-slate-300">100g</span>
                </div>
              ))}
              <button className="w-full py-2 text-[10px] font-black text-[#22B391] uppercase tracking-widest hover:underline">Ver todos</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDistribuicao = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <PieChartIcon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0B2B24]">Distribuição por Refeições</h2>
          <p className="text-slate-400 font-medium">Equilíbrio nutricional ao longo do dia.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activePrescription?.meals.map(m => ({
              name: m.name,
              kcal: m.foods.reduce((sum, f) => sum + f.calories, 0)
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="kcal" fill="#22B391" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <h4 className="font-black text-[#0B2B24] text-sm uppercase tracking-widest mb-4">Resumo Calórico</h4>
          {activePrescription?.meals.map(m => {
            const kcal = m.foods.reduce((sum, f) => sum + f.calories, 0);
            const pct = Math.round((kcal / totals.calories) * 100);
            return (
              <div key={m.id} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{m.name}</span>
                  <span className="text-[#0B2B24]">{kcal} kcal ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div style={{ width: `${pct}%` }} className="h-full bg-[#22B391]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOrientacoes = () => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Info className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0B2B24]">Orientações e Observações</h2>
            <p className="text-slate-400 font-medium">Instruções personalizadas para o paciente.</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <h4 className="font-black text-[#0B2B24] text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Hidratação
            </h4>
            <p className="text-sm font-bold text-slate-600 mb-4">Meta diária: {activePrescription?.hydrationGoal}ml</p>
            <ul className="space-y-2">
              {['Beber 500ml ao acordar', 'Utilizar garrafa de 1L para controle', 'Adicionar limão ou hortelã se desejar'].map(t => (
                <li key={t} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <h4 className="font-black text-[#0B2B24] text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              Comportamento Alimentar
            </h4>
            <ul className="space-y-3">
              {[
                'Mastigar bem os alimentos (mínimo 20 vezes)',
                'Evitar telas durante as refeições',
                'Realizar as refeições em ambiente tranquilo'
              ].map(t => (
                <li key={t} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-8 bg-[#0B2B24] rounded-[2.5rem] text-white flex flex-col">
          <h4 className="font-black text-emerald-400 text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Orientações Gerais
          </h4>
          <textarea 
            className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium text-white/80 focus:outline-none focus:border-emerald-500/50 min-h-[300px]"
            placeholder="Digite aqui as orientações gerais para o paciente..."
            defaultValue={activePrescription?.observations}
          />
          <button className="mt-6 w-full py-4 bg-[#22B391] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1C9A7D] transition-all">
            Salvar Orientações
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[800px]">
      {/* Sub-navigation Sidebar */}
      <div className="lg:w-72 shrink-0">
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-8">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-sm transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#22B391] text-white shadow-lg shadow-[#22B391]/20' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-300'}`} />
                {item.label}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-slate-50 px-2">
              <button 
                onClick={populateMockData}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-[#22B391] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Dados de Exemplo
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 px-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status da Dieta</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">Plano Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'plano' && renderPlanoAlimentar()}
            {activeTab === 'criar' && renderCriarPrescricao()}
            {activeTab === 'ia' && renderIA()}
            {activeTab === 'estrategia' && renderEstrategia()}
            {activeTab === 'substituicoes' && renderSubstituicoes()}
            {activeTab === 'distribuicao' && renderDistribuicao()}
            {activeTab === 'orientacoes' && renderOrientacoes()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const User = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default PrescriptionDietetica;

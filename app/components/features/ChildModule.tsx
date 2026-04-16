'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Baby, 
  Scale, 
  Ruler, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Brain,
  Calendar,
  ChevronRight,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Activity,
  Heart,
  Smile,
  Frown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ChildProfile {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string;
  sex: 'male' | 'female';
  created_at: string;
}

interface GrowthRecord {
  id: string;
  child_id: string;
  measurement_date: string;
  weight_kg: number;
  height_cm: number;
  head_circumference_cm?: number;
  imi?: number;
  percentile_weight_age?: number;
  percentile_height_age?: number;
  percentile_imc_age?: number;
  classification?: string;
  notes?: string;
  created_at?: string;
}

interface ChildDiet {
  id: string;
  child_id: string;
  diet_type: string;
  feeding_frequency: string;
  breastfeeding: boolean;
  introduced_foods: string[];
  restrictions: string[];
  meals: any;
  nutritional_targets: any;
  status: string;
}

interface ChildModuleProps {
  parentId: string;
  nutritionistId?: string;
}

const REFERENCE_DATA = {
  male: {
    '0-3': { weightP5: 2.5, weightP50: 4.3, weightP95: 6.0, heightP5: 46.3, heightP50: 54.7, heightP95: 63.0 },
    '3-6': { weightP5: 5.0, weightP50: 6.4, weightP95: 8.0, heightP5: 56.2, heightP50: 61.4, heightP95: 66.6 },
    '6-12': { weightP5: 6.5, weightP50: 8.0, weightP95: 10.0, heightP5: 63.6, heightP50: 69.0, heightP95: 74.4 },
    '12-24': { weightP5: 8.5, weightP50: 10.5, weightP95: 13.0, heightP5: 71.3, heightP50: 77.5, heightP95: 83.7 },
    '24-36': { weightP5: 10.5, weightP50: 12.5, weightP95: 15.5, heightP5: 80.0, heightP50: 86.5, heightP95: 93.0 },
    '36-48': { weightP5: 12.0, weightP50: 14.5, weightP95: 18.0, heightP5: 86.5, heightP50: 93.5, heightP95: 100.5 },
    '48-60': { weightP5: 13.5, weightP50: 16.0, weightP95: 20.0, heightP5: 92.0, heightP50: 99.5, heightP95: 107.0 },
  },
  female: {
    '0-3': { weightP5: 2.4, weightP50: 4.0, weightP95: 5.5, heightP5: 45.6, heightP50: 53.7, heightP95: 61.8 },
    '3-6': { weightP5: 4.5, weightP50: 5.8, weightP95: 7.5, heightP5: 54.5, heightP50: 59.8, heightP95: 65.1 },
    '6-12': { weightP5: 6.0, weightP50: 7.5, weightP95: 9.5, heightP5: 62.0, heightP50: 67.3, heightP95: 72.6 },
    '12-24': { weightP5: 8.0, weightP50: 10.0, weightP95: 12.5, heightP5: 70.0, heightP50: 76.0, heightP95: 82.0 },
    '24-36': { weightP5: 10.0, weightP50: 12.0, weightP95: 15.0, heightP5: 79.0, heightP50: 85.0, heightP95: 91.0 },
    '36-48': { weightP5: 11.5, weightP50: 14.0, weightP95: 17.5, heightP5: 85.5, heightP50: 92.0, heightP95: 98.5 },
    '48-60': { weightP5: 13.0, weightP50: 15.5, weightP95: 19.5, heightP5: 91.0, heightP50: 98.0, heightP95: 105.0 },
  }
};

const getAgeInMonths = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
};

const getAgeRange = (months: number): string => {
  if (months < 3) return '0-3';
  if (months < 6) return '3-6';
  if (months < 12) return '6-12';
  if (months < 24) return '12-24';
  if (months < 36) return '24-36';
  if (months < 48) return '36-48';
  return '48-60';
};

const calculatePercentile = (value: number, p5: number, p50: number, p95: number): number => {
  if (value <= p5) return 5;
  if (value >= p95) return 95;
  if (value <= p50) return 5 + ((value - p5) / (p50 - p5)) * 45;
  return 50 + ((value - p50) / (p95 - p50)) * 45;
};

const classifyGrowth = (weightP: number, heightP: number, imiP: number): string => {
  const avgP = (weightP + heightP + imiP) / 3;
  if (avgP < 3) return 'Baixo Peso';
  if (avgP < 15) return 'Risco de Baixo Peso';
  if (avgP <= 85) return 'Adequado';
  if (avgP <= 97) return 'Sobrepeso';
  return 'Obesidade';
};

const calculateIMC = (weight: number, height: number): number => {
  return (weight / Math.pow(height / 100, 2));
};

export default function ChildModule({ parentId, nutritionistId }: ChildModuleProps) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [diets, setDiets] = useState<ChildDiet[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'growth' | 'diet' | 'ai'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddGrowth, setShowAddGrowth] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [newChild, setNewChild] = useState({
    name: '',
    birth_date: '',
    sex: 'male' as 'male' | 'female'
  });

  const [newGrowth, setNewGrowth] = useState({
    measurement_date: new Date().toISOString().split('T')[0],
    weight_kg: 0,
    height_cm: 0,
    head_circumference_cm: 0,
    notes: ''
  });

  const fetchChildren = useCallback(async () => {
    try {
      if (!isSupabaseConfigured) {
        setChildren(getMockChildren());
        return;
      }
      
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', parentId);
      
      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren(getMockChildren());
    }
  }, [parentId]);

  const fetchGrowthRecords = useCallback(async (childId: string) => {
    try {
      if (!isSupabaseConfigured) {
        setGrowthRecords(getMockGrowthRecords(childId));
        return;
      }
      
      const { data, error } = await supabase
        .from('child_growth')
        .select('*')
        .eq('child_id', childId)
        .order('measurement_date', { ascending: false });
      
      if (error) throw error;
      setGrowthRecords(data || []);
    } catch (error) {
      console.error('Error fetching growth records:', error);
      setGrowthRecords(getMockGrowthRecords(childId));
    }
  }, []);

  const fetchDiets = useCallback(async (childId: string) => {
    try {
      if (!isSupabaseConfigured) {
        setDiets(getMockDiets(childId));
        return;
      }
      
      const { data, error } = await supabase
        .from('child_diet')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDiets(data || []);
    } catch (error) {
      console.error('Error fetching diets:', error);
      setDiets(getMockDiets(childId));
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchChildren();
      setIsLoading(false);
    };
    loadData();
  }, [fetchChildren]);

  useEffect(() => {
    if (selectedChild) {
      fetchGrowthRecords(selectedChild.id);
      fetchDiets(selectedChild.id);
    }
  }, [selectedChild, fetchGrowthRecords, fetchDiets]);

  const handleAddChild = async () => {
    try {
      if (!isSupabaseConfigured) {
        const mockChild: ChildProfile = {
          id: Math.random().toString(36).substr(2, 9),
          parent_id: parentId,
          ...newChild,
          created_at: new Date().toISOString()
        };
        setChildren(prev => [...prev, mockChild]);
        setSelectedChild(mockChild);
        setShowAddChild(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('child_profiles')
        .insert({ ...newChild, parent_id: parentId })
        .select()
        .single();
      
      if (error) throw error;
      setChildren(prev => [...prev, data]);
      setSelectedChild(data);
      setShowAddChild(false);
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  const handleAddGrowth = async () => {
    if (!selectedChild) return;
    
    const months = getAgeInMonths(selectedChild.birth_date);
    const ageRange = getAgeRange(months);
    const refData = REFERENCE_DATA[selectedChild.sex][ageRange];
    
    const imi = calculateIMC(newGrowth.weight_kg, newGrowth.height_cm);
    const weightP = calculatePercentile(newGrowth.weight_kg, refData.weightP5, refData.weightP50, refData.weightP95);
    const heightP = calculatePercentile(newGrowth.height_cm, refData.heightP5, refData.heightP50, refData.heightP95);
    const imiP = calculatePercentile(imi, 10, 15, 25);
    const classification = classifyGrowth(weightP, heightP, imiP);
    
    const growthData = {
      ...newGrowth,
      imi,
      percentile_weight_age: weightP,
      percentile_height_age: heightP,
      percentile_imc_age: imiP,
      classification
    };
    
    try {
      if (!isSupabaseConfigured) {
        const mockRecord: GrowthRecord = {
          id: Math.random().toString(36).substr(2, 9),
          child_id: selectedChild.id,
          ...growthData,
          created_at: new Date().toISOString()
        };
        setGrowthRecords(prev => [mockRecord, ...prev]);
        setShowAddGrowth(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('child_growth')
        .insert({ ...growthData, child_id: selectedChild.id })
        .select()
        .single();
      
      if (error) throw error;
      setGrowthRecords(prev => [data, ...prev]);
      setShowAddGrowth(false);
    } catch (error) {
      console.error('Error adding growth record:', error);
    }
  };

  const generateChildDiet = async () => {
    if (!selectedChild) return;
    
    setIsGeneratingAI(true);
    
    try {
      const months = getAgeInMonths(selectedChild.birth_date);
      const lastGrowth = growthRecords[0];
      
      const dietPlan = getAIChildDiet(months, selectedChild.sex, lastGrowth);
      
      if (!isSupabaseConfigured) {
        const mockDiet: ChildDiet = {
          id: Math.random().toString(36).substr(2, 9),
          child_id: selectedChild.id,
          diet_type: dietPlan.diet_type,
          feeding_frequency: dietPlan.feeding_frequency,
          breastfeeding: dietPlan.breastfeeding,
          introduced_foods: dietPlan.introduced_foods,
          restrictions: [],
          meals: dietPlan.meals,
          nutritional_targets: dietPlan.nutritional_targets,
          status: 'active'
        };
        setDiets(prev => [mockDiet, ...prev]);
        setIsGeneratingAI(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('child_diet')
        .insert({
          child_id: selectedChild.id,
          nutritionist_id: nutritionistId,
          ...dietPlan,
          start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      
      if (error) throw error;
      setDiets(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error generating diet:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateGrowthAnalysis = async () => {
    if (!selectedChild || growthRecords.length === 0) return;
    
    setIsGeneratingAI(true);
    
    setTimeout(() => {
      setIsGeneratingAI(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-[#22B391] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22B391] to-[#1C9A7D] rounded-2xl flex items-center justify-center">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0B2B24]">Módulo Infantil</h2>
            <p className="text-sm text-slate-500 font-bold">Nutrição Pediátrica</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddChild(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#22B391] text-white rounded-xl font-bold text-sm hover:bg-[#1C9A7D] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Filho
        </button>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Baby className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-[#0B2B24] mb-2">Nenhuma criança cadastrada</h3>
          <p className="text-slate-400 text-sm font-bold mb-6">Adicione seu primeiro filho para começar o acompanhamento.</p>
          <button
            onClick={() => setShowAddChild(true)}
            className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-colors"
          >
            Cadastrar Primeira Criança
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                  selectedChild?.id === child.id
                    ? 'bg-[#22B391] text-white'
                    : 'bg-white border border-slate-200 text-[#0B2B24] hover:border-[#22B391]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedChild?.id === child.id ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {child.sex === 'male' ? '👦' : '👧'}
                </div>
                <span className="font-bold text-sm">{child.name}</span>
                <span className="text-xs opacity-70">
                  {getAgeInMonths(child.birth_date)}m
                </span>
              </button>
            ))}
          </div>

          {selectedChild && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#22B391]" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Idade</span>
                  </div>
                  <p className="text-2xl font-black text-[#0B2B24]">
                    {getAgeInMonths(selectedChild.birth_date)} meses
                  </p>
                </div>
                
                {growthRecords[0] && (
                  <>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-[#22B391]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Peso</span>
                      </div>
                      <p className="text-2xl font-black text-[#0B2B24]">
                        {growthRecords[0].weight_kg} kg
                      </p>
                      <p className={`text-xs font-bold ${
                        growthRecords[0].percentile_weight_age! > 50 ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        P{growthRecords[0].percentile_weight_age?.toFixed(0)}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-[#22B391]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Altura</span>
                      </div>
                      <p className="text-2xl font-black text-[#0B2B24]">
                        {growthRecords[0].height_cm} cm
                      </p>
                      <p className={`text-xs font-bold ${
                        growthRecords[0].percentile_height_age! > 50 ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        P{growthRecords[0].percentile_height_age?.toFixed(0)}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-[#22B391]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Classificação</span>
                      </div>
                      <p className={`text-lg font-black ${
                        growthRecords[0].classification?.includes('Adequado') ? 'text-emerald-500' :
                        growthRecords[0].classification?.includes('Obesidade') ? 'text-rose-500' :
                        'text-amber-500'
                      }`}>
                        {growthRecords[0].classification}
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        IMC: {growthRecords[0].imi?.toFixed(1)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl">
                {(['profile', 'growth', 'diet', 'ai'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                      activeTab === tab
                        ? 'bg-white text-[#0B2B24] shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'profile' && 'Perfil'}
                    {tab === 'growth' && 'Crescimento'}
                    {tab === 'diet' && 'Alimentação'}
                    {tab === 'ai' && 'IA'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-3xl border border-slate-100 p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-black text-[#0B2B24]">Informações Pessoais</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome</label>
                            <p className="text-sm font-bold text-[#0B2B24]">{selectedChild.name}</p>
                          </div>
                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Sexo</label>
                            <p className="text-sm font-bold text-[#0B2B24]">{selectedChild.sex === 'male' ? 'Masculino' : 'Feminino'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</label>
                            <p className="text-sm font-bold text-[#0B2B24]">
                              {new Date(selectedChild.birth_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Idade</label>
                            <p className="text-sm font-bold text-[#0B2B24]">{getAgeInMonths(selectedChild.birth_date)} meses</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-black text-[#0B2B24]">Resumo de Crescimento</h3>
                        {growthRecords.length > 0 ? (
                          <div className="space-y-2">
                            {growthRecords.slice(0, 3).map((record) => (
                              <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold text-slate-400">
                                  {new Date(record.measurement_date).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-sm font-black text-[#0B2B24]">
                                  {record.weight_kg}kg / {record.height_cm}cm
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  record.classification?.includes('Adequado') ? 'bg-emerald-100 text-emerald-600' :
                                  record.classification?.includes('Obesidade') ? 'bg-rose-100 text-rose-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  {record.classification}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">Nenhum registro de crescimento.</p>
                        )}
                        <button
                          onClick={() => setShowAddGrowth(true)}
                          className="flex items-center gap-2 text-sm font-bold text-[#22B391]"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Medida
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'growth' && (
                  <motion.div
                    key="growth"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowAddGrowth(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#22B391] text-white rounded-xl font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Nova Medida
                      </button>
                    </div>
                    
                    {growthRecords.length > 0 && (
                      <div className="bg-white rounded-3xl border border-slate-100 p-6">
                        <h3 className="text-lg font-black text-[#0B2B24] mb-4">Curva de Crescimento</h3>
                        <div className="h-64 flex items-end justify-around gap-4 border-b border-slate-200 pb-4">
                          {growthRecords.slice(0, 10).reverse().map((record, index) => (
                            <div key={record.id} className="flex flex-col items-center gap-2">
                              <div 
                                className="w-8 rounded-t-lg transition-all"
                                style={{
                                  height: `${(record.percentile_weight_age || 50) * 2}px`,
                                  backgroundColor: record.percentile_weight_age! > 85 ? '#22B391' :
                                    record.percentile_weight_age! < 15 ? '#F59E0B' : '#64748B'
                                }}
                              />
                              <span className="text-xs font-bold text-slate-400">
                                {new Date(record.measurement_date).toLocaleDateString('dd/MM')}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#22B391]" />
                            <span className="text-xs font-bold text-slate-500">Adequado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                            <span className="text-xs font-bold text-slate-500">Risco</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white rounded-3xl border border-slate-100 p-6">
                      <h3 className="text-lg font-black text-[#0B2B24] mb-4">Histórico de Medidas</h3>
                      <div className="space-y-3">
                        {growthRecords.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <div>
                              <p className="text-sm font-bold text-[#0B2B24]">
                                {new Date(record.measurement_date).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-slate-400">
                                Peso: {record.weight_kg}kg • Altura: {record.height_cm}cm • IMC: {record.imi?.toFixed(1)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-black px-3 py-1 rounded-full ${
                                record.classification?.includes('Adequado') ? 'bg-emerald-100 text-emerald-600' :
                                record.classification?.includes('Obesidade') ? 'bg-rose-100 text-rose-600' :
                                'bg-amber-100 text-amber-600'
                              }`}>
                                {record.classification}
                              </span>
                              <p className="text-xs text-slate-400 mt-1">
                                P{record.percentile_weight_age?.toFixed(0)} / P{record.percentile_height_age?.toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'diet' && (
                  <motion.div
                    key="diet"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-end">
                      <button
                        onClick={generateChildDiet}
                        disabled={isGeneratingAI}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#22B391] to-[#1C9A7D] text-white rounded-xl font-bold text-sm disabled:opacity-50"
                      >
                        {isGeneratingAI ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4" />
                        )}
                        Gerar Plano com IA
                      </button>
                    </div>
                    
                    {diets.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-[#0B2B24] mb-2">Nenhum plano alimentar</h3>
                        <p className="text-sm text-slate-400">Gere um plano personalizado com IA.</p>
                      </div>
                    ) : (
                      diets.map((diet) => (
                        <div key={diet.id} className="bg-white rounded-3xl border border-slate-100 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-black text-[#0B2B24]">{diet.diet_type}</h3>
                              <p className="text-sm text-slate-400">{diet.feeding_frequency}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              diet.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {diet.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          {diet.meals && (
                            <div className="space-y-3">
                              {Object.entries(diet.meals).map(([mealName, mealData]: [string, any]) => (
                                <div key={mealName} className="p-4 bg-slate-50 rounded-2xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-black text-[#0B2B24]">{mealName}</h4>
                                    <span className="text-xs font-bold text-slate-400">{mealData.time}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {mealData.foods?.map((food: any, idx: number) => (
                                      <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-slate-600">{food.name}</span>
                                        <span className="text-slate-400">{food.quantity}{food.unit} • {food.calories}kcal</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <button
                      onClick={generateChildDiet}
                      disabled={isGeneratingAI}
                      className="p-6 bg-gradient-to-br from-[#22B391]/10 to-[#1C9A7D]/10 rounded-3xl border border-[#22B391]/20 hover:border-[#22B391]/40 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-[#22B391] rounded-2xl flex items-center justify-center mb-4">
                        <Utensils className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-[#0B2B24] mb-2">Gerar Plano Alimentar</h3>
                      <p className="text-sm text-slate-500">Crie um plano personalizado baseado na idade e necessidades da criança.</p>
                    </button>
                    
                    <button
                      onClick={generateGrowthAnalysis}
                      disabled={isGeneratingAI || growthRecords.length === 0}
                      className="p-6 bg-gradient-to-br from-[#22B391]/10 to-[#1C9A7D]/10 rounded-3xl border border-[#22B391]/20 hover:border-[#22B391]/40 transition-all text-left disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-[#22B391] rounded-2xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-[#0B2B24] mb-2">Análise de Crescimento</h3>
                      <p className="text-sm text-slate-500">Receba insights e recomendações baseadas no histórico de crescimento.</p>
                    </button>
                    
                    <button
                      className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-3xl border border-purple-500/20 hover:border-purple-500/40 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-[#0B2B24] mb-2">Recomendações Nutricionais</h3>
                      <p className="text-sm text-slate-500">Sugestões de alimentos e suplementos conforme a fase de desenvolvimento.</p>
                    </button>
                    
                    <button
                      className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl border border-blue-500/20 hover:border-blue-500/40 transition-all text-left"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-[#0B2B24] mb-2">Alertas de Risco</h3>
                      <p className="text-sm text-slate-500">Identifique precocemente sinais de risco nutricional ou de desenvolvimento.</p>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAddChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-black text-[#0B2B24] mb-6">Adicionar Filho</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome</label>
                  <input
                    type="text"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                    placeholder="Nome da criança"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newChild.birth_date}
                    onChange={(e) => setNewChild({ ...newChild, birth_date: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Sexo</label>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewChild({ ...newChild, sex: 'male' })}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        newChild.sex === 'male' ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      👦 Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChild({ ...newChild, sex: 'female' })}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        newChild.sex === 'female' ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      👧 Feminino
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddChild(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddChild}
                  className="flex-1 py-3 bg-[#22B391] text-white rounded-xl font-bold text-sm"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddGrowth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-black text-[#0B2B24] mb-6">Adicionar Medida</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data da Medida</label>
                  <input
                    type="date"
                    value={newGrowth.measurement_date}
                    onChange={(e) => setNewGrowth({ ...newGrowth, measurement_date: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGrowth.weight_kg}
                    onChange={(e) => setNewGrowth({ ...newGrowth, weight_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Altura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGrowth.height_cm}
                    onChange={(e) => setNewGrowth({ ...newGrowth, height_cm: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Circunferência Craneana (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGrowth.head_circumference_cm}
                    onChange={(e) => setNewGrowth({ ...newGrowth, head_circumference_cm: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Observações</label>
                  <textarea
                    value={newGrowth.notes}
                    onChange={(e) => setNewGrowth({ ...newGrowth, notes: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl mt-1"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddGrowth(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddGrowth}
                  className="flex-1 py-3 bg-[#22B391] text-white rounded-xl font-bold text-sm"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getMockChildren(): ChildProfile[] {
  return [
    {
      id: 'child-1',
      parent_id: 'user-1',
      name: 'Pedro',
      birth_date: '2023-01-15',
      sex: 'male',
      created_at: '2024-01-01'
    }
  ];
}

function getMockGrowthRecords(childId: string): GrowthRecord[] {
  return [
    {
      id: 'growth-1',
      child_id: childId,
      measurement_date: '2024-03-01',
      weight_kg: 14.5,
      height_cm: 92,
      head_circumference_cm: 48,
      imi: 17.1,
      percentile_weight_age: 50,
      percentile_height_age: 50,
      percentile_imc_age: 50,
      classification: 'Adequado'
    },
    {
      id: 'growth-2',
      child_id: childId,
      measurement_date: '2024-02-01',
      weight_kg: 13.8,
      height_cm: 89,
      imi: 17.4,
      percentile_weight_age: 45,
      percentile_height_age: 45,
      percentile_imc_age: 55,
      classification: 'Adequado'
    },
    {
      id: 'growth-3',
      child_id: childId,
      measurement_date: '2024-01-01',
      weight_kg: 13.0,
      height_cm: 86,
      imi: 17.6,
      percentile_weight_age: 40,
      percentile_height_age: 40,
      percentile_imc_age: 60,
      classification: 'Adequado'
    }
  ];
}

function getMockDiets(childId: string): ChildDiet[] {
  return [
    {
      id: 'diet-1',
      child_id: childId,
      diet_type: 'Dietinha Controlada',
      feeding_frequency: '5 refeições/dia',
      breastfeeding: false,
      introduced_foods: ['Arroz', 'Feijão', 'Frango', 'Legumes', 'Frutas'],
      restrictions: [],
      meals: {
        'Café da Manhã': { time: '07:00', foods: [{ name: 'Leite com aveia', quantity: 200, unit: 'ml', calories: 180 }] },
        'Lanche da Manhã': { time: '09:30', foods: [{ name: 'Banana', quantity: 1, unit: 'un', calories: 90 }] },
        'Almoço': { time: '12:00', foods: [{ name: 'Arroz', quantity: 50, unit: 'g', calories: 65 }, { name: 'Feijão', quantity: 50, unit: 'g', calories: 40 }, { name: 'Frango', quantity: 80, unit: 'g', calories: 130 }] },
        'Lanche da Tarde': { time: '15:30', foods: [{ name: 'Iogurte', quantity: 1, unit: 'un', calories: 80 }] },
        'Jantar': { time: '18:30', foods: [{ name: 'Sopa de legumes', quantity: 200, unit: 'ml', calories: 120 }] }
      },
      nutritional_targets: { calories: 1000, protein: 30, carbs: 120, fat: 35 },
      status: 'active'
    }
  ];
}

function getAIChildDiet(months: number, sex: 'male' | 'female', lastGrowth?: GrowthRecord): Partial<ChildDiet> {
  const calories = months < 12 ? 800 : months < 24 ? 1000 : months < 36 ? 1200 : 1400;
  
  const mealPlans = {
    under12: {
      'Café da Manhã': { time: '07:00', foods: [{ name: 'Leite materno ou fórmula', quantity: 150, unit: 'ml', calories: 100, protein: 3, carbs: 12, fat: 4 }] },
      'Lanche da Manhã': { time: '09:30', foods: [{ name: 'Fruta amassada', quantity: 50, unit: 'g', calories: 40, protein: 0, carbs: 10, fat: 0 }] },
      'Almoço': { time: '12:00', foods: [{ name: 'Papinha de legumes', quantity: 100, unit: 'g', calories: 60, protein: 2, carbs: 8, fat: 2 }] },
      'Lanche da Tarde': { time: '15:30', foods: [{ name: 'Leite', quantity: 100, unit: 'ml', calories: 70, protein: 3, carbs: 10, fat: 3 }] },
      'Jantar': { time: '18:30', foods: [{ name: 'Papinha de frutas', quantity: 80, unit: 'g', calories: 50, protein: 0, carbs: 12, fat: 0 }] }
    },
    '12-24': {
      'Café da Manhã': { time: '07:00', foods: [{ name: 'Leite', quantity: 200, unit: 'ml', calories: 130, protein: 6, carbs: 15, fat: 5 }, { name: 'Pão', quantity: 1, unit: 'fatia', calories: 80, protein: 3, carbs: 15, fat: 1 }] },
      'Lanche da Manhã': { time: '09:30', foods: [{ name: 'Banana', quantity: 1, unit: 'un', calories: 90, protein: 1, carbs: 23, fat: 0 }] },
      'Almoço': { time: '12:00', foods: [{ name: 'Arroz', quantity: 50, unit: 'g', calories: 65, protein: 1, carbs: 14, fat: 0 }, { name: 'Feijão', quantity: 40, unit: 'g', calories: 40, protein: 3, carbs: 7, fat: 0 }, { name: 'Frango', quantity: 60, unit: 'g', calories: 100, protein: 18, carbs: 0, fat: 2 }] },
      'Lanche da Tarde': { time: '15:30', foods: [{ name: 'Biscoito infantil', quantity: 2, unit: 'un', calories: 80, protein: 1, carbs: 12, fat: 3 }] },
      'Jantar': { time: '18:30', foods: [{ name: 'Macarrão', quantity: 60, unit: 'g', calories: 100, protein: 3, carbs: 20, fat: 1 }, { name: 'Legumes', quantity: 40, unit: 'g', calories: 15, protein: 1, carbs: 3, fat: 0 }] }
    },
    '24-36': {
      'Café da Manhã': { time: '07:00', foods: [{ name: 'Leite', quantity: 200, unit: 'ml', calories: 130, protein: 6, carbs: 15, fat: 5 }, { name: 'Ovo', quantity: 1, unit: 'un', calories: 70, protein: 6, carbs: 0, fat: 5 }] },
      'Lanche da Manhã': { time: '09:30', foods: [{ name: 'Maçã', quantity: 1, unit: 'un', calories: 80, protein: 0, carbs: 20, fat: 0 }] },
      'Almoço': { time: '12:00', foods: [{ name: 'Arroz', quantity: 60, unit: 'g', calories: 80, protein: 2, carbs: 18, fat: 0 }, { name: 'Feijão', quantity: 50, unit: 'g', calories: 50, protein: 4, carbs: 9, fat: 0 }, { name: 'Carne', quantity: 70, unit: 'g', calories: 120, protein: 22, carbs: 0, fat: 4 }, { name: 'Legumes', quantity: 50, unit: 'g', calories: 20, protein: 1, carbs: 4, fat: 0 }] },
      'Lanche da Tarde': { time: '15:30', foods: [{ name: 'Iogurte', quantity: 1, unit: 'un', calories: 80, protein: 4, carbs: 10, fat: 2 }] },
      'Jantar': { time: '18:30', foods: [{ name: 'Sopa', quantity: 200, unit: 'ml', calories: 100, protein: 5, carbs: 12, fat: 3 }, { name: 'Pão', quantity: 1, unit: 'fatia', calories: 80, protein: 3, carbs: 15, fat: 1 }] }
    }
  };

  let mealPlan;
  if (months < 12) mealPlan = mealPlans.under12;
  else if (months < 24) mealPlan = mealPlans['12-24'];
  else mealPlan = mealPlans['24-36'];

  return {
    diet_type: 'Alimentação Complementar',
    feeding_frequency: '5 refeições por dia',
    breastfeeding: months < 6,
    introduced_foods: ['Cereais', 'Leguminosas', 'Carnes', 'Frutas', 'Legumes', 'Laticínios'],
    meals: mealPlan,
    nutritional_targets: { calories, protein: Math.round(calories * 0.15 / 4), carbs: Math.round(calories * 0.50 / 4), fat: Math.round(calories * 0.35 / 9) }
  };
}
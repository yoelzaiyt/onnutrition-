'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  Flame,
  Dna,
  Wheat,
  Droplets,
  Settings,
  History,
  Sparkles,
  Utensils,
  Plus,
  Trash2,
  Save,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDietPlan } from '@/lib/gemini';

interface AutomaticMealPlanIAProps {
  patientId: string;
  patientName: string;
  targetCalories?: number;
  targetMacros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  onSave?: (plan: any) => void;
}

const AutomaticMealPlanIA: React.FC<AutomaticMealPlanIAProps> = ({ 
  patientId, 
  patientName,
  targetCalories = 2000,
  targetMacros = { protein: 150, carbs: 200, fats: 60 },
  onSave
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [step, setStep] = useState<'config' | 'generating' | 'result'>('config');
  const [preferences, setPreferences] = useState({
    mealsCount: 5,
    dietType: 'Balanceada',
    restrictions: '',
    preferences: ''
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep('generating');
    
    try {
      const result = await generateDietPlan({
        patientName,
        objective: preferences.dietType,
        targetCalories,
        macros: targetMacros,
        restrictions: preferences.restrictions,
        preferences: preferences.preferences,
        mealsCount: preferences.mealsCount
      });
      
      if (result.meals) {
        setGeneratedPlan(result);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (error) {
      console.error("Erro ao gerar plano com IA:", error);
      // Fallback to mock data if AI fails
      const mockPlan = {
        meals: [
          {
            name: 'Café da Manhã (Fallback)',
            time: '07:30',
            foods: [
              { name: 'Ovos Mexidos', quantity: 2, unit: 'unid', calories: 140, protein: 12, carbs: 1, fats: 10 },
            ]
          }
        ]
      };
      setGeneratedPlan(mockPlan);
    } finally {
      setIsGenerating(false);
      setStep('result');
    }
  };

  const renderConfig = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#22B391]/10 rounded-3xl flex items-center justify-center text-[#22B391]">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#0B2B24]">Gerador de Plano Automático</h3>
            <p className="text-slate-400 font-medium">Configure as preferências para a nossa IA gerar a dieta perfeita.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Parâmetros de Entrada</h4>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Calorias Alvo</span>
                <span className="text-sm font-black text-[#0B2B24]">{targetCalories} kcal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Proteínas</span>
                <span className="text-sm font-black text-blue-500">{targetMacros.protein}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Carboidratos</span>
                <span className="text-sm font-black text-emerald-500">{targetMacros.carbs}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Gorduras</span>
                <span className="text-sm font-black text-orange-500">{targetMacros.fats}g</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Preferências do Paciente</h4>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nº de Refeições</label>
                <select 
                  value={preferences.mealsCount}
                  onChange={(e) => setPreferences({...preferences, mealsCount: parseInt(e.target.value)})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-slate-600"
                >
                  <option value={3}>3 refeições</option>
                  <option value={4}>4 refeições</option>
                  <option value={5}>5 refeições</option>
                  <option value={6}>6 refeições</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Dieta</label>
                <select 
                  value={preferences.dietType}
                  onChange={(e) => setPreferences({...preferences, dietType: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold text-slate-600"
                >
                  <option>Balanceada</option>
                  <option>Low Carb</option>
                  <option>Cetogênica</option>
                  <option>Vegetariana</option>
                  <option>Vegana</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Restrições ou Alergias</label>
          <textarea 
            value={preferences.restrictions}
            onChange={(e) => setPreferences({...preferences, restrictions: e.target.value})}
            placeholder="Ex: Intolerância a lactose, não gosta de coentro..."
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold min-h-[100px]"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Preferências Adicionais</label>
          <textarea 
            value={preferences.preferences}
            onChange={(e) => setPreferences({...preferences, preferences: e.target.value})}
            placeholder="Ex: Prefere alimentos frescos, gosta de variar o café da manhã..."
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold min-h-[100px]"
          />
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full py-6 bg-[#22B391] text-white rounded-3xl font-black text-lg hover:bg-[#1C9A7D] transition-all shadow-2xl shadow-[#22B391]/40 flex items-center justify-center gap-4 group"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          Gerar Plano Alimentar com IA
        </button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 border-4 border-[#22B391]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[#22B391] rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-12 h-12 text-[#22B391] animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-[#0B2B24]">Nossa IA está trabalhando...</h3>
        <p className="text-slate-400 font-medium">Analisando macros, micronutrientes e preferências para criar a melhor estratégia para {patientName}.</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#22B391] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#22B391] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#22B391] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Calculando equivalências calóricas</span>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setStep('config')}
            className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-[#22B391] transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-2xl font-black text-[#0B2B24]">Plano Gerado com Sucesso</h3>
            <p className="text-slate-400 font-medium">Revise e ajuste as sugestões da IA antes de salvar.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerate}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
          >
            Gerar Outra Versão
          </button>
          <button 
            onClick={() => onSave && onSave(generatedPlan)}
            className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar e Aplicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {generatedPlan?.meals.map((meal: any, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0B2B24]">
                  <Utensils className="w-6 h-6 text-[#22B391]" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#0B2B24]">{meal.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{meal.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4">
                  <p className="text-sm font-black text-[#0B2B24]">{meal.foods.reduce((s: any, f: any) => s + f.calories, 0)} kcal</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Refeição</p>
                </div>
                <button className="p-2 text-slate-300 hover:text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {meal.foods.map((food: any, fIdx: number) => (
                <div key={fIdx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#22B391]" />
                    <div>
                      <p className="font-bold text-slate-700">{food.name}</p>
                      <p className="text-xs font-bold text-slate-400">{food.quantity}{food.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-4">
                      <span className="text-[10px] font-bold text-blue-500">{food.protein}g P</span>
                      <span className="text-[10px] font-bold text-emerald-500">{food.carbs}g C</span>
                      <span className="text-[10px] font-bold text-orange-500">{food.fats}g G</span>
                    </div>
                    <span className="text-sm font-black text-[#0B2B24]">{food.calories} kcal</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 font-black text-xs uppercase tracking-widest hover:border-[#22B391] hover:text-[#22B391] transition-all">
                + Adicionar Alimento
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-[600px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'config' && renderConfig()}
          {step === 'generating' && renderGenerating()}
          {step === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AutomaticMealPlanIA;

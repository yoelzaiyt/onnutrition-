'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Clock, 
  Info, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  UtensilsCrossed,
  FileText
} from 'lucide-react';
import { MealPlanSection, MealPlan } from './mealPlan.types';
import { mealPlanService } from './mealPlan.service';

interface MealPlanPageProps {
  patientId: string;
  onBack: () => void;
}

const MealPlanPage: React.FC<MealPlanPageProps> = ({ patientId, onBack }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealPlan = async () => {
      setIsLoading(true);
      try {
        const plan = await mealPlanService.getActiveMealPlan(patientId);
        if (plan) {
          setMealPlan(plan);
          if (plan.sections.length > 0) {
            setSelectedSection(plan.sections[0].id);
          }
        } else {
          // Demo data if no plan found
          const demoPlan: MealPlan = {
            id: 'demo-plan',
            patient_id: patientId,
            nutritionist_id: 'nutri-1',
            created_at: new Date().toISOString(),
            active: true,
            sections: [
              {
                id: '1',
                time: '07:30',
                meal_type: 'Café da Manhã',
                instructions: 'Beber 200ml de água morna com limão antes de comer.',
                items: [
                  { id: 'i1', food_name: 'Ovos Mexidos', quantity: '2', unit: 'unidades', substitutions: ['Omelete de claras', 'Tofu mexido'] },
                  { id: 'i2', food_name: 'Pão Integral', quantity: '1', unit: 'fatia', substitutions: ['Tapioca (2 colheres)', 'Cuscuz (3 colheres)'] },
                  { id: 'i3', food_name: 'Mamão Papaia', quantity: '1/2', unit: 'unidade', substitutions: ['Melão (1 fatia)', 'Morangos (6 unidades)'] }
                ]
              },
              {
                id: '2',
                time: '10:00',
                meal_type: 'Lanche da Manhã',
                items: [
                  { id: 'i4', food_name: 'Mix de Castanhas', quantity: '20', unit: 'gramas', substitutions: ['Nozes (3 unidades)', 'Amêndoas (10 unidades)'] }
                ]
              },
              {
                id: '3',
                time: '12:30',
                meal_type: 'Almoço',
                instructions: 'Começar sempre pela salada verde.',
                items: [
                  { id: 'i5', food_name: 'Frango Grelhado', quantity: '120', unit: 'gramas', substitutions: ['Peixe grelhado', 'Patinho moído'] },
                  { id: 'i6', food_name: 'Arroz Integral', quantity: '3', unit: 'colheres de sopa', substitutions: ['Batata doce (100g)', 'Quinoa (3 colheres)'] },
                  { id: 'i7', food_name: 'Feijão Preto', quantity: '1', unit: 'concha pequena' },
                  { id: 'i8', food_name: 'Salada Verde', quantity: 'à vontade', unit: '' }
                ]
              }
            ]
          };
          setMealPlan(demoPlan);
          setSelectedSection(demoPlan.sections[0].id);
        }
      } catch (error) {
        console.error('Error fetching meal plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealPlan();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSection = mealPlan?.sections.find(s => s.id === selectedSection);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-[#22B391] transition-all shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[#0B2B24] tracking-tight">Plano Alimentar</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sua dieta personalizada</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Timeline Navigation */}
        <div className="md:col-span-4 space-y-3">
          {mealPlan?.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${
                selectedSection === section.id 
                  ? 'bg-[#0B2B24] border-[#0B2B24] text-white shadow-xl shadow-[#0B2B24]/20 scale-[1.02]' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-[#22B391]/30'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedSection === section.id ? 'bg-white/10 text-[#22B391]' : 'bg-slate-50 text-slate-400'}`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedSection === section.id ? 'text-[#22B391]' : 'text-slate-400'}`}>
                  {section.time}
                </p>
                <p className="font-bold text-sm">{section.meal_type}</p>
              </div>
              {selectedSection === section.id && <ChevronRight className="w-5 h-5 ml-auto text-[#22B391]" />}
            </button>
          ))}
        </div>

        {/* Meal Details */}
        <div className="md:col-span-8">
          {currentSection && (
            <motion.div 
              key={currentSection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl text-[#22B391]">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#0B2B24] tracking-tight">{currentSection.meal_type}</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{currentSection.time} • Horário Sugerido</p>
                    </div>
                  </div>
                </div>

                {currentSection.instructions && (
                  <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                    <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm shrink-0 h-fit">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Instruções do Nutri</p>
                      <p className="text-xs font-bold text-[#0B2B24] leading-relaxed">{currentSection.instructions}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alimentos e Quantidades</p>
                  {currentSection.items.map((item) => (
                    <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-black text-[#0B2B24]">{item.food_name}</p>
                        <span className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-black text-[#22B391] uppercase tracking-widest">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      
                      {item.substitutions && item.substitutions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                          <div className="flex items-center gap-2 mb-2">
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Substituições</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.substitutions.map((sub, i) => (
                              <span key={i} className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-[#0B2B24] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#0B2B24]/20 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-10">
                  <FileText className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#22B391]" />
                    Dica de Ouro
                  </h4>
                  <p className="text-slate-400 text-sm font-bold leading-relaxed">
                    Mantenha-se hidratado! Beber água entre as refeições ajuda na digestão e no controle da saciedade.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanPage;

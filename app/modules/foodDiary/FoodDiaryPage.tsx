"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getMealsByDate,
  addMeal,
  updateMeal,
  deleteMeal,
  getDaySummary,
  updateDaySummary,
} from "./foodDiary.service";
import { seedFoodDiaryData } from "./seedData";
import MealCard from "./MealCard";
import AddFoodModal from "./AddFoodModal";
import AIChat from "./AIChat";
import { Meal, MealType, DaySummary } from "./foodDiary.types";
import { useFirebase } from "@/app/components/layout/FirebaseProvider";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Utensils,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  Filter,
  PieChart as PieIcon,
  MessageSquare,
  History,
  ArrowRight,
  Target,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface FoodDiaryPageProps {
  patientId?: string;
  onBack?: () => void;
}

const MEAL_TYPES: { type: MealType; label: string; icon: any }[] = [
  { type: "breakfast", label: "Café da Manhã", icon: Clock },
  { type: "morning_snack", label: "Lanche da Manhã", icon: Clock },
  { type: "lunch", label: "Almoço", icon: Utensils },
  { type: "afternoon_snack", label: "Lanche da Tarde", icon: Clock },
  { type: "dinner", label: "Jantar", icon: Utensils },
  { type: "supper", label: "Ceia", icon: Clock },
];

export default function FoodDiaryPage({
  patientId: initialPatientId,
  onBack,
}: FoodDiaryPageProps) {
  const { user } = useFirebase();
  const patientId = initialPatientId || user?.uid;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [observations, setObservations] = useState("");

  const loadData = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const [mealsRes, summaryRes] = await Promise.all([
        getMealsByDate(patientId, selectedDate),
        getDaySummary(patientId, selectedDate),
      ]);

      if (mealsRes.error) throw mealsRes.error;
      setMeals(mealsRes.data || []);

      if (summaryRes.data) {
        setSummary(summaryRes.data);
        setObservations(summaryRes.data.observations || "");
      } else {
        // Default summary
        const defaultSummary: DaySummary = {
          date: selectedDate,
          patientId,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          targetCalories: 2000,
          targetProtein: 150,
          targetCarbs: 200,
          targetFat: 65,
          createdBy: user?.uid || "system",
        };
        setSummary(defaultSummary);
        setObservations("");
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeedData = async () => {
    if (!patientId || !user?.uid) return;
    setIsLoading(true);
    try {
      await seedFoodDiaryData(patientId, user.uid);
      await loadData();
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        if (!meal.consumed) return acc;
        meal.foods.forEach((food) => {
          acc.calories += food.calories || 0;
          acc.protein += food.protein || 0;
          acc.carbs += food.carbs || 0;
          acc.fat += food.fat || 0;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [meals]);

  const handleToggleStatus = async (mealId: string, currentStatus: boolean) => {
    if (!patientId) return;
    try {
      const { error } = await updateMeal(patientId, mealId, {
        consumed: !currentStatus,
      });
      if (error) throw error;
      setMeals(
        meals.map((m) =>
          m.id === mealId ? { ...m, consumed: !currentStatus } : m,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!patientId || !confirm("Tem certeza que deseja excluir este registro?"))
      return;
    try {
      const { error } = await deleteMeal(patientId, mealId);
      if (error) throw error;
      setMeals(meals.filter((m) => m.id !== mealId));
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const handleSaveMeal = async (mealData: any) => {
    if (!patientId || !user) return;
    setIsSaving(true);
    try {
      const newMeal = {
        ...mealData,
        type: activeMealType || mealData.type,
        patientId,
        date: selectedDate,
        createdBy: user.uid,
      };
      const { error } = await addMeal(patientId, newMeal);
      if (error) throw error;
      setIsAddModalOpen(false);
      setActiveMealType(null);
      await loadData();
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update summary in Firestore when totals change
  useEffect(() => {
    const syncSummary = async () => {
      if (!patientId || !summary || !user) return;

      // Only update if totals are different from summary
      if (
        totals.calories !== summary.totalCalories ||
        totals.protein !== summary.totalProtein ||
        totals.carbs !== summary.totalCarbs ||
        totals.fat !== summary.totalFat
      ) {
        await updateDaySummary(patientId, selectedDate, {
          ...summary,
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFat: totals.fat,
          createdBy: user.uid,
        });
      }
    };

    const timer = setTimeout(syncSummary, 2000); // Debounce sync
    return () => clearTimeout(timer);
  }, [totals, patientId, selectedDate, summary, user]);

  const handleSaveObservations = async () => {
    if (!patientId || !summary || !user) return;
    try {
      await updateDaySummary(patientId, selectedDate, {
        ...summary,
        observations,
        patientId,
        createdBy: user.uid,
      });
      alert("Observações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving observations:", error);
    }
  };

  const macroData = [
    { name: "Proteínas", value: totals.protein, color: "#22B391" },
    { name: "Carboidratos", value: totals.carbs, color: "#3B82F6" },
    { name: "Gorduras", value: totals.fat, color: "#F59E0B" },
  ];

  const progressPercent = summary
    ? Math.min(
        Math.round((totals.calories / summary.targetCalories) * 100),
        100,
      )
    : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Top Summary Card */}
        <div className="bg-[#0B2B24] text-white p-8 rounded-[40px] shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-1">
                  Resumo do Dia
                </h1>
                <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.2em]">
                  {new Date(selectedDate).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                <button
                  onClick={() =>
                    setSelectedDate((d) => {
                      const date = new Date(d);
                      date.setDate(date.getDate() - 1);
                      return date.toISOString().split("T")[0];
                    })
                  }
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 font-black text-sm">Hoje</div>
                <button
                  onClick={() =>
                    setSelectedDate((d) => {
                      const date = new Date(d);
                      date.setDate(date.getDate() + 1);
                      return date.toISOString().split("T")[0];
                    })
                  }
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
              <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * progressPercent) / 100}
                      className="text-[#22B391] transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black leading-none">
                      {totals.calories}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                      kcal
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Meta: {summary?.targetCalories} kcal
                </p>
              </div>

              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Proteínas",
                    value: totals.protein,
                    target: summary?.targetProtein,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Carbos",
                    value: totals.carbs,
                    target: summary?.targetCarbs,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Gorduras",
                    value: totals.fat,
                    target: summary?.targetFat,
                    color: "bg-amber-500",
                  },
                ].map((macro) => (
                  <div
                    key={macro.label}
                    className="bg-white/5 p-5 rounded-3xl border border-white/5"
                  >
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">
                      {macro.label}
                    </p>
                    <div className="flex items-end gap-1 mb-3">
                      <span className="text-xl font-black">{macro.value}</span>
                      <span className="text-[8px] font-black opacity-40 mb-1">
                        g
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((macro.value / (macro.target || 1)) * 100, 100)}%`,
                        }}
                        className={`h-full ${macro.color}`}
                      />
                    </div>
                    <p className="mt-2 text-[8px] font-black opacity-40">
                      Meta: {macro.target}g
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-6">
          {MEAL_TYPES.map((mealType) => {
            const mealEntries = meals.filter((m) => m.type === mealType.type);
            return (
              <div key={mealType.type} className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#22B391]">
                      <mealType.icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-[#0B2B24] tracking-tight">
                      {mealType.label}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveMealType(mealType.type);
                      setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#22B391] hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mealEntries.length > 0 ? (
                    mealEntries.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDeleteMeal}
                      />
                    ))
                  ) : (
                    <div className="col-span-full border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group hover:border-emerald-100 transition-all">
                      <p className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">
                        Nenhum registro para esta refeição
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Observations */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-[#0B2B24] tracking-tight">
                Observações do Nutricionista
              </h2>
            </div>
            <button
              onClick={handleSaveObservations}
              className="bg-[#0B2B24] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              Salvar Observações
            </button>
          </div>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Digite aqui as orientações e observações para o paciente..."
            className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-sm font-bold text-[#0B2B24] placeholder:text-slate-300 focus:ring-2 focus:ring-[#22B391]/20 transition-all min-h-[150px] resize-none"
          />
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-full lg:w-80 space-y-8">
        {/* Analysis Card */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <PieIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#0B2B24] tracking-tight">
              Análise de Macros
            </h2>
          </div>

          <div className="h-48 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {macroData.map((macro) => (
              <div
                key={macro.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="text-xs font-bold text-slate-500">
                    {macro.name}
                  </span>
                </div>
                <span className="text-xs font-black text-[#0B2B24]">
                  {macro.value}g
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-rose-50 p-8 rounded-[40px] border border-rose-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-rose-900 tracking-tight">
              Alertas
            </h2>
          </div>

          <div className="space-y-4">
            {totals.fat > (summary?.targetFat || 0) && (
              <div className="flex gap-3">
                <div className="w-1 h-auto bg-rose-300 rounded-full shrink-0" />
                <p className="text-xs font-bold text-rose-800 leading-relaxed">
                  Consumo de gorduras acima da meta diária recomendada.
                </p>
              </div>
            )}
            {totals.protein < (summary?.targetProtein || 0) * 0.5 && (
              <div className="flex gap-3">
                <div className="w-1 h-auto bg-rose-300 rounded-full shrink-0" />
                <p className="text-xs font-bold text-rose-800 leading-relaxed">
                  Consumo de proteínas muito baixo. Tente incluir mais fontes
                  proteicas.
                </p>
              </div>
            )}
            {totals.calories === 0 && (
              <p className="text-xs font-bold text-rose-400 italic">
                Nenhum alerta para os dados atuais.
              </p>
            )}
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#0B2B24] tracking-tight">
              Histórico
            </h2>
          </div>

          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dStr = d.toISOString().split("T")[0];
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dStr)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    selectedDate === dStr
                      ? "bg-emerald-50 text-[#22B391] border border-emerald-100"
                      : "hover:bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">
                    {i === 0
                      ? "Hoje"
                      : i === 1
                        ? "Ontem"
                        : d.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Card */}
        <div className="bg-gradient-to-br from-[#0B2B24] to-[#22B391] p-8 rounded-[40px] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-2">
              Assistente Nutricional
            </h3>
            <p className="text-xs font-bold text-white/60 leading-relaxed">
              Tire suas dúvidas sobre alimentos, receitas e alimentação
              saudável.
            </p>
          </div>
        </div>
      </div>

      {onBack && (
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-8 py-4 text-slate-400 hover:text-[#22B391] hover:bg-[#22B391]/5 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar ao Painel
          </button>
        </div>
      )}

      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMeal}
        isSaving={isSaving}
      />

      <AIChat userProfile={{ weight: totals.calories > 0 ? 70 : undefined }} />
    </div>
  );
}

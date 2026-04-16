"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  PieChart as PieChartIcon,
  User,
  PlusCircle,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  CartesianGrid,
} from "recharts";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase";
import {
  DietPlan,
  Meal,
  MealFood,
  dietPlanService,
} from "@/app/lib/dietPlanService";
import AutomaticMealPlanIA from "./AutomaticMealPlanIA";

interface MealPlanningProps {
  patientId: string;
  patientName: string;
  onBack?: () => void;
}

const MealPlanning: React.FC<MealPlanningProps> = ({
  patientId,
  patientName,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "plano"
    | "criar"
    | "estrategia"
    | "substituicoes"
    | "distribuicao"
    | "orientacoes"
    | "ia"
  >("plano");
  const [loading, setLoading] = useState(true);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [energyData, setEnergyData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Energy Calculation
        const { data: energy } = await supabase
          .from("prescriptions") // Reusing existing table for energy if needed or just fetch latest
          .select("*")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (energy) setEnergyData(energy);

        // 2. Fetch Diet Plans
        const plans = await dietPlanService.getAll(patientId);
        setDietPlans(plans);
        if (plans.length > 0) {
          setActivePlan(plans[0]);
        }
      } catch (error) {
        console.error("Error fetching meal planning data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const totals = useMemo(() => {
    if (!activePlan || !activePlan.meals)
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return activePlan.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach((food) => {
          acc.calories += Number(food.calories || 0);
          acc.protein += Number(food.protein || 0);
          acc.carbs += Number(food.carbs || 0);
          acc.fats += Number(food.fats || 0);
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );
  }, [activePlan]);

  const sidebarItems = [
    { id: "plano", label: "Plano Alimentar", icon: ClipboardList },
    { id: "criar", label: "Criar Plano", icon: Plus },
    { id: "estrategia", label: "Estratégia", icon: Settings },
    { id: "substituicoes", label: "Substituições", icon: RefreshCw },
    { id: "distribuicao", label: "Distribuição", icon: PieChartIcon },
    { id: "orientacoes", label: "Orientações", icon: Info },
    { id: "ia", label: "Gerar com IA", icon: Brain },
  ];

  const handleAddFood = (mealIdx: number) => {
    if (!activePlan || !activePlan.meals) return;
    const newMeals = [...activePlan.meals];
    const newFood: MealFood = {
      name: "Novo Alimento",
      quantity: 100,
      unit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };
    newMeals[mealIdx].foods = [...newMeals[mealIdx].foods, newFood];
    setActivePlan({ ...activePlan, meals: newMeals });
  };

  const handleRemoveFood = (mealIdx: number, foodIdx: number) => {
    if (!activePlan || !activePlan.meals) return;
    const newMeals = [...activePlan.meals];
    newMeals[mealIdx].foods = newMeals[mealIdx].foods.filter(
      (_, i) => i !== foodIdx,
    );
    setActivePlan({ ...activePlan, meals: newMeals });
  };

  const handleRemoveMeal = (mealIdx: number) => {
    if (!activePlan || !activePlan.meals) return;
    const newMeals = activePlan.meals.filter((_, i) => i !== mealIdx);
    setActivePlan({ ...activePlan, meals: newMeals });
  };

  const handleAddMeal = () => {
    if (!activePlan || !activePlan.meals) return;
    const newMeals = [...activePlan.meals];
    const newMeal: Meal = {
      name: "Nova Refeição",
      time: "12:00",
      order_index: newMeals.length,
      foods: [],
    };
    newMeals.push(newMeal);
    setActivePlan({ ...activePlan, meals: newMeals });
  };

  const handleSavePlan = async () => {
    if (!activePlan) return;
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para salvar o plano.");
        return;
      }

      const planToSave = {
        ...activePlan,
        nutri_id: user.id,
        patient_id: patientId,
      };

      if (activePlan.id) {
        await dietPlanService.update(activePlan.id, planToSave);
      } else {
        const newPlan = await dietPlanService.create(planToSave);
        setActivePlan(newPlan as any);
      }

      const updatedPlans = await dietPlanService.getAll(patientId);
      setDietPlans(updatedPlans);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving diet plan:", error);
      alert("Erro ao salvar o plano alimentar.");
    } finally {
      setLoading(false);
    }
  };

  const renderSubstituicoes = () => (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#22B391]/10 rounded-2xl flex items-center justify-center text-[#22B391]">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#0B2B24]">
              Sistema de Substituições
            </h3>
            <p className="text-slate-400 font-medium">
              Gerencie equivalências para dar flexibilidade ao paciente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
            <h4 className="text-lg font-black text-[#0B2B24]">
              Grupos de Substituição
            </h4>
            <div className="space-y-3">
              {[
                "Proteínas Magras",
                "Carboidratos Complexos",
                "Vegetais A",
                "Frutas",
              ].map((group) => (
                <div
                  key={group}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group hover:border-[#22B391] transition-all cursor-pointer"
                >
                  <span className="font-bold text-slate-700">{group}</span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#22B391]" />
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-[#22B391] hover:text-[#22B391] transition-all">
                + Criar Novo Grupo
              </button>
            </div>
          </div>

          <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-[#0B2B24]">
                Equivalentes
              </h4>
              <span className="px-3 py-1 bg-[#22B391]/10 text-[#22B391] rounded-full text-[10px] font-black uppercase tracking-widest">
                Proteínas Magras
              </span>
            </div>
            <div className="space-y-4">
              {[
                { name: "Frango Grelhado", qty: "100g" },
                { name: "Patinho Moído", qty: "100g" },
                { name: "Tilápia Grelhada", qty: "120g" },
                { name: "Ovos Cozidos", qty: "3 unid" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50"
                >
                  <span className="font-bold text-slate-600">{item.name}</span>
                  <span className="text-sm font-black text-[#0B2B24]">
                    {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistribuicao = () => (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-[#22B391]/10 rounded-2xl flex items-center justify-center text-[#22B391]">
            <PieChartIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#0B2B24]">
              Distribuição de Macronutrientes
            </h3>
            <p className="text-slate-400 font-medium">
              Análise visual da composição nutricional do plano.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Proteína",
                      value: totals.protein * 4,
                      color: "#3b82f6",
                    },
                    {
                      name: "Carboidrato",
                      value: totals.carbs * 4,
                      color: "#10b981",
                    },
                    {
                      name: "Gordura",
                      value: totals.fats * 9,
                      color: "#f59e0b",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                <span className="text-blue-500">Proteína</span>
                <span className="text-[#0B2B24]">
                  {Math.round(((totals.protein * 4) / totals.calories) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${((totals.protein * 4) / totals.calories) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                <span className="text-emerald-500">Carboidratos</span>
                <span className="text-[#0B2B24]">
                  {Math.round(((totals.carbs * 4) / totals.calories) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${((totals.carbs * 4) / totals.calories) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                <span className="text-orange-500">Gorduras</span>
                <span className="text-[#0B2B24]">
                  {Math.round(((totals.fats * 9) / totals.calories) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{
                    width: `${((totals.fats * 9) / totals.calories) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlanoAlimentar = () => (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#22B391]/10 rounded-2xl flex items-center justify-center text-[#22B391]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-[#0B2B24]">{patientName}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Plano: {activePlan?.name || "Nenhum plano ativo"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-sm font-black text-[#0B2B24]">
              {activePlan?.target_calories || 0} kcal
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Meta
            </p>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="text-center">
            <p className="text-sm font-black text-[#22B391]">
              {Math.round(totals.calories)} kcal
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Prescrito
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-3 rounded-xl transition-all ${isEditing ? "bg-[#22B391] text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
          >
            {isEditing ? (
              <Save className="w-5 h-5" onClick={handleSavePlan} />
            ) : (
              <Edit2 className="w-5 h-5" />
            )}
          </button>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 gap-6">
        {activePlan?.meals?.map((meal, idx) => (
          <motion.div
            key={meal.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0B2B24]">
                  {meal.name.toLowerCase().includes("café") ? (
                    <Flame className="w-6 h-6 text-orange-400" />
                  ) : meal.name.toLowerCase().includes("almoço") ? (
                    <Utensils className="w-6 h-6 text-blue-400" />
                  ) : (
                    <Clock className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => {
                          const newMeals = [...(activePlan.meals || [])];
                          newMeals[idx].name = e.target.value;
                          setActivePlan({ ...activePlan, meals: newMeals });
                        }}
                        className="text-xl font-black text-[#0B2B24] bg-transparent border-b border-slate-200 focus:border-[#22B391] outline-none"
                      />
                      <input
                        type="text"
                        value={meal.time}
                        onChange={(e) => {
                          const newMeals = [...(activePlan.meals || [])];
                          newMeals[idx].time = e.target.value;
                          setActivePlan({ ...activePlan, meals: newMeals });
                        }}
                        className="text-xs font-bold text-slate-400 bg-transparent border-b border-slate-200 focus:border-[#22B391] outline-none w-16"
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xl font-black text-[#0B2B24]">
                        {meal.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {meal.time}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-[#0B2B24]">
                    {Math.round(
                      meal.foods.reduce((s, f) => s + Number(f.calories), 0),
                    )}{" "}
                    kcal
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total
                  </p>
                </div>
                {isEditing ? (
                  <button
                    onClick={() => handleRemoveMeal(idx)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Alimento
                    </th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Qtd
                    </th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Medida
                    </th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Prot
                    </th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Carb
                    </th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Gord
                    </th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Kcal
                    </th>
                    {isEditing && <th className="pb-4 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {meal.foods.map((food, fIdx) => (
                    <tr
                      key={food.id || fIdx}
                      className="group hover:bg-slate-50/50 transition-all"
                    >
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={food.name}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].name = e.target.value;
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-full bg-transparent font-bold text-slate-700 outline-none focus:text-[#22B391]"
                          />
                        ) : (
                          <span className="font-bold text-slate-700">
                            {food.name}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].quantity = Number(
                                e.target.value,
                              );
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-16 bg-transparent font-black text-[#0B2B24] outline-none"
                          />
                        ) : (
                          <span className="font-black text-[#0B2B24]">
                            {food.quantity}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={food.unit}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].unit = e.target.value;
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-20 bg-transparent text-sm font-bold text-slate-400 outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-slate-400">
                            {food.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={food.protein}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].protein = Number(
                                e.target.value,
                              );
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-12 bg-transparent text-sm font-bold text-blue-500 outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-blue-500">
                            {food.protein}g
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={food.carbs}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].carbs = Number(
                                e.target.value,
                              );
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-12 bg-transparent text-sm font-bold text-emerald-500 outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-emerald-500">
                            {food.carbs}g
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={food.fats}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].fats = Number(
                                e.target.value,
                              );
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-12 bg-transparent text-sm font-bold text-orange-500 outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-orange-500">
                            {food.fats}g
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={food.calories}
                            onChange={(e) => {
                              const newMeals = [...(activePlan.meals || [])];
                              newMeals[idx].foods[fIdx].calories = Number(
                                e.target.value,
                              );
                              setActivePlan({ ...activePlan, meals: newMeals });
                            }}
                            className="w-16 bg-transparent text-sm font-black text-[#0B2B24] text-right outline-none"
                          />
                        ) : (
                          <span className="text-sm font-black text-[#0B2B24]">
                            {food.calories}
                          </span>
                        )}
                      </td>
                      {isEditing && (
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveFood(idx, fIdx)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {isEditing && (
                    <tr>
                      <td colSpan={8} className="py-4">
                        <button
                          onClick={() => handleAddFood(idx)}
                          className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 hover:border-[#22B391] hover:text-[#22B391] transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Alimento
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}

        {isEditing && (
          <button
            onClick={handleAddMeal}
            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 hover:border-[#22B391] hover:text-[#22B391] transition-all flex flex-col items-center justify-center gap-2"
          >
            <PlusCircle className="w-8 h-8" />
            <span className="font-black uppercase tracking-widest text-xs">
              Adicionar Refeição
            </span>
          </button>
        )}
      </div>
    </div>
  );

  const renderIA = () => (
    <div className="space-y-8">
      <AutomaticMealPlanIA
        patientId={patientId}
        patientName={patientName}
        targetCalories={energyData?.target_calories || 2000}
        targetMacros={{
          protein: energyData?.target_protein || 150,
          carbs: energyData?.target_carbs || 200,
          fats: energyData?.target_fats || 60,
        }}
        onSave={(plan) => {
          const newPlan: DietPlan = {
            patient_id: patientId,
            nutri_id: "", // Will be set in service
            name: `Plano IA - ${new Date().toLocaleDateString()}`,
            target_calories: energyData?.target_calories || 2000,
            target_protein: energyData?.target_protein || 150,
            target_carbs: energyData?.target_carbs || 200,
            target_fats: energyData?.target_fats || 60,
            hydration_goal: 3000,
            status: "Ativo",
            meals: plan.meals.map((m: any, idx: number) => ({
              name: m.name,
              time: m.time,
              order_index: idx,
              foods: m.foods.map((f: any) => ({
                name: f.name,
                quantity: f.quantity,
                unit: f.unit,
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fats: f.fats,
              })),
            })),
          };
          setActivePlan(newPlan);
          setActiveTab("plano");
          setIsEditing(true);
        }}
      />
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
                    ? "bg-[#22B391] text-white shadow-lg shadow-[#22B391]/20"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-slate-300"}`}
                />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 px-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Status do Plano
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600">
                  {activePlan?.status === "Ativo" ? "Ativo" : "Rascunho"}
                </span>
              </div>
            </div>
          </div>

          {onBack && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <button
                onClick={onBack}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs text-slate-400 hover:bg-slate-50 hover:text-[#22B391] transition-all uppercase tracking-widest"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-[#22B391] animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "plano" && renderPlanoAlimentar()}
              {activeTab === "ia" && renderIA()}
              {activeTab === "substituicoes" && renderSubstituicoes()}
              {activeTab === "distribuicao" && renderDistribuicao()}
              {/* Other tabs can be implemented similarly */}
              {activeTab !== "plano" &&
                activeTab !== "ia" &&
                activeTab !== "substituicoes" &&
                activeTab !== "distribuicao" && (
                  <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                    <Settings className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-[#0B2B24] mb-2">
                      Módulo em Desenvolvimento
                    </h3>
                    <p className="text-slate-400 font-medium max-w-md mx-auto">
                      Estamos trabalhando para trazer a melhor experiência em{" "}
                      {sidebarItems.find((i) => i.id === activeTab)?.label}.
                    </p>
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MealPlanning;

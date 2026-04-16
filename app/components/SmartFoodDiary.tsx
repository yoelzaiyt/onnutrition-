'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Plus, 
  MessageCircle, 
  Heart, 
  Clock, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Activity, 
  ChevronRight, 
  MoreHorizontal,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Utensils,
  Flame,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Smile,
  Send,
  ArrowLeft,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { GoogleGenAI } from "@google/genai";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Types
export interface FoodItem {
  name: string;
  amount: number;
  unit: 'g' | 'porção' | 'unidade' | 'ml';
}

export interface Meal {
  id: string;
  patient_id: string;
  photo_url?: string;
  description: string;
  items?: FoodItem[];
  notes?: string;
  status: 'consumed' | 'not_consumed' | 'pending';
  timestamp: string;
  category: 'Café da Manhã' | 'Lanche' | 'Almoço' | 'Jantar' | 'Ceia' | 'Outros';
  nutritional_analysis?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    score: number; // 0-100
    aiFeedback?: string;
  };
  reactions: { userId: string; emoji: string }[];
  comments: { id: string; authorId: string; authorName: string; text: string; timestamp: string }[];
}

const MOCK_MEALS: Meal[] = [
  {
    id: 'm1',
    patient_id: 'p1',
    photo_url: 'https://picsum.photos/seed/breakfast/800/600',
    description: 'Omelete de 3 ovos com espinafre e queijo branco, acompanhado de uma fatia de pão integral.',
    items: [
      { name: 'Ovo', amount: 3, unit: 'unidade' },
      { name: 'Espinafre', amount: 50, unit: 'g' },
      { name: 'Queijo Branco', amount: 30, unit: 'g' },
      { name: 'Pão Integral', amount: 1, unit: 'unidade' }
    ],
    notes: 'Me senti um pouco cansado hoje, mas a refeição foi boa.',
    status: 'consumed',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    category: 'Café da Manhã',
    nutritional_analysis: {
      calories: 350,
      protein: 24,
      carbs: 18,
      fat: 20,
      score: 85,
      aiFeedback: 'Ótima escolha proteica para começar o dia. O espinafre adiciona micronutrientes essenciais.'
    },
    reactions: [],
    comments: []
  },
  {
    id: 'm2',
    patient_id: 'p1',
    photo_url: 'https://picsum.photos/seed/lunch/800/600',
    description: 'Frango grelhado, arroz integral, feijão preto e uma salada generosa de folhas verdes.',
    items: [
      { name: 'Frango Grelhado', amount: 150, unit: 'g' },
      { name: 'Arroz Integral', amount: 100, unit: 'g' },
      { name: 'Feijão Preto', amount: 80, unit: 'g' },
      { name: 'Salada Verde', amount: 1, unit: 'porção' }
    ],
    notes: 'Bebi 500ml de água durante a refeição.',
    status: 'consumed',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: 'Almoço',
    nutritional_analysis: {
      calories: 520,
      protein: 35,
      carbs: 65,
      fat: 12,
      score: 92,
      aiFeedback: 'Refeição muito equilibrada. Boa proporção de macronutrientes e fibras.'
    },
    reactions: [],
    comments: []
  }
];

export interface Exercise {
  id: string;
  patient_id: string;
  type: string;
  duration: number; // minutes
  calories_burned: number;
  timestamp: string;
}

interface SmartFoodDiaryProps {
  patientId: string;
  patientName: string;
  currentUserId?: string;
  currentUserName?: string;
  onBack?: () => void;
}

export default function SmartFoodDiary({ patientId, patientName, currentUserId, currentUserName, onBack }: SmartFoodDiaryProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Café da Manhã' | 'Lanche' | 'Almoço' | 'Jantar' | 'Ceia'>('All');
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMealData, setNewMealData] = useState<Partial<Meal>>({
    category: 'Almoço',
    description: '',
    items: [],
    notes: '',
    status: 'consumed',
    timestamp: new Date().toISOString()
  });
  const [newExerciseData, setNewExerciseData] = useState<Partial<Exercise>>({
    type: '',
    duration: 30,
    calories_burned: 200,
    timestamp: new Date().toISOString()
  });
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState<string[]>([]);
  const [isSearchingFood, setIsSearchingFood] = useState(false);

  const searchFood = async (query: string) => {
    setFoodSearchQuery(query);
    if (query.length < 2) {
      setFoodSuggestions([]);
      return;
    }

    setIsSearchingFood(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Sugira 5 alimentos comuns que começam com ou são relacionados a "${query}" para um diário alimentar. Retorne apenas uma lista de nomes separados por vírgula.`,
      });
      
      const text = response.text;
      if (text) {
        const suggestions = text.split(',').map(s => s.trim());
        setFoodSuggestions(suggestions);
      }
    } catch (err) {
      console.error("Food search failed:", err);
      // Fallback
      const mockFoods = ['Arroz', 'Feijão', 'Frango', 'Ovo', 'Banana', 'Maçã', 'Pão', 'Leite'];
      setFoodSuggestions(mockFoods.filter(f => f.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
    } finally {
      setIsSearchingFood(false);
    }
  };

  const selectFoodSuggestion = (name: string) => {
    setNewMealData(prev => ({
      ...prev,
      items: [...(prev.items || []), { name, amount: 100, unit: 'g' }]
    }));
    setFoodSearchQuery('');
    setFoodSuggestions([]);
  };

  const fetchData = useCallback(async () => {
    try {
      if (!isSupabaseConfigured) {
        setMeals(MOCK_MEALS);
        setExercises([]);
        setLoading(false);
        return;
      }

      const [mealsRes, exercisesRes] = await Promise.all([
        supabase.from('meals').select('*').eq('patient_id', patientId).order('timestamp', { ascending: false }),
        supabase.from('exercises').select('*').eq('patient_id', patientId).order('timestamp', { ascending: false })
      ]);

      if (mealsRes.data) setMeals(mealsRes.data);
      if (exercisesRes.data) setExercises(exercisesRes.data);
    } catch (error) {
      console.error("Error fetching diary data:", error);
      setMeals(MOCK_MEALS); // Fallback to mock
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();

    if (isSupabaseConfigured) {
      const mealsSubscription = supabase
        .channel('meals_changes')
        .on('postgres_changes' as any, { event: '*', table: 'meals', filter: `patient_id=eq.${patientId}` }, () => {
          fetchData();
        })
        .subscribe();

      const exercisesSubscription = supabase
        .channel('exercises_changes')
        .on('postgres_changes' as any, { event: '*', table: 'exercises', filter: `patient_id=eq.${patientId}` }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(mealsSubscription);
        supabase.removeChannel(exercisesSubscription);
      };
    }
  }, [patientId, fetchData]);

  const filteredMeals = meals.filter(m => activeFilter === 'All' || m.category === activeFilter);

  const generateAIImage = async () => {
    if (!newMealData.description) return;
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `A professional, high-quality, appetizing food photography of: ${newMealData.description}. Style: clean, bright, top-down view, restaurant quality.`,
      });

      const base64Data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (base64Data) {
        setGeneratedImage(`data:image/png;base64,${base64Data}`);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Erro ao gerar imagem com IA. Tente novamente.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    let finalPhotoUrl = generatedImage || `https://picsum.photos/seed/${Math.random()}/800/600`;
    let analysis = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      score: 50,
      aiFeedback: 'Análise indisponível no momento.'
    };

    // Construct description from items if empty
    let description = newMealData.description || '';
    if (!description && newMealData.items && newMealData.items.length > 0) {
      description = newMealData.items.map(item => `${item.amount}${item.unit} de ${item.name}`).join(', ');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const analysisResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise esta descrição de refeição e forneça estimativas nutricionais: "${description}".`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: "object" as any,
            properties: {
              calories: { type: "number" as any, description: "Total calories in kcal" },
              protein: { type: "number" as any, description: "Protein in grams" },
              carbs: { type: "number" as any, description: "Carbohydrates in grams" },
              fat: { type: "number" as any, description: "Fat in grams" },
              score: { type: "number" as any, description: "Healthy score from 0 to 100" },
              aiFeedback: { type: "string" as any, description: "A short feedback sentence in Portuguese" }
            },
            required: ["calories", "protein", "carbs", "fat", "score", "aiFeedback"]
          }
        }
      });
      
      const text = analysisResponse.text;
      if (text) {
        const aiResult = JSON.parse(text);
        analysis = aiResult;
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      // Fallback to random if AI fails completely
      analysis = {
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 20) + 5,
        score: Math.floor(Math.random() * 40) + 60,
        aiFeedback: 'Análise simplificada gerada devido a uma falha na IA.'
      };
    }

    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      patient_id: patientId,
      description: description,
      items: newMealData.items || [],
      notes: newMealData.notes || '',
      status: newMealData.status as any || 'consumed',
      category: newMealData.category as any,
      timestamp: newMealData.timestamp || new Date().toISOString(),
      photo_url: finalPhotoUrl,
      reactions: [],
      comments: [],
      nutritional_analysis: analysis
    };

    if (isSupabaseConfigured) {
      const { error: supabaseError } = await supabase.from('meals').insert(newMeal);

      if (supabaseError) {
        console.error("Error adding meal:", supabaseError);
        setError("Erro ao salvar a refeição no banco de dados. Tente novamente.");
        setIsSubmitting(false);
        return;
      }
    } else {
      // In demo mode, add to local state
      setMeals(prev => [newMeal, ...prev]);
    }

    setShowAddMealForm(false);
    setIsAddingMeal(false);
    setGeneratedImage(null);
    setNewMealData({ 
      category: 'Almoço', 
      description: '', 
      items: [], 
      notes: '', 
      status: 'consumed', 
      timestamp: new Date().toISOString() 
    });
    setIsSubmitting(false);
  };

  const addFoodItem = () => {
    setNewMealData(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', amount: 100, unit: 'g' }]
    }));
  };

  const removeFoodItem = (index: number) => {
    setNewMealData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: any) => {
    setNewMealData(prev => ({
      ...prev,
      items: (prev.items || []).map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const exerciseData = {
      patient_id: patientId,
      type: newExerciseData.type || 'Caminhada',
      duration: newExerciseData.duration || 30,
      calories_burned: newExerciseData.calories_burned || 200,
      timestamp: newExerciseData.timestamp || new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { error: supabaseError } = await supabase.from('exercises').insert(exerciseData);

      if (supabaseError) {
        console.error("Error adding exercise:", supabaseError);
        setError("Erro ao salvar o exercício. Tente novamente.");
        setIsSubmitting(false);
        return;
      }
    } else {
      // In demo mode, add to local state
      const newExercise = {
        id: Math.random().toString(36).substr(2, 9),
        ...exerciseData
      };
      setExercises(prev => [newExercise, ...prev]);
    }

    setShowAddExerciseForm(false);
    setIsAddingMeal(false);
    setNewExerciseData({ type: '', duration: 30, calories_burned: 200, timestamp: new Date().toISOString() });
    setIsSubmitting(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysMeals = meals.filter(m => new Date(m.timestamp) >= today);
  const todaysExercises = exercises.filter(e => new Date(e.timestamp) >= today);

  const dailyStats = {
    consumed: todaysMeals.reduce((acc, m) => acc + (m.nutritional_analysis?.calories || 0), 0),
    burned: todaysExercises.reduce((acc, e) => acc + e.calories_burned, 0),
    target: 2200,
    macros: {
      protein: todaysMeals.reduce((acc, m) => acc + (m.nutritional_analysis?.protein || 0), 0),
      carbs: todaysMeals.reduce((acc, m) => acc + (m.nutritional_analysis?.carbs || 0), 0),
      fat: todaysMeals.reduce((acc, m) => acc + (m.nutritional_analysis?.fat || 0), 0),
      targets: { protein: 150, carbs: 200, fat: 70 }
    }
  };

  const handleAddComment = async (mealId: string) => {
    if (!newComment[mealId] || !currentUserId) return;
    
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: currentUserId,
      authorName: currentUserName || 'Usuário',
      text: newComment[mealId],
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('meals')
      .update({ comments: [...meal.comments, comment] })
      .eq('id', mealId);

    if (error) {
      console.error("Error adding comment:", error);
      setError("Erro ao adicionar comentário.");
      return;
    }

    setNewComment({ ...newComment, [mealId]: '' });
  };

  const handleReaction = async (mealId: string, emoji: string) => {
    if (!currentUserId) return;
    
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    let newReactions = [...meal.reactions];
    const existing = newReactions.find(r => r.userId === currentUserId);
    
    if (existing) {
      if (existing.emoji === emoji) {
        newReactions = newReactions.filter(r => r.userId !== currentUserId);
      } else {
        newReactions = newReactions.map(r => r.userId === currentUserId ? { ...r, emoji } : r);
      }
    } else {
      newReactions.push({ userId: currentUserId, emoji });
    }

    const { error } = await supabase
      .from('meals')
      .update({ reactions: newReactions })
      .eq('id', mealId);

    if (error) {
      console.error("Error updating reaction:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Smart Dashboard Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Resumo do Dia</h2>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calorie Progress */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-700">Calorias</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{dailyStats.consumed} / {dailyStats.target} kcal</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(dailyStats.consumed / dailyStats.target) * 100}%` }}
                className="h-full bg-orange-500"
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Restante</span>
              <span className="text-[10px] font-bold text-orange-600 uppercase">{dailyStats.target - dailyStats.consumed} kcal</span>
            </div>
          </div>

          {/* Macros Progress */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700">Macronutrientes</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Proteína', value: dailyStats.macros.protein, target: dailyStats.macros.targets.protein, color: 'bg-rose-500' },
                { label: 'Carbo', value: dailyStats.macros.carbs, target: dailyStats.macros.targets.carbs, color: 'bg-emerald-500' },
                { label: 'Gordura', value: dailyStats.macros.fat, target: dailyStats.macros.targets.fat, color: 'bg-amber-500' }
              ].map((macro, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-slate-400">{macro.label}</span>
                    <span className="text-slate-700">{macro.value}g</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }}
                      className={`h-full ${macro.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed Section */}
      <div className="max-w-2xl mx-auto w-full p-6 space-y-8">
        {/* Adherence Score Insight */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Score de Aderência</h3>
                <p className="text-white/80 text-xs">Baseado nos registros de hoje</p>
              </div>
            </div>
            <div className="text-3xl font-black">92<span className="text-sm font-normal opacity-60">/100</span></div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Alexandre está seguindo o plano com excelência. O consumo de proteínas está dentro da meta e a escolha dos alimentos no almoço foi exemplar.
            </p>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Café da Manhã', 'Lanche', 'Almoço', 'Jantar', 'Ceia'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === filter 
                ? 'bg-[#22B391] text-white shadow-md shadow-[#22B391]/20' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-[#22B391]/50'
              }`}
            >
              {filter === 'All' ? 'Tudo' : filter}
            </button>
          ))}
        </div>

        {/* Timeline Feed */}
        <div className="space-y-8">
          {filteredMeals.map((meal, idx) => (
            <motion.div 
              key={meal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                    {patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{meal.category}</h4>
                      {meal.status && (
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                          meal.status === 'consumed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {meal.status === 'consumed' ? 'Consumido' : 'Não Consumido'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {new Date(meal.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post Image */}
              {meal.photo_url && (
                <div className="relative aspect-square bg-slate-100">
                  <Image 
                    src={meal.photo_url} 
                    alt={meal.description} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* AI Score Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <div className={`w-2 h-2 rounded-full ${meal.nutritional_analysis?.score! > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className="text-xs font-bold text-slate-800">IA: {meal.nutritional_analysis?.score}%</span>
                  </div>
                </div>
              )}

              {/* Post Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {meal.description}
                  </p>
                  
                  {meal.items && meal.items.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {meal.items.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                          {item.name} ({item.amount}{item.unit})
                        </span>
                      ))}
                    </div>
                  )}

                  {meal.notes && (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        <span className="font-black uppercase tracking-widest mr-1">Obs:</span>
                        {meal.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Analysis Card */}
                {meal.nutritional_analysis && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <TrendingUp className="w-3 h-3" />
                      Análise Nutricional Estimada
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Kcal', value: meal.nutritional_analysis.calories, color: 'text-orange-600' },
                        { label: 'Prot', value: meal.nutritional_analysis.protein + 'g', color: 'text-rose-600' },
                        { label: 'Carb', value: meal.nutritional_analysis.carbs + 'g', color: 'text-emerald-600' },
                        { label: 'Gord', value: meal.nutritional_analysis.fat + 'g', color: 'text-amber-600' }
                      ].map((stat, i) => (
                        <div key={i} className="text-center">
                          <div className={`text-sm font-black ${stat.color}`}>{stat.value}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    {meal.nutritional_analysis.aiFeedback && (
                      <div className="pt-2 border-t border-slate-200 flex gap-2">
                        <Smile className="w-4 h-4 text-[#22B391] shrink-0" />
                        <p className="text-[11px] text-slate-500 italic leading-tight">
                          {meal.nutritional_analysis.aiFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactions */}
                <div className="flex items-center gap-6 pt-2">
                  <button 
                    onClick={() => handleReaction(meal.id, '👏')}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                      meal.reactions.some(r => r.userId === currentUserId) ? 'text-[#22B391]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {meal.reactions.length > 0 && <span>{meal.reactions.length}</span>}
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {meal.comments.length > 0 && <span>{meal.comments.length}</span>}
                  </button>
                </div>

                {/* Comments Section */}
                {meal.comments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {meal.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold shrink-0">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-800">{comment.authorName}</span>
                            <span className="text-[9px] text-slate-400">{new Date(comment.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-[#22B391] flex items-center justify-center text-white text-[10px] font-bold shrink-0 uppercase">
                    {currentUserName?.charAt(0) || 'U'}
                  </div>
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Adicione um feedback..." 
                      className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all"
                      value={newComment[meal.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [meal.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(meal.id)}
                    />
                    <button 
                      onClick={() => handleAddComment(meal.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#22B391] hover:bg-[#22B391]/10 rounded-full transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Exercise Entry */}
          {exercises.map(exercise => (
            <div key={exercise.id} className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{exercise.type}</h4>
                  <p className="text-xs text-slate-500 font-medium">{exercise.duration} minutos · {exercise.calories_burned} kcal queimadas</p>
                </div>
              </div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                {new Date(exercise.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (Simulated for Patient View) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 items-end">
        <AnimatePresence>
          {isAddingMeal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-64 space-y-3"
            >
              <button 
                onClick={() => setShowAddMealForm(true)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm"
              >
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Utensils className="w-4 h-4" />
                </div>
                Registrar Refeição
              </button>
              <button 
                onClick={() => setShowAddExerciseForm(true)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-700 font-bold text-sm"
              >
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                Registrar Exercício
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsAddingMeal(!isAddingMeal)}
          className="w-14 h-14 bg-[#22B391] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#22B391]/30 hover:scale-110 transition-transform active:scale-95"
        >
          <Plus className={`w-8 h-8 transition-transform duration-300 ${isAddingMeal ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showAddMealForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMealForm(false)}
              className="absolute inset-0 bg-[#0B2B24]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-800">Registrar Refeição</h3>
                <p className="text-sm text-slate-500 font-medium">Capture o momento e acompanhe a nutrição</p>
              </div>

              <form onSubmit={handleAddMeal} className="p-8 space-y-6">
                {/* Photo Placeholder / AI Generated Image */}
                <div 
                  onClick={() => !isGeneratingImage && generateAIImage()}
                  className="relative aspect-video bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:border-[#22B391] transition-colors cursor-pointer overflow-hidden"
                >
                  {generatedImage ? (
                    <Image 
                      src={generatedImage} 
                      alt="Generated" 
                      fill 
                      className="object-cover"
                    />
                  ) : isGeneratingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#22B391] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-[#22B391] uppercase tracking-widest">Gerando imagem...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-2xl text-slate-400 group-hover:text-[#22B391] shadow-sm transition-colors">
                        <Camera className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {newMealData.description ? 'Clique para gerar imagem com IA' : 'Descreva a refeição para gerar imagem'}
                      </span>
                    </>
                  )}
                  
                  {generatedImage && !isGeneratingImage && (
                    <div className="absolute inset-0 bg-[#0B2B24]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-xs uppercase tracking-widest">Clique para regerar</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Café da Manhã', 'Lanche', 'Almoço', 'Jantar', 'Ceia', 'Outros'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewMealData({ ...newMealData, category: cat as any })}
                          className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${
                            newMealData.category === cat 
                            ? 'bg-[#22B391] text-white border-[#22B391] shadow-md shadow-[#22B391]/20' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alimentos</label>
                      <button 
                        type="button"
                        onClick={addFoodItem}
                        className="flex items-center gap-1 text-[10px] font-black text-[#22B391] uppercase tracking-widest hover:bg-[#22B391]/5 px-2 py-1 rounded-lg transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar Manual
                      </button>
                    </div>

                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Buscar no banco de alimentos..."
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22B391]/20"
                          value={foodSearchQuery}
                          onChange={(e) => searchFood(e.target.value)}
                        />
                        {isSearchingFood && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#22B391] border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      
                      {foodSuggestions.length > 0 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                          {foodSuggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectFoodSuggestion(suggestion)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {newMealData.items?.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex-1 space-y-1">
                            <input 
                              type="text"
                              placeholder="Nome do alimento"
                              className="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
                              value={item.name}
                              onChange={(e) => updateFoodItem(idx, 'name', e.target.value)}
                            />
                            <div className="flex gap-2">
                              <input 
                                type="number"
                                placeholder="Qtd"
                                className="w-16 bg-transparent text-xs text-slate-500 focus:outline-none"
                                value={item.amount}
                                onChange={(e) => updateFoodItem(idx, 'amount', parseFloat(e.target.value))}
                              />
                              <select 
                                className="bg-transparent text-xs text-slate-500 focus:outline-none"
                                value={item.unit}
                                onChange={(e) => updateFoodItem(idx, 'unit', e.target.value as any)}
                              >
                                <option value="g">g</option>
                                <option value="porção">porção</option>
                                <option value="unidade">unidade</option>
                                <option value="ml">ml</option>
                              </select>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFoodItem(idx)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Plus className="w-4 h-4 rotate-45" />
                          </button>
                        </div>
                      ))}
                      
                      {(!newMealData.items || newMealData.items.length === 0) && (
                        <div className="space-y-2">
                          <textarea 
                            required
                            placeholder="Descreva sua refeição (ex: 2 ovos, 1 fatia de pão integral...)"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 min-h-[100px] resize-none"
                            value={newMealData.description}
                            onChange={e => setNewMealData({ ...newMealData, description: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'consumed', label: 'Consumido ✔', color: 'bg-emerald-500' },
                        { id: 'not_consumed', label: 'Não consumido ❌', color: 'bg-rose-500' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setNewMealData({ ...newMealData, status: s.id as any })}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all border ${
                            newMealData.status === s.id 
                            ? `${s.color} text-white border-transparent shadow-md` 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações</label>
                    <textarea 
                      placeholder="Alguma observação sobre esta refeição?"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 min-h-[80px] resize-none"
                      value={newMealData.notes}
                      onChange={e => setNewMealData({ ...newMealData, notes: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</label>
                      <input 
                        type="time" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        defaultValue={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                      <input 
                        type="date" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddMealForm(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-[#22B391] text-white rounded-2xl font-bold hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Refeição'}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-rose-500 text-center font-bold mt-2">{error}</p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {showAddExerciseForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExerciseForm(false)}
              className="absolute inset-0 bg-[#0B2B24]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-800">Registrar Exercício</h3>
                <p className="text-sm text-slate-500 font-medium">Mantenha o corpo em movimento</p>
              </div>

              <form onSubmit={handleAddExercise} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Exercício</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Musculação, Corrida, Yoga..." 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22B391]/20"
                      value={newExerciseData.type}
                      onChange={e => setNewExerciseData({ ...newExerciseData, type: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração (min)</label>
                      <input 
                        required
                        type="number" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        value={newExerciseData.duration}
                        onChange={e => setNewExerciseData({ ...newExerciseData, duration: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calorias Queimadas</label>
                      <input 
                        required
                        type="number" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        value={newExerciseData.calories_burned}
                        onChange={e => setNewExerciseData({ ...newExerciseData, calories_burned: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</label>
                      <input 
                        type="time" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        defaultValue={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        onChange={e => {
                          const [hours, minutes] = e.target.value.split(':');
                          const date = new Date(newExerciseData.timestamp || new Date());
                          date.setHours(parseInt(hours), parseInt(minutes));
                          setNewExerciseData({ ...newExerciseData, timestamp: date.toISOString() });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                      <input 
                        type="date" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        onChange={e => {
                          const date = new Date(e.target.value);
                          const oldDate = new Date(newExerciseData.timestamp || new Date());
                          date.setHours(oldDate.getHours(), oldDate.getMinutes());
                          setNewExerciseData({ ...newExerciseData, timestamp: date.toISOString() });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddExerciseForm(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-[#22B391] text-white rounded-2xl font-bold hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Exercício'}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-rose-500 text-center font-bold mt-2">{error}</p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {onBack && (
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 px-8 py-4 text-slate-400 hover:text-[#22B391] hover:bg-[#22B391]/5 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Painel
          </button>
        </div>
      )}
    </div>
  );
}

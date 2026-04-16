'use client';

import React from 'react';
import { CheckCircle2, XCircle, Clock, Camera, MessageSquare, Trash2 } from 'lucide-react';
import { Meal, MealType } from './foodDiary.types';
import { motion } from 'motion/react';

interface MealCardProps {
  meal: Meal;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete?: (id: string) => void;
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Café da Manhã',
  morning_snack: 'Lanche da Manhã',
  lunch: 'Almoço',
  afternoon_snack: 'Lanche da Tarde',
  dinner: 'Jantar',
  supper: 'Ceia'
};

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-amber-50 text-amber-600 border-amber-100',
  morning_snack: 'bg-orange-50 text-orange-600 border-orange-100',
  lunch: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  afternoon_snack: 'bg-sky-50 text-sky-600 border-sky-100',
  dinner: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  supper: 'bg-purple-50 text-purple-600 border-purple-100'
};

export default function MealCard({ meal, onToggleStatus, onDelete }: MealCardProps) {
  const totalCalories = meal.foods?.reduce((acc, food) => acc + (food.calories || 0), 0) || 0;
  const totalProtein = meal.foods?.reduce((acc, food) => acc + (food.protein || 0), 0) || 0;
  const totalCarbs = meal.foods?.reduce((acc, food) => acc + (food.carbs || 0), 0) || 0;
  const totalFat = meal.foods?.reduce((acc, food) => acc + (food.fat || 0), 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-white rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 ${
        meal.consumed ? 'border-emerald-100 shadow-sm' : 'border-slate-100 shadow-sm opacity-80'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
              meal.consumed ? 'bg-emerald-50 border-emerald-100 text-[#22B391]' : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0B2B24] tracking-tight">
                {mealTypeLabels[meal.type]}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{meal.time || 'Horário não definido'}</span>
                <span>•</span>
                <span className={meal.consumed ? 'text-emerald-500' : 'text-amber-500'}>
                  {meal.consumed ? 'Consumido' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-xl font-black text-[#0B2B24] leading-none">{totalCalories}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">kcal</p>
            </div>
            <button 
              onClick={() => onToggleStatus(meal.id, meal.consumed)}
              className={`p-3 rounded-xl transition-all ${
                meal.consumed 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-[#22B391]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            {onDelete && (
              <button 
                onClick={() => onDelete(meal.id)}
                className="p-3 text-slate-300 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {meal.foods?.map((food) => (
            <div key={food.id} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-40 group-hover/item:opacity-100 transition-opacity" />
                <span className="text-sm font-bold text-[#0B2B24]">{food.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {food.quantity} {food.unit}
                </span>
                <span className="text-xs font-black text-slate-400 w-12 text-right">
                  {food.calories} <span className="text-[8px]">kcal</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6 px-4 py-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Prot</span>
            <span className="text-xs font-black text-[#0B2B24]">{totalProtein}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Carb</span>
            <span className="text-xs font-black text-[#0B2B24]">{totalCarbs}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Gord</span>
            <span className="text-xs font-black text-[#0B2B24]">{totalFat}g</span>
          </div>
        </div>

        {meal.photoUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-50 border border-slate-100">
            <img 
              src={meal.photoUrl} 
              alt="Foto da refeição" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest">
                <Camera className="w-3 h-3" />
                Registro Fotográfico
              </div>
            </div>
          </div>
        )}

        {meal.notes && (
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
              &ldquo;{meal.notes}&rdquo;
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

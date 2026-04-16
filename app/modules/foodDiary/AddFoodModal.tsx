'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Camera, Save, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MealType, FoodItem } from './foodDiary.types';
import { foodDatabase, FoodDatabaseItem } from './foodDatabase';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: any) => void;
  isSaving?: boolean;
}

const mealTypes: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Café da Manhã' },
  { value: 'morning_snack', label: 'Lanche da Manhã' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'afternoon_snack', label: 'Lanche da Tarde' },
  { value: 'dinner', label: 'Jantar' },
  { value: 'supper', label: 'Ceia' }
];

interface FoodItemState extends Omit<FoodItem, 'id'> {
  searchQuery: string;
  showResults: boolean;
  filteredResults: FoodDatabaseItem[];
}

export default function AddFoodModal({ isOpen, onClose, onSave, isSaving }: AddFoodModalProps) {
  const [type, setType] = useState<MealType>('breakfast');
  const [foods, setFoods] = useState<FoodItemState[]>([
    { name: '', quantity: 0, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0, searchQuery: '', showResults: false, filteredResults: [] }
  ]);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAddFood = () => {
    setFoods([...foods, { name: '', quantity: 0, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0, searchQuery: '', showResults: false, filteredResults: [] }]);
  };

  const handleRemoveFood = (index: number) => {
    if (foods.length > 1) {
      setFoods(foods.filter((_, i) => i !== index));
    }
  };

  const calculateNutrients = (food: FoodDatabaseItem, quantity: number) => {
    const ratio = quantity / food.defaultQuantity;
    return {
      calories: Math.round(food.calories * ratio),
      protein: parseFloat((food.protein * ratio).toFixed(1)),
      carbs: parseFloat((food.carbs * ratio).toFixed(1)),
      fat: parseFloat((food.fat * ratio).toFixed(1)),
    };
  };

  const handleFoodSearch = (index: number, query: string) => {
    const filtered = foodDatabase.filter(f => 
      f.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    const newFoods = [...foods];
    newFoods[index] = { 
      ...newFoods[index], 
      searchQuery: query, 
      name: query,
      filteredResults: filtered,
      showResults: query.length > 0
    };
    setFoods(newFoods);
  };

  const selectFood = (index: number, food: FoodDatabaseItem) => {
    const nutrients = calculateNutrients(food, food.defaultQuantity);
    const newFoods = [...foods];
    newFoods[index] = {
      ...newFoods[index],
      name: food.name,
      searchQuery: food.name,
      quantity: food.defaultQuantity,
      unit: food.defaultUnit,
      ...nutrients,
      showResults: false
    };
    setFoods(newFoods);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newFoods = [...foods];
    const foodName = newFoods[index].name;
    const dbItem = foodDatabase.find(f => f.name === foodName);

    if (dbItem) {
      const nutrients = calculateNutrients(dbItem, quantity);
      newFoods[index] = { ...newFoods[index], quantity, ...nutrients };
    } else {
      newFoods[index] = { ...newFoods[index], quantity };
    }
    setFoods(newFoods);
  };

  const handleFoodChange = (index: number, field: keyof FoodItemState, value: any) => {
    const newFoods = [...foods];
    newFoods[index] = { ...newFoods[index], [field]: value };
    setFoods(newFoods);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (foods.some(f => !f.name)) return;

    const mealData = {
      type,
      foods: foods.map((f, i) => ({
        id: `food-${Date.now()}-${i}`,
        name: f.name,
        quantity: f.quantity,
        unit: f.unit,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat
      })),
      consumed: true,
      notes,
      photoUrl,
      createdAt: new Date().toISOString()
    };

    onSave(mealData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2B24]/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-[#0B2B24] tracking-tight">Nova Refeição</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Registre o que você consumiu agora</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white hover:shadow-lg transition-all rounded-2xl text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {/* Meal Type */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tipo de Refeição</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mealTypes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setType(m.value)}
                  className={`px-4 py-3 rounded-2xl text-xs font-black transition-all border ${
                    type === m.value 
                      ? 'bg-[#22B391] text-white border-[#22B391] shadow-lg shadow-[#22B391]/20' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-[#22B391]/30 hover:text-[#22B391]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Alimentos</label>
              <button 
                onClick={handleAddFood}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#22B391] hover:text-[#0B2B24] transition-colors"
              >
                <Plus className="w-3 h-3" /> Adicionar Alimento
              </button>
            </div>
            
            <div className="space-y-4">
              {foods.map((food, index) => (
                <div key={index} className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 relative">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          placeholder="Buscar alimento (ex: Arroz Integral)"
                          value={food.searchQuery}
                          onChange={(e) => handleFoodSearch(index, e.target.value)}
                          onFocus={() => food.searchQuery && handleFoodSearch(index, food.searchQuery)}
                          onBlur={() => {
                            setTimeout(() => {
                              const newFoods = [...foods];
                              if (newFoods[index]) {
                                newFoods[index] = { ...newFoods[index], showResults: false };
                                setFoods(newFoods);
                              }
                            }, 200);
                          }}
                          className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-5 py-4 text-sm font-bold text-[#0B2B24] placeholder:text-slate-300 focus:ring-2 focus:ring-[#22B391]/20 transition-all"
                        />
                      </div>
                      
                      <AnimatePresence>
                        {food.showResults && food.filteredResults.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                          >
                            {food.filteredResults.map((result, i) => (
                              <button
                                key={i}
                                onClick={() => selectFood(index, result)}
                                className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                              >
                                <div>
                                  <p className="text-sm font-bold text-[#0B2B24]">{result.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {result.calories} kcal / {result.defaultQuantity}{result.defaultUnit}
                                  </p>
                                </div>
                                <Plus className="w-4 h-4 text-slate-200 group-hover:text-[#22B391] transition-colors" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="w-24">
                      <input 
                        type="number"
                        placeholder="Qtd"
                        value={food.quantity || ''}
                        onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold text-[#0B2B24] placeholder:text-slate-300 focus:ring-2 focus:ring-[#22B391]/20 transition-all"
                      />
                    </div>
                    <div className="w-20">
                      <select 
                        value={food.unit}
                        onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl px-3 py-4 text-sm font-bold text-[#0B2B24] focus:ring-2 focus:ring-[#22B391]/20 transition-all appearance-none"
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="un">un</option>
                        <option value="porção">porção</option>
                        <option value="fatia">fatia</option>
                        <option value="colher de sopa">colher</option>
                      </select>
                    </div>
                    {foods.length > 1 && (
                      <button 
                        onClick={() => handleRemoveFood(index)}
                        className="p-4 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {food.calories > 0 && (
                    <div className="flex gap-4 px-5 py-2 bg-emerald-50/50 rounded-xl">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        {food.calories} kcal
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Foto da Refeição</label>
            <div className="relative">
              {photoUrl ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden group">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <label className="p-4 bg-white rounded-2xl text-[#0B2B24] cursor-pointer hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                    <button 
                      onClick={() => setPhotoUrl('')}
                      className="p-4 bg-rose-500 rounded-2xl text-white hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-100 rounded-3xl hover:border-[#22B391]/40 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 text-[#22B391] animate-spin" />
                  ) : (
                    <>
                      <div className="p-5 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-[#22B391] group-hover:bg-white group-hover:shadow-lg transition-all mb-4">
                        <Camera className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-black text-slate-400 group-hover:text-[#0B2B24]">Tirar ou enviar foto</p>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Opcional</p>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Observações</label>
            <textarea 
              placeholder="Como você se sentiu? Alguma observação especial?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-sm font-bold text-[#0B2B24] placeholder:text-slate-300 focus:ring-2 focus:ring-[#22B391]/20 transition-all min-h-[120px] resize-none"
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-top border-slate-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-5 rounded-2xl font-black text-sm text-slate-400 hover:text-[#0B2B24] transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving || isUploading || foods.some(f => !f.name)}
            className="flex-[2] bg-[#22B391] text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl shadow-[#22B391]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar Refeição
          </button>
        </div>
      </motion.div>
    </div>
  );
}

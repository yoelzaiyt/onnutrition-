"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import { Plus, Trash2, Utensils, Coffee, Apple, Clock } from "lucide-react";

interface EatingHabit {
  id: string;
  mealTime: string;
  mealType: string;
  description: string;
  calories?: number;
  notes?: string;
  createdBy: string;
}

const mealTypes = [
  "Café da manhã",
  "Almoço",
  "Jantar",
  "Lanche da manhã",
  "Lanche da tarde",
  "Lanche da noite",
  "Pré-treino",
  "Pós-treino",
];

const mealTimes = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export default function EatingHabits({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [habits, setHabits] = useState<EatingHabit[]>([]);
  const [mealTime, setMealTime] = useState("");
  const [mealType, setMealType] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<EatingHabit>(
      `patients/${patientId}/eating-habits`,
      (data) => {
        setHabits(data.sort((a, b) => a.mealTime.localeCompare(b.mealTime)));
      },
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealTime || !description) return;

    await addDocument(`patients/${patientId}/eating-habits`, {
      patientId,
      mealTime,
      mealType: mealType || undefined,
      description,
      calories: calories ? parseInt(calories) : undefined,
      notes: notes || undefined,
    });

    setMealTime("");
    setMealType("");
    setDescription("");
    setCalories("");
    setNotes("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/eating-habits`, id);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case "Café da manhã":
        return <Coffee className="w-5 h-5" />;
      case "Almoço":
      case "Jantar":
        return <Utensils className="w-5 h-5" />;
      default:
        return <Apple className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Hábitos Alimentares
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Refeição
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário
            </label>
            <select
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Selecione...</option>
              {mealTimes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Refeição
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Selecione...</option>
              {mealTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              rows={2}
              placeholder="Ex: 2 fatias pão integral, 1 ovo, 1 banana"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calorias (kcal)
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: 350"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Comer devagar"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {habits.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum hábito alimentar cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b">Horário</th>
                  <th className="p-4 border-b">Tipo</th>
                  <th className="p-4 border-b">Descrição</th>
                  <th className="p-4 border-b">Kcal</th>
                  <th className="p-4 border-b">Obs</th>
                  <th className="p-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {habits.map((habit) => (
                  <tr
                    key={habit.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {habit.mealTime}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                          {getMealIcon(habit.mealType || "")}
                        </span>
                        {habit.mealType || "-"}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{habit.description}</td>
                    <td className="p-4 text-gray-600">
                      {habit.calories || "-"}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {habit.notes || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

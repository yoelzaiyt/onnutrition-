"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import {
  Plus,
  Trash2,
  Brain,
  Heart,
  Smile,
  Frown,
  Meh,
  Coffee,
  Moon,
} from "lucide-react";

interface BehaviorRecord {
  id: string;
  date: string;
  category: string;
  mood: string;
  stressLevel: number;
  sleepHours?: number;
  notes?: string;
  createdBy: string;
}

const categories = [
  "Estado de Humor",
  "Nível de Estresse",
  "Qualidade do Sono",
  "Comportamento Alimentar",
  "social",
  "Trabalho/Estudo",
  "Exercícios",
  "Outros",
];

const moods = [
  {
    value: "happy",
    label: "Feliz",
    icon: Smile,
    color: "bg-green-100 text-green-600",
  },
  {
    value: "neutral",
    label: "Neutro",
    icon: Meh,
    color: "bg-gray-100 text-gray-600",
  },
  {
    value: "sad",
    label: "Triste",
    icon: Frown,
    color: "bg-blue-100 text-blue-600",
  },
  {
    value: "anxious",
    label: "Ansioso",
    icon: Brain,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    value: "irritated",
    label: "Irritado",
    icon: Heart,
    color: "bg-red-100 text-red-600",
  },
];

export default function Behavior({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [category, setCategory] = useState("");
  const [mood, setMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<BehaviorRecord>(
      `patients/${patientId}/behavior`,
      (data) => {
        setRecords(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
      },
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    await addDocument(`patients/${patientId}/behavior`, {
      patientId,
      date: new Date().toISOString(),
      category,
      mood: mood || undefined,
      stressLevel,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      notes: notes || undefined,
    });

    setCategory("");
    setMood("");
    setStressLevel(5);
    setSleepHours("");
    setNotes("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/behavior`, id);
  };

  const getMoodInfo = (value: string) =>
    moods.find((m) => m.value === value) || moods[1];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Comportamento</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Humor
            </label>
            <div className="flex gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex-1 p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${mood === m.value ? `${m.color} ring-2 ring-offset-2 ring-current` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Estresse (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center font-bold">
                {stressLevel}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas de Sono
            </label>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Ex: 7.5"
              />
              <span className="text-gray-500">horas</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              rows={2}
              placeholder="Como foi seu dia?"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
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
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum registro comportamental encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => {
              const moodInfo = getMoodInfo(record.mood || "");
              return (
                <div
                  key={record.id}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${moodInfo.color}`}
                      >
                        <moodInfo.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {record.category}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                    {record.mood && (
                      <span className="flex items-center gap-1">
                        <moodInfo.icon className="w-4 h-4" />
                        {moodInfo.label}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Brain className="w-4 h-4 text-yellow-500" />
                      Estresse: {record.stressLevel}/10
                    </span>
                    {record.sleepHours && (
                      <span className="flex items-center gap-1">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        {record.sleepHours}h
                      </span>
                    )}
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
                      {record.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

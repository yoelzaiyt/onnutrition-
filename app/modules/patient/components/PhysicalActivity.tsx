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
  Activity,
  Timer,
  Flame,
  Heart,
  Dumbbell,
  Footprints,
  Bike,
  Zap,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  type: string;
  duration: number;
  intensity: string;
  calories?: number;
  heartRate?: number;
  date: string;
  notes?: string;
  createdBy: string;
}

const exerciseTypes = [
  "Cardio",
  "Fuerca",
  "Flexibilidade",
  " equilíbrio",
  "HIIT",
  "Yoga",
  "Pilates",
  "Natação",
  "Ciclismo",
  "Caminhada",
];

const intensities = [
  { value: "light", label: "Leve", color: "bg-green-100 text-green-600" },
  {
    value: "moderate",
    label: "Moderado",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    value: "intense",
    label: "Intenso",
    color: "bg-orange-100 text-orange-600",
  },
  { value: "extreme", label: "Extremo", color: "bg-red-100 text-red-600" },
];

export default function PhysicalActivity({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");
  const [calories, setCalories] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Exercise>(
      `patients/${patientId}/physical-activity`,
      (data) => {
        setExercises(
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
    if (!name || !duration) return;

    await addDocument(`patients/${patientId}/physical-activity`, {
      patientId,
      name,
      type: type || undefined,
      duration: parseInt(duration),
      intensity: intensity || undefined,
      calories: calories ? parseInt(calories) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      date: new Date().toISOString(),
      notes: notes || undefined,
    });

    setName("");
    setType("");
    setDuration("");
    setIntensity("");
    setCalories("");
    setHeartRate("");
    setNotes("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/physical-activity`, id);
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "Cardio":
      case "Caminhada":
      case "Corrida":
        return Footprints;
      case "Ciclismo":
        return Bike;
      case "Fuerca":
      case "HIIT":
        return Dumbbell;
      default:
        return Activity;
    }
  };

  const getIntensityInfo = (v: string) =>
    intensities.find((i) => i.value === v) || intensities[0];

  const totalCalories = exercises.reduce(
    (sum, e) => sum + (e.calories || 0),
    0,
  );
  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Atividade Física</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Exercício
        </button>
      </div>

      {exercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-cyan-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-cyan-700">
              <Flame className="w-5 h-5" />
              <span className="text-sm font-medium">Total Calorias</span>
            </div>
            <p className="text-2xl font-bold text-cyan-800 mt-1">
              {totalCalories} kcal
            </p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-cyan-700">
              <Timer className="w-5 h-5" />
              <span className="text-sm font-medium">Tempo Total</span>
            </div>
            <p className="text-2xl font-bold text-cyan-800 mt-1">
              {totalDuration} min
            </p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-cyan-700">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Exercícios</span>
            </div>
            <p className="text-2xl font-bold text-cyan-800 mt-1">
              {exercises.length}
            </p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-cyan-700">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Média Cal/Dia</span>
            </div>
            <p className="text-2xl font-bold text-cyan-800 mt-1">
              {exercises.length > 0
                ? Math.round(
                    totalCalories /
                      new Set(exercises.map((e) => e.date.split("T")[0])).size,
                  )
                : 0}
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercício
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
              placeholder="Ex: Corrida, Academia, Natação"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
            >
              <option value="">Selecione...</option>
              {exerciseTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração (min)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
              placeholder="Ex: 45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intensidade
            </label>
            <div className="flex gap-2">
              {intensities.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensity(i.value)}
                  className={`flex-1 p-2 rounded-lg text-sm transition-all ${intensity === i.value ? `${i.color} ring-2 ring-offset-2 ring-current` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calorias Queimadas
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
              placeholder="Ex: 300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FC Máx (bpm)
            </label>
            <input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
              placeholder="Ex: 160"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
              placeholder="Ex: Feltiu bem, perlu ir mais devagar"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-colors"
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
        {exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhuma atividade física registrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => {
              const Icon = getTypeIcon(exercise.type || "");
              const intensityInfo = getIntensityInfo(exercise.intensity || "");
              return (
                <div
                  key={exercise.id}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {exercise.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(exercise.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {exercise.duration} min
                    </span>
                    {exercise.calories && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {exercise.calories} kcal
                      </span>
                    )}
                    {exercise.heartRate && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        {exercise.heartRate} bpm
                      </span>
                    )}
                    {exercise.intensity && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${intensityInfo.color}`}
                      >
                        {intensityInfo.label}
                      </span>
                    )}
                  </div>
                  {exercise.notes && (
                    <p className="mt-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
                      {exercise.notes}
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

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
  Target,
  Calendar,
  Flag,
  CheckCircle,
  Circle,
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  category: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  weightGoal?: number;
  createdBy: string;
}

const categories = [
  "Peso",
  "IMC",
  "Gordura Corporal",
  "Musculatura",
  "Medida Corporal",
  "Consumo de Água",
  "Refeições Saudáveis",
  "Exercício Físico",
  "Horas de Sono",
  "Outro",
];

export default function GoalsPrescription({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("");
  const [weightGoal, setWeightGoal] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Goal>(
      `patients/${patientId}/goals`,
      (data) => {
        setGoals(
          data.sort((a, b) => {
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;
            return (
              new Date(a.targetDate).getTime() -
              new Date(b.targetDate).getTime()
            );
          }),
        );
      },
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addDocument(`patients/${patientId}/goals`, {
      patientId,
      title,
      description: description || undefined,
      targetDate: new Date(targetDate).toISOString(),
      category: category || undefined,
      weightGoal: weightGoal ? parseFloat(weightGoal) : undefined,
      progress: 0,
      status: "pending",
    });

    setTitle("");
    setDescription("");
    setTargetDate("");
    setCategory("");
    setWeightGoal("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/goals`, id);
  };

  const updateProgress = async (goal: Goal, progress: number) => {
    await addDocument(`patients/${patientId}/goals`, {
      ...goal,
      progress,
      status:
        progress >= 100
          ? "completed"
          : progress > 0
            ? "in_progress"
            : "pending",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "in_progress":
        return "Em Progresso";
      case "cancelled":
        return "Cancelada";
      default:
        return "Pendente";
    }
  };

  const pending = goals.filter(
    (g) => g.status !== "completed" && g.status !== "cancelled",
  );
  const completed = goals.filter((g) => g.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Objetivos e Metas</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-700">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Total de Metas</span>
            </div>
            <p className="text-2xl font-bold text-emerald-800 mt-1">
              {goals.length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700">
              <Flag className="w-5 h-5" />
              <span className="text-sm font-medium">Em Progresso</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {pending.length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Concluídas</span>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-1">
              {completed.length}
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
              Título da Meta
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
              placeholder="Ex: Perder 5kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
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
              Data Alvo
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta de Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightGoal}
              onChange={(e) => setWeightGoal(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
              placeholder="Ex: 65.0"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600"
              rows={2}
              placeholder="Detalhes da meta..."
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
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
        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhuma meta cadastrada.
          </div>
        ) : (
          <div className="space-y-4">
            {pending.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  Metas Ativas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {goal.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {goal.category}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goal.status)}`}
                        >
                          {getStatusLabel(goal.status)}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {goal.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(goal.targetDate).toLocaleDateString(
                            "pt-BR",
                          )}
                        </div>
                        {goal.weightGoal && (
                          <span className="font-medium text-emerald-600">
                            {goal.weightGoal} kg
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progresso</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <button
                            onClick={() =>
                              updateProgress(
                                goal,
                                Math.max(0, goal.progress - 10),
                              )
                            }
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            -10%
                          </button>
                          <button
                            onClick={() =>
                              updateProgress(
                                goal,
                                Math.min(100, goal.progress + 10),
                              )
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            +10%
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-600 uppercase mb-3">
                  Metas Concluídas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completed.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-green-50 p-4 rounded-xl border border-green-100 opacity-80"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900 line-through">
                              {goal.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {goal.category}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

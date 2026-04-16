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
  Calendar,
  TrendingDown,
  TrendingUp,
  Scale,
} from "lucide-react";

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  goalWeight?: number;
  variation?: number;
  notes?: string;
  createdBy: string;
}

export default function WeightHistory({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [weight, setWeight] = useState<string>("");
  const [goalWeight, setGoalWeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<WeightRecord>(
      `patients/${patientId}/weight-history`,
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
    const w = parseFloat(weight);
    if (isNaN(w)) return;

    const lastWeight = records[0]?.weight || w;
    const variation = parseFloat((w - lastWeight).toFixed(2));

    await addDocument(`patients/${patientId}/weight-history`, {
      patientId,
      date: new Date().toISOString(),
      weight: w,
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
      variation,
      notes: notes || undefined,
    });

    setWeight("");
    setGoalWeight("");
    setNotes("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/weight-history`, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Histórico de Peso</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Pesagem
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: 70.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: 65.0"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: Após jejum"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum registro de peso encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b">Data</th>
                  <th className="p-4 border-b">Peso (kg)</th>
                  <th className="p-4 border-b">Meta</th>
                  <th className="p-4 border-b">Variação</th>
                  <th className="p-4 border-b">Observações</th>
                  <th className="p-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {record.weight} kg
                    </td>
                    <td className="p-4 text-gray-600">
                      {record.goalWeight ? `${record.goalWeight} kg` : "-"}
                    </td>
                    <td className="p-4">
                      {record.variation !== undefined &&
                        record.variation !== 0 && (
                          <span
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              record.variation < 0
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {record.variation < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {Math.abs(record.variation)} kg
                          </span>
                        )}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {record.notes || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
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

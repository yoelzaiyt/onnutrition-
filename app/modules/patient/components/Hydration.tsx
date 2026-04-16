"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import { Plus, Trash2, Droplets, Coffee } from "lucide-react";

interface HydrationRecord {
  id: string;
  date: string;
  totalMl: number;
  waterMl?: number;
  teaMl?: number;
  juiceMl?: number;
  coconutMl?: number;
  otherMl?: number;
  goalMl: number;
  notes?: string;
  createdBy: string;
}

export default function Hydration({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [records, setRecords] = useState<HydrationRecord[]>([]);
  const [waterMl, setWaterMl] = useState("");
  const [teaMl, setTeaMl] = useState("");
  const [juiceMl, setJuiceMl] = useState("");
  const [coconutMl, setCoconutMl] = useState("");
  const [otherMl, setOtherMl] = useState("");
  const [goalMl, setGoalMl] = useState("2500");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<HydrationRecord>(
      `patients/${patientId}/hydration`,
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

    const w = parseInt(waterMl) || 0;
    const t = parseInt(teaMl) || 0;
    const j = parseInt(juiceMl) || 0;
    const c = parseInt(coconutMl) || 0;
    const o = parseInt(otherMl) || 0;
    const total = w + t + j + c + o;

    if (total === 0) return;

    await addDocument(`patients/${patientId}/hydration`, {
      patientId,
      date: new Date().toISOString(),
      totalMl: total,
      waterMl: w || undefined,
      teaMl: t || undefined,
      juiceMl: j || undefined,
      coconutMl: c || undefined,
      otherMl: o || undefined,
      goalMl: parseInt(goalMl) || 2500,
      notes: notes || undefined,
    });

    setWaterMl("");
    setTeaMl("");
    setJuiceMl("");
    setCoconutMl("");
    setOtherMl("");
    setNotes("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/hydration`, id);
  };

  const todayRecord = records.find((r) =>
    r.date.startsWith(new Date().toISOString().split("T")[0]),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Hidratação</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar
        </button>
      </div>

      {todayRecord && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Hoje</h4>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(todayRecord.totalMl / todayRecord.goalMl) * 220} 220`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(
                      (todayRecord.totalMl / todayRecord.goalMl) * 100,
                    )}
                    %
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {todayRecord.totalMl} ml
                </p>
                <p className="text-sm text-gray-500">
                  Meta: {todayRecord.goalMl} ml
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              {todayRecord.waterMl && (
                <div className="text-center">
                  <Droplets className="w-5 h-5 mx-auto text-blue-500" />
                  <p className="text-sm font-medium">{todayRecord.waterMl}</p>
                </div>
              )}
              {todayRecord.teaMl && (
                <div className="text-center">
                  <Coffee className="w-5 h-5 mx-auto text-amber-600" />
                  <p className="text-sm font-medium">{todayRecord.teaMl}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Água (ml)
            </label>
            <input
              type="number"
              value={waterMl}
              onChange={(e) => setWaterMl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chá (ml)
            </label>
            <input
              type="number"
              value={teaMl}
              onChange={(e) => setTeaMl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suco (ml)
            </label>
            <input
              type="number"
              value={juiceMl}
              onChange={(e) => setJuiceMl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Água de coco (ml)
            </label>
            <input
              type="number"
              value={coconutMl}
              onChange={(e) => setCoconutMl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outros (ml)
            </label>
            <input
              type="number"
              value={otherMl}
              onChange={(e) => setOtherMl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta diária (ml)
            </label>
            <input
              type="number"
              value={goalMl}
              onChange={(e) => setGoalMl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 2500"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Muito quente hoje"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
            <Droplets className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum registro de hidratação encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b">Data</th>
                  <th className="p-4 border-b">Total (ml)</th>
                  <th className="p-4 border-b">Meta</th>
                  <th className="p-4 border-b">% Meta</th>
                  <th className="p-4 border-b">Água</th>
                  <th className="p-4 border-b">Chá</th>
                  <th className="p-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.slice(0, 10).map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-900">
                      {new Date(record.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {record.totalMl} ml
                    </td>
                    <td className="p-4 text-gray-600">{record.goalMl} ml</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          record.totalMl >= record.goalMl
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {Math.round((record.totalMl / record.goalMl) * 100)}%
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {record.waterMl || "-"}
                    </td>
                    <td className="p-4 text-gray-600">{record.teaMl || "-"}</td>
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

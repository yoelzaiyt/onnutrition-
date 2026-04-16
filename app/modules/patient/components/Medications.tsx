"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import { Plus, Trash2, Pill, Clock, AlertTriangle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times?: string[];
  startDate: string;
  endDate?: string;
  active: boolean;
  notes?: string;
  prescribedBy?: string;
  createdBy: string;
}

const frequencies = [
  "1x ao dia",
  "2x ao dia",
  "3x ao dia",
  "4x ao dia",
  "A cada 8 horas",
  "A cada 12 horas",
  " conforme necessário",
  "Em jejum",
  "Antes das refeições",
  "Depois das refeições",
  " Ao deitar",
];

export default function Medications({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [times, setTimes] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Medication>(
      `patients/${patientId}/medications`,
      (data) => {
        setMedications(
          data.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1)),
        );
      },
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;

    await addDocument(`patients/${patientId}/medications`, {
      patientId,
      name,
      dosage,
      frequency: frequency || undefined,
      times: times ? times.split(",").map((t) => t.trim()) : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      active: true,
      notes: notes || undefined,
      prescribedBy: prescribedBy || undefined,
    });

    setName("");
    setDosage("");
    setFrequency("");
    setTimes("");
    setNotes("");
    setPrescribedBy("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/medications`, id);
  };

  const toggleActive = async (med: Medication) => {
    await addDocument(`patients/${patientId}/medications`, {
      ...med,
      active: !med.active,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Meds & Suplementos
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Medicamento
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Medicamento/Suplemento
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Metformina, Vit D3, Whey"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosagem
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: 500mg, 2000UI, 25g"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequência
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecione...</option>
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horários (separados por vírgula)
            </label>
            <input
              type="text"
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: 08:00, 12:00, 20:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Término (se aplicável)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescrito por
            </label>
            <input
              type="text"
              value={prescribedBy}
              onChange={(e) => setPrescribedBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Dr. Nome"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Tome com alimento"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
        {medications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum medicamento cadastrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-xl border transition-all ${med.active ? "bg-white border-gray-200 hover:shadow-sm" : "bg-gray-50 border-gray-100 opacity-60"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${med.active ? "bg-purple-100" : "bg-gray-200"}`}
                    >
                      <Pill
                        className={`w-5 h-5 ${med.active ? "text-purple-600" : "text-gray-500"}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{med.name}</h4>
                      <p className="text-sm text-gray-500">{med.dosage}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                  {med.frequency && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {med.frequency}
                    </div>
                  )}
                  {med.times && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {med.times.join(", ")}
                    </div>
                  )}
                </div>
                {med.notes && (
                  <div className="mt-2 flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className="text-gray-500">{med.notes}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${med.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
                  >
                    {med.active ? "Ativo" : "Inativo"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Início:{" "}
                    {new Date(med.startDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

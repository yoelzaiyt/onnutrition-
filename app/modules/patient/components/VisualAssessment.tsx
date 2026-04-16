"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import { Plus, Trash2, Eye, Camera, Image, Scale, Ruler } from "lucide-react";

interface VisualAssessment {
  id: string;
  date: string;
  type: string;
  description?: string;
  imageUrl?: string;
  notes?: string;
  measurements?: {
    waist?: number;
    hip?: number;
    chest?: number;
    thighs?: number;
    arms?: number;
  };
  createdBy: string;
}

const assessmentTypes = [
  "Foto Inicial",
  "Foto de Progresso",
  "Medição Corporal",
  "Avaliação Postural",
  "Antes/Depois",
  "Outra",
];

export default function VisualAssessment({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [assessments, setAssessments] = useState<VisualAssessment[]>([]);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [chest, setChest] = useState("");
  const [thighs, setThighs] = useState("");
  const [arms, setArms] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<VisualAssessment>(
      `patients/${patientId}/visual-assessment`,
      (data) => {
        setAssessments(
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
    if (!type) return;

    const measurements = {};
    if (waist) (measurements as any).waist = parseFloat(waist);
    if (hip) (measurements as any).hip = parseFloat(hip);
    if (chest) (measurements as any).chest = parseFloat(chest);
    if (thighs) (measurements as any).thighs = parseFloat(thighs);
    if (arms) (measurements as any).arms = parseFloat(arms);

    await addDocument(`patients/${patientId}/visual-assessment`, {
      patientId,
      date: new Date().toISOString(),
      type,
      description: description || undefined,
      notes: notes || undefined,
      measurements:
        Object.keys(measurements).length > 0 ? measurements : undefined,
    });

    setType("");
    setDescription("");
    setNotes("");
    setWaist("");
    setHip("");
    setChest("");
    setThighs("");
    setArms("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/visual-assessment`, id);
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "Foto Inicial":
      case "Foto de Progresso":
      case "Antes/Depois":
        return Camera;
      case "Medição Corporal":
        return Ruler;
      default:
        return Eye;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Avaliação Visual</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Avaliação
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Avaliação
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Selecione...</option>
              {assessmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              placeholder="Ex: Foto frontal"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medições Corporais (cm)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Cintura
                </label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ex: 80"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Quadril
                </label>
                <input
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ex: 100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Peitoral
                </label>
                <input
                  type="number"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ex: 95"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Coxas
                </label>
                <input
                  type="number"
                  value={thighs}
                  onChange={(e) => setThighs(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ex: 55"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Braços
                </label>
                <input
                  type="number"
                  value={arms}
                  onChange={(e) => setArms(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ex: 30"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
              rows={2}
              placeholder="Observações adicionais..."
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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
        {assessments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhuma avaliação visual registrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => {
              const Icon = getTypeIcon(assessment.type);
              return (
                <div
                  key={assessment.id}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {assessment.type}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(assessment.date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(assessment.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {assessment.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {assessment.description}
                    </p>
                  )}
                  {assessment.measurements && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assessment.measurements.waist && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Cintura: {assessment.measurements.waist}cm
                        </span>
                      )}
                      {assessment.measurements.hip && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Quadril: {assessment.measurements.hip}cm
                        </span>
                      )}
                      {assessment.measurements.chest && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Peito: {assessment.measurements.chest}cm
                        </span>
                      )}
                      {assessment.measurements.thighs && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Coxas: {assessment.measurements.thighs}cm
                        </span>
                      )}
                      {assessment.measurements.arms && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Braços: {assessment.measurements.arms}cm
                        </span>
                      )}
                    </div>
                  )}
                  {assessment.notes && (
                    <p className="mt-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
                      {assessment.notes}
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

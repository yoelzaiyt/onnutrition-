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
  Stethoscope,
  AlertCircle,
  Clock,
} from "lucide-react";

interface ClinicalRecord {
  id: string;
  date: string;
  condition: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  doctor?: string;
  createdBy: string;
}

const conditions = [
  "Hipertensão",
  "Diabetes",
  "Dislipidemia",
  "Obesidade",
  "Síndrome Metabólica",
  "Hipotireoidismo",
  "Hipertireoidismo",
  "Doença Celíaca",
  "Intolerância à Lactose",
  "SOP",
  "Endometriose",
  "Gastrite",
  "Refluxo",
  "Outros",
];

export default function ClinicalHistory({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [condition, setCondition] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [doctor, setDoctor] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<ClinicalRecord>(
      `patients/${patientId}/clinical-history`,
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
    if (!condition) return;

    await addDocument(`patients/${patientId}/clinical-history`, {
      patientId,
      date: new Date().toISOString(),
      condition,
      diagnosis: diagnosis || undefined,
      treatment: treatment || undefined,
      notes: notes || undefined,
      doctor: doctor || undefined,
    });

    setCondition("");
    setDiagnosis("");
    setTreatment("");
    setNotes("");
    setDoctor("");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/clinical-history`, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Histórico Clínico</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
              Condição
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médico/Profissional
            </label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Dr. Nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Código CID-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tratamento
            </label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tratamento realizado"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Detalhes adicionais..."
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum histórico clínico encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {record.condition}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                        {record.doctor && (
                          <>
                            <span>•</span>
                            <span>{record.doctor}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {record.diagnosis && (
                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className="text-gray-600">
                      Diagnóstico: {record.diagnosis}
                    </span>
                  </div>
                )}
                {record.treatment && (
                  <div className="mt-2 flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-600">
                      Tratamento: {record.treatment}
                    </span>
                  </div>
                )}
                {record.notes && (
                  <p className="mt-2 text-sm text-gray-500 pl-6">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

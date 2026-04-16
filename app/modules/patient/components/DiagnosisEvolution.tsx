'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument, deleteDocument } from '@/app/lib/firestore-utils';
import { Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';

interface DiagnosisRecord {
  id: string;
  date: string;
  evolution: string;
  createdBy: string;
}

export default function DiagnosisEvolution({ patientId = 'patient-1' }: { patientId?: string }) {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [newEvolution, setNewEvolution] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<DiagnosisRecord>(
      `patients/${patientId}/diagnosisEvolution`,
      (data) => {
        setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvolution.trim()) return;

    await addDocument(`patients/${patientId}/diagnosisEvolution`, {
      patientId,
      date: new Date().toISOString(),
      evolution: newEvolution,
    });

    setNewEvolution('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    // In a real app, we would use a custom modal.
    // For now, we'll just delete directly to avoid blocking the iframe.
    await deleteDocument(`patients/${patientId}/diagnosisEvolution`, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Evolução do Diagnóstico</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evolução / Observações</label>
            <textarea
              value={newEvolution}
              onChange={(e) => setNewEvolution(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="Descreva a evolução do quadro clínico..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            Nenhum registro de evolução encontrado.
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(record.date).toLocaleDateString('pt-BR')}
                  <TrendingUp className="w-4 h-4 ml-2 text-blue-500" />
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{record.evolution}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

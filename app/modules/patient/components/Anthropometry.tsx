'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument, deleteDocument } from '@/app/lib/firestore-utils';
import { Plus, Trash2, Calendar, Ruler, Weight, Activity } from 'lucide-react';

interface AnthroRecord {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  createdBy: string;
}

export default function Anthropometry({ patientId = 'patient-1' }: { patientId?: string }) {
  const [records, setRecords] = useState<AnthroRecord[]>([]);
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<AnthroRecord>(
      `patients/${patientId}/anthropometry`,
      (data) => {
        setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    );
    return () => unsubscribe();
  }, [patientId]);

  const calculateBMI = (w: number, h: number) => {
    if (h === 0) return 0;
    const hInMeters = h / 100;
    return parseFloat((w / (hInMeters * hInMeters)).toFixed(2));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h)) return;

    await addDocument(`patients/${patientId}/anthropometry`, {
      patientId,
      date: new Date().toISOString(),
      weight: w,
      height: h,
      bmi: calculateBMI(w, h),
    });

    setWeight('');
    setHeight('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    // In a real app, we would use a custom modal.
    // For now, we'll just delete directly to avoid blocking the iframe.
    await deleteDocument(`patients/${patientId}/anthropometry`, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Avaliação Antropométrica</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Medição
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 70.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
            <input
              type="number"
              step="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 175"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            Nenhuma medição encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b">Data</th>
                  <th className="p-4 border-b">Peso (kg)</th>
                  <th className="p-4 border-b">Altura (cm)</th>
                  <th className="p-4 border-b">IMC</th>
                  <th className="p-4 border-b text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{record.weight} kg</td>
                    <td className="p-4 text-gray-600">{record.height} cm</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        record.bmi < 18.5 ? 'bg-yellow-100 text-yellow-700' :
                        record.bmi < 25 ? 'bg-green-100 text-green-700' :
                        record.bmi < 30 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.bmi}
                      </span>
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

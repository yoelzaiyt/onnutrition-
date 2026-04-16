'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument, deleteDocument } from '@/app/lib/firestore-utils';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { auth } from '@/firebase';

interface AnamneseRecord {
  id: string;
  date: string;
  complaints: string;
  history: string;
  createdBy: string;
}

export default function Anamnese({ patientId = 'patient-1' }: { patientId?: string }) {
  const [records, setRecords] = useState<AnamneseRecord[]>([]);
  const [newComplaint, setNewComplaint] = useState('');
  const [newHistory, setNewHistory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<AnamneseRecord>(
      `patients/${patientId}/anamnesis`,
      (data) => {
        setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.trim() || !newHistory.trim()) return;

    await addDocument(`patients/${patientId}/anamnesis`, {
      patientId,
      date: new Date().toISOString(),
      complaints: newComplaint,
      history: newHistory,
    });

    setNewComplaint('');
    setNewHistory('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    // In a real app, we would use a custom modal. 
    // For now, we'll just delete directly to avoid blocking the iframe.
    await deleteDocument(`patients/${patientId}/anamnesis`, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Histórico de Anamnese</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Queixas Principais</label>
            <textarea
              value={newComplaint}
              onChange={(e) => setNewComplaint(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descreva as queixas do paciente..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Histórico da Doença Atual</label>
            <textarea
              value={newHistory}
              onChange={(e) => setNewHistory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Descreva o histórico médico..."
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
              Salvar Registro
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            Nenhum registro encontrado.
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(record.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-500 hover:bg-red-50 text-xs p-2 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">Queixas</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{record.complaints}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">Histórico</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{record.history}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import { Plus, Trash2, StickyNote, Calendar, User } from "lucide-react";

interface Observation {
  id: string;
  date: string;
  category: string;
  content: string;
  author?: string;
  priority: "low" | "medium" | "high";
  resolved: boolean;
  createdBy: string;
}

const categories = [
  "Acompanhamento",
  "Alerta",
  "Meta",
  "Lembrete",
  "Evolução",
  "Intercorrência",
  "Outro",
];

export default function Observations({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Observation>(
      `patients/${patientId}/observations`,
      (data) => {
        setObservations(
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
    if (!content) return;

    await addDocument(`patients/${patientId}/observations`, {
      patientId,
      date: new Date().toISOString(),
      category,
      content,
      author: author || undefined,
      priority,
      resolved: false,
    });

    setCategory("");
    setContent("");
    setAuthor("");
    setPriority("medium");
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/observations`, id);
  };

  const toggleResolved = async (obs: Observation) => {
    await addDocument(`patients/${patientId}/observations`, {
      ...obs,
      resolved: !obs.resolved,
    });
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (c: string) => {
    switch (c) {
      case "Alerta":
        return "text-red-500";
      case "Lembrete":
        return "text-blue-500";
      case "Meta":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const unresolved = observations.filter((o) => !o.resolved);
  const resolved = observations.filter((o) => o.resolved);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Observações</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Observação
        </button>
      </div>

      {unresolved.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-xl">
            <span className="text-sm font-medium text-red-700">Pendentes</span>
            <p className="text-2xl font-bold text-red-800">
              {unresolved.length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl">
            <span className="text-sm font-medium text-yellow-700">
              Prioridade Média
            </span>
            <p className="text-2xl font-bold text-yellow-800">
              {unresolved.filter((o) => o.priority === "medium").length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <span className="text-sm font-medium text-green-700">
              Resolvidas
            </span>
            <p className="text-2xl font-bold text-green-800">
              {resolved.length}
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
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600"
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
              Autor
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 p-2 rounded-lg text-sm capitalize transition-all ${
                    priority === p
                      ? getPriorityColor(p) +
                        " ring-2 ring-offset-2 ring-current"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-600"
              rows={3}
              placeholder="Digite sua observação..."
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors"
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
        {observations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhuma observação registrada.
          </div>
        ) : (
          <div className="space-y-4">
            {unresolved.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  Pendentes
                </h4>
                <div className="space-y-3">
                  {unresolved.map((obs) => (
                    <div
                      key={obs.id}
                      className={`bg-white p-4 rounded-xl border-l-4 ${obs.priority === "high" ? "border-l-red-500" : obs.priority === "medium" ? "border-l-yellow-500" : "border-l-gray-300"} hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <StickyNote
                            className={`w-5 h-5 ${getCategoryIcon(obs.category)}`}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {obs.category}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {new Date(obs.date).toLocaleDateString("pt-BR")}
                              {obs.author && (
                                <>
                                  <span>•</span>
                                  <User className="w-3 h-3" />
                                  {obs.author}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(obs.priority)}`}
                          >
                            {obs.priority}
                          </span>
                          <button
                            onClick={() => toggleResolved(obs)}
                            className="text-green-500 hover:bg-green-50 px-2 py-1 rounded-lg text-sm transition-colors"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() => handleDelete(obs.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{obs.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resolved.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 uppercase mb-3">
                  Resolvidas
                </h4>
                <div className="space-y-3">
                  {resolved.map((obs) => (
                    <div
                      key={obs.id}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-100 opacity-60 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <StickyNote className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-600 line-through">
                              {obs.category}
                            </h4>
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {new Date(obs.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(obs.id)}
                          className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-gray-500">{obs.content}</p>
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

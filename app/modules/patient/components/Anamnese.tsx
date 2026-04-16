"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import {
  Plus,
  Trash2,
  Calendar,
  Camera,
  Upload,
  X,
  User,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Image,
  Save,
  Edit,
  CheckCircle,
  Scan,
  Ruler,
  Activity,
  Heart,
  AlertTriangle,
} from "lucide-react";
import BodyScan3D from "./BodyScan3D";

interface WeightRecord {
  id: string;
  date: string;
  currentWeight: number;
  usualWeight: number;
  idealWeight: number;
  maxWeight: number;
  minWeight: number;
  hasSanfona: boolean;
  photoFront?: string;
  photoSide?: string;
  notes?: string;
  createdBy: string;
}

export default function Anamnese({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentWeight, setCurrentWeight] = useState("");
  const [usualWeight, setUsualWeight] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [hasSanfona, setHasSanfona] = useState(false);
  const [notes, setNotes] = useState("");
  const [photoFront, setPhotoFront] = useState<string | null>(null);
  const [photoSide, setPhotoSide] = useState<string | null>(null);
  const [selectedPhotoType, setSelectedPhotoType] = useState<
    "front" | "side" | null
  >(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const [showOnScan, setShowOnScan] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<WeightRecord>(
      `patients/${patientId}/weight-records`,
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

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "side",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "front") {
          setPhotoFront(reader.result as string);
        } else {
          setPhotoSide(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openPhotoUpload = (type: "front" | "side") => {
    setSelectedPhotoType(type);
    if (type === "front") {
      frontInputRef.current?.click();
    } else {
      sideInputRef.current?.click();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    await addDocument(`patients/${patientId}/weight-records`, {
      patientId,
      date: new Date().toISOString(),
      currentWeight: parseFloat(currentWeight) || 0,
      usualWeight: parseFloat(usualWeight) || 0,
      idealWeight: parseFloat(idealWeight) || 0,
      maxWeight: parseFloat(maxWeight) || 0,
      minWeight: parseFloat(minWeight) || 0,
      hasSanfona,
      photoFront: photoFront || undefined,
      photoSide: photoSide || undefined,
      notes: notes || undefined,
    });

    resetForm();
  };

  const resetForm = () => {
    setCurrentWeight("");
    setUsualWeight("");
    setIdealWeight("");
    setMaxWeight("");
    setMinWeight("");
    setHasSanfona(false);
    setNotes("");
    setPhotoFront(null);
    setPhotoSide(null);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(`patients/${patientId}/weight-records`, id);
  };

  const latestRecord = records[0];
  const weightVariation = latestRecord
    ? (latestRecord.currentWeight - latestRecord.usualWeight).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Histórico de Peso
          </h3>
          <p className="text-sm text-gray-500">
            Preencha as informações detalhadas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOnScan(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Scan className="w-4 h-4" />
            ON Scan 3D
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-[#22B391] text-white px-4 py-2 rounded-lg hover:bg-[#1a9580] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Registro
          </button>
        </div>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Atual (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
                placeholder="Ex: 70.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Habitual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={usualWeight}
                onChange={(e) => setUsualWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
                placeholder="Ex: 75.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso Ideal (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={idealWeight}
                onChange={(e) => setIdealWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
                placeholder="Ex: 65.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maior Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
                placeholder="Ex: 80.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menor Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
                placeholder="Ex: 55.0"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSanfona}
                  onChange={(e) => setHasSanfona(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#22B391] focus:ring-[#22B391]"
                />
                <span className="text-sm text-gray-700">Sanfona?</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos Antropométricas
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Foto Frontal</p>
                <div
                  onClick={() => openPhotoUpload("front")}
                  className="aspect-[3/4] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#22B391] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
                >
                  {photoFront ? (
                    <>
                      <img
                        src={photoFront}
                        alt="Foto frontal"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium">
                          Alterar
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-gray-400 text-xs">
                        Clique para adicionar
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, "front")}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Foto Lateral</p>
                <div
                  onClick={() => openPhotoUpload("side")}
                  className="aspect-[3/4] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#22B391] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
                >
                  {photoSide ? (
                    <>
                      <img
                        src={photoSide}
                        alt="Foto lateral"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium">
                          Alterar
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-gray-400 text-xs">
                        Clique para adicionar
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={sideInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, "side")}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-[#22B391] text-white py-3 rounded-lg hover:bg-[#1a9580] transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Salvar Registro
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-xs text-blue-600 font-medium">Peso Atual</p>
          <p className="text-2xl font-black text-blue-700">
            {latestRecord?.currentWeight || "-"}kg
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-xs text-gray-500 font-medium">Habitual</p>
          <p className="text-2xl font-black text-gray-700">
            {latestRecord?.usualWeight || "-"}kg
          </p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl">
          <p className="text-xs text-emerald-600 font-medium">Ideal</p>
          <p className="text-2xl font-black text-emerald-700">
            {latestRecord?.idealWeight || "-"}kg
          </p>
        </div>
        <div
          className={`p-4 rounded-xl ${
            weightVariation && parseFloat(weightVariation) > 0
              ? "bg-red-50"
              : parseFloat(weightVariation) < 0
                ? "bg-green-50"
                : "bg-gray-50"
          }`}
        >
          <p className="text-xs text-gray-500 font-medium">Variação</p>
          <p
            className={`text-2xl font-black ${
              weightVariation && parseFloat(weightVariation) > 0
                ? "text-red-700"
                : parseFloat(weightVariation) < 0
                  ? "text-green-700"
                  : "text-gray-700"
            }`}
          >
            {weightVariation && parseFloat(weightVariation) !== 0
              ? `${weightVariation > 0 ? "+" : ""}${weightVariation}kg`
              : "-"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Scale className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Nenhum registro encontrado.
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-red-500 hover:bg-red-50 text-xs p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium">
                    Peso Atual
                  </p>
                  <p className="text-xl font-bold text-blue-700">
                    {record.currentWeight}kg
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Habitual</p>
                  <p className="text-xl font-bold text-gray-700">
                    {record.usualWeight || "-"}kg
                  </p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600 font-medium">Ideal</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {record.idealWeight || "-"}kg
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600 font-medium">Maior</p>
                  <p className="text-xl font-bold text-red-700">
                    {record.maxWeight || "-"}kg
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-600 font-medium">Menor</p>
                  <p className="text-xl font-bold text-purple-700">
                    {record.minWeight || "-"}kg
                  </p>
                </div>
              </div>

              {(record.photoFront || record.photoSide) && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <p className="col-span-2 text-xs text-gray-500 mb-2">
                    Fotos Antropométricas
                  </p>
                  {record.photoFront && (
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={record.photoFront}
                        alt="Foto frontal"
                        className="w-full h-48 object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                        Frontal
                      </span>
                    </div>
                  )}
                  {record.photoSide && (
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={record.photoSide}
                        alt="Foto lateral"
                        className="w-full h-48 object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                        Lateral
                      </span>
                    </div>
                  )}
                </div>
              )}

              {record.notes && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">{record.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showOnScan && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Scan className="w-6 h-6 text-indigo-600" />
              ON Scan 3D - Avaliação Antropométrica
            </h3>
            <button
              onClick={() => setShowOnScan(false)}
              className="text-gray-500 hover:text-gray-700 px-3 py-1"
            >
              ✕ Fechar
            </button>
          </div>
          <BodyScan3D patientId={patientId} />
        </div>
      )}
    </div>
  );
}

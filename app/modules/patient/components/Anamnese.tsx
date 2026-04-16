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
  Scale,
  Stethoscope,
  Pill,
  Utensils,
  Brain,
  Activity,
  Droplets,
  Target,
  Eye,
  ChevronDown,
  ChevronRight,
  Save,
  Scan,
  Camera,
  Clock,
  Flame,
  Heart,
  Moon,
  Coffee,
  Image,
  Ruler,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

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

interface EatingHabit {
  id: string;
  mealTime: string;
  mealType: string;
  description: string;
  calories?: number;
  notes?: string;
  createdBy: string;
}

interface BehaviorRecord {
  id: string;
  date: string;
  category: string;
  mood: string;
  stressLevel: number;
  sleepHours?: number;
  notes?: string;
  createdBy: string;
}

interface Exercise {
  id: string;
  name: string;
  type: string;
  duration: number;
  intensity: string;
  calories?: number;
  heartRate?: number;
  date: string;
  notes?: string;
  createdBy: string;
}

interface HydrationRecord {
  id: string;
  date: string;
  totalMl: number;
  waterMl?: number;
  teaMl?: number;
  goalMl: number;
  notes?: string;
  createdBy: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  category: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  weightGoal?: number;
  createdBy: string;
}

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

type SectionKey =
  | "weight"
  | "clinical"
  | "medications"
  | "eating"
  | "behavior"
  | "physical"
  | "hydration"
  | "goals"
  | "visual";

const sections: { id: SectionKey; label: string; icon: React.ElementType }[] = [
  { id: "weight", label: "Peso + ON Scan 3D", icon: Scale },
  { id: "clinical", label: "Histórico Clínico", icon: Stethoscope },
  { id: "medications", label: "Meds & Suplementos", icon: Pill },
  { id: "eating", label: "Hábitos Alimentares", icon: Utensils },
  { id: "behavior", label: "Comportamento", icon: Brain },
  { id: "physical", label: "Atividade Física", icon: Activity },
  { id: "hydration", label: "Hidratação", icon: Droplets },
  { id: "goals", label: "Objetivos e Metas", icon: Target },
  { id: "visual", label: "Avaliação Visual", icon: Eye },
];

export default function Anamnese({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [activeSection, setActiveSection] = useState<SectionKey>("weight");
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    new Set(["weight"]),
  );

  const toggleSection = (section: SectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4 rounded-xl mb-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          ANAMNESE COMPLETA - NOVA VERSÃO 2025
        </h3>
        <p className="text-white/70 text-sm">Avaliação nutricional integrada</p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full flex items-center justify-between p-4 transition-colors ${
                activeSection === section.id
                  ? "bg-[#22B391]/10 text-[#22B391]"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                {section.id === "weight" && (
                  <WeightSection patientId={patientId} />
                )}
                {section.id === "clinical" && (
                  <ClinicalSection patientId={patientId} />
                )}
                {section.id === "medications" && (
                  <MedicationsSection patientId={patientId} />
                )}
                {section.id === "eating" && (
                  <EatingSection patientId={patientId} />
                )}
                {section.id === "behavior" && (
                  <BehaviorSection patientId={patientId} />
                )}
                {section.id === "physical" && (
                  <PhysicalSection patientId={patientId} />
                )}
                {section.id === "hydration" && (
                  <HydrationSection patientId={patientId} />
                )}
                {section.id === "goals" && (
                  <GoalsSection patientId={patientId} />
                )}
                {section.id === "visual" && (
                  <VisualSection patientId={patientId} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function WeightSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentWeight, setCurrentWeight] = useState("");
  const [usualWeight, setUsualWeight] = useState("");
  const [idealWeight, setIdealWeight] = useState("");
  const [showOnScan, setShowOnScan] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<WeightRecord>(
      `patients/${patientId}/weight-records`,
      (data) =>
        setRecords(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/weight-records`, {
      patientId,
      date: new Date().toISOString(),
      currentWeight: parseFloat(currentWeight) || 0,
      usualWeight: parseFloat(usualWeight) || 0,
      idealWeight: parseFloat(idealWeight) || 0,
      maxWeight: 0,
      minWeight: 0,
      hasSanfona: false,
    });
    setCurrentWeight("");
    setUsualWeight("");
    setIdealWeight("");
    setIsAdding(false);
  };

  const latestRecord = records[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" /> Novo Peso
        </button>
        <button
          onClick={() => setShowOnScan(!showOnScan)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          <Scan className="w-4 h-4" /> ON Scan 3D
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg"
        >
          <input
            type="number"
            step="0.1"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="Peso atual (kg)"
            className="p-2 border rounded-lg text-sm"
          />
          <input
            type="number"
            step="0.1"
            value={usualWeight}
            onChange={(e) => setUsualWeight(e.target.value)}
            placeholder="Peso habitual"
            className="p-2 border rounded-lg text-sm"
          />
          <input
            type="number"
            step="0.1"
            value={idealWeight}
            onChange={(e) => setIdealWeight(e.target.value)}
            placeholder="Peso ideal"
            className="p-2 border rounded-lg text-sm"
          />
          <button
            type="submit"
            className="col-span-3 bg-emerald-600 text-white py-2 rounded-lg text-sm"
          >
            <Save className="w-4 h-4 inline mr-1" /> Salvar
          </button>
        </form>
      )}

      {showOnScan && (
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-indigo-700 text-sm">
            Módulo ON Scan 3D seria carregado aqui...
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-600">Atual</p>
          <p className="text-xl font-bold text-blue-700">
            {latestRecord?.currentWeight ?? "-"}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Habitual</p>
          <p className="text-xl font-bold text-gray-700">
            {latestRecord?.usualWeight ?? "-"}
          </p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg text-center">
          <p className="text-xs text-emerald-600">Ideal</p>
          <p className="text-xl font-bold text-emerald-700">
            {latestRecord?.idealWeight ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ClinicalSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [condition, setCondition] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const conditions = [
    "Hipertensão",
    "Diabetes",
    "Dislipidemia",
    "Obesidade",
    "Hipotireoidismo",
    "Outros",
  ];

  useEffect(() => {
    const unsubscribe = subscribeToCollection<ClinicalRecord>(
      `patients/${patientId}/clinical-history`,
      (data) =>
        setRecords(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/clinical-history`, {
      patientId,
      date: new Date().toISOString(),
      condition,
      diagnosis: diagnosis || undefined,
      notes: notes || undefined,
    });
    setCondition("");
    setDiagnosis("");
    setNotes("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Novo Histórico
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="">Selecione...</option>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Diagnóstico"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações"
            className="w-full p-2 border rounded-lg text-sm"
            rows={2}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="space-y-2">
        {records.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between p-2 bg-white rounded-lg"
          >
            <div>
              <p className="font-medium text-sm">{r.condition}</p>
              <p className="text-xs text-gray-500">
                {new Date(r.date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedicationsSection({ patientId }: { patientId: string }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Medication>(
      `patients/${patientId}/medications`,
      (data) => setMedications(data),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/medications`, {
      patientId,
      name,
      dosage,
      frequency: frequency || undefined,
      startDate: new Date().toISOString(),
      active: true,
    });
    setName("");
    setDosage("");
    setFrequency("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Novo Medicamento
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do medicamento"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Dosagem"
              className="p-2 border rounded-lg text-sm"
            />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="p-2 border rounded-lg text-sm"
            >
              <option value="">Frequência</option>
              <option value="1x/dia">1x/dia</option>
              <option value="2x/dia">2x/dia</option>
              <option value="3x/dia">3x/dia</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-2">
        {medications.slice(0, 3).map((med) => (
          <div
            key={med.id}
            className="flex items-center gap-2 p-2 bg-white rounded-lg"
          >
            <Pill className="w-4 h-4 text-purple-500" />
            <div className="flex-1">
              <p className="font-medium text-sm">{med.name}</p>
              <p className="text-xs text-gray-500">{med.dosage}</p>
            </div>
            {med.active && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Ativo
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EatingSection({ patientId }: { patientId: string }) {
  const [habits, setHabits] = useState<EatingHabit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [mealTime, setMealTime] = useState("");
  const [mealType, setMealType] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<EatingHabit>(
      `patients/${patientId}/eating-habits`,
      (data) => setHabits(data),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/eating-habits`, {
      patientId,
      mealTime,
      mealType: mealType || undefined,
      description,
    });
    setMealTime("");
    setMealType("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Nova Refeição
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <div className="grid grid-cols-2 gap-2">
            <select
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="p-2 border rounded-lg text-sm"
            >
              <option value="">Horário</option>
              {["07:00", "08:00", "12:00", "13:00", "19:00", "20:00"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="p-2 border rounded-lg text-sm"
            >
              <option value="">Tipo</option>
              <option value="Café da manhã">Café</option>
              <option value="Almoço">Almoço</option>
              <option value="Jantar">Jantar</option>
              <option value="Lanche">Lanche</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da refeição"
            className="w-full p-2 border rounded-lg text-sm"
            rows={2}
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="space-y-1">
        {habits.slice(0, 5).map((h) => (
          <div
            key={h.id}
            className="flex items-center gap-2 p-2 bg-white rounded-lg"
          >
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 w-12">{h.mealTime}</span>
            <span className="flex-1 text-sm">{h.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BehaviorSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [mood, setMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<BehaviorRecord>(
      `patients/${patientId}/behavior`,
      (data) =>
        setRecords(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/behavior`, {
      patientId,
      date: new Date().toISOString(),
      category: "Comportamento",
      mood,
      stressLevel,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
    });
    setMood("");
    setStressLevel(5);
    setSleepHours("");
    setIsAdding(false);
  };

  const latestRecord = records[0];

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-pink-500 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Novo Registro
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <div>
            <label className="text-xs text-gray-500">Humor</label>
            <div className="flex gap-1">
              {["happy", "neutral", "sad", "anxious"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`flex-1 p-2 rounded-lg text-xs ${mood === m ? "bg-pink-200" : "bg-gray-100"}`}
                >
                  {m === "happy" && "😊"}
                  {m === "neutral" && "😐"}
                  {m === "sad" && "😢"}
                  {m === "anxious" && "😰"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">
              Estresse: {stressLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <input
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="Horas de sono"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      {latestRecord && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-pink-50 p-2 rounded-lg text-center">
            <p className="text-xs text-pink-600">Humor</p>
            <p className="text-lg">
              {latestRecord.mood === "happy"
                ? "😊"
                : latestRecord.mood === "sad"
                  ? "😢"
                  : "😐"}
            </p>
          </div>
          <div className="bg-pink-50 p-2 rounded-lg text-center">
            <p className="text-xs text-pink-600">Estresse</p>
            <p className="text-lg font-bold">{latestRecord.stressLevel}</p>
          </div>
          <div className="bg-pink-50 p-2 rounded-lg text-center">
            <p className="text-xs text-pink-600">Sono</p>
            <p className="text-lg font-bold">
              {latestRecord.sleepHours || "-"}h
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PhysicalSection({ patientId }: { patientId: string }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Exercise>(
      `patients/${patientId}/physical-activity`,
      (data) =>
        setExercises(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/physical-activity`, {
      patientId,
      name,
      type: type || undefined,
      duration: parseInt(duration) || 0,
      date: new Date().toISOString(),
    });
    setName("");
    setType("");
    setDuration("");
    setIsAdding(false);
  };

  const totalMinutes = exercises.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Novo Exercício
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do exercício"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 border rounded-lg text-sm"
            >
              <option value="">Tipo</option>
              <option value="Cardio">Cardio</option>
              <option value="Força">Força</option>
              <option value="Yoga">Yoga</option>
            </select>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duração (min)"
              className="p-2 border rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      {exercises.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-cyan-50 rounded-lg">
          <Activity className="w-5 h-5 text-cyan-600" />
          <span className="text-sm text-cyan-700">
            Total: <strong>{totalMinutes} min</strong>
          </span>
        </div>
      )}
    </div>
  );
}

function HydrationSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<HydrationRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [waterMl, setWaterMl] = useState("");
  const [goalMl, setGoalMl] = useState("2500");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<HydrationRecord>(
      `patients/${patientId}/hydration`,
      (data) =>
        setRecords(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseInt(waterMl) || 0;
    await addDocument(`patients/${patientId}/hydration`, {
      patientId,
      date: new Date().toISOString(),
      totalMl: total,
      waterMl: total || undefined,
      goalMl: parseInt(goalMl) || 2500,
    });
    setWaterMl("");
    setIsAdding(false);
  };

  const todayRecord = records.find((r) =>
    r.date.startsWith(new Date().toISOString().split("T")[0]),
  );
  const percentage = todayRecord
    ? Math.round((todayRecord.totalMl / todayRecord.goalMl) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Registrar
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <input
            type="number"
            value={waterMl}
            onChange={(e) => setWaterMl(e.target.value)}
            placeholder="Quantidade de água (ml)"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <input
            type="number"
            value={goalMl}
            onChange={(e) => setGoalMl(e.target.value)}
            placeholder="Meta diária (ml)"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
        <div className="w-12 h-12 relative">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${percentage * 1.26} 126`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
              {percentage}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-blue-700">
            {todayRecord?.totalMl || 0} ml
          </p>
          <p className="text-xs text-blue-600">Meta: {goalMl} ml</p>
        </div>
      </div>
    </div>
  );
}

function GoalsSection({ patientId }: { patientId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weightGoal, setWeightGoal] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Goal>(
      `patients/${patientId}/goals`,
      (data) => setGoals(data),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/goals`, {
      patientId,
      title,
      targetDate: new Date(targetDate).toISOString(),
      category: "Peso",
      weightGoal: weightGoal ? parseFloat(weightGoal) : undefined,
      progress: 0,
      status: "pending",
    });
    setTitle("");
    setTargetDate("");
    setWeightGoal("");
    setIsAdding(false);
  };

  const activeGoals = goals.filter((g) => g.status !== "completed");

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Nova Meta
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da meta"
            className="w-full p-2 border rounded-lg text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="p-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              step="0.1"
              value={weightGoal}
              onChange={(e) => setWeightGoal(e.target.value)}
              placeholder="Meta de peso"
              className="p-2 border rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="space-y-2">
        {activeGoals.slice(0, 3).map((goal) => (
          <div key={goal.id} className="p-2 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{goal.title}</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {goal.progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualSection({ patientId }: { patientId: string }) {
  const [assessments, setAssessments] = useState<VisualAssessment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<VisualAssessment>(
      `patients/${patientId}/visual-assessment`,
      (data) =>
        setAssessments(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
    );
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const measurements: any = {};
    if (waist) measurements.waist = parseFloat(waist);
    if (hip) measurements.hip = parseFloat(hip);

    await addDocument(`patients/${patientId}/visual-assessment`, {
      patientId,
      date: new Date().toISOString(),
      type,
      description: description || undefined,
      measurements:
        Object.keys(measurements).length > 0 ? measurements : undefined,
    });
    setType("");
    setDescription("");
    setWaist("");
    setHip("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        <Plus className="w-4 h-4" /> Nova Avaliação
      </button>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 bg-white rounded-lg"
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="">Tipo</option>
            <option value="Foto Inicial">Foto Inicial</option>
            <option value="Foto Progresso">Foto Progresso</option>
            <option value="Medição">Medição Corporal</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="Cintura (cm)"
              className="p-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              placeholder="Quadril (cm)"
              className="p-2 border rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-2">
        {assessments.slice(0, 2).map((a) => (
          <div key={a.id} className="p-2 bg-white rounded-lg">
            <p className="font-medium text-sm">{a.type}</p>
            <p className="text-xs text-gray-500">
              {new Date(a.date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

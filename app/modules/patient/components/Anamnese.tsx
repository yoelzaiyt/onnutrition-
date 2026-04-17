"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToCollection,
  addDocument,
  deleteDocument,
} from "@/app/lib/firestore-utils";
import AnamnesisWizard from "@/app/components/features/AnamnesisWizard";
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
  Sparkles,
  Zap,
  TrendingUp,
  History,
  Info
} from "lucide-react";

// --- Interfaces ---
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

const sections: { id: SectionKey; label: string; icon: React.ElementType; color: string }[] = [
  { id: "weight", label: "Peso + ON Scan 3D", icon: Scale, color: "text-emerald-400" },
  { id: "clinical", label: "Histórico Clínico", icon: Stethoscope, color: "text-blue-400" },
  { id: "medications", label: "Meds & Suplementos", icon: Pill, color: "text-purple-400" },
  { id: "eating", label: "Hábitos Alimentares", icon: Utensils, color: "text-orange-400" },
  { id: "behavior", label: "Comportamento", icon: Brain, color: "text-pink-400" },
  { id: "physical", label: "Atividade Física", icon: Activity, color: "text-cyan-400" },
  { id: "hydration", label: "Hidratação", icon: Droplets, color: "text-sky-400" },
  { id: "goals", label: "Objetivos e Metas", icon: Target, color: "text-emerald-500" },
  { id: "visual", label: "Avaliação Visual", icon: Eye, color: "text-violet-400" },
];

export default function Anamnese({
  patientId = "patient-1",
}: {
  patientId?: string;
}) {
  const [viewMode, setViewMode] = useState<"wizard" | "tools">("wizard");
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set([]));
  const [wizardSaved, setWizardSaved] = useState(false);

  const handleSaveWizard = async (data: any) => {
    try {
      await addDocument(`patients/${patientId}/anamnesis_wizard_data`, {
        patientId,
        date: new Date().toISOString(),
        ...data,
      });
      setWizardSaved(true);
      setTimeout(() => setWizardSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar wizard:", error);
    }
  };

  const toggleSection = (section: SectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
      if (activeSection === section) setActiveSection(null);
    } else {
      newExpanded.add(section);
      setActiveSection(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f16] rounded-[32px] shadow-2xl border border-white/5 overflow-hidden font-sans text-slate-200">
      
      {/* Header Premium */}
      <div className="relative border-b border-white/5 bg-[#0f1520] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22B391] rounded-full blur-[100px] opacity-10 mix-blend-screen pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#22B391]/20 to-[#125c4a]/10 border border-[#22B391]/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,179,145,0.2)]">
              <Sparkles className="w-6 h-6 text-[#45dcb9]" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                ANAMNESE 
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#22B391]/20 text-[#45dcb9] border border-[#22B391]/30">Inteligente</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Avaliação Clínica • Rastreamento de Hábitos • Evolução IA
              </p>
            </div>
          </div>
          
          {/* Mode Switcher Premium */}
          <div className="flex bg-[#0a0f16] p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode("wizard")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                viewMode === "wizard"
                  ? "bg-[#22B391] text-[#0a0f16] shadow-lg shadow-[#22B391]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Wizard
            </button>
            <button
              onClick={() => setViewMode("tools")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                viewMode === "tools"
                  ? "bg-[#22B391] text-[#0a0f16] shadow-lg shadow-[#22B391]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Ferramentas
            </button>
          </div>
        </div>
      </div>

      {wizardSaved && (
        <div className="m-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">Anamnese Avançada salva com sucesso no perfil!</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
        {viewMode === "wizard" ? (
          <div className="bg-[#0f1520] rounded-[32px] overflow-hidden border border-white/5 p-1 animate-in fade-in zoom-in-95 duration-500">
            <AnamnesisWizard 
              patientId={patientId} 
              onSave={handleSaveWizard} 
              onBack={() => setViewMode("tools")} 
            />
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Legend/Banner */}
            <div className="relative group bg-gradient-to-br from-[#0B2B24] to-[#111827] p-6 rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#22B391] rounded-full blur-[60px] opacity-10" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                     <History className="w-5 h-5 text-[#45dcb9]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic tracking-tight">Registro de Evolução Diária</h3>
                    <p className="text-xs text-slate-400 font-medium">Controle pontual de hábitos e condições clínicas do paciente.</p>
                  </div>
               </div>
            </div>

            {/* Accordion Tools */}
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`group border transition-all duration-300 rounded-[24px] overflow-hidden ${
                    expandedSections.has(section.id)
                      ? "bg-[#0f1520] border-[#22B391]/30 shadow-[0_0_20px_rgba(34,179,145,0.05)]"
                      : "bg-[#0f1520]/50 border-white/5 hover:border-white/10 hover:bg-[#0f1520]"
                  }`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-[#22B391]/30 transition-all ${expandedSections.has(section.id) ? "shadow-[inset_0_0_10px_rgba(34,179,145,0.1)]" : ""}`}>
                        <section.icon className={`w-5 h-5 ${section.color}`} />
                      </div>
                      <span className={`font-bold text-sm tracking-tight ${expandedSections.has(section.id) ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                        {section.label}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedSections.has(section.id) ? "bg-[#22B391] text-[#0a0f16]" : "bg-white/5 text-slate-500"}`}>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {expandedSections.has(section.id) && (
                    <div className="p-6 border-t border-white/5 bg-[#0a0f16]/40 animate-in slide-in-from-top-2 duration-300">
                      {section.id === "weight" && <WeightSection patientId={patientId} />}
                      {section.id === "clinical" && <ClinicalSection patientId={patientId} />}
                      {section.id === "medications" && <MedicationsSection patientId={patientId} />}
                      {section.id === "eating" && <EatingSection patientId={patientId} />}
                      {section.id === "behavior" && <BehaviorSection patientId={patientId} />}
                      {section.id === "physical" && <PhysicalSection patientId={patientId} />}
                      {section.id === "hydration" && <HydrationSection patientId={patientId} />}
                      {section.id === "goals" && <GoalsSection patientId={patientId} />}
                      {section.id === "visual" && <VisualSection patientId={patientId} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Compliance */}
      <div className="bg-[#0f1520] border-t border-white/5 p-4 text-[10px] font-bold text-slate-600 flex justify-between items-center uppercase tracking-[0.1em]">
         <div className="flex gap-6">
            <span className="flex items-center gap-1.5 font-black text-[#45dcb9]/50"><Info className="w-3 h-3"/> Dados Seguros con ON Crypt</span>
            <span className="flex items-center gap-1.5 opacity-50"><CheckCircle className="w-3 h-3"/> HIPAA Compliant</span>
         </div>
         <div className="opacity-40">ONNutrition — v2.5.0</div>
      </div>
    </div>
  );
}

// --- Sub-components (Re-styled for Premium Dark) ---

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
      (data) => setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
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
    });
    setCurrentWeight(""); setUsualWeight(""); setIdealWeight(""); setIsAdding(false);
  };

  const latestRecord = records[0];

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-[#22B391] text-[#0a0f16] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#34b093] transition-all">
          <Plus className="w-4 h-4" /> Novo Peso
        </button>
        <button onClick={() => setShowOnScan(!showOnScan)} className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600/30 transition-all">
          <Scan className="w-4 h-4" /> ON Scan 3D
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px] animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Peso Atual (kg)</label>
            <input type="number" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#45dcb9] outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Habitual</label>
            <input type="number" step="0.1" value={usualWeight} onChange={(e) => setUsualWeight(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#45dcb9] outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Ideal</label>
            <input type="number" step="0.1" value={idealWeight} onChange={(e) => setIdealWeight(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#45dcb9] outline-none" />
          </div>
          <button type="submit" className="md:col-span-3 bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-black uppercase text-white hover:bg-[#22B391] hover:text-[#0a0f16] transition-all">
            Salvar Registro
          </button>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Peso Atual", val: latestRecord?.currentWeight, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
          { label: "Habitual", val: latestRecord?.usualWeight, color: "text-slate-300", bg: "bg-white/5", border: "border-white/5" },
          { label: "Ideal", val: latestRecord?.idealWeight, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} ${stat.border} border p-5 rounded-[24px] text-center shadow-xl`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val ?? "-"} <span className="text-[10px] font-bold text-slate-600">KG</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClinicalSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [condition, setCondition] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const conditions = ["Hipertensão", "Diabetes", "Dislipidemia", "Obesidade", "Hipotireoidismo", "DOP", "Outros"];

  useEffect(() => {
    const unsubscribe = subscribeToCollection<ClinicalRecord>(`patients/${patientId}/clinical-history`, (data) => setRecords(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/clinical-history`, { patientId, date: new Date().toISOString(), condition, diagnosis });
    setCondition(""); setDiagnosis(""); setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2">
        <Plus className="w-4 h-4" /> Novo Histórico
      </button>

      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px] animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Condição Principal</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500">
              <option value="">Selecione...</option>
              {conditions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Diagnóstico Clínico</label>
            <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Ex: CID-10 E11" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600/20 text-blue-400 border border-blue-600/30 py-3 rounded-xl text-xs font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
            Adicionar ao Prontuário
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {records.map(r => (
          <div key={r.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/[0.05] transition-all">
            <div>
              <p className="font-black text-white text-sm">{r.condition}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{r.diagnosis || "Sem diagnóstico específico"}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-600">{new Date(r.date).toLocaleDateString()}</span>
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

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Medication>(`patients/${patientId}/medications`, (data) => setMedications(data));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/medications`, { patientId, name, dosage, startDate: new Date().toISOString(), active: true });
    setName(""); setDosage(""); setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setIsAdding(!isAdding)} className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-500 transition-all flex items-center gap-2">
        <Plus className="w-4 h-4" /> Novo Registro
      </button>

      {isAdding && (
        <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px] animate-in slide-in-from-top-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do fármaco ou suplemento" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500" />
          <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="Ex: 50mg, 1 scoop" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500" />
          <button type="submit" className="w-full bg-purple-600/20 text-purple-400 border border-purple-600/30 py-3 rounded-xl text-xs font-black uppercase hover:bg-purple-600 hover:text-white transition-all">Salvar</button>
        </form>
      )}

      <div className="space-y-2">
        {medications.map(med => (
          <div key={med.id} className="bg-[#0a0f16]/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Pill className="w-5 h-5 text-purple-400" />
             </div>
             <div className="flex-1">
               <p className="font-bold text-white text-sm">{med.name}</p>
               <p className="text-xs text-slate-500">{med.dosage}</p>
             </div>
             <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">Ativo</span>
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
  const [description, setDescription] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<EatingHabit>(`patients/${patientId}/eating-habits`, (data) => setHabits(data));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/eating-habits`, { patientId, mealTime, description });
    setMealTime(""); setDescription(""); setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setIsAdding(!isAdding)} className="bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
        Adicionar Refeição
      </button>

      {isAdding && (
         <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px] animate-in slide-in-from-top-2">
            <input type="time" value={mealTime} onChange={(e) => setMealTime(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-orange-500" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Composição habitual da refeição..." className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm min-h-[80px] outline-none focus:border-orange-500" />
            <button type="submit" className="w-full bg-orange-600/20 text-orange-400 border border-orange-600/30 py-3 rounded-xl text-xs font-black uppercase hover:bg-orange-600">Salvar</button>
         </form>
      )}

      <div className="space-y-3">
        {habits.map(h => (
          <div key={h.id} className="bg-[#0f1520] border-l-4 border-orange-500/50 p-4 rounded-r-2xl shadow-lg flex gap-4">
             <div className="text-orange-400 font-black text-sm">{h.mealTime}</div>
             <p className="text-sm text-slate-300 leading-relaxed">{h.description}</p>
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
    const unsubscribe = subscribeToCollection<BehaviorRecord>(`patients/${patientId}/behavior`, (data) => setRecords(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/behavior`, { patientId, date: new Date().toISOString(), category: "Comportamento", mood, stressLevel, sleepHours: parseFloat(sleepHours) });
    setMood(""); setStressLevel(5); setSleepHours(""); setIsAdding(false);
  };

  const latest = records[0];

  return (
    <div className="space-y-6">
       <button onClick={() => setIsAdding(!isAdding)} className="bg-pink-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">Registrar Humor/Sono</button>
       
       {isAdding && (
         <form onSubmit={handleAdd} className="space-y-6 p-5 bg-[#0f1520] border border-white/5 rounded-[20px]">
            <div className="flex justify-between items-center bg-[#0a0f16] p-2 rounded-2xl border border-white/5">
                {["happy", "neutral", "sad"].map(m => (
                  <button key={m} type="button" onClick={() => setMood(m)} className={`text-2xl p-4 rounded-xl transition-all ${mood === m ? "bg-pink-500/20 border border-pink-500/30 scale-110 shadow-lg" : "grayscale opacity-30 hover:opacity-100"}`}>
                    {m === "happy" ? "😊" : m === "neutral" ? "😐" : "😢"}
                  </button>
                ))}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase">Nível de Estresse: {stressLevel}/10</label>
              <input type="range" min="1" max="10" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full accent-pink-500" />
            </div>
            <input type="number" placeholder="Horas de sono" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm" />
            <button type="submit" className="w-full bg-pink-600/20 text-pink-400 border border-pink-600/30 py-3 rounded-xl text-xs font-black uppercase">Salvar</button>
         </form>
       )}

       {latest && (
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-pink-500/5 border border-pink-500/10 p-5 rounded-[24px] text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Humor</p>
                <span className="text-3xl">{latest.mood === 'happy' ? '😊' : latest.mood === 'sad' ? '😢' : '😐'}</span>
             </div>
             <div className="bg-pink-500/5 border border-pink-500/10 p-5 rounded-[24px] text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Estresse</p>
                <div className="text-xl font-black text-pink-400">{latest.stressLevel}<span className="text-[10px] text-slate-600">/10</span></div>
             </div>
             <div className="bg-pink-500/5 border border-pink-500/10 p-5 rounded-[24px] text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Sono</p>
                <div className="text-xl font-black text-slate-200">{latest.sleepHours}<span className="text-[10px] text-slate-600">H</span></div>
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
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Exercise>(`patients/${patientId}/physical-activity`, (data) => setExercises(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/physical-activity`, { patientId, name, duration: parseInt(duration), date: new Date().toISOString() });
    setName(""); setDuration(""); setIsAdding(false);
  };

  return (
    <div className="space-y-4">
       <button onClick={() => setIsAdding(!isAdding)} className="bg-cyan-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">Registrar Atividade</button>
       {isAdding && (
         <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px]">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Musculação, Corrida" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-500" />
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duração em minutos" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-500" />
            <button type="submit" className="w-full bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 py-3 rounded-xl text-xs font-black uppercase">Salvar</button>
         </form>
       )}
       <div className="space-y-2">
         {exercises.slice(0, 3).map(ex => (
           <div key={ex.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                 <Activity className="w-4 h-4 text-cyan-400" />
                 <span className="text-sm font-bold text-slate-200">{ex.name}</span>
              </div>
              <span className="text-xs font-black text-cyan-500">{ex.duration} MIN</span>
           </div>
         ))}
       </div>
    </div>
  );
}

function HydrationSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<HydrationRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [waterMl, setWaterMl] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<HydrationRecord>(`patients/${patientId}/hydration`, (data) => setRecords(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/hydration`, { patientId, date: new Date().toISOString(), totalMl: parseInt(waterMl), goalMl: 2500 });
    setWaterMl(""); setIsAdding(false);
  };

  const today = records[0];
  const percentage = today ? Math.min(100, Math.round((today.totalMl / 2500) * 100)) : 0;

  return (
    <div className="space-y-6">
       <button onClick={() => setIsAdding(!isAdding)} className="bg-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">Adicionar Água</button>
       {isAdding && (
         <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px]">
            <input type="number" value={waterMl} onChange={(e) => setWaterMl(e.target.value)} placeholder="Mililitros (ml)" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm" />
            <button type="submit" className="w-full bg-sky-600/20 text-sky-400 border border-sky-600/30 py-3 rounded-xl text-xs font-black uppercase">Registrar</button>
         </form>
       )}
       <div className="bg-[#0a0f16] p-6 rounded-[24px] border border-white/5 flex items-center justify-between shadow-inner">
          <div className="space-y-1">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress Diário</p>
             <h4 className="text-3xl font-black text-white">{today?.totalMl || 0} <span className="text-xs text-slate-600">ml / 2500ml</span></h4>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/5 flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-pulse" style={{ clipPath: `inset(${100-percentage}% 0 0 0)` }} />
             <span className="text-xs font-black text-sky-400">{percentage}%</span>
          </div>
       </div>
    </div>
  );
}

function GoalsSection({ patientId }: { patientId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Goal>(`patients/${patientId}/goals`, (data) => setGoals(data));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/goals`, { patientId, title, targetDate: new Date().toISOString(), progress: 0, status: "pending" });
    setTitle(""); setIsAdding(false);
  };

  return (
    <div className="space-y-4">
       <button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">Criar Meta</button>
       {isAdding && (
         <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px]">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="O que deseja alcançar?" className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm" />
            <button type="submit" className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 py-3 rounded-xl text-xs font-black uppercase">Confirmar Objetivo</button>
         </form>
       )}
       <div className="space-y-3">
         {goals.map(g => (
           <div key={g.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 group shadow-sm">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{g.title}</span>
                 <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{g.progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#0a0f16] rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-1000" style={{ width: `${g.progress}%` }} />
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

  useEffect(() => {
    const unsubscribe = subscribeToCollection<VisualAssessment>(`patients/${patientId}/visual-assessment`, (data) => setAssessments(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    return () => unsubscribe();
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument(`patients/${patientId}/visual-assessment`, { patientId, date: new Date().toISOString(), type });
    setType(""); setIsAdding(false);
  };

  return (
    <div className="space-y-6">
       <button onClick={() => setIsAdding(!isAdding)} className="bg-violet-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">Nova Avaliação Visual</button>
       {isAdding && (
         <form onSubmit={handleAdd} className="space-y-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px]">
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm outline-none">
              <option value="">Selecione o tipo de registro...</option>
              <option value="Registro por Foto">Registro por Foto</option>
              <option value="Medição de Perímetros">Medição de Perímetros</option>
            </select>
            <button type="submit" className="w-full bg-violet-600/20 text-violet-400 border border-violet-600/30 py-3 rounded-xl text-xs font-black uppercase">Continuar</button>
         </form>
       )}
       <div className="grid grid-cols-2 gap-4">
         {assessments.slice(0, 4).map(a => (
           <div key={a.id} className="bg-[#0f1520] border border-white/5 p-5 rounded-[24px] text-center hover:bg-violet-600/5 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 mx-auto mb-3">
                 <Camera className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">{a.type}</p>
              <p className="text-xs font-bold text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
           </div>
         ))}
       </div>
    </div>
  );
}

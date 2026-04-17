"use client";

import React, { useState, useEffect } from "react";
import { 
  addDocument, 
  getDocuments, 
  deleteDocument,
  subscribeToTable 
} from "@/app/lib/supabase-utils";
import AnamnesisWizard from "@/app/components/features/AnamnesisWizard";
import { motion, AnimatePresence } from "framer-motion";
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
  Info,
  Shield
} from "lucide-react";

// --- Interfaces ---
interface WeightRecord {
  id: string;
  date: string;
  current_weight: number;
  usual_weight: number;
  ideal_weight: number;
  patient_id: string;
}

interface ClinicalRecord {
  id: string;
  date: string;
  condition: string;
  diagnosis?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  active: boolean;
}

interface EatingHabit {
  id: string;
  meal_time: string;
  description: string;
}

interface BehaviorRecord {
  id: string;
  date: string;
  mood: string;
  stress_level: number;
  sleep_hours?: number;
}

interface Exercise {
  id: string;
  name: string;
  duration: number;
  date: string;
}

interface HydrationRecord {
  id: string;
  date: string;
  total_ml: number;
  goal_ml: number;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface VisualAssessment {
  id: string;
  date: string;
  type: string;
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
  patientId = "7a2b2c3d-1a2b-3c4d-5e6f-7g8h9i0j1k2l", // UUID Example
}: {
  patientId?: string;
}) {
  const [viewMode, setViewMode] = useState<"wizard" | "tools">("tools");
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set([]));
  const [wizardSaved, setWizardSaved] = useState(false);

  const handleSaveWizard = async (data: any) => {
    try {
      const { error } = await addDocument("anamnesis_records", {
        patient_id: patientId,
        nutri_id: "7a2b2c3d-1a2b-3c4d-5e6f-7g8h9i0j1k2l", // Fallback
        data: data,
        score: data.score || 0,
      });
      
      if (!error) {
        setWizardSaved(true);
        setTimeout(() => setWizardSaved(false), 3000);
      }
    } catch (error) {
      console.error("Erro ao salvar wizard no Supabase:", error);
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
    <div className="flex flex-col h-full bg-[#0a0f16] rounded-[32px] shadow-2xl border border-white/5 overflow-hidden font-sans text-slate-200 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,179,145,0.05)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header Premium - "Console de Comando" */}
      <div className="relative border-b border-white/5 bg-[#0f1520]/80 backdrop-blur-xl p-8 overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22B391] rounded-full blur-[120px] opacity-10 mix-blend-screen pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-[#22B391] to-[#125c4a] rounded-[22px] flex items-center justify-center shadow-[0_10px_30px_rgba(34,179,145,0.3)] border border-white/20"
            >
              <Stethoscope className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black tracking-tighter text-white">ANAMNESE CLÍNICA</h2>
                <span className="px-3 py-1 rounded-full text-[10px] uppercase font-black bg-[#22B391]/10 text-[#45dcb9] border border-[#22B391]/20">Pro Engine v3.0</span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#22B391]" /> Interface Sinérgica de Diagnóstico
              </p>
            </div>
          </div>
          
          <div className="flex bg-black/40 p-1.5 rounded-[20px] border border-white/5 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setViewMode("wizard")}
              className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black rounded-Xl transition-all uppercase tracking-widest ${
                viewMode === "wizard"
                  ? "bg-[#22B391] text-[#0a0f16] shadow-xl shadow-[#22B391]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Zap className="w-4 h-4" /> Fluxo Guiado
            </button>
            <button
              onClick={() => setViewMode("tools")}
              className={`flex items-center gap-2 px-6 py-3 text-[11px] font-black rounded-Xl transition-all uppercase tracking-widest ${
                viewMode === "tools"
                  ? "bg-[#22B391] text-[#0a0f16] shadow-xl shadow-[#22B391]/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Activity className="w-4 h-4" /> Painel Geral
            </button>
          </div>
        </div>
      </div>

      {wizardSaved && (
        <div className="m-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">Anamnese unificada salva no Supabase com sucesso!</span>
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
          <div className="space-y-12 max-w-6xl mx-auto py-4">
            {/* Status Card Unificado */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative group bg-gradient-to-br from-[#111827] to-[#0a0f16] p-8 rounded-[40px] border border-white/5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
               <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#22B391] rounded-full blur-[100px] opacity-10 pointer-events-none" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-[#22B391]/10 flex items-center justify-center border border-[#22B391]/20">
                       <Shield className="w-8 h-8 text-[#45dcb9]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic tracking-tight mb-1">Ecossistema ONN Sincronizado</h3>
                      <p className="text-sm text-slate-400 font-medium">O paciente visualiza estas atualizações em tempo real no app móvel.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Última Att</p>
                      <p className="text-sm font-black text-white">Hoje, 14:30</p>
                    </div>
                    <div className="bg-[#22B391]/10 px-6 py-4 rounded-3xl border border-[#22B391]/20 text-center">
                      <p className="text-[10px] font-black text-[#22B391] uppercase tracking-widest mb-1">Status Sync</p>
                      <p className="text-sm font-black text-[#45dcb9]">Online</p>
                    </div>
                  </div>
               </div>
            </motion.div>

            {/* Grid de Ferramentas Sinérgicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {sections.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => toggleSection(section.id)}
                    className={`relative p-8 rounded-[35px] cursor-pointer transition-all duration-500 group overflow-hidden border ${
                      activeSection === section.id
                        ? "bg-gradient-to-br from-[#0f1520] to-[#0a0f16] border-[#22B391]/50 shadow-[0_20px_40px_rgba(34,179,145,0.1)] col-span-1 md:col-span-2 lg:col-span-3"
                        : "bg-[#0f1520] border-white/5 hover:border-white/20 hover:shadow-2xl"
                    }`}
                  >
                    {/* Background Icon Watermark */}
                    <section.icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.03] rotate-12 transition-all group-hover:opacity-[0.06] group-hover:scale-110 ${section.color}`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-[#22B391]/30 transition-all ${activeSection === section.id ? "bg-[#22B391]/10 border-[#22B391]/30" : ""}`}>
                          <section.icon className={`w-7 h-7 ${section.color}`} />
                        </div>
                        {activeSection === section.id ? (
                           <button className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 group-hover:bg-[#22B391] group-hover:text-black transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <h4 className={`text-xl font-black tracking-tighter transition-colors ${activeSection === section.id ? "text-[#45dcb9]" : "text-white group-hover:text-[#45dcb9]"}`}>
                          {section.label}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">Gestão integrada de dados clínicos e biométricos.</p>
                      </div>

                      {activeSection === section.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-10 pt-10 border-t border-white/5"
                        >
                          {section.id === "weight" && <WeightSection patientId={patientId} />}
                          {section.id === "clinical" && <ClinicalSection patientId={patientId} />}
                          {section.id === "medications" && <MedicationsSection patientId={patientId} />}
                          {section.id === "eating" && <EatingSection patientId={patientId} />}
                          {section.id === "behavior" && <BehaviorSection patientId={patientId} />}
                          {section.id === "physical" && <PhysicalSection patientId={patientId} />}
                          {section.id === "hydration" && <HydrationSection patientId={patientId} />}
                          {section.id === "goals" && <GoalsSection patientId={patientId} />}
                          {section.id === "visual" && <VisualSection patientId={patientId} />}
                          
                          <div className="mt-12 flex justify-end gap-4">
                             <button onClick={() => setActiveSection(null)} className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Fechar</button>
                             <button className="flex items-center gap-2 px-8 py-3 bg-[#22B391] text-[#0a0f16] text-xs font-black rounded-xl uppercase tracking-widest hover:bg-[#1C9A7D] shadow-xl shadow-[#22B391]/20">
                                <Save className="w-4 h-4" /> Salvar Alterações
                             </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Footer Compliance */}
      <div className="bg-[#0f1520] border-t border-white/5 p-4 text-[10px] font-bold text-slate-600 flex justify-between items-center uppercase tracking-[0.1em]">
         <div className="flex gap-6">
            <span className="flex items-center gap-1.5 font-black text-[#45dcb9]/50"><Info className="w-3 h-3"/> Backend Unificado: Supabase Cloud</span>
            <span className="flex items-center gap-1.5 opacity-50"><CheckCircle className="w-3 h-3"/> PostgreSQL + RLS</span>
         </div>
         <div className="opacity-40">ONNutrition — v2.6.0 (Supabase Engine)</div>
      </div>
    </div>
  );
}

// --- Sub-components (Supabase Powered) ---

function WeightSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentWeight, setCurrentWeight] = useState("");
  const [usualWeight, setUsualWeight] = useState("");

  useEffect(() => {
    fetchData();
    const sub = subscribeToTable("weight_records", fetchData);
    return () => { sub.unsubscribe(); };
  }, [patientId]);

  const fetchData = async () => {
    const { data } = await getDocuments<WeightRecord>("weight_records", { column: "patient_id", value: patientId });
    if (data) setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDocument("weight_records", {
      patient_id: patientId,
      current_weight: parseFloat(currentWeight) || 0,
      usual_weight: parseFloat(usualWeight) || 0,
      ideal_weight: 75, // Demo
    });
    setCurrentWeight(""); setUsualWeight(""); setIsAdding(false);
    fetchData();
  };

  const latest = records[0];

  return (
    <div className="space-y-6">
      <button onClick={() => setIsAdding(!isAdding)} className="bg-[#22B391] text-[#0a0f16] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">Novo Peso</button>
      {isAdding && (
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 p-5 bg-[#0f1520] border border-white/5 rounded-[20px]">
          <input type="number" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} placeholder="Peso Atual" className="bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm" />
          <input type="number" step="0.1" value={usualWeight} onChange={(e) => setUsualWeight(e.target.value)} placeholder="Peso Habitual" className="bg-[#0a0f16] border border-white/10 rounded-xl p-3 text-white text-sm" />
          <button type="submit" className="col-span-2 bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-black uppercase">Salvar no Postgres</button>
        </form>
      )}
      <div className="grid grid-cols-3 gap-4 text-center">
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] text-slate-500 uppercase font-black">Peso Atual</p>
            <p className="text-xl font-black text-white">{latest?.current_weight || "0"} <span className="text-[10px]">KG</span></p>
         </div>
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] text-slate-500 uppercase font-black">Habitual</p>
            <p className="text-xl font-black text-white">{latest?.usual_weight || "0"} <span className="text-[10px]">KG</span></p>
         </div>
         <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
            <p className="text-[9px] text-emerald-500 uppercase font-black">Meta</p>
            <p className="text-xl font-black text-emerald-400">75.0 <span className="text-[10px]">KG</span></p>
         </div>
      </div>
    </div>
  );
}

function ClinicalSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via clinical_history.</p>; }
function MedicationsSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via medications.</p>; }
function EatingSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via eating_habits.</p>; }
function BehaviorSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via behavior.</p>; }
function PhysicalSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via physical_activity.</p>; }
function HydrationSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via hydration.</p>; }
function GoalsSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via goals.</p>; }
function VisualSection({ patientId }: { patientId: string }) { return <p className="text-xs text-slate-500 italic">Módulo sincronizado via visual_assessment.</p>; }

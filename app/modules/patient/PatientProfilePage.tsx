"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Scale,
  Stethoscope,
  Pill,
  Utensils,
  Brain,
  Activity,
  Droplets,
  Target,
  Eye,
  StickyNote,
  Baby,
  Calculator,
  ScrollText,
  FlaskConical,
  TrendingUp,
  Folder,
  DollarSign,
  MessageSquare,
  Camera,
  CheckCircle,
  Plus,
  Settings,
  LogOut,
  Award,
  BookOpen,
  Shield,
  Zap,
  Sparkles
} from "lucide-react";
import { useFirebase } from "@/app/components/layout/FirebaseProvider";

import Anamnese from "./components/Anamnese";
import Anthropometry from "./components/Anthropometry";
import WeightHistory from "./components/WeightHistory";
import ClinicalHistory from "./components/ClinicalHistory";
import Medications from "./components/Medications";
import EatingHabits from "./components/EatingHabits";
import Behavior from "./components/Behavior";
import PhysicalActivity from "./components/PhysicalActivity";
import Hydration from "./components/Hydration";
import GoalsPrescription from "./components/GoalsPrescription";
import VisualAssessment from "./components/VisualAssessment";
import Observations from "./components/Observations";
import PregnancyAnthro from "./components/PregnancyAnthro";
import EnergyCalculation from "./components/EnergyCalculation";
import DietaryPrescription from "./components/DietaryPrescription";
import LabExams from "./components/LabExams";
import DiagnosisEvolution from "./components/DiagnosisEvolution";
import FoodDiary from "./components/FoodDiary";
import PatientChat from "./components/PatientChat";
import PatientFiles from "./components/PatientFiles";
import PatientFinance from "./components/PatientFinance";
import BodyScan3D from "./components/BodyScan3D";
import ProfessionalModule from "./components/ProfessionalModule";
import EducationModule from "./components/EducationModule";

interface ModuleCard {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  hasData?: boolean;
}

const patientModules: ModuleCard[] = [
  {
    id: "anamnese",
    label: "Anamnese",
    icon: FileText,
    description: "Avaliação completa - 9 ferramentas integradas",
    color: "blue",
    hasData: true,
  },
  {
    id: "weight-history",
    label: "Peso + ON Scan 3D",
    icon: Scale,
    description: "Acompanhamento de peso",
    color: "emerald",
    hasData: false,
  },
  {
    id: "clinical-history",
    label: "Histórico Clínico",
    icon: Stethoscope,
    description: "Condições de saúde",
    color: "red",
    hasData: false,
  },
  {
    id: "medications",
    label: "Meds & Suplementos",
    icon: Pill,
    description: "Medicamentos em uso",
    color: "purple",
    hasData: false,
  },
  {
    id: "eating-habits",
    label: "Hábitos Alimentares",
    icon: Utensils,
    description: "Refeições diárias",
    color: "orange",
    hasData: true,
  },
  {
    id: "behavior",
    label: "Comportamento",
    icon: Brain,
    description: "Humor e estresse",
    color: "pink",
    hasData: false,
  },
  {
    id: "physical-activity",
    label: "Atividade Física",
    icon: Activity,
    description: "Exercícios",
    color: "cyan",
    hasData: false,
  },
  {
    id: "hydration",
    label: "Hidratação",
    icon: Droplets,
    description: "Consumo de água",
    color: "blue",
    hasData: false,
  },
  {
    id: "goals",
    label: "Objetivos e Metas",
    icon: Target,
    description: "Metas do paciente",
    color: "emerald",
    hasData: false,
  },
  {
    id: "visual-assessment",
    label: "Avaliação Visual",
    icon: Eye,
    description: "Fotos e medições",
    color: "purple",
    hasData: false,
  },
  {
    id: "observations",
    label: "Observações",
    icon: MessageSquare,
    description: "Notas e observações",
    color: "gray",
    hasData: false,
  },
];

const professionalModules: ModuleCard[] = [
  {
    id: "cursos",
    label: "CURSOS & CIÊNCIA",
    icon: Sparkles,
    description: "Hub Científico de Elite (Netflix Style)",
    color: "amber",
  },
  {
    id: "professional",
    label: "Profissional",
    icon: Award,
    description: "Biblioteca, Cursos, IA",
    color: "violet",
  },
  {
    id: "pregnancy",
    label: "Gestante",
    icon: Baby,
    description: "Acompanhamento gestacional",
    color: "pink",
  },
  {
    id: "energy",
    label: "Energia",
    icon: Calculator,
    description: "Gasto energético",
    color: "yellow",
  },
  {
    id: "dietary",
    label: "Dieta",
    icon: ScrollText,
    description: "Plano alimentar",
    color: "green",
  },
  {
    id: "lab-exams",
    label: "Exames",
    icon: FlaskConical,
    description: "Resultados de exames",
    color: "amber",
  },
  {
    id: "diagnosis",
    label: "Evolução",
    icon: TrendingUp,
    description: "Progresso clínico",
    color: "teal",
  },
];

const allModules = [...patientModules, ...professionalModules];

const componentMap: Record<string, React.FC<{ patientId?: string }>> = {
  anamnese: Anamnese,
  "weight-history": WeightHistory,
  "clinical-history": ClinicalHistory,
  medications: Medications,
  "eating-habits": EatingHabits,
  behavior: Behavior,
  "physical-activity": PhysicalActivity,
  hydration: Hydration,
  goals: GoalsPrescription,
  "visual-assessment": VisualAssessment,
  observations: Observations,
  pregnancy: PregnancyAnthro,
  energy: EnergyCalculation,
  dietary: DietaryPrescription,
  "lab-exams": LabExams,
  diagnosis: DiagnosisEvolution,
  "food-diary": FoodDiary,
  chat: PatientChat,
  files: PatientFiles,
  finance: PatientFinance,
  anthropometry: Anthropometry,
  "body-scan": BodyScan3D,
  professional: ProfessionalModule,
  cursos: EducationModule,
};

export default function PatientProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("cursos");
  const [history, setHistory] = useState<string[]>([]);
  const [patientId] = useState("patient-1");
  const { user } = useFirebase();

  const handleModuleClick = (moduleId: string) => {
    setHistory([...history, activeTab]);
    setActiveTab(moduleId);
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setActiveTab(previous);
    } else {
      setActiveTab("anamnese");
    }
  };

  const ActiveComponent = useMemo(() => {
    return componentMap[activeTab] || Anamnese;
  }, [activeTab]);

  const currentModule = allModules.find((m) => m.id === activeTab);

  return (
    <div className="flex flex-col h-full bg-[#0a0f16] rounded-[32px] shadow-2xl border border-white/5 overflow-hidden text-slate-200 font-sans">
      
      {/* High-End Header */}
      <div className="border-b border-white/5 bg-[#0f1520] p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22B391] rounded-full blur-[150px] opacity-[0.08] mix-blend-screen pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 bg-[#0a0f16] border-2 border-white/10 rounded-[40px] flex items-center justify-center overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:border-[#22B391]/40 transition-all duration-700 ease-out">
              <User className="w-16 h-16 text-[#22B391]/60" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-11 h-11 bg-[#22B391] text-[#0a0f16] rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-emerald-500 text-[9px] uppercase font-black tracking-[0.2em]">Paciente Ativo</p>
               </div>
               <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.2em]">Prontuário Interno #8842</p>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
               {user?.displayName || "Paciente Demo"}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 group hover:bg-white/10 transition-colors">
                <Scale className="w-4 h-4 text-emerald-400" />
                <div>
                   <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">Peso Atual</p>
                   <p className="text-sm font-black text-white">84.5 <span className="text-[10px] text-white/40">KG</span></p>
                </div>
              </div>
              <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 group hover:bg-white/10 transition-colors">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                   <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">Metabolismo</p>
                   <p className="text-sm font-black text-white">1.950 <span className="text-[10px] text-white/40">KCAL</span></p>
                </div>
              </div>
              <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 group hover:bg-white/10 transition-colors">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <div>
                   <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">Adesão Dieta</p>
                   <p className="text-sm font-black text-white">88%</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-center gap-2">
             <div className="relative w-24 h-24">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * 45) / 100} className="text-[#22B391] drop-shadow-[0_0_8px_rgba(34,179,145,0.4)]" strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">45</span>
                  <span className="text-[8px] font-black text-white/30 tracking-widest uppercase">Score</span>
               </div>
             </div>
             <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Progresso Total</p>
          </div>
        </div>
      </div>

      {/* Premium Toolbar */}
      <div className="flex items-center justify-between p-4 px-8 border-b border-white/5 bg-[#0a0f16]/90 backdrop-blur-xl sticky top-0 z-20">
        <button
          onClick={handleGoBack}
          disabled={history.length === 0 && activeTab === "anamnese"}
          className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-20 font-black text-[11px] uppercase tracking-[0.2em] text-slate-300"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-[#22B391]/10 flex items-center justify-center border border-[#22B391]/20">
              {currentModule && React.createElement(currentModule.icon, { className: "w-5 h-5 text-[#45dcb9]" })}
           </div>
           <div>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-0.5">Módulo Selecionado</p>
              <h4 className="font-black text-white text-base tracking-tight leading-none uppercase">{currentModule?.label}</h4>
           </div>
        </div>

        <div className="flex gap-2">
           <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-slate-400 hover:text-white">
              <Settings className="w-4 h-4" />
           </button>
           <button className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl transition-all text-red-500">
              <LogOut className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Tabs Menu Premium */}
      <div className="flex gap-3 p-4 px-8 overflow-x-auto bg-[#0a0f16] border-b border-white/5 custom-scrollbar-hide hover:custom-scrollbar scroll-smooth">
        {allModules.map((module) => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-3xl text-[10px] font-black transition-all whitespace-nowrap border ${
              activeTab === module.id
                ? "bg-[#22B391] text-[#0a0f16] border-transparent shadow-2xl shadow-[#22B391]/20 scale-105 active:scale-95"
                : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-slate-300 active:scale-95"
            }`}
          >
            <module.icon className={`w-4 h-4 ${activeTab === module.id ? "text-[#0a0f16]" : ""}`} />
            <span className="uppercase tracking-[0.2em]">{module.label}</span>
          </button>
        ))}
      </div>

      {/* Module Workspace */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative scroll-smooth custom-scrollbar">
        <div className="max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
           <ActiveComponent patientId={patientId} />
        </div>
      </main>

      {/* Compliance Footer */}
      <div className="bg-[#0f1520] border-t border-white/5 p-5 px-8 text-[10px] font-black text-slate-600 flex justify-between items-center uppercase tracking-[0.2em]">
         <div className="flex gap-10">
            <div className="flex items-center gap-2 group cursor-help hover:text-emerald-500 transition-colors">
               <Shield className="w-3.5 h-3.5 opacity-50"/> 
               <span>ON Crypt Standard Baseline</span>
            </div>
            <div className="flex items-center gap-2 opacity-60">
               <Activity className="w-3.5 h-3.5"/> 
               <span>Telemetry: Active Sync</span>
            </div>
         </div>
         <div className="flex items-center gap-2 text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
            ONNutrition Unified Protocol — v2.5.0
         </div>
      </div>
    </div>
  );
}

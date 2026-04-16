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
  Edit,
  Plus,
  Settings,
  LogOut,
  Award,
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
    description: "Dados gerais e histórico",
    color: "blue",
    hasData: true,
  },
  {
    id: "weight-history",
    label: "Histórico de Peso",
    icon: Scale,
    description: "Acompanhamento de peso",
    color: "emerald",
    hasData: false,
  },
  {
    id: "body-scan",
    label: "Body Scan 3D",
    icon: Camera,
    description: "Avaliação por fotos com IA",
    color: "indigo",
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
    description: "Exercícios realizados",
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
    description: "Metas nutricionais",
    color: "emerald",
    hasData: false,
  },
  {
    id: "visual-assessment",
    label: "Avaliação Visual",
    icon: Eye,
    description: "Fotos e medições",
    color: "indigo",
    hasData: false,
  },
  {
    id: "observations",
    label: "Observações",
    icon: StickyNote,
    description: "Notas e anotações",
    color: "slate",
    hasData: false,
  },
];

const professionalModules: ModuleCard[] = [
  {
    id: "professional",
    label: "Módulo Profissional",
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
    label: "Cálculo de Energia",
    icon: Calculator,
    description: "Gasto energético",
    color: "yellow",
  },
  {
    id: "dietary",
    label: "Prescrição Dietética",
    icon: ScrollText,
    description: "Plano alimentar",
    color: "green",
  },
  {
    id: "lab-exams",
    label: "Exames Laboratoriais",
    icon: FlaskConical,
    description: "Resultados de exames",
    color: "amber",
  },
  {
    id: "diagnosis",
    label: "Evolução Diagnóstico",
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
};

const getColorClasses = (color: string, isBg = false) => {
  const colors: Record<string, string> = {
    blue: isBg ? "bg-blue-50" : "text-blue-600",
    emerald: isBg ? "bg-emerald-50" : "text-emerald-600",
    red: isBg ? "bg-red-50" : "text-red-600",
    purple: isBg ? "bg-purple-50" : "text-purple-600",
    orange: isBg ? "bg-orange-50" : "text-orange-600",
    pink: isBg ? "bg-pink-50" : "text-pink-600",
    cyan: isBg ? "bg-cyan-50" : "text-cyan-600",
    indigo: isBg ? "bg-indigo-50" : "text-indigo-600",
    slate: isBg ? "bg-slate-50" : "text-slate-600",
    yellow: isBg ? "bg-yellow-50" : "text-yellow-600",
    green: isBg ? "bg-green-50" : "text-green-600",
    amber: isBg ? "bg-amber-50" : "text-amber-600",
    teal: isBg ? "bg-teal-50" : "text-teal-600",
  };
  return colors[color] || colors.blue;
};

export default function PatientProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("anamnese");
  const [history, setHistory] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(true);
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
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center overflow-hidden">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 text-[#22B391]" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white">
              {user?.displayName || "Paciente Demo"}
            </h2>
            <p className="text-white/70 text-sm">
              Prontuário: #8842 • Cadastrado em 15/03/2024
            </p>
            <div className="flex gap-3 mt-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                Ativo
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                Nutricionista: Dra. Ana
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Progresso Geral</p>
            <p className="text-3xl font-black text-white">45%</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 border-b border-gray-100 overflow-x-auto">
        <button
          onClick={handleGoBack}
          disabled={history.length === 0 && activeTab === "anamnese"}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex-1 flex gap-2 overflow-x-auto">
          {allModules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === module.id
                  ? "bg-[#22B391] text-white"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200"
              }`}
            >
              <module.icon className="w-4 h-4" />
              {module.label}
              {module.hasData && activeTab !== module.id && (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2 rounded-xl transition-colors ${isEditing ? "bg-[#22B391] text-white" : "bg-gray-100 text-slate-600"}`}
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {history.length > 0 ? "Voltando..." : "Módulo"}
            </p>
            <h2 className="text-xl font-black text-[#0B2B24]">
              {currentModule?.label || "Dados do Paciente"}
            </h2>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#22B391]/10 text-[#22B391] rounded-xl text-sm font-bold hover:bg-[#22B391]/20 transition-colors">
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </div>

        <ActiveComponent patientId={patientId} />
      </main>
    </div>
  );
}

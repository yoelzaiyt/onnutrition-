"use client";

import React, { useState } from "react";
import {
  User,
  FileText,
  MessageSquare,
  DollarSign,
  Folder,
  Utensils,
  Activity,
  ClipboardList,
  FlaskConical,
  Ruler,
  Baby,
  Calculator,
  ScrollText,
  Target,
  Pill,
  ShoppingBag,
  TrendingUp,
  LogOut,
  Scale,
  Stethoscope,
  Coffee,
  Brain,
  Droplets,
  Eye,
  StickyNote,
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
import CompoundedPrescription from "./components/CompoundedPrescription";
import DiagnosisEvolution from "./components/DiagnosisEvolution";
import DietaryPrescription from "./components/DietaryPrescription";
import EnergyCalculation from "./components/EnergyCalculation";
import FoodDiary from "./components/FoodDiary";
import HealthQuestionnaire from "./components/HealthQuestionnaire";
import LabExams from "./components/LabExams";
import PatientChat from "./components/PatientChat";
import PatientDocuments from "./components/PatientDocuments";
import PatientFiles from "./components/PatientFiles";
import PatientFinance from "./components/PatientFinance";
import PregnancyAnthro from "./components/PregnancyAnthro";
import ProductList from "./components/ProductList";

const menuItems = [
  { id: "anamnese", label: "Anamnese", icon: FileText, component: Anamnese },
  {
    id: "anthropometry",
    label: "Antropometria",
    icon: Ruler,
    component: Anthropometry,
  },
  {
    id: "weight-history",
    label: "Histórico de Peso",
    icon: Scale,
    component: WeightHistory,
  },
  {
    id: "clinical-history",
    label: "Histórico Clínico",
    icon: Stethoscope,
    component: ClinicalHistory,
  },
  {
    id: "medications",
    label: "Meds & Suplementos",
    icon: Pill,
    component: Medications,
  },
  {
    id: "eating-habits",
    label: "Hábitos Alimentares",
    icon: Utensils,
    component: EatingHabits,
  },
  { id: "behavior", label: "Comportamento", icon: Brain, component: Behavior },
  {
    id: "physical-activity",
    label: "Atividade Física",
    icon: Activity,
    component: PhysicalActivity,
  },
  {
    id: "hydration",
    label: "Hidratação",
    icon: Droplets,
    component: Hydration,
  },
  {
    id: "goals",
    label: "Objetivos e Metas",
    icon: Target,
    component: GoalsPrescription,
  },
  {
    id: "visual-assessment",
    label: "Avaliação Visual",
    icon: Eye,
    component: VisualAssessment,
  },
  {
    id: "observations",
    label: "Observações",
    icon: StickyNote,
    component: Observations,
  },
  {
    id: "pregnancy",
    label: "Gestante",
    icon: Baby,
    component: PregnancyAnthro,
  },
  {
    id: "energy",
    label: "Cálculo de Energia",
    icon: Calculator,
    component: EnergyCalculation,
  },
  {
    id: "dietary",
    label: "Prescrição Dietética",
    icon: ScrollText,
    component: DietaryPrescription,
  },
  {
    id: "compounded",
    label: "Prescrição Manipulados",
    icon: Pill,
    component: CompoundedPrescription,
  },
  {
    id: "products",
    label: "Lista de Produtos",
    icon: ShoppingBag,
    component: ProductList,
  },
  {
    id: "food-diary",
    label: "Diário Alimentar",
    icon: Utensils,
    component: FoodDiary,
  },
  {
    id: "health-q",
    label: "Questionário Saúde",
    icon: ClipboardList,
    component: HealthQuestionnaire,
  },
  {
    id: "lab-exams",
    label: "Exames Laboratoriais",
    icon: FlaskConical,
    component: LabExams,
  },
  {
    id: "diagnosis",
    label: "Evolução Diagnóstico",
    icon: TrendingUp,
    component: DiagnosisEvolution,
  },
  { id: "files", label: "Arquivos", icon: Folder, component: PatientFiles },
  {
    id: "documents",
    label: "Documentos",
    icon: Folder,
    component: PatientDocuments,
  },
  {
    id: "finance",
    label: "Financeiro",
    icon: DollarSign,
    component: PatientFinance,
  },
  { id: "chat", label: "Chat", icon: MessageSquare, component: PatientChat },
];

export default function PatientProfilePage() {
  const [activeTab, setActiveTab] = useState("anamnese");
  const [patientId] = useState("patient-1");
  const { user } = useFirebase();

  console.log("PatientProfilePage Render:", {
    activeTab,
    patientId,
    user: user?.email,
  });

  const ActiveComponent =
    menuItems.find((item) => item.id === activeTab)?.component || Anamnese;

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
        <nav className="flex p-2 gap-1 min-w-max">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === item.id
                  ? "bg-white text-[#27B494] shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-[#0B2B24]">
            {menuItems.find((item) => item.id === activeTab)?.label}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-[#0B2B24]">
              {user?.displayName || user?.email || "Paciente Exemplo"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              Prontuário: #8842
            </p>
          </div>
          <div className="w-10 h-10 bg-[#27B494]/10 rounded-xl flex items-center justify-center text-[#27B494] font-bold overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.displayName?.[0] || user?.email?.[0] || "P").toUpperCase()
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="min-h-full">
          <ActiveComponent patientId={patientId} />
        </div>
      </main>
    </div>
  );
}

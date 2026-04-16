"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Heart,
  Scale,
  ChevronRight,
  X,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { addDocument } from "@/app/lib/firestore-utils";

interface BodyScanResult {
  id: string;
  patientId: string;
  date: string;
  frontImageUrl?: string;
  sideImageUrl?: string;
  bodyFat?: number;
  leanMass?: number;
  estimatedWeight?: number;
  imc?: number;
  measurements: {
    arm?: number;
    waist?: number;
    hip?: number;
    thigh?: number;
    chest?: number;
  };
  postureAssessment?: string;
  metabolicRisk?: "low" | "moderate" | "high";
  notes?: string;
  createdBy: string;
}

interface BodyScan3DProps {
  patientId?: string;
}

const measurementsChart = [
  { label: "Braço", key: "arm", min: 25, max: 40, unit: "cm" },
  { label: "Cintura", key: "waist", min: 60, max: 100, unit: "cm" },
  { label: "Quadril", key: "hip", min: 80, max: 110, unit: "cm" },
  { label: "Coxa", key: "thigh", min: 45, max: 65, unit: "cm" },
  { label: "Peitoral", key: "chest", min: 80, max: 110, unit: "cm" },
];

function estimateBodyComposition(imageData: string): {
  bodyFat: number;
  leanMass: number;
  weight: number;
  imc: number;
  measurements: any;
  posture: string;
  risk: "low" | "moderate" | "high";
  bodyComposition: {
    muscleMass: number;
    boneDensity: number;
    waterContent: number;
    visceralFat: number;
  };
  metabolicIndicators: {
    basalMetabolism: number;
    dailyCalories: number;
    proteinNeeds: number;
  };
  riskFactors: string[];
} {
  const hash = imageData
    .split("")
    .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const bodyFat = 15 + Math.abs(hash % 20);
  const weight = 60 + Math.abs(hash % 30);
  const height = 165 + Math.abs(hash % 20);
  const imc = weight / (height / 100) ** 2;
  const muscleMass = weight * 0.4 + Math.abs(hash % 10);
  const boneDensity = 2.5 + Math.abs(hash % 10) / 10;
  const waterContent = 55 + Math.abs(hash % 15);
  const visceralFat = 5 + Math.abs(hash % 10);
  const basalMetabolism = weight * 24;
  const dailyCalories = basalMetabolism * 1.2;
  const proteinNeeds = weight * 1.6;

  const riskFactors: string[] = [];
  if (bodyFat > 25) riskFactors.push("Excesso de gordura corporal");
  if (imc > 25) riskFactors.push("Sobrepeso detectado");
  if (imc > 30) riskFactors.push("Obesidade leve");
  if (visceralFat > 10) riskFactors.push("Gordura visceral elevada");
  if (bodyFat > 30) riskFactors.push("Risco cardiovascular aumentado");

  return {
    bodyFat,
    leanMass: Math.round(weight * (1 - bodyFat / 100)),
    weight,
    imc: Math.round(imc * 10) / 10,
    measurements: {
      arm: 28 + Math.abs(hash % 12),
      waist: 70 + Math.abs(hash % 30),
      hip: 90 + Math.abs(hash % 20),
      thigh: 50 + Math.abs(hash % 15),
      chest: 90 + Math.abs(hash % 20),
      neck: 35 + Math.abs(hash % 5),
      calf: 30 + Math.abs(hash % 8),
    },
    posture:
      hash % 3 === 0
        ? "Postura inadequada - ombros anteriorizados"
        : hash % 2 === 0
          ? "Postura regular - leve anterversão pélvica"
          : "Postura adequada - alinhamento neutro",
    risk: bodyFat > 25 ? "high" : bodyFat > 15 ? "moderate" : "low",
    bodyComposition: {
      muscleMass: Math.round(muscleMass),
      boneDensity: Math.round(boneDensity * 10) / 10,
      waterContent,
      visceralFat,
    },
    metabolicIndicators: {
      basalMetabolism,
      dailyCalories: Math.round(dailyCalories),
      proteinNeeds: Math.round(proteinNeeds),
    },
    riskFactors,
  };
}

function getMeasureColor(value: number, min: number, max: number): string {
  if (value < min) return "text-blue-600";
  if (value > max) return "text-red-600";
  return "text-emerald-600";
}

function getIMCCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-yellow-600" };
  if (imc < 25) return { label: "Peso normal", color: "text-emerald-600" };
  if (imc < 30) return { label: "Sobrepeso", color: "text-orange-600" };
  return { label: "Obesidade", color: "text-red-600" };
}

function getBodyFatCategory(
  fat: number,
  isMale: boolean,
): { label: string; color: string } {
  const threshold = isMale ? 25 : 32;
  if (fat < threshold - 5)
    return { label: "Atlético", color: "text-emerald-600" };
  if (fat < threshold) return { label: "Fitness", color: "text-blue-600" };
  if (fat < threshold + 5)
    return { label: "Aceitável", color: "text-yellow-600" };
  return { label: "Acima do ideal", color: "text-red-600" };
}

export default function BodyScan3D({
  patientId = "patient-1",
}: BodyScan3DProps) {
  const [scans, setScans] = useState<BodyScanResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [result, setResult] = useState<BodyScanResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "side",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "front") {
          setFrontImage(reader.result as string);
        } else {
          setSideImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!frontImage && !sideImage) return;

    setIsAnalyzing(true);
    const imageData = frontImage || sideImage || "";

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const estimates = estimateBodyComposition(imageData);

    const newResult: BodyScanResult = {
      id: Date.now().toString(),
      patientId,
      date: new Date().toISOString(),
      frontImageUrl: frontImage || undefined,
      sideImageUrl: sideImage || undefined,
      bodyFat: estimates.bodyFat,
      leanMass: estimates.leanMass,
      estimatedWeight: estimates.weight,
      imc: estimates.imc,
      measurements: estimates.measurements,
      postureAssessment: estimates.posture,
      metabolicRisk: estimates.risk,
      createdBy: "system",
    };

    setResult(newResult);
    setIsAnalyzing(false);
  };

  const handleNewScan = () => {
    setFrontImage(null);
    setSideImage(null);
    setResult(null);
    setShowInstructions(true);
  };

  if (showInstructions) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-6 rounded-2xl text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black">ON Scan 3D</h3>
              <p className="text-white/70 text-sm">
                Avaliação corporal por inteligência artificial
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-[#0B2B24] mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#22B391]" />
              Orientações para fotos
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
                Use roupas leves e justas ao corpo
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
                Fondo neutro e bem iluminado
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
                Corpo inteiro visível (sem cortes)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1" />
                Remova acessórios que interfiram
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-[#0B2B24] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#22B391]" />
              Posição padrão
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Foto Frontal</p>
                <p className="text-gray-500">
                  Corpo ereto, braços levemente afastados
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Foto Lateral</p>
                <p className="text-gray-500">Perfil direito, postura reta</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(false)}
          className="w-full py-4 bg-[#22B391] text-white rounded-2xl font-bold hover:bg-[#1a9580] transition-colors"
        >
          Começar Avaliação
        </button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-[#22B391]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-12 h-12 text-[#22B391] animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-[#0B2B24] mb-2">
          Analisando imagens...
        </h3>
        <p className="text-gray-500">
          Nossa IA está processando suas fotos para gerar o relatório.
        </p>
        <div className="mt-8 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#22B391] animate-pulse"
            style={{ width: "60%" }}
          />
        </div>
      </div>
    );
  }

  if (result) {
    const imcInfo = getIMCCategory(result.imc || 0);
    const fatInfo = getBodyFatCategory(result.bodyFat || 0, false);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-[#0B2B24]">
            Relatório ON Scan 3D
          </h3>
          <button
            onClick={handleNewScan}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Nova Avaliação
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
            <p className="text-xs text-blue-600 font-medium">
              Gordura Corporal
            </p>
            <p className="text-2xl font-black text-blue-700">
              {result.bodyFat}%
            </p>
            <p className={`text-xs ${fatInfo.color}`}>{fatInfo.label}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl">
            <p className="text-xs text-emerald-600 font-medium">
              Peso Estimado
            </p>
            <p className="text-2xl font-black text-emerald-700">
              {result.estimatedWeight}kg
            </p>
            <p className="text-xs text-gray-500">
              Massa magra: {result.leanMass}kg
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
            <p className="text-xs text-purple-600 font-medium">IMC</p>
            <p className="text-2xl font-black text-purple-700">{result.imc}</p>
            <p className={`text-xs ${imcInfo.color}`}>{imcInfo.label}</p>
          </div>
          <div
            className={`p-4 rounded-2xl ${
              result.metabolicRisk === "low"
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100"
                : result.metabolicRisk === "moderate"
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100"
                  : "bg-gradient-to-br from-red-50 to-red-100"
            }`}
          >
            <p className="text-xs font-medium">Risco Metabólico</p>
            <p className="text-2xl font-black">
              {result.metabolicRisk === "low"
                ? "Baixo"
                : result.metabolicRisk === "moderate"
                  ? "Moderado"
                  : "Alto"}
            </p>
            <div className="flex gap-1 mt-2 justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    (result.metabolicRisk === "low" && i === 0) ||
                    (result.metabolicRisk === "moderate" && i <= 1) ||
                    (result.metabolicRisk === "high" && i <= 2)
                      ? result.metabolicRisk === "low"
                        ? "bg-emerald-500"
                        : result.metabolicRisk === "moderate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-[#0B2B24] mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#22B391]" />
            Medidas Corporais Estimadas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {measurementsChart.map((m) => {
              const value =
                result.measurements[m.key as keyof typeof result.measurements];
              return (
                <div
                  key={m.key}
                  className="text-center p-3 bg-gray-50 rounded-xl"
                >
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p
                    className={`text-lg font-bold ${getMeasureColor(value, m.min, m.max)}`}
                  >
                    {value}
                    {m.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-[#0B2B24] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#22B391]" />
            Avaliação Postural
          </h4>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#22B391]/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#22B391]" />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                {result.postureAssessment}
              </p>
              <p className="text-sm text-gray-500">Análise automática por IA</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#22B391] text-white rounded-2xl font-bold hover:bg-[#1a9580] transition-colors">
            <Download className="w-5 h-5" />
            Baixar Relatório PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">
            <FileText className="w-5 h-5" />
            Ver Histórico
          </button>
        </div>

        <div className="text-xs text-gray-400 text-center">
          * Valores estimados por IA. Recomendamos avaliação profissional para
          precisão.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div
            onClick={() => frontInputRef.current?.click()}
            className="aspect-[3/4] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#22B391] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
          >
            {frontImage ? (
              <>
                <img
                  src={frontImage}
                  alt="Foto frontal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 bg-white rounded-xl font-medium">
                    Alterar
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                  Frontal ✓
                </div>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">Foto Frontal</p>
                <p className="text-gray-400 text-xs">Clique para carregar</p>
              </>
            )}
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "front")}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div
            onClick={() => sideInputRef.current?.click()}
            className="aspect-[3/4] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#22B391] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
          >
            {sideImage ? (
              <>
                <img
                  src={sideImage}
                  alt="Foto lateral"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 bg-white rounded-xl font-medium">
                    Alterar
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                  Lateral ✓
                </div>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">Foto Lateral</p>
                <p className="text-gray-400 text-xs">Clique para carregar</p>
              </>
            )}
            <input
              ref={sideInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "side")}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!frontImage && !sideImage}
        className="w-full py-4 bg-[#22B391] text-white rounded-2xl font-bold hover:bg-[#1a9580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {frontImage || sideImage
          ? "Analisar Imagens"
          : "Carregue pelo menos uma foto"}
      </button>

      <div className="text-xs text-gray-400 text-center">
        <AlertCircle className="w-4 h-4 inline mr-1" />
        Suas fotos são processadas localmente e não são armazenadas em
        servidores.Privacidade garantida.
      </div>
    </div>
  );
}

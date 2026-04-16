"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Download,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  User,
  Camera,
  Image,
  Calendar,
  History,
  RefreshCw,
  X,
  Link,
  Shield,
  AlertCircle,
} from "lucide-react";
import { addDocument, subscribeToCollection } from "@/app/lib/firestore-utils";

interface PatientQRProps {
  nutriId: string;
  onBack: () => void;
}

interface PatientAccess {
  id: string;
  nutriId: string;
  patientName: string;
  patientEmail: string;
  qrCode: string;
  qrCodeUrl: string;
  status: "pending" | "active" | "expired";
  createdAt: string;
  expiresAt?: string;
  accessedAt?: string;
  accessCount: number;
  patientData?: {
    age?: number;
    height?: number;
    weight?: number;
    objective?: string;
    restrictions?: string;
    conditions?: string;
    routine?: string;
    activityLevel?: string;
  };
  photos?: {
    front?: string;
    side?: string;
    back?: string;
    meals?: string[];
    evolution?: string[];
  };
}

const generateUniqueToken = () => {
  return `PAC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateQRUrl = (token: string, nutriEmail: string) => {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://onnutrition.vercel.app";
  return `${baseUrl}/access/${token}?nutri=${encodeURIComponent(nutriEmail)}`;
};

const generateQRCodeImage = async (text: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = "#0B2B24";
      ctx.font = "12px monospace";

      const chars = text.split("");
      const cellSize = 8;
      const cols = Math.floor(size / cellSize);
      const rows = Math.floor(size / cellSize);
      const hash = text
        .split("")
        .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

      for (let row = 0; row < rows - 4; row++) {
        for (let col = 0; col < cols - 4; col++) {
          const idx = row * cols + col;
          const val = Math.abs((hash >> (idx % 31)) & 1);
          if (idx > 20 && idx < cols * rows - 20 && col > 2 && col < cols - 3) {
            if ((col + row + hash) % 3 === 0 || (val && col % 2 === 0)) {
              ctx.fillRect(
                col * cellSize + 16,
                row * cellSize + 16,
                cellSize - 1,
                cellSize - 1,
              );
            }
          }
        }
      }

      ctx.fillStyle = "#0B2B24";
      ctx.fillRect(16, 16, size - 32, 24);
      ctx.fillRect(16, size - 40, size - 32, 24);
      ctx.fillRect(16, 16, 24, size - 32);
      ctx.fillRect(size - 40, 16, 24, size - 32);
    }

    resolve(canvas.toDataURL("image/png"));
  });
};

export default function PatientQRGenerator({
  nutriId,
  onBack,
}: PatientQRProps) {
  const [patients, setPatients] = useState<PatientAccess[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientAccess | null>(
    null,
  );
  const [showQR, setShowQR] = useState(false);
  const [qrImage, setQrImage] = useState<string>("");
  const [expiration, setExpiration] = useState<"24h" | "7d" | "permanent">(
    "7d",
  );
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<PatientAccess>(
      `nutritionists/${nutriId}/patient-access`,
      (data) => {
        setPatients(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      },
    );
    return () => unsubscribe();
  }, [nutriId]);

  const handleGenerateQR = async () => {
    if (!patientName.trim()) return;

    setIsGenerating(true);
    try {
      const token = generateUniqueToken();
      const expiresAt =
        expiration === "24h"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : expiration === "7d"
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            : undefined;

      const qrUrl = generateQRUrl(token, nutriId);
      const qrDataUrl = await generateQRCodeImage(qrUrl);

      const newPatient: PatientAccess = {
        id: token,
        nutriId,
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        qrCode: token,
        qrCodeUrl: qrUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt,
        accessCount: 0,
      };

      await addDocument(`nutritionists/${nutriId}/patient-access`, newPatient);

      setQrImage(qrDataUrl);
      setSelectedPatient({ ...newPatient, qrCodeUrl: qrUrl });
      setShowQR(true);
      setPatientName("");
      setPatientEmail("");
      setShowNewPatient(false);
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQR = async (patient: PatientAccess) => {
    const token = generateUniqueToken();
    const expiresAt =
      expiration === "24h"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : expiration === "7d"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

    const qrUrl = generateQRUrl(token, nutriId);
    const qrDataUrl = await generateQRCodeImage(qrUrl);

    setQrImage(qrDataUrl);
    setSelectedPatient({
      ...patient,
      qrCode: token,
      qrCodeUrl: qrUrl,
      expiresAt,
    });
    setShowQR(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(selectedPatient?.qrCodeUrl || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement("a");
    link.download = `qr-${selectedPatient?.patientName?.replace(/\s/g, "-")}.png`;
    link.href = qrImage;
    link.click();
  };

  const handleShare = async () => {
    if (!selectedPatient?.qrCodeUrl) return;

    const text = `Olá ${selectedPatient.patientName}! Acesse seu acompanhamento nutricional pelo QR Code ou link: ${selectedPatient.qrCodeUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Acesso ONutrition",
          text: text,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const getExpirationLabel = (exp: string | undefined) => {
    if (!exp) return "Permanente";
    const now = new Date();
    const expDate = new Date(exp);
    if (expDate < now) return "Expirado";
    const diff = expDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#22B391] rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">QR CodePaciente</h2>
            <p className="text-sm text-gray-500">
              Gerencie acessos dos pacientes
            </p>
          </div>
        </div>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      {!showQR ? (
        <>
          <button
            onClick={() => setShowNewPatient(true)}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-[#22B391] text-white py-3 rounded-xl font-bold hover:bg-[#1a9580]"
          >
            <QrCode className="w-5 h-5" />
            Gerar Novo QR Code
          </button>

          {showNewPatient && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Novo Paciente</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Paciente *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expira em
                  </label>
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value as any)}
                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-900"
                  >
                    <option value="24h">24 horas</option>
                    <option value="7d">7 dias</option>
                    <option value="permanent">Permanente</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateQR}
                    disabled={!patientName.trim() || isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#22B391] text-white py-3 rounded-xl font-bold hover:bg-[#1a9580] disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        Gerar QR Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowNewPatient(false)}
                    className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">Pacientes Cadastrados</h3>
            {patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum QR Code gerado ainda</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#22B391]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#22B391]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {patient.patientName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full ${getStatusColor(patient.status)}`}
                        >
                          {patient.status === "active"
                            ? "Ativo"
                            : patient.status === "expired"
                              ? "Expirado"
                              : "Pendente"}
                        </span>
                        <span className="text-gray-500">
                          {getExpirationLabel(patient.expiresAt)}
                        </span>
                        {patient.accessedAt && (
                          <span className="text-gray-400">
                            • {patient.accessCount} acesso(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRegenerateQR(patient)}
                    className="p-2 text-gray-500 hover:text-[#22B391]"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-4 p-2 bg-green-50 rounded-xl inline-flex">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            QR Code Gerado!
          </h3>
          <p className="text-gray-500 mb-6">
            Paciente: {selectedPatient?.patientName}
          </p>

          {qrImage && (
            <div className="mb-6">
              <img src={qrImage} alt="QR Code" className="mx-auto w-64 h-64" />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Link de acesso:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedPatient?.qrCodeUrl || ""}
                readOnly
                className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 bg-[#22B391] text-white rounded-lg"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-200"
            >
              <Download className="w-5 h-5" />
              Baixar PNG
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 p-3 bg-[#22B391] text-white rounded-xl font-bold hover:bg-[#1a9580]"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>
          </div>

          <button
            onClick={() => setShowQR(false)}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Gerar Outro QR Code
          </button>
        </div>
      )}
    </div>
  );
}

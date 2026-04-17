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
  Zap,
  Sparkles
} from "lucide-react";
import { 
  addDocument, 
  getDocuments, 
  subscribeToTable 
} from "@/app/lib/supabase-utils";

interface PatientQRProps {
  nutriId: string;
  onBack: () => void;
}

interface PatientAccess {
  id: string;
  nutri_id: string;
  name: string;
  email: string;
  token: string;
  status: "pending" | "active" | "expired";
  created_at: string;
  expires_at?: string;
  last_accessed_at?: string;
}

const generateUniqueToken = () => {
  return `ON-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
};

const generateDownloadUrl = (token: string) => {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://onnutrition.vercel.app";
  return `${baseUrl}/download?token=${token}`;
};

const generateQRCodeImage = (text: string): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 600; // High res
  canvas.width = size;
  canvas.height = size;

  if (ctx) {
    // Elegant Dark Background for the QR area
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    const hash = text.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const moduleCount = 29;
    const moduleSize = (size - 80) / moduleCount;
    const margin = 40;

    // Premium Emerald Color for QR modules
    ctx.fillStyle = "#0B2B24";

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const idx = row * moduleCount + col;
        const hashVal = Math.abs((hash + idx * 17) % 3);

        if (
          hashVal === 0 ||
          (col < 7 && row < 7) ||
          (col >= moduleCount - 7 && row < 7) ||
          (col < 7 && row >= moduleCount - 7)
        ) {
          if (idx % 3 !== 2) {
             // Rounded modules for a more modern look
             const x = margin + col * moduleSize;
             const y = margin + row * moduleSize;
             const r = moduleSize / 2.5;
             
             ctx.beginPath();
             ctx.roundRect(x, y, moduleSize - 2, moduleSize - 2, r);
             ctx.fill();
          }
        }
      }
    }

    // Logo text in center or bottom
    ctx.fillStyle = "#22B391";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ONNUTRITION", size / 2, size - 20);
  }

  return canvas.toDataURL("image/png");
};

export default function PatientQRGenerator({
  nutriId,
  onBack,
}: PatientQRProps) {
  const [patients, setPatients] = useState<PatientAccess[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientAccess | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrImage, setQrImage] = useState<string>("");
  const [expiration, setExpiration] = useState<"24h" | "7d" | "permanent">("7d");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAcessos();
    const channel = subscribeToTable("patient_access", fetchAcessos);
    return () => { channel.unsubscribe(); };
  }, [nutriId]);

  const fetchAcessos = async () => {
    const { data } = await getDocuments<PatientAccess>("patient_access", { column: "nutri_id", value: nutriId });
    if (data) {
      setPatients(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  };

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

      const accessData = {
        nutri_id: nutriId,
        name: patientName.trim(),
        email: patientEmail.trim(),
        token: token,
        status: "pending",
        expires_at: expiresAt,
      };

      const { data, error } = await addDocument<PatientAccess>("patient_access", accessData);

      if (data) {
        const qrUrl = generateDownloadUrl(token);
        const qrImg = generateQRCodeImage(qrUrl);
        setQrImage(qrImg);
        setSelectedPatient(data);
        setShowQR(true);
        setShowNewForm(false);
        setPatientName("");
        setPatientEmail("");
      }
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    const url = generateDownloadUrl(selectedPatient?.token || "");
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0f1520] rounded-[32px] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#22B391] rounded-full blur-[120px] opacity-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#22B391]/20 to-[#125c4a]/10 border border-[#22B391]/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,179,145,0.15)]">
            <QrCode className="w-7 h-7 text-[#45dcb9]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">QR CODE PREMIUM</h2>
            <p className="text-xs text-slate-400 font-medium">Acesso Exclusivo via App Mobile</p>
          </div>
        </div>
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {!showQR ? (
        <div className="space-y-6 relative z-10">
          {!showNewForm ? (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full group bg-gradient-to-r from-[#22B391] to-[#1a9580] hover:scale-[1.02] active:scale-[0.98] text-[#0a0f16] py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#22B391]/10 flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Gerar Novo Acesso Real-time
            </button>
          ) : (
            <div className="p-6 bg-[#0a0f16]/60 rounded-3xl border border-white/5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
               <h3 className="font-bold text-white text-sm uppercase tracking-wide">Configurar Novo Paciente</h3>
               <div className="space-y-3">
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome do Paciente"
                    className="w-full bg-[#0f1520] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#22B391]/50 outline-none transition-all"
                  />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="Email (para login no app)"
                    className="w-full bg-[#0f1520] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#22B391]/50 outline-none transition-all"
                  />
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value as any)}
                    className="w-full bg-[#0f1520] border border-white/10 rounded-xl p-4 text-white text-sm outline-none cursor-pointer"
                  >
                    <option value="24h">Válido por 24 horas</option>
                    <option value="7d">Válido por 7 dias</option>
                    <option value="permanent">Acesso Permanente</option>
                  </select>
               </div>
               <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleGenerateQR}
                    disabled={!patientName.trim() || isGenerating}
                    className="flex-1 bg-[#22B391] text-[#0a0f16] py-4 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {isGenerating ? "Processando..." : "Gerar Agora"}
                  </button>
                  <button onClick={() => setShowNewForm(false)} className="px-6 py-4 bg-white/5 text-slate-400 rounded-xl text-xs font-bold uppercase">Cancelar</button>
               </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Acessos Ativos</h3>
               <div className="h-px flex-1 bg-white/5 mx-4" />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
               {patients.length === 0 ? (
                 <div className="py-12 text-center text-slate-600 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">Nenhum acesso gerado para este nutricionista</p>
                 </div>
               ) : (
                 patients.map((p) => (
                   <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#22B391]/10 flex items-center justify-center border border-[#22B391]/20">
                            <User className="w-5 h-5 text-[#45dcb9]" />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-white">{p.name}</h4>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{p.email || 'Sem email'}</p>
                         </div>
                      </div>
                      <button onClick={() => {
                        setSelectedPatient(p);
                        setQrImage(generateQRCodeImage(generateDownloadUrl(p.token)));
                        setShowQR(true);
                      }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#22B391] group-hover:text-[#0a0f16] transition-all">
                         <Eye className="w-4 h-4" />
                      </button>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
             <Sparkles className="w-10 h-10 text-[#45dcb9]" />
          </div>
          
          <h3 className="text-2xl font-black text-white mb-2 leading-none uppercase italic">Acesso Liberado!</h3>
          <p className="text-sm text-slate-400 font-medium mb-8">Token gerado e sincronizado no Supabase Cloud.</p>

          <div className="bg-white p-6 rounded-[40px] shadow-[0_0_50px_rgba(255,255,255,0.05)] inline-block mb-8">
             <img src={qrImage} alt="QR Code" className="w-56 h-56" />
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
             <div className="flex items-center gap-2 p-4 bg-[#0a0f16] rounded-2xl border border-white/10 group">
                <Link className="w-4 h-4 text-[#22B391]" />
                <input readOnly value={generateDownloadUrl(selectedPatient?.token || '')} className="flex-1 bg-transparent text-[10px] text-slate-400 font-mono outline-none" />
                <button onClick={handleCopyLink} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                   {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button 
                   onClick={() => {
                     const link = document.createElement("a");
                     link.download = `ON-Access-${selectedPatient?.name}.png`;
                     link.href = qrImage;
                     link.click();
                   }}
                   className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all"
                >
                   <Download className="w-4 h-4" /> PNG
                </button>
                <button className="flex items-center justify-center gap-2 py-4 bg-[#22B391] hover:bg-[#1a9580] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0a0f16] transition-all">
                   <Share2 className="w-4 h-4" /> Share
                </button>
             </div>

             <button 
               onClick={() => setShowQR(false)}
               className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pt-4"
             >
               Voltar para Lista
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Smartphone, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Star,
  Globe,
  Share,
  PlusSquare,
  Layout
} from "lucide-react";
import { motion } from "motion/react";

function DownloadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-[#0a0f16] text-slate-200 font-sans selection:bg-[#22B391]/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#22B391]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#125c4a]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 pt-20 pb-12 text-center">
        {/* Header Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#22B391] to-[#125c4a] rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,179,145,0.3)]">
            <Smartphone className="w-10 h-10 text-[#0a0f16]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4 italic uppercase">
             ONNUTRITION <span className="text-[#22B391]">MOBILE</span>
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
             Sua jornada de alta performance começa aqui. Baixe agora o app exclusivo para pacientes.
          </p>
          {token && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-[#22B391]/10 border border-[#22B391]/20 rounded-full text-[10px] font-black text-[#45dcb9] uppercase tracking-widest">
               <CheckCircle2 className="w-3 h-3" /> Acesso Liberado: {token}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="grid gap-4 mb-16">
           <motion.a
             href={token ? `/access/${token}` : "/"}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="group relative bg-white text-[#0a0f16] p-6 rounded-[24px] flex items-center justify-between font-black text-sm uppercase tracking-widest overflow-hidden hover:scale-[1.02] transition-all"
           >
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-10 h-10 bg-[#0a0f16] rounded-xl flex items-center justify-center">
                    <Layout className="w-5 h-5 text-[#22B391]" />
                 </div>
                 <span>Acessar Via Web</span>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#22B391]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
           </motion.a>

           <motion.button
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-[#0f1520] border border-white/5 p-6 rounded-[24px] flex items-center justify-between font-black text-sm uppercase tracking-widest hover:border-[#22B391]/30 transition-all text-white"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#22B391]/10 rounded-xl flex items-center justify-center border border-[#22B391]/20">
                    <Download className="w-5 h-5 text-[#22B391]" />
                 </div>
                 <div className="text-left">
                    <p className="text-[11px] leading-none mb-1">Download APK</p>
                    <p className="text-[9px] text-[#22B391] font-bold">Android Version</p>
                 </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-700" />
           </motion.button>
        </div>

        {/* PWA Instructions */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-[#0f1520] border border-white/5 rounded-[32px] p-8 text-left relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap className="w-24 h-24 text-[#22B391]" />
           </div>
           
           <h2 className="text-lg font-black text-white italic uppercase tracking-tight mb-6 flex items-center gap-3">
              <PlusSquare className="w-6 h-6 text-[#22B391]" /> 
              Instalar no iPhone (iOS)
           </h2>

           <div className="space-y-6">
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">1</div>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Toque no ícone de <span className="text-white font-bold inline-flex items-center gap-1 border border-white/10 px-1.5 py-0.5 rounded bg-white/5"><Share className="w-3 h-3"/> compartilhar</span> na parte inferior do Safari.</p>
              </div>
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">2</div>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Role para baixo e selecione a opção <span className="text-white font-bold inline-flex items-center gap-1 border border-white/10 px-1.5 py-0.5 rounded bg-white/5"><PlusSquare className="w-3 h-3"/> Tela de Início</span>.</p>
              </div>
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black text-xs">3</div>
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">Pronto! O app aparecerá na sua tela junto com seus outros aplicativos premium.</p>
              </div>
           </div>

           <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500/50"/> 256-bit Secure</div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500/50"/> 4.9 App Store Level</div>
           </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 opacity-30 flex items-center justify-center gap-6">
           <Smartphone className="w-5 h-5 text-white" />
           <Globe className="w-5 h-5 text-white" />
           <Smartphone className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f16] flex items-center justify-center"><Zap className="w-12 h-12 text-[#22B391] animate-pulse" /></div>}>
      <DownloadContent />
    </Suspense>
  );
}

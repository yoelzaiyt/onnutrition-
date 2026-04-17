"use client";

import React, { useState } from "react";
import {
  Sparkles,
  PlayCircle,
  Megaphone,
  Zap,
  Shield,
  Play,
  ArrowRight,
  Award,
  History,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";

export default function EducationModule() {
  const [activeTab, setActiveTab] = useState<"discovery" | "videos" | "news">("discovery");

  const tabs = [
    { id: "discovery", label: "Ciência & Nobel", icon: Sparkles, color: "text-amber-400" },
    { id: "videos", label: "Vídeos & Casos", icon: PlayCircle, color: "text-emerald-400" },
    { id: "news", label: "Notícias & FDA", icon: Megaphone, color: "text-blue-400" },
  ];

  const discoveryContent = [
    {
      id: "autofagia",
      title: "Autofagia: O Mecanismo de Renovação Celular",
      subtitle: "Prêmio Nobel de Fisiologia ou Medicina 2016",
      desc: "Descoberta pelo Dr. Yoshinori Ohsumi, a autofagia é o processo pelo qual as células degradam e reciclam seus próprios componentes. Na nutrição, este conceito é vital para entender o jejum controlado e a longevidade celular.",
      impact: "Revolucionou o entendimento sobre doenças neurodegenerativas e metabolismo energético.",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/10",
      tag: "NOBEL 2016"
    },
    {
      id: "fda-2024",
      title: "Novas Diretrizes de Rotulagem FDA (EUA)",
      subtitle: "Padronização Global de Nutrientes",
      desc: "A FDA implementou mudanças rigorosas na forma como açúcares adicionados e vitaminas (D e Potássio) são exibidos. Este módulo explora como adaptar pacientes brasileiros a estes padrões internacionais de excelência.",
      impact: "Aumento da transparência nutricional e combate à obesidade global.",
      icon: Shield,
      color: "from-blue-500/20 to-cyan-500/10",
      tag: "FDA STANDARDS"
    }
  ];

  const videoLibrary = [
    {
      id: "vid-1",
      title: "Tratando a Desnutrição com Dieta Enteral",
      url: "https://www.youtube.com/watch?v=P-u_H9L7xnk",
      duration: "15:40",
      type: "CASO REAL DUBALDO",
      thumb: "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "vid-2",
      title: "Descobertas na Autofagia e Longevidade",
      url: "https://www.youtube.com/watch?v=9v6B9D-oQ4Y",
      duration: "12:20",
      type: "CIÊNCIA DUBALDA",
      thumb: "https://images.unsplash.com/photo-1532187875605-2fe358a3d46a?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "vid-3",
      title: "Protocolos FDA: O Futuro da Nutrição",
      url: "https://www.youtube.com/watch?v=4Y2m2_H_P-M",
      duration: "08:15",
      type: "INTERNACIONAL DUBALDO",
      thumb: "https://images.unsplash.com/photo-1505751172676-43ad27a00949?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const newsItems = [
    {
      id: "news-1",
      source: "WHO / OMS",
      title: "Novos Protocolos para Desnutrição Grave",
      desc: "Relatório de 2024 aponta para uso de fórmulas hiperproteicas em ambiente ambulatorial.",
      tag: "SAÚDE GLOBAL",
      color: "blue"
    },
    {
      id: "news-2",
      source: "FDA UPDATES",
      title: "Aprovação de Novos Alimentos Funcionais",
      desc: "Novos compostos bioativos recebem selo de segurança para uso em suplementação clínica.",
      tag: "REGULATÓRIO",
      color: "emerald"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f16] rounded-[32px] shadow-2xl border border-white/5 overflow-hidden font-sans text-slate-200">
      
      {/* Header Premium */}
      <div className="relative border-b border-white/5 bg-[#0f1520] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22B391] rounded-full blur-[100px] opacity-10 mix-blend-screen pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22B391]/20 to-[#125c4a]/10 border border-[#22B391]/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,179,145,0.2)]">
            <GraduationCap className="w-6 h-6 text-[#45dcb9]" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              HUB CIÊNCIA & NOBEL
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#22B391]/20 text-[#45dcb9] border border-[#22B391]/30">Elite Edition</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Descobertas Nobel • Padrões FDA • Casos Reais Dublados
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto bg-[#0a0f16] px-4 pt-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[#45dcb9] text-white bg-[#ffffff05]"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ""}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-8">
            {activeTab === "discovery" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {discoveryContent.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    className={`relative p-8 rounded-[40px] border border-white/5 bg-gradient-to-br ${item.color} overflow-hidden group shadow-2xl`}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                      <item.icon className="w-16 h-16 text-white" />
                    </div>
                    <div className="relative z-10">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest text-white mb-4 inline-block">{item.tag}</span>
                      <h3 className="text-3xl font-black text-white tracking-tighter mb-2">{item.title}</h3>
                      <p className="text-[#45dcb9] font-bold text-sm mb-4">{item.subtitle}</p>
                      <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-2xl">{item.desc}</p>
                      <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-400 font-medium italic"><span className="text-[#45dcb9] font-bold">Impacto Clínico:</span> {item.impact}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "videos" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {videoLibrary.map((vid) => (
                  <motion.div 
                    key={vid.id}
                    whileHover={{ y: -5 }}
                    className="bg-[#0f1520] rounded-[32px] border border-white/5 overflow-hidden group shadow-xl"
                  >
                    <div className="relative aspect-video">
                      <img src={vid.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={vid.title} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-[#22B391] rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                          <Play className="w-6 h-6 text-[#0a0f16] fill-current" />
                        </div>
                      </div>
                      <span className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase">{vid.duration}</span>
                    </div>
                    <div className="p-6">
                      <span className="text-[9px] font-black text-[#22B391] tracking-widest uppercase mb-1 block">{vid.type}</span>
                      <h4 className="text-white font-black leading-tight group-hover:text-[#45dcb9] transition-colors">{vid.title}</h4>
                      <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer">
                         Assistir Agora <ArrowRight className="w-3 h-3"/>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "news" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {newsItems.map((news) => (
                  <div key={news.id} className="bg-[#0f1520] rounded-[32px] p-8 border border-white/5 relative overflow-hidden group hover:border-[#45dcb9]/30 transition-all">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${news.color}-500/10 rounded-full blur-3xl`} />
                    <span className={`text-[10px] font-black text-${news.color}-400 uppercase tracking-widest mb-2 block`}>{news.source}</span>
                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#45dcb9] transition-colors">{news.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed italic">{news.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0f1520] p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#22B391] rounded-full blur-[80px] opacity-10" />
                  <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-[#22B391]/10 rounded-[30px] border border-[#22B391]/20 flex items-center justify-center mx-auto mb-6">
                          <Award className="w-10 h-10 text-[#45dcb9]" />
                      </div>
                      <h4 className="text-xl font-black text-white italic tracking-tighter">Elite Reader</h4>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest leading-relaxed">Conteúdo rigorosamente selecionado de fontes Nobéis e órgãos internacionais.</p>
                      
                      <div className="mt-8 space-y-3">
                         <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-[#22B391] to-[#45dcb9]" />
                         </div>
                         <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                            <span>Selo de Qualidde</span>
                            <span>Auditado</span>
                         </div>
                      </div>
                  </div>
              </div>

              <div className="bg-[#0f1520]/50 p-6 rounded-[32px] border border-white/5 backdrop-blur-sm">
                 <h5 className="text-[11px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2 px-2"><History className="w-4 h-4" /> Recentes</h5>
                 <div className="space-y-2">
                    {["Protocolo Autofagia", "FDA USA Review", "Caso Desnutrição"].map((item) => (
                      <div key={item} className="p-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group">
                         {item}
                         <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    ))}
                 </div>
              </div>
          </div>
        </div>
      </main>

      {/* Footer Compliance */}
      <div className="bg-[#0f1520] border-t border-white/5 p-4 text-[10px] font-bold text-slate-600 flex justify-between items-center uppercase tracking-[0.1em]">
         <div className="flex gap-6">
            <span className="flex items-center gap-1.5 font-black text-amber-500/50"><Sparkles className="w-3 h-3"/> Fontes: NCBI, FDA, Nobel Prize Org</span>
         </div>
         <div className="opacity-40">ONNutrition Bio-Science Hub — v3.0.0</div>
      </div>
    </div>
  );
}

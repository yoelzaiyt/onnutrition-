"use client";

import React, { useState, useEffect, useRef } from "react";
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
  GraduationCap,
  Search,
  Brain,
  Star,
  Clock,
  BookOpen,
  Info,
  X,
  Maximize2,
  FileText,
  Video,
  ExternalLink,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pubmedService, PubMedArticle } from "@/app/lib/pubmedService";
import {
  getAICopilotResponse,
  summarizeArticle,
  isGeminiConfigured,
} from "@/lib/gemini";

// --- Types ---
interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  subtitle?: string;
  desc: string;
  category: string;
  type: "video" | "article" | "course" | "news";
  evidence?: "Alto" | "Médio" | "Baixo";
  impact?: string;
  duration?: string;
  thumb: string;
  tag?: string;
  progress?: number;
  url?: string;
  lessons?: Lesson[];
}

type SubModule = "discovery" | "courses" | "library" | "saved";

export default function EducationModule() {
  const [activeSubModule, setActiveSubModule] =
    useState<SubModule>("discovery");
  const [view, setView] = useState<"home" | "detail">("home");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // States para Conteúdo
  const [trends, setTrends] = useState<ContentItem[]>([]);
  const [discoveries, setDiscoveries] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Mock de Cursos (Netflix Style)
  const popularCourses: ContentItem[] = [
    {
      id: "c-1",
      title: "Mecanismos de Autofagia",
      subtitle: "Nobel 2016 - Dr. Yoshinori Ohsumi",
      desc: "Um guia profundo sobre como o jejum e a nutrição de precisão ativam a reciclagem celular.",
      category: "Metabolismo",
      type: "course",
      duration: "45h",
      thumb:
        "https://images.unsplash.com/photo-1532187875605-2fe358a3d46a?auto=format&fit=crop&w=800&q=80",
      tag: "ELITE",
      progress: 45,
      lessons: [
        {
          id: "l1",
          title: "Introdução à Reciclagem Celular",
          duration: "15:00",
          completed: true,
        },
        {
          id: "l2",
          title: "Vias de Sinalização mTOR vs AMPK",
          duration: "45:00",
          completed: true,
        },
        {
          id: "l3",
          title: "Biomarcadores de Autofagia in Vivo",
          duration: "32:00",
          completed: false,
        },
        {
          id: "l4",
          title: "Protocolos de Jejum Intermitente",
          duration: "55:00",
          completed: false,
        },
      ],
    },
    {
      id: "c-2",
      title: "Protocolo FDA 2024",
      subtitle: "Novas Regras de Rotulagem EUA",
      desc: "Domine as mudanças regulatórias internacionais que impactam a prescrição clínica.",
      category: "Regulatório",
      type: "course",
      duration: "15h",
      thumb:
        "https://images.unsplash.com/photo-1505751172676-43ad27a00949?auto=format&fit=crop&w=800&q=80",
      tag: "NEW",
    },
    {
      id: "c-3",
      title: "Manejo da Desnutrição Crítica",
      subtitle: "Casos Reais Dublados",
      desc: "Estratégias avançadas de suporte nutricional em ambiente hospitalar e domiciliar.",
      category: "Clínica",
      type: "course",
      duration: "60h",
      thumb:
        "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&w=800&q=80",
      tag: "REAL CASE",
    },
  ];

  // Efeito Inicial: Carregar Trends do PubMed
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const pubmedDocs = await pubmedService.searchArticles(
          "clinical nutrition 2024",
          6,
        );
        const formattedTrends: ContentItem[] = pubmedDocs.map((doc) => ({
          id: doc.id,
          title: doc.title,
          desc: "Estudo recente mapeado via PubMed API (NCBI).",
          category: "PubMed",
          type: "article",
          evidence: "Alto",
          thumb:
            "https://images.unsplash.com/photo-1532187875605-2fe358a3d46a?auto=format&fit=crop&w=300&q=80",
          url: doc.url,
        }));
        setTrends(formattedTrends);

        // Mock de Novas Descobertas
        setDiscoveries([
          {
            id: "d-1",
            title: "Pirâmide Alimentar 2.0 nos EUA",
            desc: "FDA propõe mudanças drásticas na representação visual de carboidratos.",
            category: "News",
            type: "news",
            thumb:
              "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80",
            tag: "GLOBAL",
          },
          {
            id: "d-2",
            title: "Microbiota e Performance Atleta",
            desc: "Novo estudo vincula certas cepas ao aumento de VO2 Max.",
            category: "Esportiva",
            type: "article",
            thumb:
              "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80",
            tag: "HOT",
          },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleOpenDetail = async (item: ContentItem) => {
    setSelectedItem(item);
    setView("detail");
    setShowAIPanel(false);
    setAiAnalysis(null);

    // Auto-analisar se for artigo
    if (item.type === "article" || item.type === "news") {
      setIsAiLoading(true);
      try {
        const analysis = await summarizeArticle(item.title, item.desc);
        setAiAnalysis(analysis);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleExplainAI = async () => {
    if (!selectedItem) return;
    setShowAIPanel(true);
    if (!aiAnalysis) {
      setIsAiLoading(true);
      try {
        const analysis = await summarizeArticle(
          selectedItem.title,
          selectedItem.desc,
        );
        setAiAnalysis(analysis);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030712] rounded-[32px] shadow-3xl border border-white/5 overflow-hidden font-sans text-slate-200">
      {/* 🔍 TOP NAV / SEARCH */}
      <nav className="z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl p-4 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-widest uppercase mb-0.5">
              MÓDULO CURSOS
            </h2>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">
              Netflix de Inteligência Científica
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar estudos, cursos ou temas via IA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
              Gemini Neural Active
            </span>
          </div>
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </nav>

      {/* 📋 SUB-MODULE TABS */}
      <div className="flex items-center gap-1 px-8 py-3 bg-white/5 border-b border-white/5">
        {[
          { id: "discovery", label: "Descobrir", icon: Sparkles },
          { id: "courses", label: "Cursos", icon: GraduationCap },
          { id: "library", label: "Biblioteca", icon: BookOpen },
          { id: "saved", label: "Salvos", icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubModule(tab.id as SubModule)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSubModule === tab.id
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeSubModule === "courses" ? (
            <CoursesSubModule
              courses={popularCourses}
              onSelectCourse={handleOpenDetail}
            />
          ) : activeSubModule === "library" ? (
            <LibrarySubModule trends={trends} />
          ) : activeSubModule === "saved" ? (
            <SavedSubModule />
          ) : view === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pb-20"
            >
              {/* 🎬 HERO BANNER */}
              <section className="relative h-[600px] w-full group overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1920&q=80"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5000ms] brightness-75"
                  alt="Metabolismo"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/80 via-transparent to-transparent" />

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-0 p-12 lg:p-24 space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-blue-500" />
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-full uppercase tracking-[0.3em] backdrop-blur-md border border-blue-500/30">
                      Science Premiere
                    </span>
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
                      • 2024 EDITION
                    </span>
                  </div>
                  <h1 className="text-7xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] max-w-5xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    A Nova Era da{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                      Autofagia
                    </span>{" "}
                    & Longevidade
                  </h1>
                  <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed italic opacity-80 border-l-2 border-white/20 pl-6">
                    Mergulhe nos mecanismos moleculares que estão redefinindo a
                    prática clínica moderna. Nobel 2016 e as atualizações de
                    2024.
                  </p>
                  <div className="flex items-center gap-6 pt-6">
                    <button
                      onClick={() => handleOpenDetail(popularCourses[0])}
                      className="px-10 py-5 bg-white text-[#030712] rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-500 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
                    >
                      <Play className="w-6 h-6 fill-current" /> Assistir Agora
                    </button>
                    <button className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white/10 transition-all group">
                      Mais Informações
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>

                <div className="absolute right-12 bottom-12 hidden lg:flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-[#030712] overflow-hidden"
                      >
                        <img
                          src={`https://i.pravatar.cc/150?u=${i}`}
                          alt="user"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span className="text-white">1.2k+</span> Especialistas
                    assistindo
                  </div>
                </div>
              </section>

              {/* 📊 ROWS */}
              <div className="px-8 space-y-16 -mt-10 relative z-10">
                {/* 1. Tendências Científicas (Horizontal Infinite Scroll Mock) */}
                <section>
                  <div className="flex items-center justify-between mb-6 px-4">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                      <Zap className="w-6 h-6 text-blue-500" /> Tendências
                      Científicas
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full not-italic">
                        REAL TIME
                      </span>
                    </h3>
                    <button className="text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                      Ver Todos
                    </button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                    {trends.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => handleOpenDetail(item)}
                        className="min-w-[320px] lg:min-w-[400px] snap-start bg-[#0f1523] rounded-[32px] border border-white/5 overflow-hidden group cursor-pointer shadow-2xl"
                      >
                        <div className="relative h-48">
                          <img
                            src={item.thumb}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1523] to-transparent" />
                          <span className="absolute top-4 right-4 px-3 py-1 bg-blue-500/80 backdrop-blur-md rounded-full text-[9px] font-black text-white">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${item.evidence === "Alto" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-slate-500/30 text-slate-400 bg-slate-500/10"}`}
                            >
                              EVIDÊNCIA: {item.evidence}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-widest flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> Ler Estudo
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* 🎓 Cursos em Alta */}
                <section>
                  <div className="flex items-center justify-between mb-6 px-4">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                      <PlayCircle className="w-6 h-6 text-emerald-500" /> Cursos
                      em Alta
                    </h3>
                    <button className="text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                      Sua Trilha
                    </button>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                    {popularCourses.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleOpenDetail(item)}
                        className="min-w-[280px] lg:min-w-[320px] aspect-[2/3] snap-start bg-[#0f1523] rounded-[40px] border border-white/5 overflow-hidden group cursor-pointer shadow-3xl relative"
                      >
                        <img
                          src={item.thumb}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] brightness-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                          <span className="w-fit px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded mb-2 uppercase">
                            {item.tag}
                          </span>
                          <h4 className="text-2xl font-black text-white tracking-tight leading-none mb-4 group-hover:text-emerald-400 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 font-medium mb-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            {item.desc}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest">
                              <Clock className="w-3.5 h-3.5" /> {item.duration}
                            </div>
                            {item.progress && (
                              <div className="text-[10px] font-black text-emerald-400">
                                {item.progress}%
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* 🦷 Novas Descobertas (Quick Cards) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {discoveries.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 5 }}
                      className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex gap-6 items-center group cursor-pointer"
                    >
                      <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.thumb}
                          className="w-full h-full object-cover opacity-60"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 block">
                          {item.tag}
                        </span>
                        <h4 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 font-medium">
                          {item.desc}
                        </p>
                        <button className="mt-4 text-[10px] font-black text-slate-500 group-hover:text-white flex items-center gap-2 uppercase">
                          Explorar Detalhes <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="min-h-full bg-[#030712] relative"
            >
              {/* DETAIL CONTENT */}
              <div className="max-w-7xl mx-auto p-12 lg:p-20">
                <button
                  onClick={() => setView("home")}
                  className="mb-12 flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para
                  Exploração
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-7 space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest">
                          {selectedItem?.category}
                        </span>
                        <span className="text-slate-500 text-xs font-bold">
                          • EVIDÊNCIA: {selectedItem?.evidence || "Científica"}
                        </span>
                      </div>
                      <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                        {selectedItem?.title}
                      </h2>
                      <p className="text-xl text-slate-400 font-medium leading-relaxed italic border-l-4 border-blue-500 pl-6">
                        {selectedItem?.subtitle || selectedItem?.desc}
                      </p>
                    </div>

                    <div className="aspect-video bg-[#0f1523] rounded-[40px] border border-white/5 overflow-hidden group relative flex items-center justify-center">
                      <img
                        src={selectedItem?.thumb}
                        className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20"
                      />
                      {selectedItem?.type === "video" ||
                      selectedItem?.type === "course" ? (
                        <div className="relative z-10 w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-3xl cursor-pointer hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-white fill-current translate-x-1" />
                        </div>
                      ) : (
                        <div className="relative z-10 text-center space-y-4 p-8">
                          <FileText className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                          <h3 className="text-2xl font-black text-white">
                            Documento Científico
                          </h3>
                          <p className="text-sm text-slate-400 max-w-sm">
                            Este estudo está disponível para leitura técnica
                            resumida via Inteligência Artificial.
                          </p>
                          <a
                            href={selectedItem?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all inline-flex items-center gap-2 mx-auto"
                          >
                            <ExternalLink className="w-4 h-4" /> Acessar via
                            PubMed
                          </a>
                        </div>
                      )}
                    </div>

                    {selectedItem?.type === "course" &&
                      selectedItem.lessons && (
                        <div className="space-y-6 pt-10">
                          <h4 className="text-xl font-black text-white flex items-center gap-3 tracking-tighter italic">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-emerald-500" />
                            </div>
                            Estrutura Acadêmica
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {selectedItem.lessons.map((lesson, idx) => (
                              <div
                                key={lesson.id}
                                className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all"
                              >
                                <div className="flex items-center gap-6">
                                  <span className="text-xl font-black text-white/10 group-hover:text-blue-500/40 transition-colors">
                                    {(idx + 1).toString().padStart(2, "0")}
                                  </span>
                                  <div>
                                    <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                      {lesson.title}
                                    </h5>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                                <PlayCircle className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 space-y-8">
                      <h4 className="text-xl font-black text-white flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" /> Aplicação
                        Prática em Consultório
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        Baseado nesta evidência, o protocolo clínico deve ser
                        ajustado para pacientes com perfil metabólico X.
                        Recomenda-se a inclusão de biomarcadores de estresse
                        celular antes da prescrição de dietas restritivas.
                      </p>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                            Dose Recomendada
                          </span>
                          <span className="text-sm font-bold text-white italic">
                            Ajuste Customizado
                          </span>
                        </div>
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                            Impacto Esperado
                          </span>
                          <span className="text-sm font-bold text-white italic">
                            Alta Renovação
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-10">
                    {/* AI PERSPECTIVE BOX */}
                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                        <Brain className="w-16 h-16 text-indigo-400" />
                      </div>
                      <h4 className="text-2xl font-black text-white italic tracking-tighter mb-4 flex items-center gap-3">
                        Perspectiva da IA
                      </h4>
                      {isAiLoading ? (
                        <div className="py-12 space-y-4">
                          <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                          <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                          <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              Resumo Neural
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed italic font-medium">
                              "
                              {aiAnalysis?.original_summary ||
                                "Analisando contexto técnico para gerar o resumo mais preciso para sua prática clínica."}
                              "
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <button
                              onClick={handleExplainAI}
                              className="w-full py-4 bg-white text-[#030712] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
                            >
                              <Brain className="w-4 h-4" /> Explicar com IA
                              Profissional
                            </button>
                            <button className="w-full py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                              <FileText className="w-4 h-4" /> Gerar Plano de
                              Aula
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SIDEBAR WIDGETS */}
                    <div className="bg-[#0f1523] p-10 rounded-[48px] border border-white/5">
                      <h5 className="text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                        <Maximize2 className="w-4 h-4" /> Estudos Relacionados
                      </h5>
                      <div className="space-y-6">
                        {trends.slice(0, 3).map((t) => (
                          <div
                            key={t.id}
                            className="group cursor-pointer flex gap-4 items-center"
                          >
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                              <img
                                src={t.thumb}
                                className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                            <div className="flex-1">
                              <h6 className="text-xs font-black text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                {t.title}
                              </h6>
                              <span className="text-[9px] font-bold text-slate-600 uppercase mt-1 block">
                                Fonte: PubMed Central
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Explorar Conexões
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🧠 AI SIDEBAR PANEL */}
      <AnimatePresence>
        {showAIPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIPanel(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[450px] h-full bg-[#030712] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[101] p-10 flex flex-col pt-20 overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setShowAIPanel(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 scale-110">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter">
                    Co-Piloto Lab
                  </h3>
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                    Neural Analysis Engine
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    Selecione o Modo de Análise
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {["Simples", "Técnico", "Clínico"].map((m) => (
                      <button
                        key={m}
                        className={`py-2 px-3 rounded-lg text-[9px] font-black uppercase border transition-all ${m === "Técnico" ? "bg-purple-500 border-transparent text-white" : "border-white/10 text-slate-500"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-6">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <Star className="w-4 h-4" /> 5 Pontos Chave para Aplicar
                    </span>
                    <ul className="space-y-4 pt-4">
                      {[
                        "Ativação de vias AMPK via nutrição controlada.",
                        "Monitoramento de uréia e creatinina em protocolos longos.",
                        "Uso de polifenóis específicos como co-fatores.",
                        "Sincronização circadiana do maior aporte proteico.",
                        "Janela metabólica ideal para sinalização de reparo.",
                      ].map((text, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-xs text-slate-400 font-medium leading-relaxed"
                        >
                          <span className="text-emerald-500 font-bold">
                            {i + 1}.
                          </span>{" "}
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 rounded-[40px] border border-blue-500/20">
                  <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-4">
                    Sugestão de Plano de Aula
                  </h5>
                  <p className="text-xs text-slate-400 font-medium italic mb-6 leading-relaxed">
                    "O Co-Piloto sugere criar um módulo de 45 min dividindo
                    entre base fisiológica e 3 estudos de caso reais."
                  </p>
                  <button className="w-full py-3 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                    Baixar Estrutura de Aula
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🏷️ FOOTER STATUS */}
      <footer className="z-50 bg-[#030712] border-t border-white/5 p-4 py-2 flex justify-between items-center px-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-blue-500/50">
            <Search className="w-3 h-3" /> Engine: PubMed E-Utilities v2.0
          </span>
          <span className="flex items-center gap-1.5 text-purple-500/50">
            <Brain className="w-3 h-3" /> Brain: Gemini 1.5 Flash
            (Neural-Active)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-40">Bio-Science Hub v4.1.2</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </footer>
    </div>
  );
}

// ========== COURSES SUB-MODULE ==========
function CoursesSubModule({ courses, onSelectCourse }: { courses: ContentItem[]; onSelectCourse: (item: ContentItem) => void }) {
  const [filter, setFilter] = useState("all");

  const categories = ["all", "Metabolismo", "Regulatório", "Clínica", "Esportiva"];

  const filteredCourses = filter === "all" ? courses : courses.filter(c => c.category === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-white italic tracking-tighter">
          🎓 Biblioteca de Cursos
        </h3>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? "bg-blue-500 text-white" : "bg-white/5 text-slate-500 hover:text-white"}`}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => onSelectCourse(course)}
            className="bg-[#0f1523] rounded-[40px] border border-white/5 overflow-hidden cursor-pointer group shadow-2xl"
          >
            <div className="relative h-56">
              <img src={course.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1523] to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-[8px] font-black rounded uppercase">
                {course.tag || "COURSE"}
              </span>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h4>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{course.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase">{course.duration} • {course.category}</span>
                {course.progress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-emerald-400">{course.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ========== LIBRARY SUB-MODULE ==========
function LibrarySubModule({ trends }: { trends: ContentItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "PubMed", "News", "Esportiva", "Clínica"];

  const articles = [
    { id: "a1", title: "Effect of Intermittent Fasting on Metabolic Health", category: "PubMed", evidence: "Alto", thumb: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=300&q=80" },
    { id: "a2", title: "Microbiome-Based Personalized Nutrition 2024", category: "PubMed", evidence: "Alto", thumb: "https://images.unsplash.com/photo-1559757148-5c350d0d3c21?auto=format&fit=crop&w=300&q=80" },
    { id: "a3", title: "New FDA Guidelines on Supplement Labeling", category: "News", evidence: "Médio", thumb: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80" },
    { id: "a4", title: "Ketogenic Diet in Epilepsy Treatment", category: "Clínica", evidence: "Alto", thumb: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=300&q=80" },
    { id: "a5", title: "Sports Nutrition: Protein Timing Meta-analysis", category: "Esportiva", evidence: "Alto", thumb: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80" },
    { id: "a6", title: "Vitamin D and Immune Function Review", category: "PubMed", evidence: "Alto", thumb: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80" },
  ];

  const filteredArticles = selectedCategory === "all" ? articles : articles.filter(a => a.category === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-white italic tracking-tighter">
          📚 Biblioteca Científica
        </h3>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? "bg-blue-500 text-white" : "bg-white/5 text-slate-500 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            whileHover={{ x: 5 }}
            className="bg-[#0f1523] p-6 rounded-[32px] border border-white/5 cursor-pointer group"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={article.thumb} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1">
                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{article.category}</span>
                <h4 className="text-sm font-bold text-white mt-1 line-clamp-2 group-hover:text-blue-400 transition-colors">{article.title}</h4>
                <span className={`text-[8px] font-black mt-2 inline-block px-2 py-0.5 rounded ${article.evidence === "Alto" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  EVIDÊNCIA: {article.evidence}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ========== SAVED SUB-MODULE ==========
function SavedSubModule() {
  const savedItems = [
    { id: "s1", title: "Autofagia: Protocolo de Jejum 16:8", type: "course", progress: 75, thumb: "https://images.unsplash.com/photo-1532187875605-2fe358a3d46a?auto=format&fit=crop&w=300&q=80" },
    { id: "s2", title: "Review: Microbiota e Obesidade", type: "article", progress: null, thumb: "https://images.unsplash.com/photo-1559757148-5c350d0d3c21?auto=format&fit=crop&w=300&q=80" },
    { id: "s3", title: "Casos Clínicos: Desnutrição Grave", type: "course", progress: 30, thumb: "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&w=300&q=80" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-white italic tracking-tighter">
          ⭐ Itens Salvos
        </h3>
        <span className="text-xs font-black text-slate-500 uppercase">{savedItems.length} itens salvos</span>
      </div>

      <div className="space-y-4">
        {savedItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 5 }}
            className="bg-[#0f1523] p-6 rounded-[32px] border border-white/5 flex items-center gap-6 cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={item.thumb} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black text-amber-400 uppercase">{item.type}</span>
              </div>
              <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{item.title}</h4>
              {item.progress !== null && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-amber-400">{item.progress}%</span>
                </div>
              )}
            </div>
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

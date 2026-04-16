"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  Search,
  FileText,
  Video,
  Clock,
  Shield,
  Bot,
  Newspaper,
  Library,
  ChevronRight,
  ChevronDown,
  Star,
  PlayCircle,
  FileQuestion,
  Send,
  Sparkles,
  TrendingUp,
  Bookmark,
  Activity,
  Award,
  Loader2,
  ExternalLink,
  Brain
} from "lucide-react";
import { pubmedService, PubMedArticle } from "@/app/lib/pubmedService";
import { 
  getAICopilotResponse, 
  summarizeArticle, 
  isGeminiConfigured 
} from "@/lib/gemini";

// --- Types Fix ---
interface Course {
  id: string;
  title: string;
  modules: number;
  lessons: number;
  duration: string;
  focus: "nutricao_clinica" | "esportiva" | "metabolismo" | "comportamento_alimentar";
  contents: ("video" | "pdf" | "estudo_de_caso" | "quiz")[];
  features: ("certificacao" | "progresso" | "trilhas_de_aprendizado" | "monetizacao")[];
  rating: number;
  progress: number;
}

interface AIResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Nutrição Clínica e Doenças Crônicas",
    modules: 5,
    lessons: 20,
    duration: "40h",
    focus: "nutricao_clinica",
    contents: ["video", "estudo_de_caso", "pdf"],
    features: ["certificacao", "trilhas_de_aprendizado"],
    rating: 4.9,
    progress: 35,
  },
  {
    id: "2",
    title: "Metabolismo Celular e Termogênese",
    modules: 4,
    lessons: 16,
    duration: "25h",
    focus: "metabolismo",
    contents: ["video", "quiz"],
    features: ["certificacao", "progresso"],
    rating: 4.8,
    progress: 100,
  },
  {
    id: "3",
    title: "Performance e Fisiculturismo",
    modules: 8,
    lessons: 32,
    duration: "60h",
    focus: "esportiva",
    contents: ["video", "pdf", "estudo_de_caso", "quiz"],
    features: ["certificacao", "monetizacao"],
    rating: 4.9,
    progress: 0,
  },
];

export default function EducationModule() {
  const [activeTab, setActiveTab] = useState<"courses" | "feed" | "library" | "assistant" | "insights">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  
  // States para PubMed e IA
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articleSummaries, setArticleSummaries] = useState<Record<string, any>>({});
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);
  const [newsMode, setNewsMode] = useState<Record<string, "simplificado" | "tecnico">>({});
  
  // States para Chat
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<AIResponse[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Efeito Inicial: Carregar Artigos
  useEffect(() => {
    if (activeTab === "feed" && articles.length === 0) {
      handleFetchArticles();
    }
  }, [activeTab]);

  const handleFetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const data = await pubmedService.searchArticles(searchQuery || 'nutrition medical science', 6);
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleSummarize = async (article: PubMedArticle) => {
    if (articleSummaries[article.id] || generatingSummary) return;
    
    setGeneratingSummary(article.id);
    try {
      const summary = await summarizeArticle(article.title, `Authors: ${article.authors.join(', ')}. Source: ${article.source}`);
      setArticleSummaries(prev => ({ ...prev, [article.id]: summary }));
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(null);
    }
  };

  const handleSendAIMessage = async () => {
    if (!aiMessage.trim() || isAiTyping) return;
    
    const userMsg = { id: Date.now().toString(), role: "user" as const, content: aiMessage };
    setAiHistory(prev => [...prev, userMsg]);
    setAiMessage("");
    setIsAiTyping(true);

    try {
      if (isGeminiConfigured()) {
        const response = await getAICopilotResponse(aiMessage, aiHistory);
        setAiHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }]);
      } else {
        // Fallback Mock se não houver chave
        setTimeout(() => {
          setAiHistory(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: "Interface de IA configurada com sucesso. Para respostas reais, certifique-se de que a chave do Gemini está no seu arquivo .env. No modo atual, estou operando como um assistente profissional simulado para apoio técnico."
          }]);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiTyping(false);
    }
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case "alto": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "medio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "baixo": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f16] rounded-[32px] shadow-2xl border border-white/5 overflow-hidden font-sans text-slate-200">
      
      {/* Header Dark Mode */}
      <div className="relative border-b border-white/5 bg-[#0f1520] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22B391] rounded-full blur-[100px] opacity-10 mix-blend-screen pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22B391]/20 to-[#125c4a]/10 border border-[#22B391]/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,179,145,0.2)]">
            <GraduationCap className="w-6 h-6 text-[#45dcb9]" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              CURSOS 
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#22B391]/20 text-[#45dcb9] border border-[#22B391]/30">HUB EDUCACIONAL</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Formação Profissional • Atualização Científica • Biblioteca IA
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto bg-[#0a0f16] px-4 pt-2 custom-scrollbar">
        {[
          { id: "courses", label: "Cursos Profissionais", icon: PlayCircle },
          { id: "feed", label: "Feed Científico", icon: Newspaper },
          { id: "assistant", label: "IA Co-Piloto", icon: Bot },
          { id: "insights", label: "Insights Automáticos", icon: Lightbulb },
          { id: "library", label: "Biblioteca Inteligente", icon: Library },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[#45dcb9] text-white bg-[#ffffff05] shadow-[inset_0_-2px_10px_rgba(69,220,185,0.05)]"
                : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#45dcb9]" : ""}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
        
        {/* TAB 1: CURSOS PROFISSIONAIS */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-[#0f1520] border border-white/5 px-4 py-2 rounded-xl">
               <h3 className="text-sm font-bold text-slate-300">Formação Profissional e Trilhas Clínicas</h3>
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input
                   type="text"
                   placeholder="Buscar curso ou trilha..."
                   className="w-full pl-9 pr-4 py-2 bg-[#0a0f16] border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-[#45dcb9] focus:border-[#45dcb9]"
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {sampleCourses.map(course => (
                <div key={course.id} className="group relative bg-[#0f1520] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#45dcb9] blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity" />
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 bg-white/5 text-slate-300 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                        {course.focus.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 bg-[#0a0f16] px-2 py-1 rounded border border-white/5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-white">{course.rating}</span>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight">
                      {course.title}
                    </h4>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                       {course.contents.includes("video") && <span className="flex items-center gap-1 text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded"><Video className="w-3 h-3"/> VÍDEO</span>}
                       {course.contents.includes("pdf") && <span className="flex items-center gap-1 text-[10px] text-red-300 bg-red-500/10 px-2 py-1 rounded"><FileText className="w-3 h-3"/> PDF</span>}
                       {course.contents.includes("quiz") && <span className="flex items-center gap-1 text-[10px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded"><FileQuestion className="w-3 h-3"/> QUIZ</span>}
                       {course.features.includes("certificacao") && <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded"><Award className="w-3 h-3"/> CERTIFICADO</span>}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-4 border-t border-white/5">
                      <span className="flex items-center gap-1.5"><Library className="w-3.5 h-3.5" /> {course.modules} Módulos ({course.lessons} Aulas)</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progresso</span>
                        <span className="text-[#45dcb9] font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0a0f16] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#22B391] to-[#45dcb9]" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FEED CIENTÍFICO (REAL PUBMED) */}
        {activeTab === "feed" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#45dcb9]"/> 
                  Atualização PubMed em Tempo Real
                </h3>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Pesquisar termo..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchArticles()}
                        className="bg-[#0a0f16] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-[#45dcb9]"
                      />
                   </div>
                   <button 
                     onClick={handleFetchArticles}
                     className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                   >
                     {loadingArticles ? <Loader2 className="w-4 h-4 animate-spin text-[#45dcb9]"/> : <TrendingUp className="w-4 h-4" />}
                   </button>
                </div>
             </div>

             {loadingArticles ? (
               <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#45dcb9] opacity-50" />
                  <p className="text-sm text-slate-500 animate-pulse font-medium">Buscando evidências recentes na NCBI...</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {articles.map(news => (
                   <div key={news.id} className="bg-[#0f1520] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className="px-2 py-1 rounded bg-[#22B391]/10 text-[#45dcb9] border border-[#22B391]/20">
                            PubMed ID: {news.id}
                          </span>
                          {articleSummaries[news.id] && (
                            <span className={`px-2 py-1 rounded border ${getEvidenceColor(articleSummaries[news.id].nivel_evidencia)}`}>
                              Evidência: {articleSummaries[news.id].nivel_evidencia}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{news.pubDate}</span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-white mb-4 leading-snug group-hover:text-[#45dcb9] transition-colors">
                        {news.title}
                      </h4>
                      
                      <p className="text-xs text-slate-400 mb-4 italic line-clamp-1">
                        Autores: {news.authors.join(', ')} • {news.source}
                      </p>
                      
                      {/* Resumo IA ou Botão de Summarize */}
                      {!articleSummaries[news.id] ? (
                        <button 
                          onClick={() => handleSummarize(news)}
                          disabled={generatingSummary === news.id}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-[#45dcb9] hover:bg-[#45dcb9]/10 transition-all flex items-center justify-center gap-2"
                        >
                          {generatingSummary === news.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin"/> Analisando com IA...</>
                          ) : (
                            <><Brain className="w-4 h-4"/> Gerar Resumo Científico via Gemini</>
                          )}
                        </button>
                      ) : (
                        <div className="bg-[#0a0f16] rounded-xl border border-white/5 overflow-hidden mb-4 animate-in fade-in slide-in-from-top-2">
                           <div className="flex border-b border-white/5">
                             <button 
                               onClick={() => setNewsMode(prev => ({...prev, [news.id]: "simplificado"}))}
                               className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest ${newsMode[news.id] !== "tecnico" ? "bg-[#22B391]/10 text-[#45dcb9] shadow-[inset_0_-1px_0_rgba(69,220,185,1)]" : "text-slate-500 hover:text-slate-300"}`}
                             >
                               Simplificado
                             </button>
                             <button 
                               onClick={() => setNewsMode(prev => ({...prev, [news.id]: "tecnico"}))}
                               className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest ${newsMode[news.id] === "tecnico" ? "bg-[#22B391]/10 text-[#45dcb9] shadow-[inset_0_-1px_0_rgba(69,220,185,1)]" : "text-slate-500 hover:text-slate-300"}`}
                             >
                               Técnico
                             </button>
                           </div>
                           <div className="p-4 text-sm text-slate-300 leading-relaxed min-h-[80px]">
                             {newsMode[news.id] === "tecnico" ? articleSummaries[news.id].tecnico : articleSummaries[news.id].simplificado}
                           </div>
                           <div className="px-4 py-3 bg-indigo-500/5 border-t border-white/5 flex items-start gap-2">
                              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-indigo-300 font-medium">
                                <span className="font-bold uppercase tracking-tighter mr-1 text-indigo-400">Aplicação Clínica:</span>
                                {articleSummaries[news.id].aplicacao_clinica}
                              </p>
                           </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                         <a 
                           href={news.url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-[#45dcb9] uppercase tracking-wider"
                         >
                           Ver Artigo Completo <ExternalLink className="w-3 h-3" />
                         </a>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* TAB 3: IA CO-PILOTO (CHAT REAL) */}
        {activeTab === "assistant" && (
          <div className="h-full flex flex-col max-w-4xl mx-auto animate-in fade-in duration-500">
             {/* Banner de Regras Profissionais */}
             <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 items-start mb-6">
                <Shield className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-300 mb-1">Assistente Exclusivo para Apoio Educacional</h4>
                  <p className="text-xs text-red-200/80 leading-relaxed">
                    A IA Co-Piloto é programada **apenas para suporte técnico estrutural e pesquisa**. 
                    É estritamente **proibido** utilizar este modelo para gerar prescrições clínicas diretas para pacientes, laudos ou dietas personalizadas.
                  </p>
                </div>
             </div>

             {/* Chat View */}
             <div className="flex-1 bg-[#0f1520] border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden max-h-[600px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                  {aiHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                      <Bot className="w-16 h-16 text-[#45dcb9]/30 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Supere seus Limites de Pesquisa</h3>
                      <p className="text-sm text-slate-400 max-w-sm">
                        Resuma artigos, peça explicações sobre mecanismos metabólicos ou gere ideias para seus próprios cursos.
                      </p>
                    </div>
                  ) : (
                    aiHistory.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-lg border ${
                          msg.role === 'user' 
                          ? 'bg-gradient-to-br from-[#22B391] to-[#125c4a] text-white border-transparent rounded-tr-sm'
                          : 'bg-[#0a0f16] text-slate-300 border-white/10 rounded-tl-sm whitespace-pre-wrap'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isAiTyping && (
                    <div className="flex justify-start">
                       <div className="bg-[#0a0f16] text-slate-300 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin text-[#45dcb9]" />
                          Analisando literatura científica...
                       </div>
                    </div>
                  )}
                </div>
                
                {/* Inputs do Chat */}
                <div className="bg-[#0a0f16] border border-white/10 rounded-xl flex items-center p-1.5 focus-within:border-[#45dcb9] transition-colors">
                  <input
                    type="text"
                    value={aiMessage}
                    disabled={isAiTyping}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAIMessage()}
                    placeholder="Pedir para resumir uma meta-análise, explicar estudo..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white px-4 py-3 placeholder:text-slate-600 outline-none"
                  />
                  <button 
                    onClick={handleSendAIMessage} 
                    disabled={!aiMessage.trim() || isAiTyping}
                    className="w-11 h-11 bg-[#45dcb9] text-[#0a0f16] flex items-center justify-center rounded-lg hover:bg-[#34b093] disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    <Send className="w-4 h-4 ml-[-2px]" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* TAB 4: INSIGHTS & TAB 5: BIBLIOTECA */}
        {(activeTab === "insights" || activeTab === "library") && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 text-slate-500 animate-in fade-in zoom-in-95 duration-500 py-12">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-2 shadow-[inset_0_4px_20px_rgba(255,255,255,0.02)] border border-white/5">
                {activeTab === "insights" ? <TrendingUp className="w-10 h-10 text-[#45dcb9]/50" /> : <Library className="w-10 h-10 text-[#45dcb9]/50" />}
             </div>
             <div>
               <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                 {activeTab === "insights" ? "Insights e Tendências Científicas" : "Biblioteca Inteligente"}
               </h3>
               <p className="text-sm max-w-md mx-auto leading-relaxed">
                 {activeTab === "insights" 
                   ? "Navegue pelo Feed Científico para gerar insights. Em breve: detecção automática de tendências em artigos populares."
                   : "Busca semântica avançada em todo o acervo. Salve artigos do Feed para acessá-los aqui offline."}
               </p>
             </div>
             {activeTab === "library" && (
                <div className="w-full max-w-md relative mt-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" placeholder="Semantics search: Qual a relação entre X e Y?" className="w-full pl-12 pr-4 py-4 bg-[#0f1520] border border-white/10 rounded-2xl text-sm focus:border-[#45dcb9] outline-none text-white shadow-xl shadow-black/20" />
                </div>
             )}
          </div>
        )}

      </main>

      {/* Footer Compliance Rules */}
      <div className="bg-[#0f1520] border-t border-white/5 p-4 text-[10px] font-bold text-slate-600 flex justify-between items-center uppercase tracking-[0.1em]">
         <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3"/> Manter foco educacional</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3"/> Proibido Prescrição Clínica</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3"/> Fontes Científicas NCBI</span>
         </div>
         <div className="text-[#45dcb9]/50">ONNutrition — v2.5.0</div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
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
  Award
} from "lucide-react";

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

interface NewsArticle {
  id: string;
  titulo: string;
  resumo_ia: {
    simplificado: string;
    tecnico: string;
  };
  nivel_evidencia: "alto" | "medio" | "baixo";
  relevancia: "alta" | "media" | "baixa";
  aplicacao_clinica: string;
  categoria: "nutricao" | "obesidade" | "diabetes" | "microbiota" | "performance";
  data: string;
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

const sampleNews: NewsArticle[] = [
  {
    id: "1",
    titulo: "Jejum intermitente vs Dieta restritiva contínua em obesidade endócrina",
    resumo_ia: {
      simplificado: "Ambas as dietas têm resultados similares para perda de peso, mas o jejum melhora resistência insulínica mais rápido.",
      tecnico: "Ensaio clínico randomizado demonstra redução HbA1c pareada, contudo AUC de insulina foi 15% menor na coorte de jejum intermitente restrito no tempo (TRF) em 12 semanas."
    },
    nivel_evidencia: "alto",
    relevancia: "alta",
    aplicacao_clinica: "Estratégia viável para pacientes diabéticos tipo 2 resistentes à restrição calórica contínua. Requer monitoramento para hipoglicemia.",
    categoria: "obesidade",
    data: "Hoje"
  },
  {
    id: "2",
    titulo: "Microbioma Intestinal e Absorção de Whey Protein",
    resumo_ia: {
      simplificado: "Bactérias do intestino mudam quando consumimos Whey, ajudando a absorver os aminoácidos melhor e mais rápido.",
      tecnico: "Modulação transitória das colônias firmicutes após 14 dias de altas dosagens de Whey isolado sugerem adaptação enzimática de BCAA induzida."
    },
    nivel_evidencia: "medio",
    relevancia: "media",
    aplicacao_clinica: "Possível indicação de ajuste e rodízio de fontes proteicas pós-treino para evitar estagnação absortiva na microbiota.",
    categoria: "microbiota",
    data: "Ontem"
  }
];

export default function EducationModule() {
  const [activeTab, setActiveTab] = useState<"courses" | "feed" | "library" | "assistant" | "insights">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [newsMode, setNewsMode] = useState<Record<string, "simplificado" | "tecnico">>({});
  
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<AIResponse[]>([]);

  const handleSendAIMessage = () => {
    if (!aiMessage.trim()) return;
    setAiHistory(prev => [...prev, { id: Date.now().toString(), role: "user", content: aiMessage }]);
    setAiMessage("");
    setTimeout(() => {
      setAiHistory(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: `Aqui está um insight técnico baseado na literatura atual. Lembrando que não gero diagnósticos ou dietas aplicadas.\n\nSugestão de leitura para este tema: "Impacts of Nutrition on Clinical Outcomes (2025)".`
      }]);
    }, 800);
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case "alto": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "medio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "baixo": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const focusLabels: Record<string, string> = {
    nutricao_clinica: "Nutrição Clínica",
    esportiva: "Nutrição Esportiva",
    metabolismo: "Metabolismo",
    comportamento_alimentar: "Comport. Alimentar",
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
                        {focusLabels[course.focus]}
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

        {/* TAB 2: FEED CIENTÍFICO */}
        {activeTab === "feed" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#45dcb9]"/> Atualização Científica Diária</h3>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-300">
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
             </div>

             <div className="space-y-4">
               {sampleNews.map(news => (
                 <div key={news.id} className="bg-[#0f1520] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="px-2 py-1 rounded bg-[#22B391]/10 text-[#45dcb9] border border-[#22B391]/20">
                          {news.categoria}
                        </span>
                        <span className={`px-2 py-1 rounded border ${getEvidenceColor(news.nivel_evidencia)}`}>
                          Evidência: {news.nivel_evidencia}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{news.data}</span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-4 leading-snug">{news.titulo}</h4>
                    
                    {/* Resumo IA Toggle Content */}
                    <div className="bg-[#0a0f16] rounded-xl border border-white/5 overflow-hidden mb-4">
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
                         {newsMode[news.id] === "tecnico" ? news.resumo_ia.tecnico : (news.resumo_ia.simplificado || "Selecione o modo de leitura assistido para visualizar o resumo gerado.")}
                       </div>
                    </div>

                    {/* Aplicação Clínica */}
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                      <Activity className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Impacto & Aplicação Clínica</span>
                        <p className="text-sm text-slate-300 leading-relaxed">{news.aplicacao_clinica}</p>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* TAB 3: IA CO-PILOTO */}
        {activeTab === "assistant" && (
          <div className="h-full flex flex-col max-w-4xl mx-auto animate-in fade-in duration-500">
             {/* Banner de Regras Profissionais */}
             <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 items-start mb-6">
                <Shield className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-300 mb-1">Assistente Exclusivo para Apoio Educacional</h4>
                  <p className="text-xs text-red-200/80 leading-relaxed">
                    A IA Co-Piloto é programada **apenas para suporte técnico estrutural e pesquisa**. 
                    É estritamente **proibido** utilizar este modelo para gerar prescrições clínicas diretas para pacientes, laudos ou dietas personalizadas de tratamento.
                  </p>
                </div>
             </div>

             {/* Chat View */}
             <div className="flex-1 bg-[#0f1520] border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                  {aiHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                      <Bot className="w-16 h-16 text-[#45dcb9]/30 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Supere seus Limites de Pesquisa</h3>
                      <p className="text-sm text-slate-400 max-w-sm">
                        Resuma artigos em segundos, peça explicações sobre mecanismos metabólicos, ou obtenha ideias para criar seus próprios cursos.
                      </p>
                    </div>
                  ) : (
                    aiHistory.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-lg border ${
                          msg.role === 'user' 
                          ? 'bg-gradient-to-br from-[#22B391] to-[#125c4a] text-white border-transparent rounded-tr-sm'
                          : 'bg-[#0a0f16] text-slate-300 border-white/10 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Inputs do Chat */}
                <div className="bg-[#0a0f16] border border-white/10 rounded-xl flex items-center p-1.5 focus-within:border-[#45dcb9] transition-colors">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAIMessage()}
                    placeholder="Pedir para resumir uma meta-análise, explicar estudo..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white px-4 py-3 placeholder:text-slate-600"
                  />
                  <button onClick={handleSendAIMessage} className="w-10 h-10 bg-[#45dcb9] text-[#0a0f16] flex items-center justify-center rounded-lg hover:bg-[#34b093] transition-colors">
                    <Send className="w-4 h-4 ml-[-2px] relative z-10" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* TAB 4: INSIGHTS & TAB 5: BIBLIOTECA */}
        {(activeTab === "insights" || activeTab === "library") && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 text-slate-500 animate-in fade-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-2 shadow-[inset_0_4px_20px_rgba(255,255,255,0.02)] border border-white/5">
                {activeTab === "insights" ? <TrendingUp className="w-10 h-10 text-[#45dcb9]/50" /> : <Library className="w-10 h-10 text-[#45dcb9]/50" />}
             </div>
             <div>
               <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                 {activeTab === "insights" ? "Insights e Tendências Científicas" : "Biblioteca Inteligente"}
               </h3>
               <p className="text-sm max-w-md mx-auto leading-relaxed">
                 {activeTab === "insights" 
                   ? "A IA detecta padrões nos artigos publicados esta semana e dispara alertas de tendências clínicas."
                   : "Busca semântica avançada em todo o acervo curado por profissionais. Use tags como #microbiota #jejum."}
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
    </div>
  );
}

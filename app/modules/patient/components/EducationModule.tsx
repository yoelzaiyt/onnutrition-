"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  Brain,
  Search,
  FileText,
  Video,
  Clock,
  Users,
  Star,
  Award,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Library,
  Sparkles,
  TrendingUp,
  Target,
  FlaskConical,
  Newspaper,
  Bot,
  Bookmark,
  Share2,
  Zap,
  Shield,
  Microscope,
  Activity,
  Filter,
  Plus,
  Send,
  BarChart3,
  AlertCircle,
  FileCheck,
  BrainCircuit,
  BookMarked,
  Calendar,
  Bell,
  Download,
  PlayCircle,
  FileQuestion,
  Trophy,
  TrendingDown,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: number;
  lessons: number;
  duration: string;
  level: "iniciante" | "intermediario" | "avancado";
  instructor: string;
  rating: number;
  students: number;
  price: number;
  isFree: boolean;
  certificate: boolean;
  tags: string[];
  progress?: number;
  thumbnail?: string;
  isEnrolled?: boolean;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  summarySimple: string;
  summaryTechnical: string;
  source: string;
  sourceType: "artigo" | "meta_analise" | "revisao" | "noticia";
  year: number;
  evidenceLevel: "alto" | "medio" | "baixo";
  relevance: "alta" | "media" | "baixa";
  category: string;
  area: string;
  clinicalApplication: string;
  tags: string[];
  readTime: number;
  publishDate: string;
  isFavorite?: boolean;
}

interface LibraryItem {
  id: string;
  title: string;
  type: "article" | "course" | "study" | "material" | "video";
  category: string;
  tags: string[];
  dateAdded: string;
  isFavorite: boolean;
}

interface AIResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Nutrição Clínica Avançada",
    description: "Protocolos de dietoterapia para condições clínicas complexas",
    category: "Nutrição Clínica",
    modules: 12,
    lessons: 48,
    duration: "40h",
    level: "avancado",
    instructor: "Dra. Ana Santos",
    rating: 4.9,
    students: 856,
    price: 497,
    isFree: false,
    certificate: true,
    tags: ["clínica", "dietoterapia", "avançado"],
    progress: 35,
    isEnrolled: true,
  },
  {
    id: "2",
    title: "Metabolismo e Termogênese",
    description: "Fisiologia metabólica aplicada à prática profissional",
    category: "Metabolismo",
    modules: 8,
    lessons: 32,
    duration: "24h",
    level: "intermediario",
    instructor: "Dr. Carlos Lima",
    rating: 4.8,
    students: 1240,
    price: 0,
    isFree: true,
    certificate: true,
    tags: ["metabolismo", "fisiologia", "intermediário"],
    progress: 100,
    isEnrolled: true,
  },
  {
    id: "3",
    title: "Comportamento Alimentar e TCC",
    description:
      "Psicologia da alimentação e técnicas cognitivo-comportamentais",
    category: "Comportamento",
    modules: 10,
    lessons: 40,
    duration: "30h",
    level: "intermediario",
    instructor: "Dra. Maria Chen",
    rating: 4.7,
    students: 560,
    price: 297,
    isFree: false,
    certificate: true,
    tags: ["psicologia", "comportamento", "TCC"],
    progress: 0,
    isEnrolled: false,
  },
  {
    id: "4",
    title: "Nutrição Esportiva de Elite",
    description: "Protocolos para atletas de alta performance e resistência",
    category: "Esportivo",
    modules: 15,
    lessons: 60,
    duration: "45h",
    level: "avancado",
    instructor: "Prof. João Silva",
    rating: 4.9,
    students: 320,
    price: 697,
    isFree: false,
    certificate: true,
    tags: ["esporte", "performance", "atleta"],
    progress: 0,
    isEnrolled: false,
  },
  {
    id: "5",
    title: "Microbioma Intestinal e Saúde",
    description: "Atualização científica sobre ejeção e microbioma",
    category: "Ciência",
    modules: 6,
    lessons: 24,
    duration: "18h",
    level: "avancado",
    instructor: "Dra. Pedro Alves",
    rating: 4.6,
    students: 890,
    price: 197,
    isFree: false,
    certificate: true,
    tags: ["microbioma", "intestino", "pesquisa"],
    progress: 0,
    isEnrolled: false,
  },
  {
    id: "6",
    title: "Obesidade: Abordagem Multidisciplinar",
    description: "Tratamento integrado daobesidade baseada em evidências",
    category: "Obesidade",
    modules: 8,
    lessons: 32,
    duration: "28h",
    level: "intermediario",
    instructor: "Dr. Roberto Mendes",
    rating: 4.8,
    students: 720,
    price: 347,
    isFree: false,
    certificate: true,
    tags: ["obesidade", "tratamento", "multidisciplinar"],
    progress: 0,
    isEnrolled: false,
  },
];

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Dieta mediterrânea reduz risco cardiovascular em 30%",
    summary:
      "Meta-análise com 12.000 participantes demonstra proteção cardiovascular significativa da dieta mediterrânea",
    summarySimple:
      "Estudo mostra que dieta mediterrânea diminui em 30% o risco de problemas no coração",
    summaryTechnical:
      "Meta-análise de 12 ensaios clínicos randomizados demonstra redução de 30% em eventos cardiovasculares majors",
    source: "NEJM",
    sourceType: "meta_analise",
    year: 2025,
    evidenceLevel: "alto",
    relevance: "alta",
    category: "Cardiovascular",
    area: "Prevenção",
    clinicalApplication:
      "Recomendação de dieta mediterrânea para todos os pacientes sem contraindicações",
    tags: ["dieta", "coração", "prevenção", "meta-análise"],
    readTime: 8,
    publishDate: "2025-04-15",
    isFavorite: true,
  },
  {
    id: "2",
    title: "Jejum intermitente: eficácia e segurança",
    summary:
      "Revisão sistemática avalia efeitos do jejum intermitente na composição corporal e metabólica",
    summarySimple:
      "Análise de estudos mostra que jejum intermitente ajuda a emagrecer, mas precisa de cuidado",
    summaryTechnical:
      "Revisão sistemática com 23 estudos demonstra perda média de 4-8% de peso corporal em 12 semanas",
    source: "Lancet",
    sourceType: "revisao",
    year: 2025,
    evidenceLevel: "alto",
    relevance: "alta",
    category: "Emagrecimento",
    area: "Nutrição",
    clinicalApplication:
      "Avaliar individualmente pacientes para jejum intermitente; contra-indicar em gestantes e diabéticos tipo 1",
    tags: ["jejum", "emagrecimento", "metabolismo"],
    readTime: 7,
    publishDate: "2025-04-14",
    isFavorite: false,
  },
  {
    id: "3",
    title: "Nova diretriz da ABA sobre manejo daobesidade",
    summary:
      "Atualização das diretrizes brasileiras para tratamento multiprofissional daobesidade",
    summarySimple:
      "Novas regras para tratarobesidade com equipe de profissionais de saúde",
    summaryTechnical:
      "Diretrizes atualizadas enfatizando abordagem multidisciplinar e farmacoterapia adjunctiva",
    source: "ABP",
    sourceType: "noticia",
    year: 2025,
    evidenceLevel: "alto",
    relevance: "alta",
    category: "Obesidade",
    area: "Protocolo",
    clinicalApplication:
      "Implementar protocolo multidisciplinar com seguimento quinzenal nos primeiros 3 meses",
    tags: ["diretriz", "obesidade", "protocolo", "ABA"],
    readTime: 6,
    publishDate: "2025-04-13",
    isFavorite: true,
  },
  {
    id: "4",
    title: "Probióticos e função imunológica",
    summary:
      "Estudo revela mecanismos de ação dos probióticos na modulação imunológica",
    summarySimple: "Bactérias boas podem ajudar o sistema de defesa do corpo",
    summaryTechnical:
      "Pesquisa demonstra modulação de células T regulatórias e produção de IgA secretora",
    source: "Cell",
    sourceType: "artigo",
    year: 2025,
    evidenceLevel: "alto",
    relevance: "media",
    category: "Microbiota",
    area: "Imunologia",
    clinicalApplication:
      "Considerar suplementação de Lactobacillus rhamnosus em pacientes com imunidade comprometida",
    tags: ["probióticos", "imunidade", "microbioma"],
    readTime: 9,
    publishDate: "2025-04-12",
    isFavorite: false,
  },
  {
    id: "5",
    title: "Proteína vegetal vs animal para atletas",
    summary:
      "Comparação de biodisponibilidade proteica entre fontes vegetais e animais",
    summarySimple:
      "Proteína de carne e de planta são igualmente boas para atletas",
    summaryTechnical:
      "Estudo demonstra digestibilidade proteica semelhante (PDCAAS >0.9) entre fontes vegetais e animais",
    source: "JISSN",
    sourceType: "artigo",
    year: 2025,
    evidenceLevel: "alto",
    relevance: "media",
    category: "Esportivo",
    area: "Nutrição Esportiva",
    clinicalApplication:
      "Recomendar combinação de fontes proteicas vegetais para atletas vegetarianos/veganos",
    tags: ["proteína", "esporte", "atleta", "vegetal"],
    readTime: 6,
    publishDate: "2025-04-11",
    isFavorite: false,
  },
  {
    id: "6",
    title: "Impacto do sono na composição corporal",
    summary:
      "Relação entre qualidade do sono, metabolismo e composição corporal",
    summarySimple: "Dormir bem ajuda a manter peso saudável",
    summaryTechnical:
      "Estudo demonstra correlação negativa entre fragmentação do sono e taxa metabólica basal",
    source: "Cell Metabolism",
    sourceType: "artigo",
    year: 2025,
    evidenceLevel: "alto",
    relevance: "alta",
    category: "Sono",
    area: "Metabolismo",
    clinicalApplication:
      "Avaliar qualidade do sono em pacientes com dificuldade de perda de peso",
    tags: ["sono", "metabolismo", "composição", "peso"],
    readTime: 7,
    publishDate: "2025-04-10",
    isFavorite: true,
  },
];

const courseCategories = [
  { id: "all", label: "Todos" },
  { id: "Nutrição Clínica", label: "Nutrição Clínica" },
  { id: "Metabolismo", label: "Metabolismo" },
  { id: "Comportamento", label: "Comportamento" },
  { id: "Esportivo", label: "Esportivo" },
  { id: "Ciência", label: "Ciência" },
  { id: "Obesidade", label: "Obesidade" },
];

const articleCategories = [
  { id: "all", label: "Todas" },
  { id: "Cardiovascular", label: "Cardiovascular" },
  { id: "Obesidade", label: "Obesidade" },
  { id: "Diabetes", label: "Diabetes" },
  { id: "Microbiota", label: "Microbiota" },
  { id: "Esportivo", label: "Esportivo" },
  { id: "Sono", label: "Sono" },
];

const levelColors = {
  iniciante: "bg-green-100 text-green-700",
  intermediario: "bg-yellow-100 text-yellow-700",
  avancado: "bg-red-100 text-red-700",
};

const evidenceColors = {
  alto: "bg-green-500",
  medio: "bg-yellow-500",
  baixo: "bg-red-500",
};

export default function CursosModule() {
  const [activeTab, setActiveTab] = useState<
    "courses" | "feed" | "library" | "assistant" | "insights"
  >("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<AIResponse[]>([]);
  const [showAICategory, setShowAICategory] = useState<string | null>(null);

  const filteredCourses = sampleCourses.filter((course) => {
    const matchSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || course.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const filteredArticles = sampleArticles.filter((article) => {
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleSendAIMessage = () => {
    if (!aiMessage.trim()) return;

    const userMessage = aiMessage;
    setAiHistory([
      ...aiHistory,
      {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);
    setAiMessage("");

    setTimeout(() => {
      let response = "";
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("artigo") || lowerMessage.includes("estudo")) {
        response = `📚 Posso ajudá-lo a encontrar artigos científicos relevantes. Tenho acesso a:

• Meta-análises e revisões sistemáticas
• Artigos de periódicos renomados (NEJM, Lancet, Cell)
• Notícias recentes sobre nutrição

Qual tema você está pesquisando?`;
      } else if (
        lowerMessage.includes("curso") ||
        lowerMessage.includes("formação")
      ) {
        response = `🎓 Temos diversos cursos de formação profissional:

• Nutrição Clínica Avançada
• Metabolismo e Termogênese
• Comportamento Alimentar
• Nutrição Esportiva
• Microbioma Intestinal

Posso indicar basedo na sua área de interesse!`;
      } else if (
        lowerMessage.includes("resum") ||
        lowerMessage.includes("resumo")
      ) {
        response = `📝 Posso gerar resumos em dois níveis:

• **Simplificado**: Para explicar ao paciente
• **Técnico**: Para uso profissional

Qual conteúdo você gostaria de resumir?`;
      } else if (
        lowerMessage.includes("obesidade") ||
        lowerMessage.includes("emagrecer")
      ) {
        response = `⚕️ Para suporte em **obesidade**, posso ajudar com:

• Resumos de diretrizes atualizadas
•最新的 protocolos de tratamento
• Evidence-based approaches

*Lembre-se: Não faço prescrições clínicas, apenas apoio técnico-educacional.*`;
      } else {
        response = `🤖 Sou seu assistente educacional. Posso ajudar com:

📚 **Buscar artigos científicos** - Pesquise por tema
🎓 **Indicar cursos** - Baseado na sua especialidade
📝 **Criar resumos** - Simplificado ou técnico
🔬 **Explicar conceitos** - Termos técnicos
📰 **Feed científico** - Últimas publicações

Como posso ajudar hoje?`;
      }

      setAiHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
    }, 800);
  };

  const getCourseProgress = (courseId: string) => {
    const course = sampleCourses.find((c) => c.id === courseId);
    return course?.progress || 0;
  };

  const enrolledCourses = sampleCourses.filter((c) => c.isEnrolled);
  const totalStudyTime = enrolledCourses.reduce(
    (acc, c) => acc + (c.progress / 100) * parseInt(c.duration),
    0,
  );
  const completedCourses = enrolledCourses.filter(
    (c) => c.progress === 100,
  ).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">CURSOS & FORMAÇÃO</h2>
            <p className="text-xs text-white/70">
              Formação profissional e atualização científica
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50">
        {[
          { id: "courses", label: "Cursos", icon: GraduationCap },
          { id: "feed", label: "Feed Científico", icon: Newspaper },
          { id: "library", label: "Biblioteca", icon: Library },
          { id: "assistant", label: "IA Co-Piloto", icon: Bot },
          { id: "insights", label: "Insights", icon: Lightbulb },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#22B391] text-[#22B391] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === "courses" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22B391] text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              >
                {courseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-20 bg-gradient-to-r from-[#22B391] to-[#0B2B24] flex items-center justify-center relative">
                    {course.isFree && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        GRÁTIS
                      </span>
                    )}
                    {course.progress !== undefined && course.progress > 0 && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                        {course.progress}%
                      </span>
                    )}
                    <GraduationCap className="w-8 h-8 text-white/50" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium">
                          {course.rating}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {course.description}
                    </p>
                    {course.progress !== undefined && course.progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-[#22B391] h-1.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Users className="w-3 h-3" /> {course.students}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          levelColors[course.level]
                        }`}
                      >
                        {course.level}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-[#22B391]">
                        {course.price === 0 ? "GRÁTIS" : `R$ ${course.price}`}
                      </span>
                      <button className="px-3 py-1.5 bg-[#22B391] text-white text-xs rounded-lg hover:bg-[#1a9580]">
                        {course.isEnrolled ? "Continuar" : "Matricular"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "feed" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  HOJE
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              >
                {articleCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-2 h-2 rounded-full ${evidenceColors[article.evidenceLevel]}`}
                      />
                      <span className="text-xs text-gray-500">
                        {article.source} • {article.year}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {article.sourceType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Bookmark
                          className={`w-4 h-4 ${
                            article.isFavorite
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime} min
                    </span>
                    <span>|</span>
                    <span>{article.category}</span>
                    <span>|</span>
                    <span className="text-[#22B391]">
                      {article.evidenceLevel}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button className="flex items-center gap-1 text-[#22B391] text-xs font-medium">
                      <Sparkles className="w-3 h-3" /> Resumo IA
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 text-xs hover:text-[#22B391]">
                      Ver completo <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {expandedArticle === article.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        📖 Resumo Simplificado:
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        {article.summarySimple}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        🔬 Resumo Técnico:
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {article.summaryTechnical}
                      </p>
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        💡 Aplicação Clínica:
                      </p>
                      <p className="text-xs text-gray-600">
                        {article.clinicalApplication}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FileText, label: "Artigos", count: 156, color: "blue" },
                { icon: Video, label: "Vídeos", count: 42, color: "purple" },
                { icon: BookOpen, label: "E-books", count: 28, color: "green" },
                {
                  icon: FlaskConical,
                  label: "Estudos",
                  count: 64,
                  color: "orange",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] text-center"
                >
                  <item.icon
                    className={`w-6 h-6 mx-auto mb-1 text-${item.color}-500`}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                  <p className="text-xs text-gray-500">{item.count}</p>
                </button>
              ))}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">
                Busca Inteligente
              </h4>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar na biblioteca..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <button className="px-4 py-2.5 bg-[#22B391] text-white rounded-xl text-sm hover:bg-[#1a9580]">
                  Buscar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Nutrição Clínica",
                  "Microbioma",
                  "Obesidade",
                  "Performance",
                  "Diabetes",
                  "Cardiovascular",
                ].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "assistant" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4 rounded-2xl text-white">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6" />
                <div>
                  <h4 className="font-bold">IA Co-Piloto Profissional</h4>
                  <p className="text-xs text-white/70">
                    Suporte técnico-educacional para profissionais
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <strong>Importante:</strong> Este assistente é apenas para
                  suporte técnico-educacional. Não faz prescrições clínicas,
                  dietas personalizadas ou diagnósticos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { icon: FileText, label: "Resumir Artigos" },
                { icon: BookOpen, label: "Explicar Estudos" },
                { icon: GraduationCap, label: "Ideias de Cursos" },
                { icon: Lightbulb, label: "Criar Resumos" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] text-center"
                >
                  <item.icon className="w-5 h-5 mx-auto mb-1 text-[#22B391]" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="h-64 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-xl">
              {aiHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Como posso ajudá-lo hoje?</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Pergunte sobre artigos, cursos ou conceitos técnicos
                  </p>
                </div>
              ) : (
                aiHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                        msg.role === "user"
                          ? "bg-[#22B391] text-white"
                          : "bg-white text-gray-700 border"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendAIMessage()}
                placeholder="Digite sua dúvida técnica..."
                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm"
              />
              <button
                onClick={handleSendAIMessage}
                className="p-3 bg-[#22B391] text-white rounded-xl hover:bg-[#1a9580]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl text-center">
                <GraduationCap className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <p className="text-xl font-black text-green-700">
                  {completedCourses}
                </p>
                <p className="text-xs text-green-600">Concluídos</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl text-center">
                <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xl font-black text-blue-700">
                  {Math.round(totalStudyTime)}h
                </p>
                <p className="text-xs text-blue-600">Estudadas</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl text-center">
                <FileText className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-xl font-black text-purple-700">
                  {sampleArticles.filter((a) => a.isFavorite).length}
                </p>
                <p className="text-xs text-purple-600">Favoritos</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl text-center">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                <p className="text-xl font-black text-amber-700">2</p>
                <p className="text-xs text-amber-600">Certificados</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">Próximo Conteúdo</h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-[#22B391] rounded-xl flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm text-gray-900">
                    Nutrição Avançada
                  </h5>
                  <p className="text-xs text-gray-500">
                    Continue para desbloquear
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-amber-800">Conquistas</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-white rounded-xl text-center opacity-50">
                  <span className="text-xl">🌱</span>
                  <p className="text-xs">Iniciante</p>
                </div>
                <div className="p-2 bg-white rounded-xl text-center">
                  <BookOpen className="w-5 h-5 mx-auto text-blue-500" />
                  <p className="text-xs font-medium">Leitor</p>
                </div>
                <div className="p-2 bg-white rounded-xl text-center opacity-50">
                  <span className="text-xl">🏆</span>
                  <p className="text-xs">Especialista</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

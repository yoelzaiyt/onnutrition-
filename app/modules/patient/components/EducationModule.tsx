"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  Brain,
  Search,
  Play,
  FileText,
  Video,
  Clock,
  Users,
  Star,
  Award,
  ChevronRight,
  CheckCircle,
  File,
  Library,
  Sparkles,
  TrendingUp,
  Target,
  Calendar,
  Bell,
  Filter,
  Plus,
  X,
  Send,
  MessageSquare,
  ExternalLink,
  Bookmark,
  Download,
  Share2,
  BarChart3,
  Zap,
  Shield,
  AlertCircle,
  FlaskConical,
  Newspaper,
  SearchCode,
  Bot,
  BookMarked,
  GraduationCap as Cap,
  Microscope,
  Activity,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: number;
  duration: string;
  level: "iniciante" | "intermediario" | "avancado";
  thumbnail?: string;
  instructor: string;
  rating: number;
  students: number;
  price: number;
  isFree: boolean;
  certificate: boolean;
  tags: string[];
  progress?: number;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  year: number;
  evidenceLevel: "alta" | "moderada" | "baixa";
  area: string;
  forProfessional: boolean;
  tags: string[];
  readTime: number;
  date: string;
  imageUrl?: string;
}

interface LibraryItem {
  id: string;
  title: string;
  type: "article" | "course" | "study" | "material";
  category: string;
  tags: string[];
  dateAdded: string;
  favorite: boolean;
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Nutrição Clínica Avançada",
    description: "Abordagem multidisciplinar em nutrology e dietoterapia",
    category: "Nutrição Clínica",
    modules: 12,
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
  },
  {
    id: "2",
    title: "Metabolismo e Termogênese",
    description: "Fisiologia metabólica para prática profissional",
    category: "Metabolismo",
    modules: 8,
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
  },
  {
    id: "3",
    title: "Comportamento Alimentar",
    description: "Psicologia da alimentação e manejo comportamental",
    category: "Comportamento",
    modules: 10,
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
  },
  {
    id: "4",
    title: "Nutrição Esportiva de Elite",
    description: "Protocolos para atletas de alta performance",
    category: "Esportivo",
    modules: 15,
    duration: "45h",
    level: "avancado",
    instructor: "Prof. João Silva",
    rating: 4.9,
    students: 320,
    price: 697,
    isFree: false,
    certificate: true,
    tags: ["esporte", "performance", "atleta"],
  },
  {
    id: "5",
    title: "Microbioma Intestinal",
    description: "Atualização científica sobre ejeção e microbioma",
    category: "Ciência",
    modules: 6,
    duration: "18h",
    level: "avancado",
    instructor: "Dra. Pedro Alves",
    rating: 4.6,
    students: 890,
    price: 197,
    isFree: false,
    certificate: true,
    tags: ["microbioma", "intestino", "pesquisa"],
  },
];

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Dieta mediterrânea reduz risco cardiovascular em 30%",
    summary:
      "Meta-análise com 12.000 participantes demonstra proteção cardiovascular significativa",
    source: "NEJM",
    year: 2025,
    evidenceLevel: "alta",
    area: "Cardiovascular",
    forProfessional: true,
    tags: ["dieta", "coração", "prevenção"],
    readTime: 5,
    date: "2025-04-15",
  },
  {
    id: "2",
    title: "Jejum intermitente: eficácia e segurança",
    summary:
      "Revisão sistemática avalia efeitos do jejum intermitente na composição corporal",
    source: "Lancet",
    year: 2025,
    evidenceLevel: "alta",
    area: "Emagrecimento",
    forProfessional: true,
    tags: ["jejum", "emagrecimento", "metabolismo"],
    readTime: 7,
    date: "2025-04-14",
  },
  {
    id: "3",
    title: "Nova diretriz da ABA sobre manejo daobesidade",
    summary:
      "Atualização das diretrizes para tratamento multiprofissional daobesidade",
    source: "ABP",
    year: 2025,
    evidenceLevel: "alta",
    area: "Obesidade",
    forProfessional: true,
    tags: ["diretriz", "obesidade", "protocolo"],
    readTime: 8,
    date: "2025-04-13",
  },
  {
    id: "4",
    title: "Probióticos e função imunológica",
    summary: "Estudo revela mecanismos de ação dos probióticos na imunidade",
    source: "Cell",
    year: 2025,
    evidenceLevel: "alta",
    area: "Microbiota",
    forProfessional: true,
    tags: ["probióticos", "imunidade", "microbioma"],
    readTime: 6,
    date: "2025-04-12",
  },
  {
    id: "5",
    title: "Proteína vegetal vs animal para atletas",
    summary:
      "Comparação de biodisponibilidade proteica entre fontes vegetais e animais",
    source: "JISSN",
    year: 2025,
    evidenceLevel: "alta",
    area: "Esportivo",
    forProfessional: true,
    tags: ["proteína", "esporte", "atleta"],
    readTime: 6,
    date: "2025-04-11",
  },
  {
    id: "6",
    title: "Impacto do sono na composição corporal",
    summary:
      "Como a qualidade do sono influencia no metabolismo e composição corporal",
    source: "Cell Metabolism",
    year: 2025,
    evidenceLevel: "alta",
    area: "Sono",
    forProfessional: true,
    tags: ["sono", "metabolismo", "composição"],
    readTime: 5,
    date: "2025-04-10",
  },
];

const professionalTabs = [
  { id: "courses", label: "Cursos", icon: GraduationCap },
  { id: "feed", label: "Feed Científico", icon: Newspaper },
  { id: "library", label: "Biblioteca", icon: Library },
  { id: "assistant", label: "IA Co-Piloto", icon: Bot },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

export default function CursosModule() {
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [showCourseDetail, setShowCourseDetail] = useState<Course | null>(null);

  const filteredCourses = sampleCourses.filter((course) => {
    const matchSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      !selectedCategory || course.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const filteredArticles = sampleArticles.filter((article) => {
    const matchSearch = article.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const handleSendAIMessage = () => {
    if (!aiMessage.trim()) return;

    const userMessage = aiMessage;
    setAiHistory([...aiHistory, { role: "user", content: userMessage }]);
    setAiMessage("");

    setTimeout(() => {
      let response = "";
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("artigo") || lowerMessage.includes("estudo")) {
        response =
          "Posso ajudá-lo a encontrar artigos científicos relevantes. Qual tema você está pesquisando?";
      } else if (
        lowerMessage.includes("curso") ||
        lowerMessage.includes("formação")
      ) {
        response =
          "Temos diversos cursos de formação profissional. Posso indicar basedo na sua área de interesse!";
      } else if (
        lowerMessage.includes("resum") ||
        lowerMessage.includes("resumo")
      ) {
        response =
          "Posso gerar resumos simplificados ou técnicos de artigos científicos. Qual conteúdo você gostaria de resumir?";
      } else {
        response =
          "Sou seu assistente educacional. Posso ajudar com:\n\n📚 Buscar artigos científicos\n🎓 Indicar cursos profissionalizantes\n📝 Criar resumos educacionais\n🔬 Explicar conceitos técnicos\n\nComo posso ajudar hoje?";
      }

      setAiHistory((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, 1000);
  };

  const getCourseProgress = (courseId: string) => {
    const course = sampleCourses.find((c) => c.id === courseId);
    return course?.progress || 0;
  };

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case "alta":
        return "bg-green-100 text-green-700";
      case "moderada":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22B391]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl"
        >
          <option value="">Todas as categorias</option>
          <option value="Nutrição Clínica">Nutrição Clínica</option>
          <option value="Metabolismo">Metabolismo</option>
          <option value="Comportamento">Comportamento</option>
          <option value="Esportivo">Esportivo</option>
          <option value="Ciência">Ciência</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => setShowCourseDetail(course)}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="h-32 bg-gradient-to-r from-[#22B391] to-[#0B2B24] flex items-center justify-center relative">
              {course.isFree && (
                <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  GRÁTIS
                </span>
              )}
              {course.progress !== undefined && course.progress > 0 && (
                <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  {course.progress}% concluído
                </span>
              )}
              <GraduationCap className="w-12 h-12 text-white/50" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{course.category}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{course.title}</h4>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {course.description}
              </p>

              {course.progress !== undefined && course.progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#22B391] h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" /> {course.students}
                </span>
              </div>
              {course.price > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-black text-[#22B391]">
                    R$ {course.price}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            HOJE
          </span>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("pt-BR")}
          </span>
        </div>
        <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm">
          <Filter className="w-4 h-4" /> Filtrar
        </button>
      </div>

      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getEvidenceColor(article.evidenceLevel)}`}
                  >
                    Evidência {article.evidenceLevel}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.source} • {article.year}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {article.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{article.summary}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" /> {article.readTime} min
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">{article.area}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bookmark className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button className="flex items-center gap-2 text-[#22B391] font-medium text-sm">
                <Sparkles className="w-4 h-4" /> Gerar resumo IA
              </button>
              <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-[#22B391]">
                Ver artigo completo <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLibraryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <span className="text-sm font-medium">Artigos</span>
          <p className="text-xs text-gray-500">156</p>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <Video className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <span className="text-sm font-medium">Vídeos</span>
          <p className="text-xs text-gray-500">42</p>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <span className="text-sm font-medium">E-books</span>
          <p className="text-xs text-gray-500">28</p>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <FlaskConical className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <span className="text-sm font-medium">Estudos</span>
          <p className="text-xs text-gray-500">64</p>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Busca Inteligente</h4>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar na biblioteca..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22B391]"
            />
          </div>
          <button className="px-4 py-2 bg-[#22B391] text-white rounded-xl hover:bg-[#1a9580]">
            Buscar
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Nutrição Clínica",
            "Microbioma",
            "Obesidade",
            "Performance",
            "Diabetes",
          ].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssistantTab = () => (
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
          <p className="text-sm text-blue-700">
            <strong>Informação importante:</strong> Este assistente é destinado
            ONLY para suporte técnico-educacional. Não faz prescrições clínicas,
            dietas personalizadas ou diagnósticos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: "Resumir Artigos" },
          { icon: BookOpen, label: "Explicar Estudos" },
          { icon: GraduationCap, label: "Ideias de Cursos" },
          { icon: Lightbulb, label: "Criar Resumos" },
        ].map((item, i) => (
          <button
            key={i}
            className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] text-center"
          >
            <item.icon className="w-6 h-6 mx-auto mb-1 text-[#22B391]" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="h-80 overflow-y-auto space-y-3 p-2 bg-gray-50 rounded-xl">
        {aiHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Como posso ajudá-lo hoje?</p>
            <p className="text-xs text-gray-400 mt-1">
              Pergunte sobre artigos, cursos ou conceitos técnicos
            </p>
          </div>
        ) : (
          aiHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-[#22B391] text-white" : "bg-white text-gray-700 border"}`}
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
          className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22B391]"
        />
        <button
          onClick={handleSendAIMessage}
          className="p-3 bg-[#22B391] text-white rounded-xl hover:bg-[#1a9580]"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
          <GraduationCap className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-black text-green-700">3</p>
          <p className="text-xs text-green-600">Cursos Concluídos</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
          <Clock className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-black text-blue-700">48h</p>
          <p className="text-xs text-blue-600">Tempo de Estudo</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
          <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-2xl font-black text-purple-700">24</p>
          <p className="text-xs text-purple-600">Artigos Lidos</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
          <Award className="w-8 h-8 text-orange-600 mb-2" />
          <p className="text-2xl font-black text-orange-700">2</p>
          <p className="text-xs text-orange-600">Certificados</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">
          Próximo Conteúdo Recomendado
        </h4>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-[#22B391] rounded-xl flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900">Nutrição Avançada</h5>
            <p className="text-sm text-gray-500">Continue para desbloquear</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-500" />
          <div>
            <h4 className="font-bold text-amber-800">
              Conquistas Desbloqueadas
            </h4>
            <p className="text-sm text-amber-700">
              Continue aprendendo para ganhar!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 bg-white rounded-xl text-center opacity-50">
            <span className="text-2xl">🌱</span>
            <p className="text-xs">Iniciante</p>
          </div>
          <div className="p-3 bg-white rounded-xl text-center opacity-50">
            <span className="text-2xl">📚</span>
            <p className="text-xs">Leitor</p>
          </div>
          <div className="p-3 bg-white rounded-xl text-center">
            <Sparkles className="w-8 h-8 mx-auto text-amber-500" />
            <p className="text-xs font-medium">Especialista</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return renderCoursesTab();
      case "feed":
        return renderFeedTab();
      case "library":
        return renderLibraryTab();
      case "assistant":
        return renderAssistantTab();
      case "insights":
        return renderInsightsTab();
      default:
        return renderCoursesTab();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Cursos & Formação</h2>
            <p className="text-xs text-white/70">
              Formação profissional e atualização científica
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100 overflow-x-auto">
        {professionalTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#22B391] text-[#22B391]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  GraduationCap,
  Lightbulb,
  Play,
  FileText,
  Video,
  CheckCircle,
  Clock,
  Users,
  Brain,
  Award,
  Star,
  ChevronRight,
  Lock,
  Download,
  Share,
  Tag,
  Filter,
  Plus,
  X,
  Send,
  MessageSquare,
  File,
  Headphones,
  BarChart3,
  TrendingUp,
  Calendar,
  Zap,
  User,
  Shield,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useFirebase } from "@/app/components/layout/FirebaseProvider";
import { addDocument, subscribeToCollection } from "@/app/lib/firestore-utils";

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
}

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  year: number;
  evidenceLevel: "alta" | "moderada" | "baixa";
  area: string;
  forPatient: boolean;
  tags: string[];
  readTime: number;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: "video" | "pdf" | "quiz";
  duration: string;
  completed: boolean;
}

interface Progress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  lastAccess: string;
}

interface UserProgress {
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Fundamentos da Alimentação Saudável",
    description:
      "Aprenda os conceitos básicos de nutrição para uma vida mais saudável",
    category: "Básico",
    modules: 8,
    duration: "2h30",
    level: "iniciante",
    instructor: "Dra. Ana Santos",
    rating: 4.8,
    students: 1240,
    price: 0,
    isFree: true,
    certificate: true,
    tags: ["alimentação", "saúde", "básico"],
  },
  {
    id: "2",
    title: "Entendendo Rótulos Nutricionais",
    description: "Como ler e interpretar rótulos de alimentos corretamente",
    category: "Consciência Alimentar",
    modules: 4,
    duration: "1h15",
    level: "iniciante",
    instructor: "Dr. Carlos Lima",
    rating: 4.9,
    students: 890,
    price: 0,
    isFree: true,
    certificate: true,
    tags: ["rótulos", "consumo", "consciência"],
  },
  {
    id: "3",
    title: "Nutrição para Performance Esportiva",
    description: "Optimize sua performance com alimentação adequada",
    category: "Esportivo",
    modules: 12,
    duration: "4h00",
    level: "avancado",
    instructor: "Dra. Ana Santos",
    rating: 4.7,
    students: 560,
    price: 197,
    isFree: false,
    certificate: true,
    tags: ["esporte", "performance", "atleta"],
  },
  {
    id: "4",
    title: "Introdução ao Microbioma Intestinal",
    description:
      "Compreenda a importância das bactérias intestinais para sua saúde",
    category: "Ciência",
    modules: 6,
    duration: "2h00",
    level: "intermediario",
    instructor: "Dra. Maria Chen",
    rating: 4.9,
    students: 320,
    price: 97,
    isFree: false,
    certificate: true,
    tags: ["microbioma", "ciência", "saúde"],
  },
];

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Dieta mediterrânea reduz risco cardiovascular",
    summary:
      "Estudo mostra que adoção da dieta mediterrânea pode reduzir em até 30% o risco de doenças cardíacas.",
    source: "NEJM",
    year: 2024,
    evidenceLevel: "alta",
    area: "Cardiovascular",
    forPatient: true,
    tags: ["dieta", "coração", "prevenção"],
    readTime: 3,
  },
  {
    id: "2",
    title: "Jejum intermitente: o que a ciência diz",
    summary:
      "Meta-análise revela efeitos do jejum intermitente na perda de peso e metabolismo.",
    source: "Lancet",
    year: 2023,
    evidenceLevel: "alta",
    area: "Emagrecimento",
    forPatient: true,
    tags: ["jejum", "emagrecimento", "metabolismo"],
    readTime: 4,
  },
  {
    id: "3",
    title: "Proteína vegetal vs animal: mito ou verdade?",
    summary:
      "Comparação científica entre fontes proteicas vegetais e animais para atletas.",
    source: "JISSN",
    year: 2024,
    evidenceLevel: "alta",
    area: "Esportivo",
    forPatient: false,
    tags: ["proteína", "esporte", "atleta"],
    readTime: 5,
  },
  {
    id: "4",
    title: "Impacto do睡眠 na composição corporal",
    summary:
      "Como a qualidade do sono influencia no metabolismo e composição corporal.",
    source: "Cell Metabolism",
    year: 2024,
    evidenceLevel: "alta",
    area: "Sono",
    forPatient: true,
    tags: ["sono", "metabolismo", "composição"],
    readTime: 4,
  },
  {
    id: "5",
    title: "Fibras e saciedade: mecanismo científico",
    summary:
      "Entenda o mecanismo científico que faz as fibras promoverem saciedade prolongada.",
    source: "American Journal",
    year: 2023,
    evidenceLevel: "moderada",
    area: "Saciiedade",
    forPatient: true,
    tags: ["fibras", "saciedade", "fome"],
    readTime: 3,
  },
];

const patientEducationalContent = [
  {
    id: "1",
    title: "Como Montar Prato Equilibrado",
    description: "Guia passo a passo para refeição",
    type: "guide",
    category: "Educação Aplicada",
    icon: "🍽️",
  },
  {
    id: "2",
    title: "Entendendo Gorduras",
    description: "Quais são saudáveis",
    type: "micro_lesson",
    category: "Nutrição",
    icon: "🧈",
  },
  {
    id: "3",
    title: "Quanto Proteína Preciso?",
    description: "Calculadora básica",
    type: "simulator",
    category: "Cálculo",
    icon: "💪",
  },
  {
    id: "4",
    title: "Por que Fiber?",
    description: "Benefícios das fibras",
    type: "insight",
    category: "Saúde",
    icon: "🌾",
  },
  {
    id: "5",
    title: "Água: Quanto Beber?",
    description: "Calculadora de hidratação",
    type: "simulator",
    category: "Hidratação",
    icon: "💧",
  },
  {
    id: "6",
    title: "Escolhas em Restaurantes",
    description: "Dicas para comer fora",
    type: "guide",
    category: "Educação Aplicada",
    icon: "🍴",
  },
  {
    id: "7",
    title: "Leitura de Rótulos",
    description: "Como interpretar ingredientes",
    type: "guide",
    category: "Educação Aplicada",
    icon: "🏷️",
  },
  {
    id: "8",
    title: "Substituições Saudáveis",
    description: "Alternativas aos alimentos",
    type: "guide",
    category: "Educação Aplicada",
    icon: "🔄",
  },
];

export default function EducationModule() {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [showCourseDetail, setShowCourseDetail] = useState<Course | null>(null);

  const isProfessional = false;

  const tabs = [
    { id: "courses", label: "Cursos", icon: GraduationCap },
    { id: "discoveries", label: "Descobertas", icon: Lightbulb },
    { id: "library", label: "Biblioteca", icon: BookOpen },
    { id: "learn", label: "Prático", icon: Play },
    { id: "assistant", label: "Assistente IA", icon: Brain },
    { id: "progress", label: "Meu Progresso", icon: TrendingUp },
  ];

  const professionalTabs = [
    { id: "courses", label: "Cursos", icon: GraduationCap },
    { id: "discoveries", label: "Descobertas", icon: Lightbulb },
    { id: "library", label: "Biblioteca", icon: BookOpen },
    { id: "assistant", label: "Assistente IA", icon: Brain },
  ];

  const userTabs = isProfessional ? professionalTabs : tabs;

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
    const matchPatient = !isProfessional || !article.forPatient;
    return matchSearch && matchPatient;
  });

  const handleSendAIMessage = () => {
    if (!aiMessage.trim()) return;

    const userMessage = aiMessage;
    setAiHistory([...aiHistory, { role: "user", content: userMessage }]);
    setAiMessage("");

    setTimeout(() => {
      let response = "";
      const lowerMessage = userMessage.toLowerCase();

      if (
        lowerMessage.includes("dieta") ||
        lowerMessage.includes("emagrecer") ||
        lowerMessage.includes("perder peso")
      ) {
        response =
          "Para orientação personalizada e planos de dieta específicos, recomendo que você marque uma consulta com um nutricionista. Posso explicar conceitos gerais sobre alimentação equilibrada, mas cada pessoa tem necessidades específicas!";
      } else if (
        lowerMessage.includes("receita") ||
        lowerMessage.includes("comida")
      ) {
        response =
          'Posso explicar sobre grupos alimentares e combinações saudáveis. Para receitas específicas, recomendo nossos cursos práticos na aba "Cursos"!';
      } else if (
        lowerMessage.includes("proteína") ||
        lowerMessage.includes("proteina")
      ) {
        response =
          "A proteína é essencial para construção muscular e manutenção dos tecidos. fontes saudáveis incluem: carnes magras, peixes, ovos, leguminosas e laticínios. A quantidade ideal depende do seu nível de atividade física!";
      } else if (
        lowerMessage.includes("vitamina") ||
        lowerMessage.includes("mineral")
      ) {
        response =
          "Vitaminas e minerais são essenciais para o metabolismo. Cada vitamina tem funções específicas no corpo. Uma alimentação equilibrada e variada é a melhor forma de obter todos os nutrientes necessários!";
      } else if (
        lowerMessage.includes("gordura") ||
        lowerMessage.includes("gordura")
      ) {
        response =
          "Existem diferentes tipos de gorduras: saturadas (use com moderação), gordura trans (evite), e gorduras insaturadas (saudáveis - azeite, abacate, nuts). As gorduras saudáveis são importantes para absorção de vitaminas e saúde cardiovascular.";
      } else {
        response =
          "Entendo sua dúvida! Posso ajudar explicando conceitos nutricionais baseados em ciência. Para dúvidas específicas sobre sua saúde, marque uma consulta com um profissional!";
      }

      setAiHistory((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, 1000);
  };

  const getCourseProgress = (courseId: string) => {
    const progress = userProgress.filter(
      (p) => p.courseId === courseId && p.completed,
    );
    return Math.round((progress.length / 3) * 100);
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
          <option value="Básico">Básico</option>
          <option value="Consciência Alimentar">Consciência</option>
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
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#22B391] h-2 rounded-full"
                  style={{ width: `${getCourseProgress(course.id)}%` }}
                />
              </div>
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

  const renderDiscoveriesTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
        <h3 className="font-bold text-gray-900 mb-2">
          Descobertas Científicas
        </h3>
        <p className="text-sm text-gray-600">
          Stay updated with the latest nutritional science discoveries,
          simplified for your understanding.
        </p>
      </div>

      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white p-5 rounded-2xl border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      article.evidenceLevel === "alta"
                        ? "bg-green-100 text-green-700"
                        : article.evidenceLevel === "moderada"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
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
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowRight className="w-5 h-5 text-[#22B391]" />
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
          <p className="text-xs text-gray-500">24</p>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <Video className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <span className="text-sm font-medium">Vídeos</span>
          <p className="text-xs text-gray-500">18</p>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <span className="text-sm font-medium">Guias</span>
          <p className="text-xs text-gray-500">12</p>
        </button>
        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center">
          <Headphones className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <span className="text-sm font-medium">Áudios</span>
          <p className="text-xs text-gray-500">8</p>
        </button>
      </div>
    </div>
  );

  const renderLearnTab = () => (
    <div className="space-y-6">
      <h3 className="font-bold text-gray-900 text-lg">
        Aprendizado Personalizado
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patientEducationalContent.map((item) => (
          <button
            key={item.id}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#22B391] transition-colors text-left"
          >
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.category}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderAssistantTab = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <div>
            <h4 className="font-bold">Assistente Educacional</h4>
            <p className="text-xs text-white/70">
              Posso explicar conceitos, resumir conteúdos
            </p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">
            <strong>⚠️ Importante:</strong> Sou um assistente educacional. Não
            prescrevo dietas, planos alimentares ou diagnósticos. Para
            orientação personalizada, consulte seu nutricionista!
          </p>
        </div>
      </div>

      <div className="h-80 overflow-y-auto space-y-3 p-2">
        {aiHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Faça uma pergunta sobre nutrição!</p>
            <p className="text-xs text-gray-400 mt-1">
              Ex: "Para que serve a proteína?"
            </p>
          </div>
        ) : (
          aiHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-[#22B391] text-white"
                    : "bg-gray-100 text-gray-700"
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
          placeholder="Digite sua dúvida..."
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

  const renderProgressTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
          <GraduationCap className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-black text-green-700">3</p>
          <p className="text-xs text-green-600">Cursos Concluídos</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
          <Clock className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-black text-blue-700">12h</p>
          <p className="text-xs text-blue-600">Tempo de Estudo</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
          <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-2xl font-black text-purple-700">24</p>
          <p className="text-xs text-purple-600">Conteúdos Acessados</p>
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
            <ArrowRight className="w-6 h-6 text-white" />
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
          <div className="p-3 bg-white rounded-xl text-center opacity-50">
            <span className="text-2xl">🏆</span>
            <p className="text-xs">Mestre</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return renderCoursesTab();
      case "discoveries":
        return renderDiscoveriesTab();
      case "library":
        return renderLibraryTab();
      case "learn":
        return renderLearnTab();
      case "assistant":
        return renderAssistantTab();
      case "progress":
        return renderProgressTab();
      default:
        return renderCoursesTab();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              Educação & Inteligência Nutricional
            </h2>
            <p className="text-xs text-white/70">Aprenda, Descubra, Evolua</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100 overflow-x-auto">
        {userTabs.map((tab) => (
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

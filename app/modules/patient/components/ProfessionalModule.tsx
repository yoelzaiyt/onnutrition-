"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Upload,
  Video,
  FileText,
  Users,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  Brain,
  BarChart3,
  Plus,
  Play,
  Download,
  Share,
  Star,
  CheckCircle,
  Clock,
  Eye,
  MoreVertical,
  Filter,
  Tag,
  Settings,
  Pen,
  Lightbulb,
  Award,
  DollarSign,
  Send,
  X,
  ChevronRight,
  Menu,
  File,
  Image,
  Zap,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  source: string;
  year: number;
  area: string;
  evidenceLevel: string;
  summary?: string;
  tags: string[];
}

interface LibraryItem {
  id: string;
  title: string;
  type: "pdf" | "video" | "article" | "protocol" | "material";
  category: string;
  tags: string[];
  createdAt: string;
  views: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  students: number;
  price: number;
  status: "draft" | "published";
  thumbnail?: string;
}

interface Testimonial {
  id: string;
  patientName: string;
  content: string;
  rating: number;
  authorized: boolean;
  date: string;
}

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Eficácia da dieta mediterrânea na prevenção cardiovascular",
    source: "NEJM",
    year: 2024,
    area: "Cardiovascular",
    evidenceLevel: "Alta",
    tags: ["dieta", "prevenção", "coração"],
  },
  {
    id: "2",
    title: "Jejum intermitente vs restrição calórica contínua",
    source: "Lancet",
    year: 2023,
    area: "Obesidade",
    evidenceLevel: "Moderada",
    tags: ["jejum", "emagrecimento"],
  },
  {
    id: "3",
    title: "Proteína vegetal vs animal em atletas",
    source: "JISSN",
    year: 2024,
    area: "Esportivo",
    evidenceLevel: "Alta",
    tags: ["proteína", "atletas", "musculação"],
  },
  {
    id: "4",
    title: "Impacto do microbioma na composição corporal",
    source: "Cell",
    year: 2024,
    area: "Metabolismo",
    evidenceLevel: "Alta",
    tags: ["microbioma", "gordura", "metabolismo"],
  },
  {
    id: "5",
    title: " Cetogênica em pacientes com resistência insulínica",
    source: "Diabetes Care",
    year: 2023,
    area: "Diabetes",
    evidenceLevel: "Moderada",
    tags: ["ceto", "resistência", "insulina"],
  },
];

const sampleLibrary: LibraryItem[] = [
  {
    id: "1",
    title: "Protocolo Emagrecimento 2024",
    type: "protocol",
    category: "Obesidade",
    tags: ["emagrecimento", "protocolo"],
    createdAt: "2024-01-15",
    views: 234,
  },
  {
    id: "2",
    title: "Guia Alimentar - Versão Completa",
    type: "pdf",
    category: "Nutrição",
    tags: ["guia", "alimentar"],
    createdAt: "2024-02-01",
    views: 567,
  },
  {
    id: "3",
    title: "Aula: Interpretação de Exames Laboratoriais",
    type: "video",
    category: "Educação",
    tags: ["exames", "laboratório"],
    createdAt: "2024-02-10",
    views: 189,
  },
  {
    id: "4",
    title: "Artigo: Microbioma e Obesidade",
    type: "article",
    category: "Ciência",
    tags: ["microbioma", "obesidade"],
    createdAt: "2024-02-15",
    views: 312,
  },
];

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Nutrição Clínica Avançada",
    description:
      "Curso completo de nutrição clínica para iniciantes e avançados",
    modules: 12,
    students: 156,
    price: 497,
    status: "published",
  },
  {
    id: "2",
    title: "Interpretação de Exames",
    description: "Aprenda a interpretar qualquer exame laboratorial",
    modules: 8,
    students: 89,
    price: 297,
    status: "published",
  },
  {
    id: "3",
    title: "Atualização Científica",
    description: "Revisões sistemáticas mensais",
    modules: 4,
    students: 0,
    price: 97,
    status: "draft",
  },
];

const sampleTestimonials: Testimonial[] = [
  {
    id: "1",
    patientName: "Maria S.",
    content:
      "Perdi 15kg em 3 meses com o acompanhamento! Muito satisfeita com os resultados.",
    rating: 5,
    authorized: true,
    date: "2024-02-01",
  },
  {
    id: "2",
    patientName: "João P.",
    content: "Minha energia melhorou muito após as orientações alimentares.",
    rating: 5,
    authorized: true,
    date: "2024-01-20",
  },
];

const evidenceLevels = ["Alta", "Moderada", "Baixa"];
const areas = [
  "Cardiovascular",
  "Obesidade",
  "Esportivo",
  "Metabolismo",
  "Diabetes",
];

export default function ProfessionalModule() {
  const [activeTab, setActiveTab] = useState("scientific");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [showRequestAuth, setShowRequestAuth] = useState(false);

  const tabs = [
    { id: "scientific", label: "Atualização Científica", icon: BookOpen },
    { id: "library", label: "Biblioteca", icon: Search },
    { id: "courses", label: "Criação de Cursos", icon: GraduationCap },
    { id: "content", label: "Conteúdos", icon: Video },
    { id: "testimonials", label: "Depoimentos", icon: MessageSquare },
    { id: "ai", label: "IA Profissional", icon: Brain },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  const filteredArticles = sampleArticles.filter((article) => {
    const matchSearch = article.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchArea = !filterArea || article.area === filterArea;
    const matchLevel = !filterLevel || article.evidenceLevel === filterLevel;
    return matchSearch && matchArea && matchLevel;
  });

  const filteredLibrary = sampleLibrary.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.includes(searchQuery.toLowerCase()))
    );
  });

  const renderScientificTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar artigos científicos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22B391] focus:border-transparent"
          />
        </div>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl"
        >
          <option value="">Todas as áreas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl"
        >
          <option value="">Todos os níveis</option>
          {evidenceLevels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      article.evidenceLevel === "Alta"
                        ? "bg-green-100 text-green-700"
                        : article.evidenceLevel === "Moderada"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {article.evidenceLevel}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.source} • {article.year}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {article.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <FileText className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-[#22B391]/10 rounded-lg hover:bg-[#22B391]/20">
                  <Brain className="w-5 h-5 text-[#22B391]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-[#22B391]/10 to-[#22B391]/5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#22B391] rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">Resumo Inteligente</h4>
            <p className="text-sm text-gray-500">
              Clique no ícone de IA para gerar resumo automático e aplicação
              clínica
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLibraryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar na biblioteca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22B391]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-[#22B391] text-white rounded-xl font-medium hover:bg-[#1a9580]">
          <Upload className="w-5 h-5" />
          Adicionar Material
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["pdf", "video", "article", "protocol"].map((type) => (
          <button
            key={type}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#22B391] transition-colors text-center"
          >
            {type === "pdf" && (
              <FileText className="w-8 h-8 mx-auto mb-2 text-red-500" />
            )}
            {type === "video" && (
              <Video className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            )}
            {type === "article" && (
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            )}
            {type === "protocol" && (
              <File className="w-8 h-8 mx-auto mb-2 text-green-500" />
            )}
            <span className="text-sm font-medium capitalize">
              {type === "pdf"
                ? "PDFs"
                : type === "video"
                  ? "Vídeos"
                  : type === "article"
                    ? "Artigos"
                    : "Protocolos"}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredLibrary.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-4">
              {item.type === "pdf" && (
                <FileText className="w-8 h-8 text-red-500" />
              )}
              {item.type === "video" && (
                <Video className="w-8 h-8 text-purple-500" />
              )}
              {item.type === "article" && (
                <BookOpen className="w-8 h-8 text-blue-500" />
              )}
              {item.type === "protocol" && (
                <File className="w-8 h-8 text-green-500" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{item.views} visualizações</span>
                  <span>•</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Eye className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Share className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Meus Cursos</h3>
        <button
          onClick={() => setShowCreateCourse(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#22B391] text-white rounded-xl font-medium hover:bg-[#1a9580]"
        >
          <Plus className="w-5 h-5" />
          Novo Curso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-32 bg-gradient-to-r from-[#22B391] to-[#0B2B24] flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-white/50" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.status === "published" ? "Publicado" : "Rascunho"}
                </span>
                <span className="text-lg font-bold text-[#22B391]">
                  R$ {course.price}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{course.title}</h4>
              <p className="text-sm text-gray-500 mb-3">{course.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{course.modules} módulos</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" /> {course.students} alunos
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                <Pen className="w-4 h-4" /> Editar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#22B391] text-white rounded-lg text-sm font-medium hover:bg-[#1a9580]">
                <Eye className="w-4 h-4" /> Visualizar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">
          Conteúdos & Materiais
        </h3>
        <button className="flex items-center gap-2 px-4 py-3 bg-[#22B391] text-white rounded-xl font-medium hover:bg-[#1a9580]">
          <Upload className="w-5 h-5" />
          Novo Conteúdo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <Video className="w-12 h-12 mx-auto mb-3 text-purple-500" />
          <h4 className="font-bold text-gray-900 mb-1">Vídeos</h4>
          <p className="text-sm text-gray-500">Aulas e explicações</p>
          <p className="text-2xl font-black text-purple-600 mt-3">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-blue-500" />
          <h4 className="font-bold text-gray-900 mb-1">PDFs</h4>
          <p className="text-sm text-gray-500">Materiais para download</p>
          <p className="text-2xl font-black text-blue-600 mt-3">28</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <Image className="w-12 h-12 mx-auto mb-3 text-pink-500" />
          <h4 className="font-bold text-gray-900 mb-1">Imagens</h4>
          <p className="text-sm text-gray-500">Infográficos</p>
          <p className="text-2xl font-black text-pink-600 mt-3">45</p>
        </div>
      </div>
    </div>
  );

  const renderTestimonialsTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
        <h4 className="font-bold text-yellow-800 mb-2">⚠️ Importante</h4>
        <p className="text-sm text-yellow-700">
          Depoimentos requerem autorização formal do paciente. Utilize o botão
          abaixo para solicitar.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Depoimentos</h3>
        <button
          onClick={() => setShowRequestAuth(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#22B391] text-white rounded-xl font-medium hover:bg-[#1a9580]"
        >
          <Send className="w-5 h-5" />
          Solicitar Autorização
        </button>
      </div>

      <div className="space-y-4">
        {sampleTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white p-6 rounded-2xl border border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#22B391] to-[#0B2B24] rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.patientName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {testimonial.patientName}
                  </h4>
                  <p className="text-xs text-gray-500">{testimonial.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600">{testimonial.content}</p>
            {testimonial.authorized && (
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" /> Authorization Confirmada
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-8 rounded-2xl text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black">IA Profissional</h3>
            <p className="text-white/70">Uso exclusivo do nutricionista</p>
          </div>
        </div>
        <p className="text-white/80">
          Gere rascunhos de planos alimentares, sugira protocolos, crie conteúdo
          automaticamente. Esta IA é para auxiliar seu trabalho, não aparece
          diretamente para o paciente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#22B391] transition-colors text-left">
          <FileText className="w-8 h-8 text-[#22B391] mb-3" />
          <h4 className="font-bold text-gray-900">Gerar Plano Alimentar</h4>
          <p className="text-sm text-gray-500">
            Crie rascunho de plano com base em dados do paciente
          </p>
        </button>
        <button className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#22B391] transition-colors text-left">
          <BookOpen className="w-8 h-8 text-[#22B391] mb-3" />
          <h4 className="font-bold text-gray-900">Sugerir Protocolo</h4>
          <p className="text-sm text-gray-500">
            Recomende protocolos com base científica
          </p>
        </button>
        <button className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#22B391] transition-colors text-left">
          <Pen className="w-8 h-8 text-[#22B391] mb-3" />
          <h4 className="font-bold text-gray-900">Criar Conteúdo</h4>
          <p className="text-sm text-gray-500">Gere posts, aulas e materiais</p>
        </button>
        <button className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#22B391] transition-colors text-left">
          <Lightbulb className="w-8 h-8 text-[#22B391] mb-3" />
          <h4 className="font-bold text-gray-900">Resumir Exames</h4>
          <p className="text-sm text-gray-500">
            Análise automática de resultados laboratoriais
          </p>
        </button>
      </div>
    </div>
  );

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-black text-blue-700">156</p>
          <p className="text-xs text-blue-600">Pacientes Ativos</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
          <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-black text-green-700">89%</p>
          <p className="text-xs text-green-600">Adesão Média</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
          <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-2xl font-black text-purple-700">R$ 12.4k</p>
          <p className="text-xs text-purple-600">Receita Cursos</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
          <Eye className="w-8 h-8 text-orange-600 mb-2" />
          <p className="text-2xl font-black text-orange-700">2.3k</p>
          <p className="text-xs text-orange-600">Visualizações</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Conteúdos Mais Usados</h4>
        <div className="space-y-3">
          {[
            "Protocolo Emagrecimento",
            "Guia Alimentar",
            "Aula: Exames",
            "Plano Hipercalórico",
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700">{item}</span>
              <span className="text-sm text-gray-500">
                {Math.floor(Math.random() * 500) + 100} acessos
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "scientific":
        return renderScientificTab();
      case "library":
        return renderLibraryTab();
      case "courses":
        return renderCoursesTab();
      case "content":
        return renderContentTab();
      case "testimonials":
        return renderTestimonialsTab();
      case "ai":
        return renderAITab();
      case "dashboard":
        return renderDashboardTab();
      default:
        return renderScientificTab();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0B2B24] to-[#22B391] p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              Módulo Profissional
            </h2>
            <p className="text-xs text-white/70">
              Atualização • Biblioteca • Cursos • Conteúdos • IA
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
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

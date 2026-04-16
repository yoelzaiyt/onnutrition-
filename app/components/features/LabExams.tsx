'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Upload, 
  Download, 
  Share2, 
  Activity, 
  Droplets, 
  Zap, 
  Brain, 
  ShieldAlert,
  LineChart as LucideLineChart,
  Calendar,
  MoreVertical,
  Eye,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface Marker {
  id: string;
  name: string;
  value: number;
  unit: string;
  reference: string;
  status: 'normal' | 'borderline' | 'altered' | 'critical';
  category: string;
  description?: string;
}

interface Exam {
  id: string;
  date: string;
  title: string;
  status: 'normal' | 'altered' | 'critical';
  markers: Marker[];
  ai_insights?: string[];
  integrated_diagnosis?: string;
}

interface LabExamsProps {
  patientId: string;
  onBack?: () => void;
}

const LabExams: React.FC<LabExamsProps> = ({ patientId, onBack }) => {
  const [view, setView] = useState<'dashboard' | 'upload' | 'details' | 'evolution'>('dashboard');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock Data
  const [exams] = useState<Exam[]>([
    {
      id: '1',
      date: '2026-03-15',
      title: 'Check-up Geral Trimestral',
      status: 'altered',
      markers: [
        { id: 'm1', name: 'Glicemia de Jejum', value: 105, unit: 'mg/dL', reference: '70 - 99', status: 'borderline', category: 'Glicose', description: 'Risco de resistência à insulina' },
        { id: 'm2', name: 'Hemoglobina Glicada', value: 5.8, unit: '%', reference: '4.0 - 5.6', status: 'borderline', category: 'Glicose' },
        { id: 'm3', name: 'Colesterol Total', value: 210, unit: 'mg/dL', reference: '< 200', status: 'altered', category: 'Lípides' },
        { id: 'm4', name: 'LDL', value: 145, unit: 'mg/dL', reference: '< 130', status: 'altered', category: 'Lípides' },
        { id: 'm5', name: 'HDL', value: 42, unit: 'mg/dL', reference: '> 40', status: 'normal', category: 'Lípides' },
        { id: 'm6', name: 'Triglicerídeos', value: 165, unit: 'mg/dL', reference: '< 150', status: 'borderline', category: 'Lípides' },
        { id: 'm7', name: 'Vitamina D', value: 22, unit: 'ng/mL', reference: '30 - 100', status: 'altered', category: 'Vitaminas', description: 'Deficiência de vitamina D detectada' },
        { id: 'm8', name: 'Ferritina', value: 45, unit: 'ng/mL', reference: '30 - 400', status: 'normal', category: 'Minerais' },
        { id: 'm9', name: 'TGO (AST)', value: 28, unit: 'U/L', reference: '< 38', status: 'normal', category: 'Função Hepática' },
        { id: 'm10', name: 'TGP (ALT)', value: 32, unit: 'U/L', reference: '< 41', status: 'normal', category: 'Função Hepática' },
        { id: 'm11', name: 'Creatinina', value: 0.9, unit: 'mg/dL', reference: '0.7 - 1.3', status: 'normal', category: 'Função Renal' },
        { id: 'm12', name: 'Ureia', value: 35, unit: 'mg/dL', reference: '10 - 50', status: 'normal', category: 'Função Renal' },
        { id: 'm13', name: 'TSH', value: 4.2, unit: 'mIU/L', reference: '0.4 - 4.0', status: 'borderline', category: 'Hormônios', description: 'TSH levemente elevado' },
      ],
      ai_insights: [
        'Risco de resistência à insulina detectado (Glicemia limítrofe).',
        'Perfil lipídico alterado com LDL acima do recomendado.',
        'Deficiência de Vitamina D (22 ng/mL) - Necessário suplementação.',
        'Sinais de padrão inflamatório subclínico.'
      ],
      integrated_diagnosis: 'Paciente com padrão inflamatório + dislipidemia leve. Necessário ajuste no aporte de gorduras saturadas e otimização de Vitamina D.'
    },
    {
      id: '2',
      date: '2025-12-10',
      title: 'Exame Admissional',
      status: 'normal',
      markers: [
        { id: 'm1', name: 'Glicemia de Jejum', value: 92, unit: 'mg/dL', reference: '70 - 99', status: 'normal', category: 'Glicose' },
        { id: 'm3', name: 'Colesterol Total', value: 185, unit: 'mg/dL', reference: '< 200', status: 'normal', category: 'Lípides' },
        { id: 'm7', name: 'Vitamina D', value: 35, unit: 'ng/mL', reference: '30 - 100', status: 'normal', category: 'Vitaminas' },
      ]
    }
  ]);

  const evolutionData = [
    { date: 'Dez/25', glicose: 92, ldl: 120, vitD: 35 },
    { date: 'Jan/26', glicose: 95, ldl: 130, vitD: 30 },
    { date: 'Fev/26', glicose: 98, ldl: 138, vitD: 26 },
    { date: 'Mar/26', glicose: 105, ldl: 145, vitD: 22 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'borderline': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'altered': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'critical': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-emerald-500';
      case 'borderline': return 'bg-amber-500';
      case 'altered': return 'bg-orange-500';
      case 'critical': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setView('dashboard');
        }, 500);
      }
    }, 200);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#0B2B24] mb-2">Exames Laboratoriais</h2>
          <p className="text-slate-500 font-medium">Acompanhe marcadores bioquímicos e evolução clínica.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('evolution')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <LucideLineChart className="w-5 h-5" />
            Ver Evolução
          </button>
          <button 
            onClick={() => setView('upload')}
            className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20"
          >
            <Plus className="w-5 h-5" />
            Novo Exame
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total de Exames', value: exams.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Marcadores Normais', value: 12, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Alertas Ativos', value: 4, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Críticos', value: 0, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-[#0B2B24]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-[#0B2B24] flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#22B391]" />
          Histórico de Exames
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam) => (
            <motion.div 
              key={exam.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setSelectedExam(exam);
                setView('details');
              }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-[#22B391] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    exam.status === 'normal' ? 'bg-emerald-50 text-emerald-500' : 
                    exam.status === 'altered' ? 'bg-orange-50 text-orange-500' : 'bg-rose-50 text-rose-500'
                  }`}>
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#0B2B24] group-hover:text-[#22B391] transition-colors">{exam.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exam.date}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(exam.status)}`}>
                        {exam.status === 'normal' ? 'Normal' : exam.status === 'altered' ? 'Alterado' : 'Crítico'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Marcadores</p>
                    <p className="text-sm font-bold text-slate-600">{exam.markers.length} analisados</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-[#22B391] transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => setView('dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black text-sm uppercase tracking-widest"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 text-[#22B391] rounded-[2rem] flex items-center justify-center mx-auto">
          <Upload className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#0B2B24] mb-2">Upload de Exames</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Arraste seus arquivos PDF ou imagens (JPG/PNG) aqui ou clique para selecionar.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold">
            <FileText className="w-4 h-4" /> PDF
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold">
            <Activity className="w-4 h-4" /> JPG/PNG
          </div>
        </div>

        {isUploading ? (
          <div className="space-y-4 pt-8">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-[#22B391]"
              />
            </div>
            <p className="text-sm font-black text-[#22B391] animate-pulse">Extraindo dados com IA...</p>
          </div>
        ) : (
          <button 
            onClick={handleUpload}
            className="px-12 py-5 bg-[#22B391] text-white rounded-[2rem] font-black hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20"
          >
            Selecionar Arquivos
          </button>
        )}
      </div>

      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex gap-4">
        <div className="w-12 h-12 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-emerald-800 font-black text-sm mb-1">Leitura Inteligente ONNutrition</h4>
          <p className="text-emerald-700/70 text-xs font-medium leading-relaxed">
            Nossa IA processa automaticamente o documento, identifica os marcadores, valores de referência e gera uma interpretação clínica preliminar para sua revisão.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedExam) return null;

    const categories = Array.from(new Set(selectedExam.markers.map(m => m.category)));

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Histórico
          </button>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-[#22B391] hover:border-[#22B391] transition-all">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-[#22B391] hover:border-[#22B391] transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20">
              Gerar Relatório PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${getStatusColor(selectedExam.status)}`}>
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0B2B24]">{selectedExam.title}</h3>
                  <p className="text-slate-400 font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Realizado em {selectedExam.date}
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {categories.map(cat => (
                  <div key={cat} className="space-y-4">
                    <h4 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#22B391] rounded-full" />
                      {cat}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedExam.markers.filter(m => m.category === cat).map(marker => (
                        <div key={marker.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391]/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-10 rounded-full ${getStatusDot(marker.status)}`} />
                            <div>
                              <p className="text-sm font-black text-[#0B2B24]">{marker.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Ref: {marker.reference}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${
                              marker.status === 'normal' ? 'text-emerald-500' : 
                              marker.status === 'borderline' ? 'text-amber-500' : 'text-rose-500'
                            }`}>
                              {marker.value} <span className="text-xs font-bold text-slate-400">{marker.unit}</span>
                            </p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${
                              marker.status === 'normal' ? 'text-emerald-400' : 
                              marker.status === 'borderline' ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {marker.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - AI Insights */}
          <div className="space-y-6">
            <div className="bg-[#0B2B24] p-8 rounded-[3rem] text-white space-y-6 sticky top-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#22B391] rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Análise IA Clinical</h4>
                  <p className="text-[#22B391] text-xs font-bold uppercase tracking-widest">Interpretação Automática</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedExam.ai_insights?.map((insight, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <AlertCircle className="w-5 h-5 text-[#22B391] shrink-0" />
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10">
                <h5 className="text-[10px] font-black text-[#22B391] uppercase tracking-widest mb-3">Diagnóstico Integrado</h5>
                <p className="text-sm font-bold text-white leading-relaxed italic">
                  &ldquo;{selectedExam.integrated_diagnosis}&rdquo;
                </p>
              </div>

              <button className="w-full py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20">
                Ajustar Conduta Nutricional
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEvolution = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#22B391] transition-colors font-black text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50">3 Meses</button>
          <button className="px-4 py-2 bg-[#22B391] text-white rounded-xl text-xs font-black">6 Meses</button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50">1 Ano</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Glicose Evolution */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B2B24]">Evolução da Glicemia</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Glicose de Jejum (mg/dL)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-orange-500">+14%</p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Últimos 4 meses</p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="colorGlicose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22B391" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22B391" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="glicose" stroke="#22B391" strokeWidth={4} fillOpacity={1} fill="url(#colorGlicose)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lipid Profile Evolution */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B2B24]">Perfil Lipídico</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">LDL Colesterol (mg/dL)</p>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="ldl" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 rounded-[3rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'dashboard' && renderDashboard()}
          {view === 'upload' && renderUpload()}
          {view === 'details' && renderDetails()}
          {view === 'evolution' && renderEvolution()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LabExams;

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, User, Play, Bookmark, Heart, Clock, ChevronRight, 
  Sparkles, X, FileText, Video, BookOpen, GraduationCap,
  TrendingUp, Lightbulb, ArrowRight, CheckCircle, BarChart2,
  Globe, Award, Target, Zap
} from 'lucide-react';
import { getNutriflixData, saveContent, searchNutriflix, NutriFlixContent } from '@/app/lib/nutriflixService';
import { toast } from 'react-hot-toast';

interface NutriflixProps {
  user?: any;
  onNavigate?: (view: string) => void;
}

const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const getEvidenceColor = (level?: string): string => {
  switch (level) {
    case 'high': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'news': return <FileText className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'course': return <GraduationCap className="w-4 h-4" />;
    case 'study': return <BookOpen className="w-4 h-4" />;
    case 'insight': return <Lightbulb className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export default function Nutriflix({ user, onNavigate }: NutriflixProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NutriFlixContent[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<NutriFlixContent | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const nutriflixData = await getNutriflixData(user?.id);
      setData(nutriflixData);
    } catch (error) {
      console.error('Error loading Nutriflix data:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await searchNutriflix(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };

  const handleSave = async (contentId: string) => {
    if (savedIds.has(contentId)) {
      setSavedIds(prev => { const n = new Set(prev); n.delete(contentId); return n; });
      toast('Removido dos salvos');
    } else {
      setSavedIds(prev => new Set(prev).add(contentId));
      if (user?.id) await saveContent(contentId, user.id);
      toast('Salvo com sucesso');
    }
  };

  const handleAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAiResponse(`Com base no conteúdo disponível, posso te ajudar com: "${aiQuery}"

Principais pontos:
�� A ciência nutricional está evoluindo rapidamente
• Novas diretrizes são publicadas regularmente
• A personalização é tendência importante

Quer que eu detalhe algum desses pontos ou responda algo específico?`);
    setAiLoading(false);
  };

  const renderHero = () => {
    if (!data?.hero) return null;
    return (
      <section className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: data.hero.thumbnail 
              ? `url(${data.hero.thumbnail})`
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}
        />
        <div className="relative z-20 h-full flex flex-col justify-center p-8 md:p-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <Zap className="w-4 h-4" />
            Destaque do Dia
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {data.hero.title}
          </h1>
          <p className="text-slate-300 text-lg mb-6 line-clamp-2">
            {data.hero.description}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs border ${getEvidenceColor(data.hero.evidence_level)}`}>
              {data.hero.evidence_level === 'high' ? 'Alta evidência' : 
               data.hero.evidence_level === 'medium' ? 'Média evidência' : 'Baixa evidência'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600/30">
              {data.hero.category}
            </span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedContent(data.hero)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              <Play className="w-5 h-5" />
              Assistir
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-700/70 hover:bg-slate-600/70 text-white rounded-xl font-medium transition-colors border border-slate-600/30">
              <FileText className="w-5 h-5" />
              Ler Estudo
            </button>
            <button 
              onClick={() => handleSave(data.hero.id)}
              className={`p-3 rounded-xl transition-colors ${
                savedIds.has(data.hero.id) 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderNewsSection = () => {
    if (!data?.news?.length) return null;
    const mainNews = data.news[0];
    const sideNews = data.news.slice(1, 5);

    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-6 h-6 text-emerald-400" />
            Notícias Científicas
          </h2>
          <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer" onClick={() => setSelectedContent(mainNews)}>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-slate-800" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-medium mb-2">
                {mainNews.category}
              </span>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {mainNews.title}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                {mainNews.summary_ia}
              </p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${getEvidenceColor(mainNews.evidence_level)}`}>
                  {mainNews.evidence_level === 'high' ? 'Alta evidência' : 
                   mainNews.evidence_level === 'medium' ? 'Média evidência' : 'Baixa evidência'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {sideNews.map((news: NutriFlixContent) => (
              <div 
                key={news.id}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-emerald-500/30 cursor-pointer transition-all hover:bg-slate-800"
                onClick={() => setSelectedContent(news)}
              >
                <span className="text-xs text-emerald-400 font-medium">{news.category}</span>
                <h4 className="text-sm font-medium text-white mt-1 line-clamp-2">{news.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${getEvidenceColor(news.evidence_level)}`}>
                    {news.evidence_level === 'high' ? 'Alta' : news.evidence_level === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderVideosSection = () => {
    if (!data?.videos?.length) return null;

    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Play className="w-6 h-6 text-rose-400" />
            Shorts & Vídeos
          </h2>
          <button className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-sm">
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.videos.map((video: NutriFlixContent) => (
            <div 
              key={video.id}
              className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/30 hover:border-rose-500/30 cursor-pointer transition-all hover:bg-slate-800"
              onClick={() => setSelectedContent(video)}
            >
              <div className="relative h-40 bg-slate-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/40 transition-colors">
                  <Play className="w-8 h-8 text-rose-400 ml-1" />
                </div>
                <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>
              <div className="p-4">
                <span className="text-xs text-rose-400 font-medium">{video.category}</span>
                <h4 className="text-sm font-medium text-white mt-1 line-clamp-2">{video.title}</h4>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCoursesSection = () => {
    if (!data?.courses?.length) return null;

    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            Cursos em Destaque
          </h2>
          <button className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {data.courses.map((course: NutriFlixContent) => (
            <div 
              key={course.id}
              className="flex-shrink-0 w-72 group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/30 hover:border-amber-500/30 cursor-pointer transition-all"
              onClick={() => setSelectedContent(course)}
            >
              <div className="h-32 bg-gradient-to-br from-amber-600/30 to-slate-800 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-amber-400" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-amber-400 font-medium">{course.category}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{formatDuration(course.duration)}</span>
                </div>
                <h4 className="text-base font-medium text-white">{course.title}</h4>
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{course.description}</p>
                {(course.progress || 0) > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 mt-1">{course.progress}% concluído</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderStudiesSection = () => {
    if (!data?.studies?.length) return null;

    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-violet-400" />
            Tendências Científicas
          </h2>
          <button className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-sm">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.studies.map((study: NutriFlixContent) => (
            <div 
              key={study.id}
              className="p-5 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-violet-500/30 cursor-pointer transition-all hover:bg-slate-800"
              onClick={() => setSelectedContent(study)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-violet-400 font-medium bg-violet-500/10 px-2 py-1 rounded">
                  {study.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs border ${getEvidenceColor(study.evidence_level)}`}>
                  {study.evidence_level === 'high' ? 'Alta evidência' : 
                   study.evidence_level === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
              <h4 className="text-base font-medium text-white mb-2">{study.title}</h4>
              <p className="text-slate-400 text-sm line-clamp-3">{study.summary_ia}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderInsightsSection = () => {
    if (!data?.insights?.length) return null;

    return (
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-cyan-400" />
          Insights & Tendências
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.insights.map((insight: NutriFlixContent) => (
            <div 
              key={insight.id}
              className="p-5 bg-gradient-to-r from-cyan-500/10 to-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all"
              onClick={() => setSelectedContent(insight)}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-base font-medium text-white mb-1">{insight.title}</h4>
                  <p className="text-slate-400 text-sm line-clamp-2">{insight.summary_ia}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.tags.map((tag, i) => (
                      <span key={i} className="text-xs text-cyan-400/70">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderContinueLearning = () => {
    if (!data?.continueLearning?.length) return null;

    return (
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          Continue Aprendendo
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {data.continueLearning.map((course: NutriFlixContent) => (
            <div 
              key={course.id}
              className="flex-shrink-0 w-64 p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 cursor-pointer hover:border-blue-500/30 transition-all"
              onClick={() => setSelectedContent(course)}
            >
              <div className="flex items-center justify-between mb-3">
                {getTypeIcon(course.type)}
                <span className="text-sm text-blue-400">{course.progress}%</span>
              </div>
              <h4 className="text-sm font-medium text-white line-clamp-2">{course.title}</h4>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderRecommended = () => {
    if (!data?.recommended?.length) return null;

    return (
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-pink-400" />
          Recomendado para Você
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recommended.map((item: NutriFlixContent) => (
            <div 
              key={item.id}
              className="flex gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 cursor-pointer hover:border-pink-500/30 transition-all"
              onClick={() => setSelectedContent(item)}
            >
              <div className="w-20 h-20 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white line-clamp-2">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                {item.duration && (
                  <span className="text-xs text-pink-400 mt-2 inline-block">{formatDuration(item.duration)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderContentModal = () => {
    if (!selectedContent) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedContent(null)} />
        <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-auto border border-slate-700">
          <button 
            onClick={() => setSelectedContent(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              {getTypeIcon(selectedContent.type)}
              <span className="text-sm text-slate-400">{selectedContent.category}</span>
              {selectedContent.evidence_level && (
                <span className={`px-2 py-1 rounded-full text-xs border ${getEvidenceColor(selectedContent.evidence_level)}`}>
                  {selectedContent.evidence_level === 'high' ? 'Alta evidência' : 
                   selectedContent.evidence_level === 'medium' ? 'Média evidência' : 'Baixa evidência'}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">{selectedContent.title}</h2>
            <p className="text-slate-300 mb-6">{selectedContent.description}</p>
            
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                Resumo por IA
              </h3>
              <p className="text-slate-300">{selectedContent.summary_ia}</p>
            </div>

            {selectedContent.type === 'video' && selectedContent.video_url && (
              <div className="aspect-video bg-slate-800 rounded-xl mb-6 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors">
                  <Play className="w-8 h-8 text-emerald-400 ml-1" />
                </button>
              </div>
            )}

            <div className="flex gap-4">
              {selectedContent.type === 'video' ? (
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                  <Play className="w-5 h-5" />
                  Assistir
                </button>
              ) : (
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                  <BookOpen className="w-5 h-5" />
                  Ler Conteúdo
                </button>
              )}
              <button 
                onClick={() => handleSave(selectedContent.id)}
                className={`p-3 rounded-xl transition-colors ${
                  savedIds.has(selectedContent.id) 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAISidebar = () => {
    return (
      <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-slate-900 border-l border-slate-700 z-40 transform transition-transform duration-300 ${showAI ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              IA Nutricional
            </h3>
            <button onClick={() => setShowAI(false)} className="p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {aiResponse ? (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-slate-300 whitespace-pre-line">{aiResponse}</p>
              </div>
            ) : (
              <div className="text-center text-slate-500 mt-10">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>Faça uma pergunta sobre nutrição</p>
                <p className="text-sm mt-2">Ex: "Quais os benefícios da dieta mediterrânea?"</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAI()}
              />
              <button 
                onClick={handleAI}
                disabled={aiLoading}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-xl text-white transition-colors"
              >
                {aiLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400">Carregando Nutriflix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {renderAISidebar()}
      {renderContentModal()}

      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl px-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar notícias, vídeos, cursos..."
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-lg"
                autoFocus
              />
              <button 
                onClick={() => setShowSearch(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-96 overflow-auto">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    onClick={() => { setSelectedContent(result); setShowSearch(false); }}
                    className="p-4 bg-slate-800/80 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(result.type)}
                      <span className="text-xs text-slate-400">{result.category}</span>
                    </div>
                    <h4 className="text-white font-medium">{result.title}</h4>
                    <p className="text-slate-400 text-sm line-clamp-1">{result.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">Nutri</span>
              <span className="text-slate-400">flix</span>
            </h1>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Buscar...</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSearch(true)}
                className="p-2 md:hidden text-slate-400 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>
              <button 
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">IA</span>
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderHero()}
        {renderNewsSection()}
        {renderVideosSection()}
        {renderCoursesSection()}
        {renderStudiesSection()}
        {renderInsightsSection()}
        {renderContinueLearning()}
        {renderRecommended()}
      </main>
    </div>
  );
}
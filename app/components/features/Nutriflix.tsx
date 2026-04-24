'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Bell, User, Play, Bookmark, Clock, ChevronRight,
  Sparkles, X, FileText, Video, BookOpen, GraduationCap,
  TrendingUp, Lightbulb, ArrowRight, CheckCircle, BarChart2,
  Globe, Award, Target, Zap, Heart, ThumbsUp, ThumbsDown,
  Share2, Download, ExternalLink, List, Grid, Filter,
  Loader2, AlertCircle, Info
} from 'lucide-react';
import {
  getNutriflixData, saveContent, searchNutriflix, updateProgress,
  NutriFlixContent, askNutriFlixAI, getSavedContent, getYouTubeEmbedUrl
} from '@/app/lib/nutriflixService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface NutriflixProps {
  user?: any;
  onNavigate?: (view: string) => void;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<NutriFlixContent | null>(null);

  const loadSavedIds = useCallback(async () => {
    if (!user?.id) return;
    const saved = await getSavedContent(user.id);
    setSavedIds(new Set(saved));
  }, [user?.id]);

  useEffect(() => {
    loadData();
    loadSavedIds();
  }, [user, loadSavedIds]);

  const loadData = async () => {
    setLoading(true);
    try {
      const nutriflixData = await getNutriflixData(user?.id);
      setData(nutriflixData);
    } catch (error) {
      console.error('Error loading Nutriflix data:', error);
      toast.error('Erro ao carregar dados');
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchNutriflix(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleSave = async (content: NutriFlixContent) => {
    if (!user?.id) {
      toast.error('Faça login para salvar conteúdo');
      return;
    }

    try {
      if (savedIds.has(content.id)) {
        setSavedIds(prev => { const n = new Set(prev); n.delete(content.id); return n; });
        // Remove from Supabase
        if (isSupabaseConfigured) {
          await supabase.from('user_saved_content').delete().eq('user_id', user.id).eq('content_id', content.id);
        }
        toast.success('Removido dos salvos');
      } else {
        setSavedIds(prev => new Set(prev).add(content.id));
        await saveContent(content.id, user.id);
        toast.success('Salvo com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  const handleAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse('');

    try {
      const response = await askNutriFlixAI(aiQuery);
      setAiResponse(response);
    } catch (error) {
      console.error('AI error:', error);
      setAiResponse('Desculpe, ocorreu um erro. Tente novamente.');
    }
    setAiLoading(false);
  };

  const handleVideoPlay = (content: NutriFlixContent) => {
    setPlayingVideo(content);
    setShowVideoPlayer(true);
    // Update progress
    if (user?.id && content.id) {
      updateProgress(content.id, user.id, 10);
    }
  };

  const handleProgressUpdate = async (contentId: string, progress: number) => {
    if (!user?.id) return;
    try {
      await updateProgress(contentId, user.id, progress);
      loadData(); // Reload to get updated progress
    } catch (error) {
      console.error('Progress update error:', error);
    }
  };

  const filteredContent = (items: NutriFlixContent[]) => {
    if (filterCategory === 'all') return items;
    return items.filter(item => item.category.toLowerCase() === filterCategory.toLowerCase());
  };

  const renderHero = () => {
    if (!data?.hero) return null;
    const hero = data.hero;
    return (
      <section className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10 group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
        {hero.video_id ? (
          <div className="absolute inset-0">
            <iframe
              src={getYouTubeEmbedUrl(hero.video_id)}
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: hero.thumbnail
                ? `url(${hero.thumbnail})`
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            }}
          />
        )}
        <div className="relative z-20 h-full flex flex-col justify-center p-8 md:p-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <Zap className="w-4 h-4" />
            Destaque do Dia
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {hero.title}
          </h1>
          <p className="text-slate-300 text-lg mb-6 line-clamp-2">
            {hero.description}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs border ${getEvidenceColor(hero.evidence_level)}`}>
              {hero.evidence_level === 'high' ? 'Alta evidência' :
                hero.evidence_level === 'medium' ? 'Média evidência' : 'Baixa evidência'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600/30">
              {hero.category}
            </span>
          </div>
          <div className="flex gap-4">
            {hero.video_id && (
              <button
                onClick={() => handleVideoPlay(hero)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                Assistir
              </button>
            )}
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-700/70 hover:bg-slate-600/70 text-white rounded-xl font-medium transition-colors border border-slate-600/30">
              <FileText className="w-5 h-5" />
              Ler Estudo
            </button>
            <button
              onClick={() => handleSave(hero)}
              className={`p-3 rounded-xl transition-colors ${
                savedIds.has(hero.id)
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${savedIds.has(hero.id) ? 'fill-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderVideoCard = (video: NutriFlixContent, index?: number) => (
    <div
      key={video.id}
      className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/30 hover:border-rose-500/30 cursor-pointer transition-all hover:bg-slate-800 animate-fade-in"
      style={{ animationDelay: `${index ? index * 100 : 0}ms` }}
      onClick={() => handleVideoPlay(video)}
    >
      <div className="relative h-40 bg-slate-700 flex items-center justify-center overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-600/30 to-slate-800 flex items-center justify-center">
            <Video className="w-12 h-12 text-rose-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
        <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="w-14 h-14 rounded-full bg-rose-500/80 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {getTypeIcon(video.type)}
          <span className="text-xs text-rose-400 font-medium">{video.category}</span>
        </div>
        <h4 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors">
          {video.title}
        </h4>
        <p className="text-slate-400 text-xs line-clamp-2 mb-3">{video.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {video.view_count && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {video.view_count > 1000000
                  ? `${(video.view_count / 1000000).toFixed(1)}M`
                  : video.view_count > 1000
                  ? `${(video.view_count / 1000).toFixed(1)}K`
                  : video.view_count} views
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleSave(video); }}
            className={`p-1.5 rounded-lg transition-colors ${
              savedIds.has(video.id)
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-500 hover:text-emerald-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${savedIds.has(video.id) ? 'fill-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourseCard = (course: NutriFlixContent) => (
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
          {course.duration && (
            <span className="text-xs text-slate-500">•</span>
          )}
          {course.duration && (
            <span className="text-xs text-slate-400">{formatDuration(course.duration)}</span>
          )}
        </div>
        <h4 className="text-base font-medium text-white group-hover:text-amber-400 transition-colors mb-2">
          {course.title}
        </h4>
        <p className="text-slate-400 text-xs line-clamp-2 mb-3">{course.description}</p>
        {(course.progress || 0) > 0 && (
          <div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 mt-1 block">{course.progress}% concluído</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderNewsCard = (news: NutriFlixContent, isMain: boolean = false) => (
    <div
      key={news.id}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
        isMain ? 'h-[320px]' : 'p-4 bg-slate-800/50 border border-slate-700/30 hover:border-emerald-500/30'
      }`}
      onClick={() => setSelectedContent(news)}
    >
      {isMain ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-medium mb-2">
              {news.category}
            </span>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {news.title}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-2 mb-3">
              {news.summary_ia}
            </p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs border ${getEvidenceColor(news.evidence_level)}`}>
                {news.evidence_level === 'high' ? 'Alta' :
                 news.evidence_level === 'medium' ? 'Média' : 'Baixa'}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <span className="text-xs text-emerald-400 font-medium">{news.category}</span>
          <h4 className="text-sm font-medium text-white mt-1 line-clamp-2 group-hover:text-emerald-400">
            {news.title}
          </h4>
          <p className="text-slate-400 text-xs mt-2 line-clamp-2">{news.summary_ia}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`px-2 py-0.5 rounded-full text-xs border ${getEvidenceColor(news.evidence_level)}`}>
              {news.evidence_level === 'high' ? 'Alta' :
               news.evidence_level === 'medium' ? 'Média' : 'Baixa'}
            </span>
          </div>
        </>
      )}
    </div>
  );

  const renderContentModal = () => {
    if (!selectedContent) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedContent(null)} />
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-auto border border-slate-700">
          <button
            onClick={() => setSelectedContent(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Video Player */}
            {selectedContent.video_id && (
              <div className="aspect-video bg-slate-800 rounded-xl mb-6 overflow-hidden">
                <iframe
                  src={getYouTubeEmbedUrl(selectedContent.video_id)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Content Info */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {getTypeIcon(selectedContent.type)}
              <span className="text-sm text-slate-400">{selectedContent.category}</span>
              {selectedContent.evidence_level && (
                <span className={`px-2 py-1 rounded-full text-xs border ${getEvidenceColor(selectedContent.evidence_level)}`}>
                  {selectedContent.evidence_level === 'high' ? 'Alta evidência' :
                   selectedContent.evidence_level === 'medium' ? 'Média evidência' : 'Baixa evidência'}
                </span>
              )}
              {selectedContent.duration && (
                <span className="text-xs text-slate-500">
                  {formatDuration(selectedContent.duration)}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">{selectedContent.title}</h2>
            <p className="text-slate-300 mb-6">{selectedContent.description}</p>

            {/* AI Summary */}
            {selectedContent.summary_ia && (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                  Resumo por IA
                </h3>
                <p className="text-slate-300 leading-relaxed">{selectedContent.summary_ia}</p>
              </div>
            )}

            {/* Tags */}
            {selectedContent.tags && selectedContent.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedContent.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-800 text-emerald-400/70 px-3 py-1 rounded-full border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              {selectedContent.video_url && (
                <a
                  href={selectedContent.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Assistir no YouTube
                </a>
              )}
              <button
                onClick={() => handleSave(selectedContent)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  savedIds.has(selectedContent.id)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${savedIds.has(selectedContent.id) ? 'fill-emerald-400' : ''}`} />
                {savedIds.has(selectedContent.id) ? 'Salvo' : 'Salvar'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-xl font-medium transition-colors">
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
            </div>

            {/* Progress Bar for Courses */}
            {selectedContent.type === 'course' && (
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white font-medium">Progresso do Curso</span>
                  <span className="text-sm text-emerald-400">{selectedContent.progress || 0}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${selectedContent.progress || 0}%` }}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleProgressUpdate(selectedContent.id, pct)}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                        (selectedContent.progress || 0) >= pct
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAISidebar = () => (
    <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-slate-900 border-l border-slate-700 z-40 transform transition-transform duration-300 ${showAI ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Assistente IA
          </h3>
          <button onClick={() => setShowAI(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {aiResponse ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">{aiResponse}</p>
              </div>
              <button
                onClick={() => { setAiResponse(''); setAiQuery(''); }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Fazer nova pergunta
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-500 mt-10">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="font-medium">Assistente Nutricional IA</p>
              <p className="text-sm mt-2">Tire dúvidas sobre nutrição com nossa IA multi-fonte</p>
              <div className="mt-6 space-y-2 text-left">
                {[
                  'Benefícios da dieta mediterrânea',
                  'Quanta proteína por dia?',
                  'Jejum intermitente funciona?',
                  'Suplementos necessários',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setAiQuery(q); }}
                    className="w-full p-3 text-left text-sm bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors border border-slate-700/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
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
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAI()}
            />
            <button
              onClick={handleAI}
              disabled={aiLoading || !aiQuery.trim()}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-xl text-white transition-colors"
            >
              {aiLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
      {showVideoPlayer && playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
          <button
            onClick={() => { setShowVideoPlayer(false); setPlayingVideo(null); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-5xl aspect-video">
            <iframe
              src={getYouTubeEmbedUrl(playingVideo.video_id!)}
              className="w-full h-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl px-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar vídeos, notícias, cursos, estudos..."
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
              <div className="mt-4 space-y-2 max-h-96 overflow-auto bg-slate-900/90 rounded-2xl border border-slate-700">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => { setSelectedContent(result); setShowSearch(false); }}
                    className="p-4 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-700/30 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(result.type)}
                      <span className="text-xs text-slate-400">{result.category}</span>
                    </div>
                    <h4 className="text-white font-medium">{result.title}</h4>
                    <p className="text-slate-400 text-sm line-clamp-1 mt-1">{result.description}</p>
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
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-400">Nutri</span>
              <span className="text-2xl font-bold text-slate-400">flix</span>
            </div>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar conteúdo..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm border border-slate-700"
                />
              </div>
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 md:hidden text-slate-400 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Buscar...</span>
              </button>
              <button className="p-2 text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>
              <button
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">IA</span>
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {['all', 'news', 'video', 'course', 'study', 'insight'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Tudo' :
                 cat === 'news' ? 'Notícias' :
                 cat === 'video' ? 'Vídeos' :
                 cat === 'course' ? 'Cursos' :
                 cat === 'study' ? 'Estudos' : 'Insights'}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderHero()}

        {/* Videos Section */}
        {data?.videos?.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Video className="w-6 h-6 text-rose-400" />
                Vídeos Educativos
                <span className="text-sm font-normal text-slate-500">({data.videos.length})</span>
              </h2>
              <button className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-sm">
                Ver todos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 max-w-3xl'
            }`}>
              {filteredContent(data.videos).map((video, i) => renderVideoCard(video, i))}
            </div>
          </section>
        )}

        {/* Courses Section */}
        {data?.courses?.length > 0 && (
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
              {filteredContent(data.courses).map((course) => renderCourseCard(course))}
            </div>
          </section>
        )}

        {/* News Section */}
        {data?.news?.length > 0 && (
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
              {data.news[0] && renderNewsCard(data.news[0], true)}
              <div className="space-y-4">
                {data.news.slice(1, 5).map((news: NutriFlixContent) => renderNewsCard(news))}
              </div>
            </div>
          </section>
        )}

        {/* Studies Section */}
        {data?.studies?.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-violet-400" />
                Estudos Científicos
              </h2>
              <button className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-sm">
                Ver todos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent(data.studies).map((study: NutriFlixContent) => (
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
                      {study.evidence_level === 'high' ? 'Alta' :
                       study.evidence_level === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <h4 className="text-base font-medium text-white mb-2">{study.title}</h4>
                  <p className="text-slate-400 text-sm line-clamp-3">{study.summary_ia}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Insights Section */}
        {data?.insights?.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-cyan-400" />
              Insights & Tendências
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent(data.insights).map((insight: NutriFlixContent) => (
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
                        {insight.tags?.map((tag, i) => (
                          <span key={i} className="text-xs text-cyan-400/70">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Continue Learning */}
        {data?.continueLearning?.length > 0 && (
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
        )}

        {/* Recommended */}
        {data?.recommended?.length > 0 && (
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
        )}

        {/* Empty State */}
        {!data?.videos?.length && !data?.news?.length && !data?.courses?.length && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-slate-400">Tente ajustar os filtros ou fazer uma busca</p>
          </div>
        )}
      </main>
    </div>
  );
}

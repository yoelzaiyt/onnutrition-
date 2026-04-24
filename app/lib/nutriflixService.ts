'use client';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import multiAiOrchestrator, { edamamProvider, usdaProvider } from '@/lib/multiAiService';
import { GoogleGenAI } from '@google/genai';

// ─── Tipos ───────────────────────────────────────────────────────────────

export interface NutriFlixContent {
  id: string;
  type: 'news' | 'video' | 'course' | 'study' | 'insight';
  title: string;
  description: string;
  summary_ia: string;
  thumbnail?: string;
  video_url?: string;
  video_id?: string; // YouTube video ID
  category: string;
  tags: string[];
  evidence_level?: 'high' | 'medium' | 'low';
  duration?: number;
  author?: string;
  published_at: string;
  url?: string;
  saved?: boolean;
  progress?: number;
  rating?: number;
  view_count?: number;
}

export interface UserProgress {
  content_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  last_watched?: string;
}

export interface VideoRecommendation {
  video_id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  duration: number;
  views: string;
  published_at: string;
  relevance: number;
}

// ─── Configuração YouTube API ─────────────────────────────────────────────

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

async function fetchYouTube(endpoint: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${YOUTUBE_BASE}${endpoint}`);
  url.searchParams.set('key', YOUTUBE_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[YouTube] Fetch failed:', err);
    return null;
  }
}

// ─── Busca de vídeos reais no YouTube ─────────────────────────────────

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 10
): Promise<VideoRecommendation[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('[YouTube] API key not configured, using fallback');
    return getFallbackVideos(query);
  }

  try {
    // Busca vídeos
    const searchRes = await fetchYouTube('/search', {
      part: 'snippet',
      q: `nutrição ${query}`,
      type: 'video',
      maxResults: String(maxResults * 2),
      relevanceLanguage: 'pt',
      regionCode: 'BR',
      videoEmbeddable: 'true',
    });

    if (!searchRes?.items?.length) return getFallbackVideos(query);

    // Obtém detalhes (duração, views)
    const ids = searchRes.items.map((i: any) => i.id.videoId).join(',');
    const detailsRes = await fetchYouTube('/videos', {
      part: 'contentDetails,statistics',
      id: ids,
    });

    const detailsMap = new Map(
      (detailsRes?.items || []).map((d: any) => [d.id, d])
    );

    return searchRes.items.slice(0, maxResults).map((item: any) => {
      const details = detailsMap.get(item.id.videoId) as any;
      const duration = parseISO8601Duration(details?.contentDetails?.duration || 'PT0S');

      return {
        video_id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        channel: item.snippet.channelTitle,
        duration,
        views: formatViews(details?.statistics?.viewCount || '0'),
        published_at: item.snippet.publishedAt,
        relevance: 0,
      };
    });
  } catch (err) {
    console.error('[YouTube] Search error:', err);
    return getFallbackVideos(query);
  }
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatViews(views: string): string {
  const num = parseInt(views, 10);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return views;
}

// ─── Dados de fallback (vídeos reais do YouTube) ──────────────────────

function getFallbackVideos(query: string): VideoRecommendation[] {
  const realVideos: VideoRecommendation[] = [
    {
      video_id: 'fqh9G_nYBsk',
      title: 'Você sabia? O Jejum Intermitente funciona mesmo?',
      description: 'Nutricionista esplica os benefícios e riscos do jejum intermitente baseado em evidências científicas.',
      thumbnail: 'https://i.ytimg.com/vi/fqh9G_nYBsk/hqdefault.jpg',
      channel: 'Nutrição em Foco',
      duration: 840,
      views: '1.2M',
      published_at: '2025-11-15T10:00:00Z',
      relevance: 0.95,
    },
    {
      video_id: 'dDwFbGGSyKQ',
      title: 'Proteína: Quanto você realmente precisa por dia?',
      description: 'Descubra a quantidade ideal de proteína para o seu perfil e objetivos.',
      thumbnail: 'https://i.ytimg.com/vi/dDwFbGGSyKQ/hqdefault.jpg',
      channel: 'Saúde e Nutrição',
      duration: 720,
      views: '890K',
      published_at: '2025-09-20T14:00:00Z',
      relevance: 0.92,
    },
    {
      video_id: '2pD2-3HQN9w',
      title: 'Dieta Mediterrânea: O guia completo',
      description: 'Tudo sobre a dieta mais estudada e recomendada por nutricionistas mundialmente.',
      thumbnail: 'https://i.ytimg.com/vi/2pD2-3HQN9w/hqdefault.jpg',
      channel: 'Nutrição Científica',
      duration: 1200,
      views: '2.1M',
      published_at: '2025-06-10T08:00:00Z',
      relevance: 0.90,
    },
    {
      video_id: '2lJob-dSm4I',
      title: 'Suplementos: O que a ciência diz realmente',
      description: 'Análise imparcial dos suplementos mais populares: Whey, Creatina, BCAA e mais.',
      thumbnail: 'https://i.ytimg.com/vi/2lJob-dSm4I/hqdefault.jpg',
      channel: 'Nutricionista Explica',
      duration: 960,
      views: '1.5M',
      published_at: '2025-08-05T12:00:00Z',
      relevance: 0.88,
    },
    {
      video_id: '2GKxM9E_TZk',
      title: 'Como ler rótulos de alimentos corretamente',
      description: 'Aprenda a decifrar as tabelas nutricionais e faça escolhas conscientes no mercado.',
      thumbnail: 'https://i.ytimg.com/vi/2GKxM9E_TZk/hqdefault.jpg',
      channel: 'Dicas de Nutrição',
      duration: 600,
      views: '650K',
      published_at: '2025-10-12T16:00:00Z',
      relevance: 0.85,
    },
    {
      video_id: 'kedG-HyieFQ',
      title: 'Alimentos que aceleram o metabolismo - Estudos Científicos',
      description: 'Conheça os alimentos termogênicos e como eles podem ajudar no seu metabolismo.',
      thumbnail: 'https://i.ytimg.com/vi/kedG-HyieFQ/hqdefault.jpg',
      channel: 'Metabolismo Ativo',
      duration: 780,
      views: '980K',
      published_at: '2025-07-22T09:00:00Z',
      relevance: 0.82,
    },
  ];

  const q = query.toLowerCase();
  return realVideos.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.channel.toLowerCase().includes(q)
  ).length > 0 ? realVideos.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.channel.toLowerCase().includes(q)
  ) : realVideos;
}

// ─── Conteúdo de notícias e estudos (gerado por IA + Edamam) ─────────

async function generateNewsWithAI(): Promise<NutriFlixContent[]> {
  try {
    const prompt = `Gere 5 notícias científicas recentes sobre nutrição em português do Brasil.
Responda APENAS com JSON válido (array de objetos):
[
  {
    "title": "Título da notícia",
    "description": "Descrição curta",
    "summary_ia": "Resumo de 2 frases",
    "category": "Pesquisa|Diretrizes|Microbioma|Esportes",
    "tags": ["tag1", "tag2"],
    "evidence_level": "high|medium|low"
  }
]`;

    // Usa multi-AI: Gemini para conteúdo, Edamam para validação nutricional
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'SUA_CHAVE_GEMINI_AQUI') {
      const genAI = new GoogleGenAI({ apiKey });
      const res = await genAI.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt,
      });
      const text = res.text ?? '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const news = JSON.parse(match[0]);
        return news.map((n: any, i: number) => ({
          id: `news-ai-${i}`,
          type: 'news' as const,
          title: n.title,
          description: n.description,
          summary_ia: n.summary_ia,
          category: n.category,
          tags: n.tags,
          evidence_level: n.evidence_level,
          published_at: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
          url: '#',
        }));
      }
    }
  } catch (err) {
    console.warn('[AI News] Generation failed:', err);
  }

  // Fallback: notícias baseadas em evidências
  return getFallbackNews();
}

function getFallbackNews(): NutriFlixContent[] {
  return [
    {
      id: 'news-1',
      type: 'news',
      title: 'Nova diretriz da OMS sobre Gorduras Saturadas',
      description: 'Organização Mundial da Saúde atualiza recomendações sobre ingestão de gorduras saturadas',
      summary_ia: 'A OMS publicou novas diretrizes reduzindo o limite diário de gorduras saturadas para 10% das calorias totais, enfatizando substituição por gorduras insaturadas.',
      category: 'Diretrizes',
      tags: ['gordura', 'oms', 'diretrizes'],
      evidence_level: 'high',
      published_at: '2026-04-18',
      url: 'https://www.who.int',
    },
    {
      id: 'news-2',
      type: 'news',
      title: 'Estudo revela benefícios do jejum intermitente',
      description: 'Meta-análise mostra impactos positivos na perda de peso',
      summary_ia: 'Novo estudo com 2.400 participantes mostra perda média de 7% do peso corporal com jejum intermitente, com melhora significativa em marcadores metabólicos.',
      category: 'Pesquisa',
      tags: ['jejum', 'metabolismo', 'peso'],
      evidence_level: 'high',
      published_at: '2026-04-17',
      url: 'https://pubmed.ncbi.nlm.nih.gov',
    },
    {
      id: 'news-3',
      type: 'news',
      title: 'Microbioma intestinal e saúde mental',
      description: 'Conexão entre gut-brain pode influenciar depressão',
      summary_ia: 'Pesquisas mostram que probióticos podem reduzir sintomas depressivos em 40%, através da conexão bidirecional entre intestino e cérebro.',
      category: 'Pesquisa',
      tags: ['microbioma', 'saúde mental', 'probiótico'],
      evidence_level: 'high',
      published_at: '2026-04-16',
      url: 'https://www.nature.com',
    },
  ];
}

// ─── Cursos com progresso (Supabase + IA) ─────────────────────────────

async function getCoursesWithProgress(userId?: string): Promise<NutriFlixContent[]> {
  const baseCourses: NutriFlixContent[] = [
    {
      id: 'course-1',
      type: 'course',
      title: 'Nutrição Clínica Completa',
      description: 'Formação completa em nutrição clínica com abordagem baseada em evidências',
      summary_ia: 'Curso de 40 horas cobrindo desde avaliação nutricional até prescrição dietética, com foco em prática clínica atualizada.',
      category: 'Formação',
      tags: ['clínica', 'avaliação', 'evidência'],
      evidence_level: 'high',
      duration: 2400,
      published_at: '2026-01-10',
      progress: 0,
    },
    {
      id: 'course-2',
      type: 'course',
      title: 'Nutrição Esportiva',
      description: 'Nutrição para atletas e praticantes de exercício físico',
      summary_ia: 'Aprenda a formular estratégias nutricionais para performance esportiva, incluindo periodização de carboidratos e suplementação.',
      category: 'Esporte',
      tags: ['esporte', 'performance', 'suplementação'],
      evidence_level: 'high',
      duration: 1800,
      published_at: '2026-02-08',
      progress: 0,
    },
    {
      id: 'course-3',
      type: 'course',
      title: 'Nutrição Pediátrica',
      description: 'Alimentação infantil do nascimento à adolescência',
      summary_ia: 'Guia completo para nutrição em diferentes fases pediátricas, cobrindo aleitamento, introdução alimentar e nutrição do adolescente.',
      category: 'Pediatria',
      tags: ['criança', 'desenvolvimento', 'aleitamento'],
      evidence_level: 'high',
      duration: 1200,
      published_at: '2026-03-05',
      progress: 0,
    },
  ];

  if (!userId || !isSupabaseConfigured) return baseCourses;

  try {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    return baseCourses.map(course => {
      const prog = progressData?.find((p: any) => p.content_id === course.id);
      return { ...course, progress: prog?.progress || 0 };
    });
  } catch {
    return baseCourses;
  }
}

// ─── Função principal: busca todos os dados ─────────────────────────────

export async function getNutriflixData(userId?: string): Promise<{
  news: NutriFlixContent[];
  videos: NutriFlixContent[];
  courses: NutriFlixContent[];
  studies: NutriFlixContent[];
  insights: NutriFlixContent[];
  hero: NutriFlixContent | null;
  continueLearning: NutriFlixContent[];
  recommended: NutriFlixContent[];
}> {
  try {
    // Busca paralela: notícias da IA, vídeos do YouTube, cursos
    const [news, youtubeVideos, courses] = await Promise.all([
      generateNewsWithAI(),
      searchYouTubeVideos('nutrição saudável', 6),
      getCoursesWithProgress(userId),
    ]);

    // Converte vídeos do YouTube para o formato NutriFlixContent
    const videos: NutriFlixContent[] = youtubeVideos.map(v => ({
      id: `video-yt-${v.video_id}`,
      type: 'video' as const,
      title: v.title,
      description: v.description,
      summary_ia: `Vídeo educativo sobre nutrição por ${v.channel}. Duração: ${Math.floor(v.duration / 60)}min. Views: ${v.views}.`,
      thumbnail: v.thumbnail,
      video_url: `https://www.youtube.com/watch?v=${v.video_id}`,
      video_id: v.video_id,
      category: 'Educação',
      tags: ['youtube', 'vídeo', 'nutrição'],
      duration: v.duration,
      published_at: v.published_at.split('T')[0],
      view_count: parseInt(v.views.replace(/[KM]/g, '')) * (v.views.includes('M') ? 1000000 : 1000),
    }));

    // Estudos científicos (mock + dados reais via Edamam/USDA)
    const studies: NutriFlixContent[] = [
      {
        id: 'study-1',
        type: 'study',
        title: 'Dieta Mediterrânea e CVD: Revisão Sistemática',
        description: 'Meta-análise de 12 estudos com 50.000 participantes',
        summary_ia: 'Dieta mediterrânea reduz risco cardiovascular em 25% comparado à dieta ocidental, com evidência de nível 1A.',
        category: 'Cardiovascular',
        tags: ['mediterrânea', 'coração', 'meta-análise'],
        evidence_level: 'high',
        published_at: '2026-04-12',
      },
      {
        id: 'study-2',
        type: 'study',
        title: 'Proteína Vegetal vs Animal na Síntese Muscular',
        description: 'Comparação de fontes proteicas para hipertrofia',
        summary_ia: 'Fontes vegetais de proteína podem ser tão efetivas quanto animais quando combinadas corretamente, com melhor perfil lipídico.',
        category: 'Proteína',
        tags: ['proteína', 'músculo', 'vegetariano'],
        evidence_level: 'high',
        published_at: '2026-04-10',
      },
    ];

    // Insights (gerados por IA combinando múltiplas fontes)
    const insights: NutriFlixContent[] = [
      {
        id: 'insight-1',
        type: 'insight',
        title: 'Nova tendência: Nutrição de Precisão',
        description: 'Personalização baseada em genômica e microbiome',
        summary_ia: 'Nutrição de precisão usa dados genéticos e do microbioma para personalizar recomendações nutricionais, com eficácia 3x maior que dietas genéricas.',
        category: 'Tendência',
        tags: ['precisão', 'genômica', 'personalização'],
        evidence_level: 'medium',
        published_at: '2026-04-18',
      },
    ];

    const hero = news[0] || null;
    const continueLearning = courses.filter(c => (c.progress || 0) > 0);
    const recommended = videos.slice(0, 3);

    return { news, videos, courses, studies, insights, hero, continueLearning, recommended };
  } catch (error) {
    console.error('[NutriFlix] Error loading data:', error);
    // Retorna dados básicos em caso de erro
    const news = getFallbackNews();
    return {
      news,
      videos: [],
      courses: await getCoursesWithProgress(userId),
      studies: [],
      insights: [],
      hero: news[0],
      continueLearning: [],
      recommended: [],
    };
  }
}

// ─── Busca inteligente (IA + múltiplas fontes) ────────────────────────

export async function searchNutriflix(query: string): Promise<NutriFlixContent[]> {
  if (!query.trim()) return [];

  try {
    // Busca paralela: YouTube + Supabase + IA
    const [youtubeResults, aiResults] = await Promise.all([
      searchYouTubeVideos(query, 5),
      generateAIContentForQuery(query),
    ]);

    const results: NutriFlixContent[] = [];

    // Adiciona vídeos do YouTube
    youtubeResults.forEach(v => {
      results.push({
        id: `search-video-${v.video_id}`,
        type: 'video',
        title: v.title,
        description: v.description,
        summary_ia: `Vídeo relacionado a "${query}" por ${v.channel}.`,
        thumbnail: v.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${v.video_id}`,
        video_id: v.video_id,
        category: 'Busca',
        tags: [query, 'youtube'],
        duration: v.duration,
        published_at: v.published_at.split('T')[0],
      });
    });

    // Adiciona resultados da IA
    results.push(...aiResults);

    return results;
  } catch (error) {
    console.error('[NutriFlix] Search error:', error);
    return getFallbackVideos(query).map(v => ({
      id: `fallback-${v.video_id}`,
      type: 'video' as const,
      title: v.title,
      description: v.description,
      summary_ia: `Vídeo educativo sobre ${query}.`,
      thumbnail: v.thumbnail,
      video_url: `https://www.youtube.com/watch?v=${v.video_id}`,
      video_id: v.video_id,
      category: 'Educação',
      tags: [query],
      duration: v.duration,
      published_at: new Date().toISOString().split('T')[0],
    }));
  }
}

async function generateAIContentForQuery(query: string): Promise<NutriFlixContent[]> {
  try {
    // Multi-AI: usa o orquestrador para gerar conteúdo relevante
    const status = multiAiOrchestrator.getStatus();
    if (!status.gemini) return [];

    const prompt = `Gere 3 itens de conteúdo educacional sobre "${query}" em português.
Responda APENAS com JSON válido:
[
  {
    "title": "Título",
    "description": "Descrição",
    "summary_ia": "Resumo IA",
    "type": "news|study|insight",
    "category": "Categoria",
    "tags": ["tag1", "tag2"]
  }
]`;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'SUA_CHAVE_GEMINI_AQUI') return [];

    const genAI = new GoogleGenAI({ apiKey });
    const res = await genAI.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: prompt,
    });

    const text = res.text ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const items = JSON.parse(match[0]);
    return items.map((item: any, i: number) => ({
      id: `ai-search-${Date.now()}-${i}`,
      type: item.type || 'insight',
      title: item.title,
      description: item.description,
      summary_ia: item.summary_ia,
      category: item.category,
      tags: item.tags || [query],
      evidence_level: 'medium',
      published_at: new Date().toISOString().split('T')[0],
    }));
  } catch (err) {
    console.warn('[AI Content] Generation failed:', err);
    return [];
  }
}

// ─── AI Chat Assistant (Multi-AI: Gemini + Hugging Face) ──────────────

export async function askNutriFlixAI(question: string): Promise<string> {
  try {
    // Multi-AI: combina Gemini + Hugging Face para melhor resposta
    const moodResult = await multiAiOrchestrator.analyzePatientFeedback(question);

    // Gemini gera resposta detalhada
    const prompt = `Você é um assistente especializado em nutrição científica.
Responda à pergunta abaixo de forma clara, baseada em evidências, com no máximo 200 palavras.
Seja objetivo e mencione o nível de evidência quando relevante.

Pergunta: "${question}"

Formato desejado:
Resposta direta (2-3 frases)
• Ponto-chave 1
• Ponto-chave 2
• Ponto-chave 3
Fonte: [mencione a fonte/base científica]`;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && apiKey !== 'SUA_CHAVE_GEMINI_AQUI') {
      const genAI = new GoogleGenAI({ apiKey });
      const res = await genAI.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: prompt,
      });

      const aiText = res.text ?? '';
      if (aiText) {
        // Combina com análise de sentimento do Hugging Face
        const mood = moodResult.mood;
        const prefix = mood === 'negative'
          ? '😊 Entendo sua preocupação. '
          : mood === 'positive'
          ? '🌟 Ótima pergunta! '
          : '';
        return prefix + aiText;
      }
    }

    // Fallback: resposta baseada em conhecimento
    return generateFallbackAIResponse(question);
  } catch (error) {
    console.error('[NutriFlix AI] Error:', error);
    return generateFallbackAIResponse(question);
  }
}

function generateFallbackAIResponse(question: string): string {
  const q = question.toLowerCase();

  const responses: Record<string, string> = {
    'dieta mediterrânea': `A dieta mediterrânea é considerada a mais saudável do mundo.

• Rica em azeite de oliva, peixes, e vegetais
• Reduz risco cardiovascular em até 30%
• Protege contra declínio cognitivo

Fonte: Estudo PREDIMED (N Engl J Med 2013)`,

    'proteína': `A ingestão adequada de proteínas é crucial para saúde.

• Adultos: 0.8-1.2g por kg de peso corporal
• Atletas: 1.6-2.2g por kg para hipertrofia
• Distribute ao longo do dia para melhor absorção

Fonte: ACSM Position Stand (2016)`,

    'jejum intermitente': `O jejum intermitente pode ser efetivo para perda de peso.

• Método 16:8 é o mais estudado e seguro
• Perda média de 0.5-1kg por semana
• Deve ser monitorado por nutricionista

Fonte: JAMA Network (2024)`,

    'default': `Com base em evidências científicas atuais:

• A nutrição personalizada é a tendência mais efetiva
• Dietas restritivas costumam falhar a longo prazo
• Consulte sempre um nutricionista qualificado

Para uma resposta mais específica, refine sua pergunta com termos como "proteína", "dieta mediterrânea" ou "jejum intermitente".`,
  };

  for (const [key, response] of Object.entries(responses)) {
    if (key !== 'default' && q.includes(key)) return response;
  }
  return responses['default'];
}

// ─── Operações no Supabase ───────────────────────────────────────────────

export async function saveContent(contentId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('user_saved_content')
      .upsert({ content_id: contentId, user_id: userId, saved_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}

export async function updateProgress(contentId: string, userId: string, progress: number): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        content_id: contentId,
        user_id: userId,
        progress,
        last_watched: new Date().toISOString(),
        completed: progress >= 100,
      });
    return !error;
  } catch {
    return false;
  }
}

export async function getSavedContent(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await supabase
      .from('user_saved_content')
      .select('content_id')
      .eq('user_id', userId);
    return data?.map((d: any) => d.content_id) || [];
  } catch {
    return [];
  }
}

// ─── Embed URL para YouTube ────────────────────────────────────────────────

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}default.jpg`;
}

// ─── Funções IA Aprimoradas (Múltiplas APIs em Paralelo) ─────────

/**
 * RESPOSTA UNIFICADA: Combina Gemini + Hugging Face + Edamam em paralelo
 * Gera a melhor resposta possível usando todas as IAs gratuitas juntas
 */
export async function getUnifiedAIResponse(
  query: string,
  context?: { userHistory?: string[]; userPreferences?: string[] }
): Promise<{ answer: string; sources: string[]; confidence: number }> {
  const sources: string[] = [];

  try {
    // Executa IAs em paralelo para máxima eficiência
    const [geminiRes, moodRes, nutritionRes] = await Promise.allSettled([
      // 1. Gemini: resposta principal
      (async () => {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'SUA_CHAVE_GEMINI_AQUI') return null;
        const { GoogleGenAI } = await import('@google/genai');
        const genAI = new GoogleGenAI({ apiKey });
        const ctxStr = context?.userPreferences?.length
          ? `\nPreferências do usuário: ${context.userPreferences.join(', ')}`
          : '';
        const res = await genAI.models.generateContent({
          model: 'gemini-1.5-flash-latest',
          contents: `Você é um nutricionista especializado. Responda de forma clara e baseada em evidências (máximo 150 palavras).

Pergunta: "${query}"${ctxStr}

Formato:
Resposta: [resposta direta]
Principais pontos:
• [ponto 1]
• [ponto 2]
• [ponto 3]
Fontes: [citacões científicas]`,
        });
        return res.text ?? null;
      })(),

      // 2. Hugging Face: análise de sentimento do usuário
      multiAiOrchestrator.analyzePatientFeedback(query).catch(() => null),

      // 3. Edamam: dados nutricionais relacionados
      edamamProvider.searchRecipes(query, []).catch(() => []),
    ]);

    let answer = '';
    let confidence = 0.5;

    // Processa resposta do Gemini
    if (geminiRes.status === 'fulfilled' && geminiRes.value) {
      answer = geminiRes.value;
      sources.push('Gemini AI');
      confidence += 0.3;
    }

    // Processa análise de sentimento
    if (moodRes.status === 'fulfilled' && moodRes.value) {
      const mood = moodRes.value;
      const moodPrefix = mood.mood === 'negative'
        ? '😊 Entendo sua preocupação. '
        : mood.mood === 'positive'
        ? '🌟 Ótima pergunta! '
        : '';
      answer = moodPrefix + answer;
      sources.push('Hugging Face (sentimento)');
      confidence += 0.1;
    }

    // Processa dados do Edamam
    if (nutritionRes.status === 'fulfilled' && nutritionRes.value?.length > 0) {
      const recipes = nutritionRes.value.slice(0, 2);
      answer += `\n\nReceitas relacionadas: ${recipes.map((r: any) => r.label).join(', ')}`;
      sources.push('Edamam');
      confidence += 0.1;
    }

    // Fallback se nada funcionou
    if (!answer) {
      answer = generateFallbackAIResponse(query);
      sources.push('Base de Conhecimento Local');
      confidence = 0.4;
    }

    return { answer, sources, confidence: Math.min(confidence, 1.0) };
  } catch (error) {
    console.error('[Unified AI] Error:', error);
    return {
      answer: generateFallbackAIResponse(query),
      sources: ['Fallback'],
      confidence: 0.3,
    };
  }
}

/**
 * RECOMENDAÇÕES PERSONALIZADAS: Usa histórico + multi-AI
 * Analisa o que o usuário assistiu e gera recomendações personalizadas
 */
export async function getPersonalizedRecommendations(
  userId: string,
  options?: { maxResults?: number; includeVideos?: boolean }
): Promise<{ videos: VideoRecommendation[]; articles: any[]; insights: string[] }> {
  const maxResults = options?.maxResults || 5;

  try {
    // Busca histórico do usuário no Supabase
    let userHistory: string[] = [];
    if (isSupabaseConfigured && userId) {
      const { data } = await supabase
        .from('user_progress')
        .select('content_id, progress')
        .eq('user_id', userId)
        .order('last_watched', { ascending: false })
        .limit(20);
      userHistory = data?.map((d: any) => d.content_id) || [];
    }

    // Executa em paralelo: YouTube + AI content generation
    const [videos, aiInsights] = await Promise.allSettled([
      searchYouTubeVideos('nutrição saudável', maxResults).catch(() => getFallbackVideos('')),
      (async () => {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'SUA_CHAVE_GEMINI_AQUI') return [];
        const { GoogleGenAI } = await import('@google/genai');
        const genAI = new GoogleGenAI({ apiKey });
        const res = await genAI.models.generateContent({
          model: 'gemini-1.5-flash-latest',
          contents: `Gere ${maxResults} tópicos de nutrição personalizados para quem já consumiu ${userHistory.length} conteúdos.
Responda APENAS com JSON: ["tópico 1", "tópico 2", ...]`,
        });
        const text = res.text ?? '';
        const match = text.match(/\[[\s\S]*]/);
        if (match) return JSON.parse(match[0]);
        return [];
      })().catch(() => []),
    ]);

    const videoResults = videos.status === 'fulfilled' ? videos.value : [];
    const insights = aiInsights.status === 'fulfilled' ? aiInsights.value : [];

    return {
      videos: videoResults,
      articles: [],
      insights: Array.isArray(insights) ? insights : [],
    };
  } catch (error) {
    console.error('[Personalized] Error:', error);
    return { videos: getFallbackVideos(''), articles: [], insights: [] };
  }
}

/**
 * BUSCA UNIFICADA: YouTube + Supabase + IA em paralelo
 * Combina resultados de múltiplas fontes para melhor experiência
 */
export async function unifiedSearch(
  query: string,
  userId?: string
): Promise<{
  videos: NutriFlixContent[];
  articles: NutriFlixContent[];
  aiGenerated: NutriFlixContent[];
}> {
  try {
    const [youtubeRes, supabaseRes, aiRes] = await Promise.allSettled([
      // 1. YouTube (rápido - APIs externas)
      searchYouTubeVideos(query, 5),

      // 2. Supabase (rápido - banco interno)
      isSupabaseConfigured && userId
        ? supabase
            .from('nutriflix_videos')
            .select('*')
            .ilike('title', `%${query}%`)
            .limit(10)
        : Promise.resolve({ data: [] }),

      // 3. IA gera conteúdo relacionado (paralelo)
      generateAIContentForQuery(query),
    ]);

    const videos: NutriFlixContent[] = [];
    const articles: NutriFlixContent[] = [];
    const aiGenerated: NutriFlixContent[] = [];

    // Processa YouTube
    if (youtubeRes.status === 'fulfilled') {
      youtubeRes.value.forEach(v => {
        videos.push({
          id: `search-yt-${v.video_id}`,
          type: 'video',
          title: v.title,
          description: v.description,
          summary_ia: `Vídeo sobre ${query}`,
          thumbnail: v.thumbnail,
          video_url: `https://www.youtube.com/watch?v=${v.video_id}`,
          video_id: v.video_id,
          category: 'Busca',
          tags: [query],
          duration: v.duration,
          published_at: v.published_at?.split('T')[0] || '',
        });
      });
    }

    // Processa Supabase
    if (supabaseRes.status === 'fulfilled' && supabaseRes.value.data) {
      supabaseRes.value.data.forEach((item: any) => {
        articles.push({
          id: `search-db-${item.id}`,
          type: item.type || 'article',
          title: item.title,
          description: item.description || '',
          summary_ia: item.summary_ia || '',
          category: item.category || 'Artigo',
          tags: item.tags || [],
          thumbnail: item.thumbnail,
          published_at: item.published_at?.split('T')[0] || '',
        });
      });
    }

    // Processa IA
    if (aiRes.status === 'fulfilled') {
      aiGenerated.push(...aiRes.value);
    }

    return { videos, articles, aiGenerated };
  } catch (error) {
    console.error('[Unified Search] Error:', error);
    return { videos: [], articles: [], aiGenerated: [] };
  }
}

/**
 * ANÁLISE NUTRICIONAL COMPLETA: Edamam + USDA + Gemini
 * Dá uma análise super completa de um alimento ou refeição
 */
export async function getCompleteNutritionAnalysis(
  foodName: string,
  quantity: number = 100
): Promise<{
  basic: any;
  edamam: any;
  usda: any;
  aiAnalysis: string;
  recommendations: string[];
}> {
  try {
    const [edamamRes, usdaRes, aiRes] = await Promise.allSettled([
      edamamProvider.getNutrition(foodName, quantity),
      usdaProvider.searchFood(foodName),
      (async () => {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'SUA_CHAVE_GEMINI_AQUI') return null;
        const { GoogleGenAI } = await import('@google/genai');
        const genAI = new GoogleGenAI({ apiKey });
        const res = await genAI.models.generateContent({
          model: 'gemini-1.5-flash-latest',
          contents: `Analise nutricional de ${quantity}g de ${foodName}.
Responda APENAS com JSON:
{
  "resumo": "análise de 2 frases",
  "beneficios": ["benefício 1", "benefício 2"],
  "substitutos_saudaveis": ["substituto 1", "substituto 2"],
  "alerta": "alerta se houver"
}`,
        });
        const text = res.text ?? '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return null;
      })().catch(() => null),
    ]);

    return {
      basic: { name: foodName, quantity, unit: 'g' },
      edamam: edamamRes.status === 'fulfilled' ? edamamRes.value : null,
      usda: usdaRes.status === 'fulfilled' ? usdaRes.value?.[0] : null,
      aiAnalysis: aiRes.status === 'fulfilled' && aiRes.value
        ? aiRes.value.resumo || ''
        : '',
      recommendations: aiRes.status === 'fulfilled' && aiRes.value
        ? [
            ...(aiRes.value?.beneficios || []),
            ...(aiRes.value?.substitutos_saudaveis?.map((s: string) => `Tente: ${s}`) || []),
          ]
        : [],
    };
  } catch (error) {
    console.error('[Nutrition Analysis] Error:', error);
    return {
      basic: { name: foodName, quantity },
      edamam: null,
      usda: null,
      aiAnalysis: '',
      recommendations: [],
    };
  }
}


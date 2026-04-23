'use client';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface NutríFlixContent {
  id: string;
  type: 'news' | 'video' | 'course' | 'study' | 'insight';
  title: string;
  description: string;
  summary_ia: string;
  thumbnail?: string;
  video_url?: string;
  category: string;
  tags: string[];
  evidence_level?: 'high' | 'medium' | 'low';
  duration?: number;
  author?: string;
  published_at: string;
  url?: string;
  saved?: boolean;
  progress?: number;
}

export interface UserProgress {
  content_id: string;
  user_id: string;
  progress: number;
  completed: boolean;
  last_watched?: string;
}

const mockNews: NutríFlixContent[] = [
  {
    id: 'news-1',
    type: 'news',
    title: 'Nova diretriz da OMS sobre Gorduras Saturadas',
    description: 'Organização Mundial da Saúde atualiza recomendações sobre ingestão de gorduras saturadas',
    summary_ia: 'A OMS publicou novas diretrizes reduzindo o limite diário de gorduras saturadas para 10% das calorias totais, enfatizando替换 de gorduras trans.',
    category: 'Diretrizes',
    tags: ['gordura', 'oms', 'diretrizes'],
    evidence_level: 'high',
    published_at: '2026-04-18',
    url: '#'
  },
  {
    id: 'news-2',
    type: 'news',
    title: 'Estudo revela benefícios do jejum intermitente',
    description: 'Meta-análise mostra impactos positivos na perda de peso',
    summary_ia: 'Novo estudo com 2.400 participantes mostra perda média de 7% do peso corporal com jejum intermitente.',
    category: 'Pesquisa',
    tags: ['jejum', 'metabolismo', 'peso'],
    evidence_level: 'high',
    published_at: '2026-04-17',
    url: '#'
  },
  {
    id: 'news-3',
    type: 'news',
    title: 'Microbioma intestinal e saúde mental',
    description: 'Conexão entre gut-brain pode influenciar depressão',
    summary_ia: 'Pesquisas mostram que probióticos podem reduzir sintomas depressivos em 40%.',
    category: 'Pesquisa',
    tags: ['microbioma', 'saúde mental', 'probiótico'],
    evidence_level: 'high',
    published_at: '2026-04-16',
    url: '#'
  }
];

const mockVideos: NutríFlixContent[] = [
  {
    id: 'video-1',
    type: 'video',
    title: 'Introdução à Nutrição Metabólica',
    description: 'Aprenda os fundamentos da nutrição baseada em metabologia',
    summary_ia: 'Curso introdutório sobre como otimizar o metabolismo para perda de peso saudável.',
    category: 'Educação',
    tags: ['metabolismo', 'básico'],
    evidence_level: 'medium',
    duration: 180,
    published_at: '2026-04-15',
    video_url: '/videos/intro-metabolica.mp4'
  },
  {
    id: 'video-2',
    type: 'video',
    title: 'Leitura de Rótulos Nutricionais',
    description: 'Como interpretar labels de alimentos',
    summary_ia: 'Guia prático para decifrar informações nutricionais em embalagens.',
    category: 'Prático',
    tags: ['rótulos', 'prático'],
    evidence_level: 'medium',
    duration: 300,
    published_at: '2026-04-14',
    video_url: '/videos/rotulos.mp4'
  },
  {
    id: 'video-3',
    type: 'video',
    title: 'Suplementação: Quando e Como',
    description: 'Guia completo sobre suplementação',
    summary_ia: 'Quando suplementos são necessários e como escolher os adequados.',
    category: 'Suplementos',
    tags: ['suplemento', 'vitamina'],
    evidence_level: 'medium',
    duration: 420,
    published_at: '2026-04-13',
    video_url: '/videos/suplementacao.mp4'
  }
];

const mockCourses: NutríFlixContent[] = [
  {
    id: 'course-1',
    type: 'course',
    title: 'Nutriç��o Clinica Completa',
    description: 'Formação completa em nutrição clínica',
    summary_ia: 'Curso de 40 horas cobrindo desde avaliação nutricional até suplementação.',
    category: 'Formação',
    tags: ['clínica', 'avaliação'],
    evidence_level: 'high',
    duration: 2400,
    published_at: '2026-04-10',
    progress: 35
  },
  {
    id: 'course-2',
    type: 'course',
    title: 'Nutrição Esportiva',
    description: 'Nutrição para atletas e praticantes de exercício',
    summary_ia: 'Aprenda a formular estratégias nutricionais paraPerformance esportiva.',
    category: 'Esporte',
    tags: ['esporte', 'performance'],
    evidence_level: 'high',
    duration: 1800,
    published_at: '2026-04-08',
    progress: 0
  },
  {
    id: 'course-3',
    type: 'course',
    title: 'Nutrição Pediátrica',
    description: 'Alimentação infantil do birthao ao adolesc',
    summary_ia: 'Guia completo para nutrição em diferentes fases pediátricas.',
    category: 'Pédia',
    tags: ['criança', 'desenvolvimento'],
    evidence_level: 'high',
    duration: 1200,
    published_at: '2026-04-05',
    progress: 70
  }
];

const mockStudies: NutríFlixContent[] = [
  {
    id: 'study-1',
    type: 'study',
    title: 'Dieta Mediterrânea e CVD: Revisão Sistemática',
    description: 'Meta-análise de 12 estudos com 50.000 participantes',
    summary_ia: 'Dieta mediterrânea reduz risco cardiovascular em 25% compared to Western diet.',
    category: 'Cardiovascular',
    tags: ['mediterrânea', 'coração'],
    evidence_level: 'high',
    published_at: '2026-04-12'
  },
  {
    id: 'study-2',
    type: 'study',
    title: 'Proteína Vegetal vs Animal',
    description: 'Comparação de fontes proteicas para síntese muscular',
    summary_ia: 'Fontes vegetais de proteína podem ser tão efetivas quanto animais quando combinadas corretamente.',
    category: 'Proteína',
    tags: ['proteína', 'músculo'],
    evidence_level: 'high',
    published_at: '2026-04-10'
  },
  {
    id: 'study-3',
    type: 'study',
    title: 'Curcumina e Inflamação Crônica',
    description: 'Efeitos anti-inflamatórios da cúrcuma',
    summary_ia: 'Curcumina mostra redução de 60% em marcadores inflamatórios em humanos.',
    category: 'Anti-inflamatório',
    tags: ['curcumina', 'inflammação'],
    evidence_level: 'high',
    published_at: '2026-04-08'
  }
];

const mockInsights: NutríFlixContent[] = [
  {
    id: 'insight-1',
    type: 'insight',
    title: 'Nova tendência: Nutrição de Precisão',
    description: 'Personalização baseada em genômica',
    summary_ia: 'Nutrição de precisão usa dados genéticos para personalizar recomendações nutricionais.',
    category: 'Tendência',
    tags: ['precisão', 'genômica'],
    evidence_level: 'medium',
    published_at: '2026-04-18'
  },
  {
    id: 'insight-2',
    type: 'insight',
    title: 'Mudança na Pirâmide Alimentar',
    description: 'USDA atualiza guia alimentar',
    summary_ia: 'Nova pirâmide enfatizando proteína plantar e redução de carboidratos refinados.',
    category: 'Tendência',
    tags: ['pirâmide', 'guia'],
    evidence_level: 'medium',
    published_at: '2026-04-15'
  }
];

export async function getNutriflixData(userId?: string): Promise<{
  news: NutríFlixContent[];
  videos: NutríFlixContent[];
  courses: NutríFlixContent[];
  studies: NutríFlixContent[];
  insights: NutríFlixContent[];
  hero: NutríFlixContent | null;
  continueLearning: NutríFlixContent[];
  recommended: NutríFlixContent[];
}> {
  if (!isSupabaseConfigured) {
    return {
      news: mockNews,
      videos: mockVideos,
      courses: mockCourses,
      studies: mockStudies,
      insights: mockInsights,
      hero: mockNews[0],
      continueLearning: mockCourses.filter(c => (c.progress || 0) > 0),
      recommended: mockVideos.slice(0, 3)
    };
  }

  try {
    const [newsRes, videosRes, coursesRes, studiesRes, insightsRes, heroRes, progressRes] = await Promise.all([
      supabase.from('nutriflix_news').select('*').order('published_at', { ascending: false }).limit(10),
      supabase.from('nutriflix_videos').select('*').order('published_at', { ascending: false }).limit(10),
      supabase.from('nutriflix_courses').select('*').order('published_at', { ascending: false }).limit(10),
      supabase.from('nutriflix_studies').select('*').order('published_at', { ascending: false }).limit(10),
      supabase.from('nutriflix_insights').select('*').order('published_at', { ascending: false }).limit(10),
      supabase.from('nutriflix_hero').select('*').order('created_at', { ascending: false }).limit(1),
      userId ? supabase.from('user_progress').select('*').eq('user_id', userId) : Promise.resolve({ data: [], error: null })
    ]);

    const hero = heroRes.data?.[0] || mockNews[0];
    const progress = progressRes.data || [];

    const coursesWithProgress = coursesRes.data?.map((c: any) => {
      const userProg = progress.find((p: any) => p.content_id === c.id);
      return { ...c, progress: userProg?.progress || 0 };
    }) || mockCourses;

    return {
      news: newsRes.data || mockNews,
      videos: videosRes.data || mockVideos,
      courses: coursesWithProgress,
      studies: studiesRes.data || mockStudies,
      insights: insightsRes.data || mockInsights,
      hero,
      continueLearning: coursesWithProgress.filter(c => (c.progress || 0) > 0),
      recommended: videosRes.data?.slice(0, 3) || mockVideos.slice(0, 3)
    };
  } catch (error) {
    console.error('Error fetching nutriflix data:', error);
    return {
      news: mockNews,
      videos: mockVideos,
      courses: mockCourses,
      studies: mockStudies,
      insights: mockInsights,
      hero: mockNews[0],
      continueLearning: mockCourses.filter(c => (c.progress || 0) > 0),
      recommended: mockVideos.slice(0, 3)
    };
  }
}

export async function saveContent(contentId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true;
  }
  try {
    const { error } = await supabase
      .from('user_saved_content')
      .upsert({ content_id: contentId, user_id: userId, saved_at: new Date().toISOString() });
    return !error;
  } catch (error) {
    return false;
  }
}

export async function updateProgress(contentId: string, userId: string, progress: number): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true;
  }
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({ content_id: contentId, user_id: userId, progress, last_watched: new Date().toISOString() });
    return !error;
  } catch (error) {
    return false;
  }
}

export async function searchNutriflix(query: string): Promise<NutríFlixContent[]> {
  const allContent = [...mockNews, ...mockVideos, ...mockCourses, ...mockStudies];
  const q = query.toLowerCase();
  return allContent.filter(c => 
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}
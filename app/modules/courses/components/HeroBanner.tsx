'use client';

import React from 'react';
import { GraduationCap, Play, BookOpen, Save } from 'lucide-react';

interface HeroBannerProps {
  onCourseSelect: (course: any) => void;
  onContentSelect: (content: any) => void;
}

export function HeroBanner({ onCourseSelect, onContentSelect }: HeroBannerProps) {
  // Sample data - will be replaced with real data from API
  const featuredContent = {
    id: 'featured-1',
    title: 'Nova visão sobre metabolismo e gordura',
    description: 'Descubra as últimas descobertas sobre como o metabolismo realmente funciona e como aplicar na prática clínica.',
    type: 'course' as const,
    category: 'Metabolismo',
    level: 'Avançado',
    duration: '6 semanas',
    isFree: false,
    price: 399,
    progress: 0,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=800&q=60',
    evidenceLevel: 'Alto',
    clinicalRelevance: 'Alta',
    practicalApplication: 'Protocolos de intervenção nutricional para otimização metabólica'
  };

  const handleCourseSelect = () => {
    onCourseSelect(featuredContent);
  };

  const handleStudySelect = () => {
    onContentSelect({
      ...featuredContent,
      type: 'study',
      title: 'Estudo revolucionário sobre metabolismo de lipídios',
      description: 'Análise detalhada dos mecanismos de armazenamento e utilização de gorduras no corpo humano'
    });
  };

  return (
    <div className="relative h-[500px] mb-8 bg-gradient-to-r from-[#1A363D] to-[#0F1A22] rounded-2xl overflow-hidden">
      {/* Background image/video */}
      <div className="absolute inset-0">
        <video autoPlay loop muted className="w-full h-full object-cover">
          <source src="https://videos.pexels.com/video-files/854990/854990-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B24]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end px-8 pb-12">
        <div className="max-w-3xl w-full space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-white drop-shadow-lg">
            Nova visão sobre metabolismo e gordura
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Descubra as últimas descobertas sobre como o metabolismo realmente funciona e como aplicar na prática clínica.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
              {featuredContent.category}
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
              {featuredContent.level}
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
              {featuredContent.duration}
            </span>
            {featuredContent.evidenceLevel && (
              <span className={`px-3 py-1 bg-${featuredContent.evidenceLevel.toLowerCase() === 'alto' ? '#10B981' : 
                                featuredContent.evidenceLevel.toLowerCase() === 'medio' ? '#F59E0B' : '#EF4444'}/20 
                                rounded-full text-sm font-medium 
                                text-${featuredContent.evidenceLevel.toLowerCase() === 'alto' ? '#10B981' : 
                                      featuredContent.evidenceLevel.toLowerCase() === 'medio' ? '#F59E0B' : '#EF4444'}`}
                >
                Evidência: {featuredContent.evidenceLevel}
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleCourseSelect}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-[#27B494] text-white rounded-xl font-bold text-lg hover:bg-[#22C55E]/90 transition-all transform hover:-scale-[102%]"
            >
              <Play className="mr-3 h-4 w-4" />
              Assistir curso
            </button>
            
            <button 
              onClick={handleStudySelect}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all transform hover:-scale-[102%]"
            >
              <BookOpen className="mr-3 h-4 w-4" />
              Ler estudo
            </button>
            
            <button 
              className="flex-1 flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all transform hover:-scale-[102%]"
            >
              <Save className="mr-3 h-4 w-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B2B24]/0 to-[#0B2B24]/80 pointer-events-none" />
    </div>
  );
}
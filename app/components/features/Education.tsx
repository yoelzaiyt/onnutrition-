import React, { useEffect, useState } from 'react';
import { getNutriflixData, NutriFlixContent } from '@/app/lib/nutriflixService';
import { Play, GraduationCap, ArrowRight } from 'lucide-react';

export default function Education({ user }: { user?: any }) {
  const [courses, setCourses] = useState<NutriFlixContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getNutriflixData(user?.id);
        // Filtra apenas itens do tipo 'course'
        const filtered = (data?.courses || []).filter((c: any) => c.type === 'course' || c.type === undefined);
        setCourses(filtered);
      } catch (e) {
        console.error('Erro ao carregar cursos', e);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        Carregando cursos...
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="p-8 text-center text-slate-500">
        Nenhum curso disponível no momento.
      </div>
    );
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-amber-400" />
          Cursos & Educação
        </h2>
        <button className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">
          Ver todos <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {courses.map((c) => (
          <div
            key={c.id}
            className="flex-shrink-0 w-72 bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 hover:border-amber-500/30 cursor-pointer transition-all"
            onClick={() => {
              // Aqui você pode abrir um modal ou redirecionar para a página de detalhes
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">{c.category}</span>
            </div>
            <h4 className="text-base font-medium text-white line-clamp-2">{c.title}</h4>
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{c.description}</p>
            {c.duration && (
              <span className="text-xs text-amber-400 mt-2 inline-block">
                {c.duration} min
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

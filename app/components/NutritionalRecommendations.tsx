'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  History, 
  Clock, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  BookOpen, 
  Dumbbell, 
  Apple, 
  Activity,
  Share2,
  Printer,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recommendationService, Recommendation } from '@/app/lib/recommendationService';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI, Type } from "@google/genai";

interface NutritionalRecommendationsProps {
  patientId: string;
  patientName: string;
}

const NutritionalRecommendations: React.FC<NutritionalRecommendationsProps> = ({ patientId, patientName }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Recommendation['category']>('Alimentação');

  const templates = [
    { 
      title: 'Higiene do Sono', 
      category: 'Hábitos' as const, 
      content: '1. Evite telas 1h antes de dormir.\n2. Mantenha o quarto escuro e fresco.\n3. Evite cafeína após as 16h.\n4. Tente dormir e acordar no mesmo horário todos os dias.' 
    },
    { 
      title: 'Hidratação Diária', 
      category: 'Hábitos' as const, 
      content: 'Sua meta de hidratação é de 35ml por kg de peso.\n- Carregue sempre uma garrafa de água.\n- Use lembretes no celular.\n- Monitore a cor da urina (deve estar clara).' 
    },
    { 
      title: 'Pré-Treino Energético', 
      category: 'Treino' as const, 
      content: 'Consumir 40-60 min antes do treino:\n- 1 banana com aveia e mel.\n- Ou 1 fatia de pão integral com geleia.\n- Foco em carboidratos de fácil digestão.' 
    },
    { 
      title: 'Atenção Plena (Mindful Eating)', 
      category: 'Alimentação' as const, 
      content: '1. Coma sem distrações (TV, celular).\n2. Mastigue bem os alimentos.\n3. Sinta o sabor e a textura.\n4. Pare quando se sentir 80% saciado.' 
    }
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [patientId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await recommendationService.getAllByPatient(patientId);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (r: Recommendation) => {
    setIsEditing(true);
    setTitle(r.title);
    setContent(r.content);
    setCategory(r.category);
    setShowAddModal(true);
  };

  const handleSaveRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isEditing && selectedRecommendation?.id) {
        await recommendationService.update(selectedRecommendation.id, {
          title,
          content,
          category
        });
      } else {
        await recommendationService.create({
          patient_id: patientId,
          nutri_id: user.id,
          title,
          content,
          category,
          status: 'Ativo'
        });
      }

      setShowAddModal(false);
      resetForm();
      fetchRecommendations();
      setSelectedRecommendation(null);
    } catch (error) {
      console.error('Error saving recommendation:', error);
    }
  };

  const generateWithIA = async () => {
    if (!title) {
      alert('Por favor, defina um tema no título para a IA sugerir orientações.');
      return;
    }

    setIsGeneratingIA(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere orientações nutricionais detalhadas e práticas para o tema: ${title}. 
        O paciente se chama ${patientName}. 
        Retorne em JSON com os campos: content (string formatada com quebras de linha), category (string: Alimentação, Treino, Hábitos ou Geral).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Alimentação', 'Treino', 'Hábitos', 'Geral'] }
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      setContent(result.content);
      setCategory(result.category as any);
    } catch (error) {
      console.error('Error generating with IA:', error);
      alert('Erro ao gerar sugestão com IA.');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setContent(template.content);
    setCategory(template.category);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('Alimentação');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta orientação?')) return;
    try {
      await recommendationService.delete(id);
      fetchRecommendations();
      if (selectedRecommendation?.id === id) setSelectedRecommendation(null);
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Orientações Nutricionais - ONNTRI\n\nPaciente: ${patientName}\nTema: ${selectedRecommendation?.title}\n\n${selectedRecommendation?.content}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Orientações ONNTRI',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Copiado para a área de transferência!');
    }
  };

  const getCategoryIcon = (cat: Recommendation['category']) => {
    switch (cat) {
      case 'Alimentação': return <Apple className="w-4 h-4" />;
      case 'Treino': return <Dumbbell className="w-4 h-4" />;
      case 'Hábitos': return <Activity className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22B391]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-black text-[#0B2B24]">Orientações Nutricionais</h2>
          <p className="text-slate-500 font-medium">Dicas e hábitos personalizados para {patientName}</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20"
        >
          <Plus className="w-5 h-5" />
          Nova Orientação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History List */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-[#22B391]" />
            <h3 className="font-black text-[#0B2B24]">Histórico</h3>
          </div>
          
          {recommendations.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center">
              <p className="text-slate-400 font-bold">Nenhuma orientação registrada.</p>
            </div>
          ) : (
            recommendations.map((r) => (
              <motion.div
                key={r.id}
                layoutId={r.id}
                onClick={() => setSelectedRecommendation(r)}
                className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
                  selectedRecommendation?.id === r.id 
                    ? 'bg-white border-[#22B391] shadow-xl shadow-[#22B391]/10' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-[#0B2B24] group-hover:text-[#22B391] transition-colors">{r.title}</h4>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border flex items-center gap-1 ${
                    r.category === 'Alimentação' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                    r.category === 'Treino' ? 'text-blue-500 bg-blue-50 border-blue-100' :
                    'text-amber-500 bg-amber-50 border-amber-100'
                  }`}>
                    {getCategoryIcon(r.category)}
                    {r.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <Clock className="w-3 h-3" />
                  {new Date(r.created_at!).toLocaleDateString('pt-BR')}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 font-medium">
                  {r.content}
                </p>
              </motion.div>
            ))
          )}
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedRecommendation ? (
              <motion.div
                key={selectedRecommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 print:shadow-none print:border-none print:p-0"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#22B391]/10 rounded-3xl flex items-center justify-center print:hidden">
                      <FileText className="w-8 h-8 text-[#22B391]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#0B2B24]">{selectedRecommendation.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-500 font-bold text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(selectedRecommendation.created_at!).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[#22B391] font-black text-xs uppercase tracking-wider flex items-center gap-1">
                          {getCategoryIcon(selectedRecommendation.category)}
                          {selectedRecommendation.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button 
                      onClick={() => handleOpenEdit(selectedRecommendation)}
                      className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all"
                      title="Editar"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedRecommendation.id!)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 print:bg-white print:border-none print:p-0">
                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedRecommendation.content}
                    </p>
                  </div>
                </div>

                {/* Print/Share Actions */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4 print:hidden">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20"
                  >
                    <Share2 className="w-5 h-5" />
                    Enviar para Paciente
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center print:hidden">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-[#0B2B24] mb-2">Selecione uma orientação</h3>
                <p className="text-slate-400 font-bold max-w-xs">Escolha uma orientação do histórico para visualizar o conteúdo completo.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#0B2B24]">
                  {isEditing ? 'Editar Orientação' : 'Nova Orientação Nutricional'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Templates Sidebar */}
                {!isEditing && (
                  <div className="lg:col-span-1 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Templates</h4>
                    <div className="space-y-2">
                      {templates.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyTemplate(t)}
                          className="w-full text-left p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#22B391] transition-all group"
                        >
                          <p className="text-[11px] font-black text-[#0B2B24] group-hover:text-[#22B391]">{t.title}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{t.category}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Area */}
                <form onSubmit={handleSaveRecommendation} className={`space-y-6 ${isEditing ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">Título / Tema</label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Higiene do Sono, Hidratação..."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                      />
                    </div>
                    <div className="w-48">
                      <label className="block text-xs font-black text-slate-400 uppercase mb-1">Categoria</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as any)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold appearance-none"
                      >
                        <option value="Alimentação">Alimentação</option>
                        <option value="Treino">Treino</option>
                        <option value="Hábitos">Hábitos</option>
                        <option value="Geral">Geral</option>
                      </select>
                    </div>
                    {!isEditing && (
                      <button 
                        type="button"
                        onClick={generateWithIA}
                        disabled={isGeneratingIA}
                        className="p-4 bg-emerald-50 text-[#22B391] rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 font-black text-sm disabled:opacity-50"
                      >
                        {isGeneratingIA ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#22B391]"></div>
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        IA
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Conteúdo da Orientação</label>
                    <textarea 
                      required
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Escreva aqui as orientações detalhadas para o paciente..."
                      className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:border-[#22B391] font-medium h-64 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-4 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20"
                    >
                      {isEditing ? 'Atualizar Orientação' : 'Salvar Orientação'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionalRecommendations;

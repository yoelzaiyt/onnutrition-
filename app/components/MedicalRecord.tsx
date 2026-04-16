'use client';

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  ClipboardList, 
  Utensils, 
  FlaskConical, 
  Ruler, 
  Target, 
  Save, 
  Plus, 
  History, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Zap,
  Brain,
  MessageSquare,
  Loader2,
  Calendar,
  Trash2,
  Edit2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { medicalRecordService, MedicalRecord as IMedicalRecord, ClinicalNote } from '@/app/lib/medicalRecordService';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI } from "@google/genai";

interface MedicalRecordProps {
  patientId: string;
  patientName?: string;
  onBack?: () => void;
}

const MedicalRecord: React.FC<MedicalRecordProps> = ({ patientId, patientName = 'Paciente', onBack }) => {
  const [record, setRecord] = useState<IMedicalRecord | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [activeSection, setActiveSection] = useState('evolution');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [nutritionalDiagnosis, setNutritionalDiagnosis] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recordData, notesData] = await Promise.all([
        medicalRecordService.getMedicalRecord(patientId),
        medicalRecordService.getClinicalNotes(patientId)
      ]);

      if (recordData) {
        setRecord(recordData);
        setClinicalHistory(recordData.clinical_history || '');
        setNutritionalDiagnosis(recordData.nutritional_diagnosis || '');
      }
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching medical record data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedRecord = await medicalRecordService.upsertMedicalRecord({
        patient_id: patientId,
        nutri_id: user.id,
        clinical_history: clinicalHistory,
        nutritional_diagnosis: nutritionalDiagnosis
      });

      setRecord(updatedRecord);
    } catch (error) {
      console.error('Error saving medical record:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingNoteId) {
        const updatedNote = await medicalRecordService.updateClinicalNote(editingNoteId, newNoteContent);
        setNotes(notes.map(n => n.id === editingNoteId ? updatedNote : n));
        setEditingNoteId(null);
      } else {
        const newNote = await medicalRecordService.createClinicalNote({
          patient_id: patientId,
          nutri_id: user.id,
          content: newNoteContent,
          date: new Date().toISOString().split('T')[0]
        });
        setNotes([newNote, ...notes]);
      }
      setNewNoteContent('');
    } catch (error) {
      console.error('Error saving clinical note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;
    try {
      await medicalRecordService.deleteClinicalNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting clinical note:', error);
    }
  };

  const generateDiagnosisWithIA = async () => {
    try {
      setIsGenerating(true);
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `Como um nutricionista especialista, gere um diagnóstico nutricional estruturado para o paciente ${patientName}. 
      Considere o histórico clínico: "${clinicalHistory}". 
      O diagnóstico deve ser profissional, técnico e focado em metas nutricionais. 
      Retorne apenas o texto do diagnóstico em português.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (response.text) {
        setNutritionalDiagnosis(response.text);
      }
    } catch (error) {
      console.error('Error generating diagnosis with IA:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    { id: 'evolution', label: 'Evolução e Notas', icon: History },
    { id: 'clinical', label: 'Histórico Clínico', icon: ClipboardList },
    { id: 'diagnosis', label: 'Diagnóstico Nutricional', icon: Stethoscope },
    { id: 'timeline', label: 'Timeline', icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-[#22B391] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-8 p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#22B391]/10 text-[#22B391] rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0B2B24]">Prontuário e Diagnóstico</h2>
              <p className="text-slate-500 font-medium">Registro clínico e evolução de {patientName}.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSaveRecord}
              disabled={isSaving}
              className="px-8 py-3 bg-[#22B391] text-white rounded-2xl font-black text-xs hover:bg-[#1C9A7D] transition-all shadow-lg shadow-[#22B391]/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Prontuário
            </button>
          </div>
        </div>

        <div className="bg-[#0B2B24] p-8 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Brain className="w-16 h-16 text-[#22B391]" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-[#22B391]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#22B391]">Assistente IA</span>
          </div>
          <p className="text-sm font-medium text-slate-300 leading-relaxed">
            Use a inteligência artificial para auxiliar no diagnóstico nutricional baseado no histórico clínico do paciente.
          </p>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${
                activeSection === section.id 
                  ? 'bg-[#22B391] text-white shadow-lg shadow-[#22B391]/20' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-sm font-black uppercase tracking-widest">{section.label}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeSection === section.id ? 'text-white/50' : 'text-slate-200'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-[#0B2B24]">
              {sections.find(s => s.id === activeSection)?.label}
            </h3>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sessão Ativa</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeSection === 'evolution' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nova Nota de Evolução</label>
                      {editingNoteId && (
                        <button 
                          onClick={() => {
                            setEditingNoteId(null);
                            setNewNoteContent('');
                          }}
                          className="text-xs font-bold text-rose-500 hover:underline"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <textarea 
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Descreva a evolução clínica, queixas e observações deste atendimento..."
                        className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:border-[#22B391] font-medium text-slate-700 resize-none"
                      />
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSaving || !newNoteContent.trim()}
                        className="absolute bottom-4 right-4 px-6 py-2 bg-[#22B391] text-white rounded-xl font-black text-xs hover:bg-[#1C9A7D] transition-all shadow-md disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingNoteId ? 'Atualizar Nota' : 'Adicionar Nota'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Notas Recentes</h4>
                    <div className="space-y-4">
                      {notes.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                          <p className="text-slate-400 font-medium">Nenhuma nota registrada ainda.</p>
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div key={note.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-[#0B2B24] uppercase tracking-widest">
                                    {new Date(note.date).toLocaleDateString('pt-BR')}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consulta</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingNoteId(note.id!);
                                    setNewNoteContent(note.content);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteNote(note.id!)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'clinical' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Histórico Clínico Geral</label>
                    <textarea 
                      value={clinicalHistory}
                      onChange={(e) => setClinicalHistory(e.target.value)}
                      placeholder="Antecedentes familiares, patologias, cirurgias, medicamentos em uso..."
                      className="w-full h-96 p-8 bg-slate-50 border border-slate-100 rounded-[3rem] focus:outline-none focus:border-[#22B391] font-medium text-slate-700 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'diagnosis' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Diagnóstico Nutricional</label>
                      <button 
                        onClick={generateDiagnosisWithIA}
                        disabled={isGenerating || !clinicalHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B2B24] text-[#22B391] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0B2B24]/90 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Gerar com IA
                      </button>
                    </div>
                    <textarea 
                      value={nutritionalDiagnosis}
                      onChange={(e) => setNutritionalDiagnosis(e.target.value)}
                      placeholder="Defina o diagnóstico nutricional baseado na avaliação completa..."
                      className="w-full h-96 p-8 bg-slate-50 border border-slate-100 rounded-[3rem] focus:outline-none focus:border-[#22B391] font-medium text-slate-700 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'timeline' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 py-4"
                >
                  <div className="relative ml-4 border-l-2 border-slate-100 space-y-12 pb-8">
                    {notes.length === 0 ? (
                      <div className="pl-8">
                        <p className="text-slate-400 font-medium">Nenhuma evolução registrada para exibir na timeline.</p>
                      </div>
                    ) : (
                      notes.map((note, index) => (
                        <div key={note.id} className="relative pl-12">
                          <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[#22B391] shadow-sm" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-[#22B391] uppercase tracking-widest">
                                {new Date(note.date).toLocaleDateString('pt-BR')}
                              </span>
                              <div className="h-px flex-1 bg-slate-50" />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                {note.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecord;

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search,
  History,
  Info,
  CheckCircle2,
  Sparkles,
  Printer,
  Share2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { prescriptionService, CompoundedPrescription, PrescriptionItem } from '@/app/lib/prescriptionService';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI, Type } from "@google/genai";

interface PrescriptionManipuladosProps {
  patientId: string;
  patientName: string;
}

const PrescriptionManipulados: React.FC<PrescriptionManipuladosProps> = ({ patientId, patientName }) => {
  const [prescriptions, setPrescriptions] = useState<CompoundedPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<CompoundedPrescription | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [posology, setPosology] = useState('');
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState<{ substance: string; dosage: string }[]>([
    { substance: '', dosage: '' }
  ]);

  const [alerts, setAlerts] = useState<{ type: 'warning' | 'info'; message: string }[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  useEffect(() => {
    checkDoseAlerts();
  }, [items]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getAllByPatient(patientId);
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDoseAlerts = () => {
    const newAlerts: { type: 'warning' | 'info'; message: string }[] = [];
    
    items.forEach(item => {
      const substance = item.substance.toLowerCase();
      const dosageValue = parseFloat(item.dosage.replace(/[^0-9.]/g, ''));

      if (substance.includes('cafeína') || substance.includes('caffeine')) {
        if (dosageValue > 400) {
          newAlerts.push({ type: 'warning', message: 'Cafeína acima de 400mg pode causar taquicardia e ansiedade.' });
        }
      }
      if (substance.includes('melatonina')) {
        if (dosageValue > 0.21) {
          newAlerts.push({ type: 'info', message: 'Melatonina acima de 0.21mg requer atenção às normas da ANVISA para suplementos.' });
        }
      }
      if (substance.includes('vitamina d')) {
        if (dosageValue > 2000 && item.dosage.toLowerCase().includes('ui')) {
          newAlerts.push({ type: 'info', message: 'Dosagens de Vitamina D acima de 2000 UI devem ser monitoradas com exames bioquímicos.' });
        }
      }
    });

    setAlerts(newAlerts);
  };

  const handleAddItem = () => {
    setItems([...items, { substance: '', dosage: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'substance' | 'dosage', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleOpenEdit = (p: CompoundedPrescription) => {
    setIsEditing(true);
    setTitle(p.title);
    setPosology(p.posology);
    setObservations(p.observations || '');
    setItems(p.items?.map(i => ({ substance: i.substance, dosage: i.dosage })) || [{ substance: '', dosage: '' }]);
    setShowAddModal(true);
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    resetForm();
    setShowAddModal(true);
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const filteredItems = items.filter(item => item.substance.trim() !== '' && item.dosage.trim() !== '');
      if (filteredItems.length === 0) {
        alert('Adicione pelo menos uma substância válida.');
        return;
      }

      if (isEditing && selectedPrescription?.id) {
        // For simplicity in this demo, we'll delete and recreate or just update the main record
        // Real implementation should update items too.
        await prescriptionService.delete(selectedPrescription.id);
      }

      await prescriptionService.create(
        {
          patient_id: patientId,
          nutri_id: user.id,
          title,
          posology,
          observations,
          status: 'Ativo'
        },
        filteredItems
      );

      setShowAddModal(false);
      resetForm();
      fetchPrescriptions();
      setSelectedPrescription(null);
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  const generateWithIA = async () => {
    if (!title) {
      alert('Por favor, defina um objetivo no título (ex: Emagrecimento, Sono, Foco) para a IA sugerir.');
      return;
    }

    setIsGeneratingIA(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Sugira uma fórmula magistral (manipulada) para o objetivo: ${title}. 
        Retorne em JSON com os campos: items (array de {substance, dosage}), posology (string), observations (string).
        Seja técnico e use dosagens seguras e comuns na nutrição clínica brasileira.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    substance: { type: Type.STRING },
                    dosage: { type: Type.STRING }
                  }
                }
              },
              posology: { type: Type.STRING },
              observations: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      setItems(result.items);
      setPosology(result.posology);
      setObservations(result.observations);
    } catch (error) {
      console.error('Error generating with IA:', error);
      alert('Erro ao gerar sugestão com IA. Verifique sua conexão ou chave de API.');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Prescrição de Manipulados - ONNTRI\n\nPaciente: ${patientName}\nFórmula: ${selectedPrescription?.title}\n\nItens:\n${selectedPrescription?.items?.map(i => `- ${i.substance}: ${i.dosage}`).join('\n')}\n\nPosologia: ${selectedPrescription?.posology}\n\nObs: ${selectedPrescription?.observations || 'Nenhuma'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Prescrição ONNTRI',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Copiado para a área de transferência!');
    }
  };

  const resetForm = () => {
    setTitle('');
    setPosology('');
    setObservations('');
    setItems([{ substance: '', dosage: '' }]);
    setAlerts([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prescrição?')) return;
    try {
      await prescriptionService.delete(id);
      fetchPrescriptions();
      if (selectedPrescription?.id === id) setSelectedPrescription(null);
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await prescriptionService.archive(id);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error archiving prescription:', error);
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
          <h2 className="text-2xl font-black text-[#0B2B24]">Prescrição de Manipulados</h2>
          <p className="text-slate-500 font-medium">Fórmulas personalizadas para {patientName}</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20"
        >
          <Plus className="w-5 h-5" />
          Nova Prescrição
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History List */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-[#22B391]" />
            <h3 className="font-black text-[#0B2B24]">Histórico</h3>
          </div>
          
          {prescriptions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center">
              <p className="text-slate-400 font-bold">Nenhuma prescrição registrada.</p>
            </div>
          ) : (
            prescriptions.map((p) => (
              <motion.div
                key={p.id}
                layoutId={p.id}
                onClick={() => setSelectedPrescription(p)}
                className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
                  selectedPrescription?.id === p.id 
                    ? 'bg-white border-[#22B391] shadow-xl shadow-[#22B391]/10' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-[#0B2B24] group-hover:text-[#22B391] transition-colors">{p.title}</h4>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${
                    p.status === 'Ativo' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-100'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <Clock className="w-3 h-3" />
                  {new Date(p.created_at!).toLocaleDateString('pt-BR')}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.items?.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                      {item.substance}
                    </span>
                  ))}
                  {(p.items?.length || 0) > 3 && (
                    <span className="text-[9px] text-slate-400 font-bold">+{p.items!.length - 3}</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedPrescription ? (
              <motion.div
                key={selectedPrescription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 print:shadow-none print:border-none print:p-0"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#22B391]/10 rounded-3xl flex items-center justify-center print:hidden">
                      <Pill className="w-8 h-8 text-[#22B391]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#0B2B24]">{selectedPrescription.title}</h3>
                      <p className="text-slate-500 font-bold flex items-center gap-2">
                        Prescrito em {new Date(selectedPrescription.created_at!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button 
                      onClick={() => handleOpenEdit(selectedPrescription)}
                      className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all"
                      title="Editar"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    {selectedPrescription.status === 'Ativo' && (
                      <button 
                        onClick={() => handleArchive(selectedPrescription.id!)}
                        className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all"
                        title="Arquivar"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(selectedPrescription.id!)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Items List */}
                  <div className="space-y-4">
                    <h4 className="font-black text-[#0B2B24] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#22B391]" />
                      Substâncias e Dosagens
                    </h4>
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 print:bg-white">
                      <div className="space-y-3">
                        {selectedPrescription.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm print:shadow-none">
                            <span className="font-bold text-[#0B2B24]">{item.substance}</span>
                            <span className="font-black text-[#22B391]">{item.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Posology and Info */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-black text-[#0B2B24] flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#22B391]" />
                        Posologia
                      </h4>
                      <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 print:bg-white">
                        <p className="text-slate-700 font-medium leading-relaxed">
                          {selectedPrescription.posology}
                        </p>
                      </div>
                    </div>

                    {selectedPrescription.observations && (
                      <div className="space-y-3">
                        <h4 className="font-black text-[#0B2B24] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Observações
                        </h4>
                        <div className="p-6 bg-amber-50/30 rounded-[2rem] border border-amber-100/50 print:bg-white">
                          <p className="text-slate-600 text-sm font-medium">
                            {selectedPrescription.observations}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Print/Share Actions */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4 print:hidden">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir Receita
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1da383] transition-all shadow-lg shadow-[#22B391]/20"
                  >
                    <Share2 className="w-5 h-5" />
                    Compartilhar
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center print:hidden">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-6">
                  <Pill className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-[#0B2B24] mb-2">Selecione uma prescrição</h3>
                <p className="text-slate-400 font-bold max-w-xs">Escolha uma fórmula do histórico para ver os detalhes completos e posologia.</p>
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
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#0B2B24]">
                  {isEditing ? 'Editar Fórmula' : 'Nova Fórmula Manipulada'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSavePrescription} className="space-y-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-1">Título da Fórmula / Objetivo</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Mix Antioxidante, Pré-Treino, etc."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold"
                    />
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

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-black text-slate-400 uppercase">Substâncias e Dosagens</label>
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="text-[10px] font-black text-[#22B391] flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar Item
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Substância"
                          value={item.substance}
                          onChange={e => handleItemChange(index, 'substance', e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#22B391] font-bold text-sm"
                        />
                        <input 
                          type="text" 
                          placeholder="Dose (ex: 500mg)"
                          value={item.dosage}
                          onChange={e => handleItemChange(index, 'dosage', e.target.value)}
                          className="w-32 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-[#22B391] font-bold text-sm"
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-3 text-rose-400 hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dose Alerts */}
                {alerts.length > 0 && (
                  <div className="space-y-2">
                    {alerts.map((alert, idx) => (
                      <div key={idx} className={`flex items-start gap-2 p-3 rounded-xl border ${
                        alert.type === 'warning' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}>
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="text-xs font-bold">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Posologia (Como tomar)</label>
                  <textarea 
                    required
                    value={posology}
                    onChange={e => setPosology(e.target.value)}
                    placeholder="Ex: Tomar 1 cápsula em jejum, diariamente."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1">Observações Adicionais</label>
                  <textarea 
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                    placeholder="Ex: Evitar consumo com café, manter em local seco..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#22B391] font-bold h-20 resize-none"
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
                    {isEditing ? 'Atualizar Prescrição' : 'Salvar Prescrição'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrescriptionManipulados;

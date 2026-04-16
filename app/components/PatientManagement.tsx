'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  ArrowLeft,
  Save,
  Edit2,
  X,
  Plus,
  FileText,
  Activity,
  Target,
  History,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import PatientRegistrationForm from './PatientRegistrationForm';
import PatientProfile from './PatientProfile';
import { patientService, Patient } from '@/app/lib/patientService';

interface PatientManagementProps {
  nutriId: string;
  onBack?: () => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ nutriId, onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const fetchPatients = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getAll(nutriId);
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [nutriId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDeletePatient = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir este paciente? Esta ação é irreversível.')) return;

    try {
      await patientService.delete(id);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Erro ao excluir paciente.');
    }
  };

  const handleEditPatient = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setEditingPatient(patient);
    setIsAddingPatient(true);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isAddingPatient) {
    return (
      <PatientRegistrationForm 
        nutriId={nutriId}
        initialData={editingPatient}
        onSuccess={() => {
          setIsAddingPatient(false);
          setEditingPatient(null);
          fetchPatients();
        }}
        onCancel={() => {
          setIsAddingPatient(false);
          setEditingPatient(null);
        }}
      />
    );
  }
  if (selectedPatient) {
    return (
      <PatientProfile 
        patientId={selectedPatient.id}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0B2B24] mb-2">Gestão de Pacientes</h1>
          <p className="text-slate-500 font-medium">Gerencie e acompanhe a evolução de seus pacientes em tempo real.</p>
        </div>
        <button 
          onClick={() => setIsAddingPatient(true)}
          className="flex items-center gap-3 px-8 py-4 bg-[#22B391] text-white rounded-[1.5rem] font-black hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20"
        >
          <UserPlus className="w-6 h-6" />
          Novo Paciente
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou tag..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPatients.map((patient, i) => (
            <motion.div 
              key={patient.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedPatient(patient)}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 hover:border-[#22B391] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl group-hover:bg-[#22B391]/10 group-hover:text-[#22B391] transition-colors">
                  {patient.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 ${
                    patient.status === 'Ativo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {patient.status}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => handleEditPatient(e, patient)}
                      className="p-2 text-slate-300 hover:text-[#22B391] transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeletePatient(e, patient.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Excluir"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-[#0B2B24] mb-1 group-hover:text-[#22B391] transition-colors">{patient.name}</h3>
              <p className="text-slate-400 text-xs font-bold mb-6 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {patient.email}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Último Contato</p>
                  <p className="text-xs font-bold text-slate-600">{patient.last_contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status Atual</p>
                  <p className="text-xs font-bold text-[#22B391]">{patient.current_status}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Patient Modal removed - using full page form */}
      {onBack && (
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 px-8 py-4 text-slate-400 hover:text-[#22B391] hover:bg-[#22B391]/5 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Painel
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

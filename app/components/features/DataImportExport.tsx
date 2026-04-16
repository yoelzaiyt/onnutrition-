'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Users,
  DollarSign,
  Ruler,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService, ImportResult } from '@/app/lib/dataService';
import { toast } from 'react-hot-toast';

interface DataImportExportProps {
  nutriId: string;
}

type ExportType = 'patients' | 'anthropometry' | 'finance';

const EXPORT_OPTIONS = [
  { id: 'patients', label: 'Pacientes', icon: Users, description: 'Exportar todos os pacientes cadastrados' },
  { id: 'anthropometry', label: 'Antropometria', icon: Ruler, description: 'Exportar medidas corporais' },
  { id: 'finance', label: 'Financeiro', icon: DollarSign, description: 'Exportar histórico de pagamentos' },
];

export default function DataImportExport({ nutriId }: DataImportExportProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedExport, setSelectedExport] = useState<ExportType>('patients');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let result;
      switch (selectedExport) {
        case 'patients':
          result = await dataService.exportPatients(nutriId);
          break;
        case 'anthropometry':
          const patientIds = await dataService.getAllPatientIds(nutriId);
          result = await dataService.exportAnthropometry(patientIds);
          break;
        case 'finance':
          result = await dataService.exportFinance(nutriId);
          break;
      }
      
      const headers = result.type === 'patients' 
        ? ['name', 'email', 'phone', 'status', 'birth_date', 'gender', 'cpf', 'instagram', 'objective', 'activity_level', 'food_restrictions', 'observations', 'tags']
        : result.type === 'anthropometry'
        ? ['patient_id', 'date', 'weight', 'height', 'imc', 'fat_percentage', 'muscle_mass']
        : ['patient_name', 'amount', 'date', 'status', 'method', 'description'];
      
      const csvRows = [headers.join(',')];
      result.data.forEach((row: any) => {
        const values = headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          if (Array.isArray(val)) return val.join(';');
          return String(val);
        });
        csvRows.push(values.map((v: string) => {
          if (v.includes(',') || v.includes('"') || v.includes('\n')) {
            return `"${v.replace(/"/g, '""')}"`;
          }
          return v;
        }).join(','));
      });
      
      const csv = csvRows.join('\n');
      dataService.downloadCSV(csv, result.filename);
      toast.success(`${result.type} exportado com sucesso!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const content = await file.text();
      const result = await dataService.importPatients(nutriId, content);
      setImportResult(result);
      
      if (result.success) {
        toast.success(`${result.imported} paciente(s) importado(s) com sucesso!`);
      } else {
        toast.error(`${result.errors.length} erro(s) encontrado(s)`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar arquivo');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#0B2B24] mb-2">Importar / Exportar Dados</h2>
        <p className="text-slate-500 font-medium">Gerencie os dados do seu consultório</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mx-auto">
        <button
          onClick={() => { setActiveTab('export'); setImportResult(null); }}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'export' ? 'bg-white text-[#22B391] shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Download className="w-5 h-5" />
          Exportar
        </button>
        <button
          onClick={() => { setActiveTab('import'); setImportResult(null); }}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'import' ? 'bg-white text-[#22B391] shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Upload className="w-5 h-5" />
          Importar
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'export' ? (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
              <h3 className="text-xl font-black text-[#0B2B24] mb-6">Selecione o que exportar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EXPORT_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedExport(option.id as ExportType)}
                    className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                      selectedExport === option.id
                        ? 'border-[#22B391] bg-[#22B391]/5'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      selectedExport === option.id ? 'bg-[#22B391] text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <option.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-[#0B2B24] mb-1">{option.label}</h4>
                    <p className="text-xs text-slate-400 font-medium">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#22B391] text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#22B391]/20 hover:bg-[#1C9A7D] transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isExporting ? 'Exportando...' : 'Baixar Arquivo CSV'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
              <h3 className="text-xl font-black text-[#0B2B24] mb-4">Importar Pacientes</h3>
              <p className="text-slate-500 font-medium mb-6">
                Importe pacientes através de um arquivo CSV. O arquivo deve conter as colunas: <strong>name</strong> e <strong>email</strong> (obrigatórios).
              </p>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center cursor-pointer hover:border-[#22B391] hover:bg-[#22B391]/5 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-[#22B391]" />
                </div>
                <p className="text-sm font-bold text-slate-600 mb-1">
                  Clique para selecionar um arquivo CSV
                </p>
                <p className="text-xs text-slate-400">
                  ou arraste e solte aqui
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            {importResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-3xl p-8 ${
                  importResult.success
                    ? 'bg-emerald-50 border-2 border-emerald-200'
                    : 'bg-amber-50 border-2 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {importResult.success ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  )}
                  <div>
                    <h4 className="font-black text-lg text-[#0B2B24]">
                      {importResult.success ? 'Importação Concluída' : 'Importação com Erros'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {importResult.imported} paciente(s) importado(s)
                    </p>
                  </div>
                </div>
                
                {importResult.errors.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Erros encontrados:</p>
                    <ul className="space-y-1">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i} className="text-xs text-amber-800 flex items-center gap-2">
                          <XCircle className="w-3 h-3 shrink-0" />
                          {err}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="text-xs text-amber-700">
                          ...e mais {importResult.errors.length - 5} erro(s)
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Utensils,
  Target,
  FileText,
  Pill,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { patientService } from '@/app/lib/patientService';

const DEMO_PATIENTS = [
  { name: 'Maria Oliveira', email: 'maria.oliveira@email.com', phone: '(11) 98888-0001', gender: 'Feminino', birth_date: '1992-05-15', objective: 'Emagrecimento Saudável', activity_level: 'Moderado', food_restrictions: 'Lactose', history: 'Paciente com histórico de ganho de peso nos últimos 2 anos. Já tentou dieta Low Carb por conta própria sem sucesso.' },
  { name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 98888-0002', gender: 'Masculino', birth_date: '1985-08-22', objective: 'Hipertrofia Muscular', activity_level: 'Ativo', food_restrictions: '', history: 'Praticante de musculação há 3 anos. Busca orientação para ganho de massa magra.' },
  { name: 'Ana Costa', email: 'ana.costa@email.com', phone: '(11) 98888-0003', gender: 'Feminino', birth_date: '1990-03-10', objective: 'Manutenção de Peso', activity_level: 'Leve', food_restrictions: 'Glúten', history: 'Paciente celíaca. Busca manutenção do peso atual com alimentação balanceada.' },
  { name: 'Roberto Lima', email: 'roberto.lima@email.com', phone: '(11) 98888-0004', gender: 'Masculino', birth_date: '1978-11-25', objective: 'Controle de Diabetes', activity_level: 'Sedentário', food_restrictions: 'Açúcar', history: 'Diabetes Tipo 2 diagnosticado há 1 ano. Necessita controle glicêmico via alimentação.' },
  { name: 'Luciana Alves', email: 'luciana.alves@email.com', phone: '(11) 98888-0005', gender: 'Feminino', birth_date: '1995-01-30', objective: 'Emagrecimento Rápido', activity_level: 'Moderado', food_restrictions: '', history: 'Jornalista com rotina estressante. Dificuldade em manter alimentação equilibrada.' },
  { name: 'Carlos Souza', email: 'carlos.souza@email.com', phone: '(11) 98888-0006', gender: 'Masculino', birth_date: '1982-07-18', objective: 'Hipertrofia Muscular', activity_level: 'Muito Ativo', food_restrictions: 'Proteína do leite', history: 'Atleta amador de crossfit. Necessita orientação para suplementação e alimentação.' },
  { name: 'Beatriz Fernandes', email: 'beatriz.fernandes@email.com', phone: '(11) 98888-0007', gender: 'Feminino', birth_date: '1988-04-12', objective: 'Gestação Saudável', activity_level: 'Leve', food_restrictions: '', history: 'Gestante de 20 semanas. Busca alimentação adequada para gestação.' },
  { name: 'Felipe Rocha', email: 'felipe.rocha@email.com', phone: '(11) 98888-0008', gender: 'Masculino', birth_date: '1993-09-05', objective: 'Melhora de Performance', activity_level: 'Muito Ativo', food_restrictions: '', history: 'Corredor amador. Preparação para maratona. Necessita otimização energética.' },
];

interface TestDataGeneratorProps {
  nutriId: string;
}

export default function TestDataGenerator({ nutriId }: TestDataGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; patients: number; errors: string[] } | null>(null);

  const handleGenerate = async () => {
    if (!confirm('Isso criará dados de teste no banco de dados. Continuar?')) return;
    
    setIsGenerating(true);
    setResult(null);
    
    const errors: string[] = [];
    let created = 0;
    
    try {
      for (const patient of DEMO_PATIENTS) {
        try {
          await patientService.create({
            nutri_id: nutriId,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            birth_date: patient.birth_date,
            objective: patient.objective,
            activity_level: patient.activity_level,
            food_restrictions: patient.food_restrictions,
            history: patient.history,
            status: 'Ativo',
            current_status: 'Em Consulta',
          });
          created++;
        } catch (err) {
          errors.push(`Erro ao criar ${patient.name}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        }
      }
      
      setResult({
        success: errors.length === 0,
        patients: created,
        errors,
      });
    } catch (error) {
      setResult({
        success: false,
        patients: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-[#22B391] to-[#1C9A7D] rounded-2xl flex items-center justify-center">
          <Database className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#0B2B24]">Gerar Dados de Teste</h3>
          <p className="text-sm text-slate-500">Crie dados mockados para demonstração</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 mb-6">
        <h4 className="text-sm font-black text-[#0B2B24] mb-4">O que será criado:</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Users, label: '8 Pacientes', desc: 'Maria, João, Ana, Roberto...' },
            { icon: Utensils, label: 'Planos Alimentares', desc: 'Personalizados por objetivo' },
            { icon: Target, label: 'Metas', desc: 'Peso, alimentação, medidas' },
            { icon: FileText, label: 'Prontuários', desc: 'Histórico clínico completo' },
            { icon: Sparkles, label: 'Recomendações', desc: 'Orientação nutricional' },
            { icon: Pill, label: 'Manipulados', desc: 'Suplementação sugerida' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#22B391]">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B2B24]">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#22B391] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#22B391]/20 hover:bg-[#1C9A7D] transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando Dados...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Gerar Dados de Teste
          </>
        )}
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-6 rounded-2xl ${
            result.success 
              ? 'bg-emerald-50 border-2 border-emerald-200' 
              : 'bg-amber-50 border-2 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <p className="font-black text-[#0B2B24]">
                {result.success ? 'Dados gerados com sucesso!' : 'Processo concluído com erros'}
              </p>
              <p className="text-sm text-slate-600">
                {result.patients} paciente(s) criado(s)
              </p>
            </div>
          </div>
          
          {result.errors.length > 0 && (
            <div className="mt-4 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-amber-700">{err}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

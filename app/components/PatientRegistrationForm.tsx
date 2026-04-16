'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IMaskInput } from 'react-imask';
import { 
  User, 
  Phone, 
  Mail, 
  Instagram, 
  CreditCard, 
  Target, 
  Activity, 
  AlertTriangle, 
  Tag, 
  Send, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Validation Schema
const patientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  gender: z.enum(['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer']),
  birthDate: z.string().refine((date) => {
    const d = new Date(date);
    return d < new Date() && d > new Date('1900-01-01');
  }, 'Data de nascimento inválida'),
  phone: z.string().min(14, 'Telefone incompleto'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  instagram: z.string().optional(),
  cpf: z.string().optional().refine((cpf) => {
    if (!cpf) return true;
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    return true;
  }, 'CPF inválido'),
  objective: z.string().min(1, 'Selecione um objetivo'),
  activityLevel: z.string().min(1, 'Selecione o nível de atividade'),
  foodRestrictions: z.string().optional(),
  observations: z.string().optional(),
  tags: z.array(z.string()),
  sendWelcomeEmail: z.boolean(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientRegistrationFormProps {
  nutriId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ nutriId, initialData, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedObjective, setSuggestedObjective] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues: initialData ? {
      name: initialData.name || '',
      gender: initialData.gender || 'Feminino',
      birthDate: initialData.birth_date || '',
      phone: initialData.phone || '',
      email: initialData.email || '',
      instagram: initialData.instagram || '',
      cpf: initialData.cpf || '',
      objective: initialData.objective || '',
      activityLevel: initialData.activity_level || 'Sedentário',
      foodRestrictions: initialData.food_restrictions || '',
      observations: initialData.history || '',
      tags: initialData.tags || [],
      sendWelcomeEmail: initialData.welcome_email_sent || false,
    } : {
      name: '',
      gender: 'Feminino',
      birthDate: '',
      phone: '',
      email: '',
      instagram: '',
      cpf: '',
      objective: '',
      activityLevel: 'Sedentário',
      foodRestrictions: '',
      observations: '',
      tags: [],
      sendWelcomeEmail: true,
    }
  });

  const watchedBirthDate = watch('birthDate');
  const watchedObjective = watch('objective');
  const watchedActivityLevel = watch('activityLevel');
  const watchedTags = watch('tags');

  // Intelligent detection: Age inconsistency
  useEffect(() => {
    if (watchedBirthDate) {
      const birth = new Date(watchedBirthDate);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (age > 120) setAgeError('Idade parece inconsistente (>120 anos)');
      else if (age < 0) setAgeError('Data no futuro?');
      else setAgeError(null);

      // Suggest objective based on age
      if (age < 18 && !watchedObjective) {
        setSuggestedObjective('Crescimento e Desenvolvimento');
      } else if (age > 65 && !watchedObjective) {
        setSuggestedObjective('Longevidade e Saúde');
      } else {
        setSuggestedObjective(null);
      }
    }
  }, [watchedBirthDate, watchedObjective]);

  // Auto-suggest tags based on profile
  useEffect(() => {
    const newSuggestions: string[] = [];
    if (watchedObjective === 'Emagrecimento') newSuggestions.push('Low Carb', 'Déficit Calórico');
    if (watchedObjective === 'Hipertrofia') newSuggestions.push('Bulking', 'Proteico');
    if (watchedActivityLevel === 'Atleta') newSuggestions.push('Alta Performance', 'Suplementação');
    
    setSuggestedTags(newSuggestions.filter(tag => !watchedTags.includes(tag)));
  }, [watchedObjective, watchedActivityLevel, watchedTags]);

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const payload = {
          nutri_id: nutriId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          birth_date: data.birthDate,
          cpf: data.cpf,
          instagram: data.instagram,
          objective: data.objective,
          activity_level: data.activityLevel,
          food_restrictions: data.foodRestrictions,
          history: data.observations,
          tags: data.tags,
          welcome_email_sent: data.sendWelcomeEmail,
          status: initialData?.status || 'Ativo'
        };

        if (initialData?.id) {
          const { error } = await supabase
            .from('patients')
            .update(payload)
            .eq('id', initialData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('patients')
            .insert([payload]);
          if (error) throw error;
        }
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving patient:', err);
      alert('Erro ao salvar paciente. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (!watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag));
  };

  const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-[#22B391]/10 text-[#22B391] rounded-2xl flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-black text-[#0B2B24] tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B2B24] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#22B391]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <button 
              onClick={onCancel}
              className="flex items-center gap-2 text-[#22B391] mb-6 font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Novo Paciente ONNTRI</h1>
            <p className="text-white/60 font-medium">Preencha os dados para iniciar o acompanhamento inteligente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-16">
          
          {/* Section 1: Basic Data */}
          <section>
            <SectionTitle icon={User} title="Dados Básicos" subtitle="Informações essenciais" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo *</label>
                <div className="relative">
                  <input 
                    {...register('name')}
                    className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all font-medium ${
                      errors.name ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391]'
                    }`}
                    placeholder="Ex: Maria Oliveira"
                  />
                  {errors.name ? <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" /> : isValid && watch('name') ? <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#22B391]" /> : null}
                </div>
                {errors.name && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Gênero</label>
                  <select 
                    {...register('gender')}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium appearance-none"
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não dizer">Não informar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nascimento *</label>
                  <input 
                    type="date"
                    {...register('birthDate')}
                    className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all font-medium ${
                      errors.birthDate || ageError ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391]'
                    }`}
                  />
                  {(errors.birthDate || ageError) && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.birthDate?.message || ageError}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Contact */}
          <section>
            <SectionTitle icon={Phone} title="Contato" subtitle="Como falar com o paciente" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp / Celular *</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <IMaskInput
                      mask="(00) 00000-0000"
                      value={field.value}
                      onAccept={(value) => field.onChange(value)}
                      className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all font-medium ${
                        errors.phone ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391]'
                      }`}
                      placeholder="(00) 00000-0000"
                    />
                  )}
                />
                {errors.phone && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
                <input 
                  {...register('email')}
                  className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all font-medium ${
                    errors.email ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391]'
                  }`}
                  placeholder="paciente@email.com"
                />
                {errors.email && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    {...register('instagram')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium"
                    placeholder="@usuario"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Identification */}
          <section>
            <SectionTitle icon={CreditCard} title="Identificação" subtitle="Documentação e faturamento" />
            <div className="max-w-md space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CPF</label>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <IMaskInput
                    mask="000.000.000-00"
                    value={field.value}
                    onAccept={(value) => field.onChange(value)}
                    className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:outline-none transition-all font-medium ${
                      errors.cpf ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-100 focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391]'
                    }`}
                    placeholder="000.000.000-00"
                  />
                )}
              />
              {errors.cpf && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.cpf.message}</p>}
            </div>
          </section>

          {/* Section 4: Profile */}
          <section>
            <SectionTitle icon={Target} title="Perfil do Paciente" subtitle="Objetivos e estilo de vida" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Objetivo Principal *</label>
                <select 
                  {...register('objective')}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Saúde">Melhora da Saúde</option>
                  <option value="Performance">Performance Esportiva</option>
                  <option value="Longevidade">Longevidade</option>
                  <option value="Crescimento">Crescimento e Desenvolvimento</option>
                </select>
                {suggestedObjective && (
                  <button 
                    type="button"
                    onClick={() => setValue('objective', suggestedObjective)}
                    className="flex items-center gap-2 text-[#22B391] text-[10px] font-black uppercase tracking-widest mt-2 hover:opacity-80"
                  >
                    <Sparkles className="w-3 h-3" />
                    Sugestão IA: {suggestedObjective}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nível de Atividade</label>
                <select 
                  {...register('activityLevel')}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium appearance-none"
                >
                  <option value="Sedentário">Sedentário (Pouco ou nenhum exercício)</option>
                  <option value="Leve">Leve (1-3 dias/semana)</option>
                  <option value="Moderado">Moderado (3-5 dias/semana)</option>
                  <option value="Ativo">Ativo (6-7 dias/semana)</option>
                  <option value="Atleta">Atleta (2x ao dia)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Restrições Alimentares</label>
                <textarea 
                  {...register('foodRestrictions')}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all font-medium min-h-[80px]"
                  placeholder="Ex: Intolerância à lactose, Alergia a amendoim..."
                />
              </div>
            </div>
          </section>

          {/* Section 5: Organization */}
          <section>
            <SectionTitle icon={Tag} title="Organização" subtitle="Categorização inteligente" />
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {watchedTags.map(tag => (
                    <motion.span 
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-4 py-2 bg-[#22B391] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-200">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                <input 
                  type="text"
                  placeholder="Adicionar tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        addTag(val);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-[#22B391]"
                />
              </div>
              
              {suggestedTags.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-[#22B391]/5 rounded-2xl border border-[#22B391]/10">
                  <Sparkles className="w-4 h-4 text-[#22B391]" />
                  <span className="text-[10px] font-black text-[#22B391] uppercase tracking-widest">Sugestões:</span>
                  <div className="flex gap-2">
                    {suggestedTags.map(tag => (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 bg-white border border-[#22B391]/20 text-[#22B391] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#22B391] hover:text-white transition-all"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('sendWelcomeEmail')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22B391]"></div>
              </label>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B2B24] uppercase tracking-widest">Enviar boas-vindas</span>
                <span className="text-[10px] text-slate-400 font-bold">O paciente receberá acesso ao app por email</span>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`flex-1 md:flex-none px-12 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl ${
                  isValid && !isSubmitting 
                    ? 'bg-[#22B391] text-white hover:bg-[#1C9A7D] shadow-[#22B391]/20' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Cadastrar Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Productivity Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Info, text: "Use 'Enter' para adicionar tags rapidamente." },
          { icon: Sparkles, text: "A IA sugere objetivos com base na idade." },
          { icon: CheckCircle2, text: "Campos com borda verde estão validados." },
        ].map((tip, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-400">
            <tip.icon className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tip.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PatientRegistrationForm;

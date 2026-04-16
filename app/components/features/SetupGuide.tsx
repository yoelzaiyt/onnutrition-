'use client';

import React, { useState } from 'react';
import { Copy, Check, Database, Key, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface SetupGuideProps {
  onBack?: () => void;
}

const SetupGuide = ({ onBack }: SetupGuideProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const sqlScript = `-- Initial Schema for ONNutrition
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('nutri', 'patient', 'admin')),
    name TEXT,
    email TEXT,
    photo_url TEXT,
    gender TEXT,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patients table (managed by nutritionists)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'Interessado',
    current_status TEXT DEFAULT 'Ausente',
    value NUMERIC DEFAULT 0,
    last_contact DATE,
    photo_url TEXT,
    gender TEXT,
    birth_date DATE,
    age INTEGER,
    current_weight NUMERIC,
    target_weight NUMERIC,
    height NUMERIC,
    objective TEXT,
    history TEXT,
    cpf TEXT,
    instagram TEXT,
    activity_level TEXT,
    food_restrictions TEXT,
    welcome_email_sent BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    location TEXT,
    web_diet_access BOOLEAN DEFAULT false,
    chat_access BOOLEAN DEFAULT false,
    food_frequency_access BOOLEAN DEFAULT false,
    metabolic_tracking_access BOOLEAN DEFAULT false,
    dysbiosis_risk_access BOOLEAN DEFAULT false,
    water_alert_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Diet Plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    meals JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Progress Logs table
CREATE TABLE IF NOT EXISTS public.progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    weight NUMERIC,
    height NUMERIC,
    bmi NUMERIC,
    body_fat_percentage NUMERIC,
    muscle_mass_percentage NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meals table
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    photo_url TEXT,
    description TEXT,
    category TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nutritional_analysis JSONB,
    reactions JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb
);

-- Exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    type TEXT,
    duration INTEGER,
    calories_burned INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Anamnesis table
CREATE TABLE IF NOT EXISTS public.anamnesis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id),
    data JSONB NOT NULL,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clinical Notes table
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    type TEXT,
    content TEXT,
    professional TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT DEFAULT 'Agendado',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    calories INTEGER,
    prep_time TEXT,
    difficulty TEXT,
    category TEXT,
    image_url TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    instructions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutris can manage their own patients" ON public.patients FOR ALL USING (auth.uid() = nutri_id);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own meals" ON public.meals FOR ALL USING (auth.uid() = patient_id);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own exercises" ON public.exercises FOR ALL USING (auth.uid() = patient_id);

ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutris can manage patients anamnesis" ON public.anamnesis FOR ALL USING (auth.uid() = nutri_id);
CREATE POLICY "Patients can view own anamnesis" ON public.anamnesis FOR SELECT USING (auth.uid() = patient_id);

ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutris can manage patients clinical notes" ON public.clinical_notes FOR ALL USING (EXISTS (
    SELECT 1 FROM public.patients WHERE patients.id = clinical_notes.patient_id AND patients.nutri_id = auth.uid()
));

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutris can manage their diet plans" ON public.diet_plans FOR ALL USING (auth.uid() = nutri_id);
CREATE POLICY "Patients can view their own diet plans" ON public.diet_plans FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.patients WHERE patients.id = diet_plans.patient_id AND patients.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
));

ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutris can manage patients progress logs" ON public.progress_logs FOR ALL USING (EXISTS (
    SELECT 1 FROM public.patients WHERE patients.id = progress_logs.patient_id AND patients.nutri_id = auth.uid()
));
CREATE POLICY "Patients can view their own progress logs" ON public.progress_logs FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.patients WHERE patients.id = progress_logs.patient_id AND patients.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
));

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutris can manage their appointments" ON public.appointments FOR ALL USING (auth.uid() = nutri_id);
CREATE POLICY "Patients can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Nutris can manage recipes" ON public.recipes FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('nutri', 'admin')
));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, name)
    VALUES (new.id, new.email, 'patient', new.raw_user_meta_data->>'name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          <div className="bg-[#22B391] p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Database className="w-6 h-6" />
                </div>
                <span className="font-bold tracking-widest uppercase text-sm opacity-80">Configuração Necessária</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Conecte seu Banco de Dados <br/> para Começar
              </h1>
              <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
                O ONNutrition utiliza o Supabase para gerenciar seus pacientes e dados com segurança. 
                Siga os passos abaixo para ativar sua plataforma.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Step 1 */}
            <section>
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 bg-[#0B2B24] text-white rounded-xl flex items-center justify-center font-bold shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Obtenha suas Chaves no Supabase</h3>
                  <p className="text-slate-500 mb-6">Acesse seu painel do Supabase e copie as credenciais de API.</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#22B391] hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-[#22B391]" />
                        <span className="font-bold text-slate-700">Abrir Supabase</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#22B391] group-hover:translate-x-1 transition-all" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 bg-[#0B2B24] text-white rounded-xl flex items-center justify-center font-bold shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Configure os Segredos no AI Studio</h3>
                  <p className="text-slate-500 mb-6">Adicione as variáveis abaixo no painel de Segredos (⚙️ ícone de engrenagem no topo direito).</p>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Project URL' },
                      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Public Key' }
                    ].map((key) => (
                      <div key={key.name} className="flex items-center justify-between p-4 bg-[#0B2B24] rounded-2xl text-white font-mono text-sm">
                        <div className="flex flex-col">
                          <span className="text-[#22B391] text-xs font-bold uppercase mb-1">{key.label}</span>
                          <span>{key.name}</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(key.name, key.name)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {copied === key.name ? <Check className="w-4 h-4 text-[#22B391]" /> : <Copy className="w-4 h-4 opacity-50" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 bg-[#0B2B24] text-white rounded-xl flex items-center justify-center font-bold shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Prepare o Banco de Dados (SQL)</h3>
                  <p className="text-slate-500 mb-6">Copie o script abaixo e cole no <b>SQL Editor</b> do seu projeto no Supabase para criar as tabelas necessárias.</p>
                  
                  <div className="relative group">
                    <pre className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-xs font-mono text-slate-600 overflow-x-auto max-h-[300px] leading-relaxed">
                      {sqlScript}
                    </pre>
                    <button 
                      onClick={() => handleCopy(sqlScript, 'sql')}
                      className="absolute top-4 right-4 bg-white shadow-lg border border-slate-100 p-3 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs text-slate-700"
                    >
                      {copied === 'sql' ? (
                        <><Check className="w-4 h-4 text-[#22B391]" /> Copiado!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copiar SQL</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Seus dados são criptografados e seguros.</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    Voltar ao Painel
                  </button>
                )}
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  Continuar em Modo Demo
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-[#22B391] text-white rounded-2xl font-black hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20"
                >
                  Já configurei, atualizar app
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default SetupGuide;

-- ONNTRI SaaS Nutrition System - Database Schema

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'patient' CHECK (role IN ('nutri', 'patient', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender TEXT,
    birth_date DATE,
    cpf TEXT,
    instagram TEXT,
    objective TEXT,
    activity_level TEXT,
    food_restrictions TEXT,
    history TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Suspenso')),
    current_status TEXT DEFAULT 'Aguardando',
    welcome_email_sent BOOLEAN DEFAULT false,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT DEFAULT 'Presencial',
    status TEXT DEFAULT 'Agendada' CHECK (status IN ('Agendada', 'Realizada', 'Cancelada', 'Faltou')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Diet Plans Table (Normalized)
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    objective TEXT,
    type TEXT,
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fats INTEGER,
    hydration_goal INTEGER,
    observations TEXT,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Rascunho', 'Arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Meals Table
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_plan_id UUID REFERENCES public.diet_plans(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Meal Foods Table
CREATE TABLE IF NOT EXISTS public.meal_foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    calories NUMERIC DEFAULT 0,
    protein NUMERIC DEFAULT 0,
    carbs NUMERIC DEFAULT 0,
    fats NUMERIC DEFAULT 0,
    substitutions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_foods ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Diet Plans: Nutris can manage their own
CREATE POLICY "Nutris can manage own diet plans" ON public.diet_plans
    FOR ALL USING (auth.uid() = nutri_id);

-- Diet Plans: Patients can read their own
CREATE POLICY "Patients can read own diet plans" ON public.diet_plans
    FOR SELECT USING (auth.uid() = patient_id);

-- Meals: Nutris can manage meals of their diet plans
CREATE POLICY "Nutris can manage meals" ON public.meals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.diet_plans 
            WHERE diet_plans.id = meals.diet_plan_id 
            AND diet_plans.nutri_id = auth.uid()
        )
    );

-- 7. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Peso, Gordura, Calorias, Hidratação, etc.
    start_value NUMERIC NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    deadline DATE NOT NULL,
    status TEXT DEFAULT 'Em progresso' CHECK (status IN ('Em progresso', 'Atrasado', 'Concluído', 'Cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Goal Progress Table
CREATE TABLE IF NOT EXISTS public.goal_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    value NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Goals: Nutris can manage their own
CREATE POLICY "Nutris can manage own goals" ON public.goals
    FOR ALL USING (auth.uid() = nutri_id);

-- Goals: Patients can read their own
CREATE POLICY "Patients can read own goals" ON public.goals
    FOR SELECT USING (auth.uid() = patient_id);

-- 9. Compounded Prescriptions Table
CREATE TABLE IF NOT EXISTS public.compounded_prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    posology TEXT NOT NULL,
    observations TEXT,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Compounded Prescriptions Table
CREATE TABLE IF NOT EXISTS public.compounded_prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    posology TEXT NOT NULL,
    observations TEXT,
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Prescription Items Table
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID REFERENCES public.compounded_prescriptions(id) ON DELETE CASCADE NOT NULL,
    substance TEXT NOT NULL,
    dosage TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Medical Records Table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    clinical_history TEXT,
    nutritional_diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(patient_id)
);

-- 12. Clinical Notes Table
CREATE TABLE IF NOT EXISTS public.clinical_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Recommendations Table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Alimentação', 'Treino', 'Hábitos', 'Geral')),
    status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.compounded_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Nutris can manage own prescriptions" ON public.compounded_prescriptions
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can read own prescriptions" ON public.compounded_prescriptions
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Nutris can manage prescription items" ON public.prescription_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.compounded_prescriptions 
            WHERE compounded_prescriptions.id = prescription_items.prescription_id 
            AND compounded_prescriptions.nutri_id = auth.uid()
        )
    );

CREATE POLICY "Nutris can manage own medical records" ON public.medical_records
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can read own medical records" ON public.medical_records
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Nutris can manage own clinical notes" ON public.clinical_notes
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can read own clinical notes" ON public.clinical_notes
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Nutris can manage own recommendations" ON public.recommendations
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can read own recommendations" ON public.recommendations
    FOR SELECT USING (auth.uid() = patient_id);

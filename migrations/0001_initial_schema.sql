-- Initial Schema for ONNutrition

-- Enable UUID extension
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

-- Meals table
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL, -- Can be a patient from 'patients' table or a user from 'profiles'
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
    duration INTEGER, -- in minutes
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

-- Profiles: Users can read their own profile, Nutris can read their patients' profiles (if linked)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Patients: Nutris can manage their own patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutris can manage their own patients" ON public.patients
    FOR ALL USING (auth.uid() = nutri_id);

-- Meals: Nutris can view their patients' meals, Patients can view their own meals
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meals" ON public.meals
    FOR ALL USING (auth.uid() = patient_id);

-- Exercises: Same as meals
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own exercises" ON public.exercises
    FOR ALL USING (auth.uid() = patient_id);

-- Anamnesis: Nutris can manage their patients' anamnesis, Patients can view their own
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutris can manage patients anamnesis" ON public.anamnesis
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can view own anamnesis" ON public.anamnesis
    FOR SELECT USING (auth.uid() = patient_id);

-- Clinical Notes: Nutris can manage their patients' notes
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutris can manage patients clinical notes" ON public.clinical_notes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.patients 
        WHERE patients.id = clinical_notes.patient_id 
        AND patients.nutri_id = auth.uid()
    ));

-- Recipes: Everyone can read recipes, only Nutris/Admins can create
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view recipes" ON public.recipes
    FOR SELECT USING (true);

CREATE POLICY "Nutris can manage recipes" ON public.recipes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('nutri', 'admin')
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
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

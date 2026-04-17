-- Expanded Schema for ONNutrition Anamnesis Tools

-- 16. Weight Records
CREATE TABLE IF NOT EXISTS public.weight_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    current_weight NUMERIC,
    usual_weight NUMERIC,
    ideal_weight NUMERIC,
    date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 17. Clinical History
CREATE TABLE IF NOT EXISTS public.clinical_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    condition TEXT,
    diagnosis TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 18. Medications
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    dosage TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 19. Eating Habits
CREATE TABLE IF NOT EXISTS public.eating_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    meal_time TIME,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 20. Behavior (Sleep, Stress, Mood)
CREATE TABLE IF NOT EXISTS public.behavior (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    mood TEXT,
    stress_level INTEGER,
    sleep_hours NUMERIC,
    date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 21. Physical Activity
CREATE TABLE IF NOT EXISTS public.physical_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    duration INTEGER,
    date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 22. Hydration
CREATE TABLE IF NOT EXISTS public.hydration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    total_ml INTEGER,
    goal_ml INTEGER DEFAULT 2500,
    date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 23. Visual Assessment
CREATE TABLE IF NOT EXISTS public.visual_assessment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    type TEXT,
    image_url TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eating_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_assessment ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Auth required)
CREATE POLICY "Users can manage weight_records" ON public.weight_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage clinical_history" ON public.clinical_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage medications" ON public.medications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage eating_habits" ON public.eating_habits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage behavior" ON public.behavior FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage physical_activity" ON public.physical_activity FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage hydration" ON public.hydration FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage visual_assessment" ON public.visual_assessment FOR ALL USING (auth.role() = 'authenticated');

-- Extension for Patient Profile Module

-- Update patients table with new fields
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS last_access TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS app_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS questionnaire_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS educational_content_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS adherence_score INTEGER DEFAULT 0;

-- Patient Logs table
CREATE TABLE IF NOT EXISTS public.patient_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patient Actions table (for tracking specific tasks/goals)
CREATE TABLE IF NOT EXISTS public.patient_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patient Scores table (for historical tracking of engagement/adherence)
CREATE TABLE IF NOT EXISTS public.patient_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    engagement_score INTEGER,
    adherence_score INTEGER,
    recorded_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for new tables
ALTER TABLE public.patient_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_scores ENABLE ROW LEVEL SECURITY;

-- Nutris can manage their patients' logs/actions/scores
CREATE POLICY "Nutris can manage patient logs" ON public.patient_logs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.patients 
        WHERE patients.id = patient_logs.patient_id 
        AND patients.nutri_id = auth.uid()
    ));

CREATE POLICY "Nutris can manage patient actions" ON public.patient_actions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.patients 
        WHERE patients.id = patient_actions.patient_id 
        AND patients.nutri_id = auth.uid()
    ));

CREATE POLICY "Nutris can manage patient scores" ON public.patient_scores
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.patients 
        WHERE patients.id = patient_scores.patient_id 
        AND patients.nutri_id = auth.uid()
    ));

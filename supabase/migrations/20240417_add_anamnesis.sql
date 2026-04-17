-- 14. Anamnesis Records (Stores the Wizard Data)
CREATE TABLE IF NOT EXISTS public.anamnesis_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL, -- Full data object from the wizard
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Patient Access Tokens (For QR Code sharing)
CREATE TABLE IF NOT EXISTS public.patient_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.anamnesis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_access ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Nutris can manage anamnesis" ON public.anamnesis_records
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can read own anamnesis" ON public.anamnesis_records
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Nutris can manage access tokens" ON public.patient_access
    FOR ALL USING (auth.uid() = nutri_id);

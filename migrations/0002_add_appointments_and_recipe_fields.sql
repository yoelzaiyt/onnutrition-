-- Migration 0002: Add appointments and recipe fields
-- This migration adds the appointments table and missing fields to recipes

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutri_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID, -- Can be from patients or profiles
    patient_name TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT DEFAULT 'Agendado',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add created_by to recipes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recipes' AND column_name='created_by') THEN
        ALTER TABLE public.recipes ADD COLUMN created_by UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutris can manage their appointments" ON public.appointments
    FOR ALL USING (auth.uid() = nutri_id);

CREATE POLICY "Patients can view their appointments" ON public.appointments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.id = appointments.patient_id OR profiles.email = (SELECT email FROM public.patients WHERE id = appointments.patient_id))
    ));

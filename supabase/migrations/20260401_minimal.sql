-- ONNutrition - Minimal Migration
-- Execute este SQL no Supabase SQL Editor

-- Only add columns if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.patients ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
      ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.profiles ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.recipes ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.appointments ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anamnesis' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anamnesis' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.anamnesis ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anthropometry' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anthropometry' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.anthropometry ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagnosis_evolution' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_evolution' AND column_name = 'nutri_id') THEN
      ALTER TABLE public.diagnosis_evolution ADD COLUMN nutri_id uuid;
    END IF;
  END IF;
END $$;

-- Create missing tables
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    CREATE TABLE public.payments (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid,
      patient_id uuid,
      patient_name text,
      amount numeric not null,
      date date not null,
      status text default 'pendente',
      method text,
      description text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_diary_entries' AND table_schema = 'public') THEN
    CREATE TABLE public.food_diary_entries (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid,
      nutri_id uuid,
      date date not null,
      meal_type text not null,
      time text,
      foods text not null,
      portions text,
      calories numeric,
      protein numeric,
      carbs numeric,
      fat numeric,
      notes text,
      image_url text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diet_plans' AND table_schema = 'public') THEN
    CREATE TABLE public.diet_plans (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid,
      nutri_id uuid,
      name text not null,
      start_date date not null,
      end_date date,
      calories numeric,
      protein numeric,
      carbs numeric,
      fat numeric,
      observations text,
      meals jsonb,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions' AND table_schema = 'public') THEN
    CREATE TABLE public.prescriptions (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid,
      nutri_id uuid,
      date timestamptz default now(),
      prescription_type text,
      product_name text not null,
      dosage text,
      frequency text,
      duration text,
      instructions text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- Enable RLS on new tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    ALTER TABLE public.payments enable row level security;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_diary_entries' AND table_schema = 'public') THEN
    ALTER TABLE public.food_diary_entries enable row level security;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diet_plans' AND table_schema = 'public') THEN
    ALTER TABLE public.diet_plans enable row level security;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions' AND table_schema = 'public') THEN
    ALTER TABLE public.prescriptions enable row level security;
  END IF;
END $$;

-- Simple policies (allow all for now - can be locked later)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    drop policy if exists "Payments read" on public.payments;
    create policy "Payments read" on public.payments for select using (true);
    drop policy if exists "Payments insert" on public.payments;
    create policy "Payments insert" on public.payments for insert with check (true);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_diary_entries' AND table_schema = 'public') THEN
    drop policy if exists "FoodDiary read" on public.food_diary_entries;
    create policy "FoodDiary read" on public.food_diary_entries for select using (true);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diet_plans' AND table_schema = 'public') THEN
    drop policy if exists "DietPlans read" on public.diet_plans;
    create policy "DietPlans read" on public.diet_plans for select using (true);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions' AND table_schema = 'public') THEN
    drop policy if exists "Prescriptions read" on public.prescriptions;
    create policy "Prescriptions read" on public.prescriptions for select using (true);
  END IF;
END $$;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
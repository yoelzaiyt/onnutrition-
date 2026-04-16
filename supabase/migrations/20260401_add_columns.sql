-- ONNutrition - Add nutri_id column only
-- Execute este SQL no Supabase SQL Editor
-- Este script apenas adiciona a coluna nutri_id às tabelas existentes

-- Add nutri_id to profiles (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.profiles ADD COLUMN nutri_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name text;
  END IF;
END $$;

-- Add nutri_id to patients
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.patients ADD COLUMN nutri_id uuid;
  END IF;
END $$;

-- Add nutri_id to recipes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.recipes ADD COLUMN nutri_id uuid;
  END IF;
END $$;

-- Add nutri_id to appointments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.appointments ADD COLUMN nutri_id uuid;
  END IF;
END $$;

-- Add nutri_id to anamnesis
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anamnesis' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.anamnesis ADD COLUMN nutri_id uuid;
  END IF;
END $$;

-- Add nutri_id to anthropometry
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anthropometry' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.anthropometry ADD COLUMN nutri_id uuid;
  END IF;
END $$;

-- Add nutri_id to diagnosis_evolution
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_evolution' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.diagnosis_evolution ADD COLUMN nutri_id uuid;
  END IF;
END $$;

-- Create missing tables (without foreign keys)
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

-- Enable RLS
alter table public.payments enable row level security;
alter table public.food_diary_entries enable row level security;
alter table public.diet_plans enable row level security;
alter table public.prescriptions enable row level security;

-- Policies
create policy "Payments read" on public.payments for select using (true);
create policy "Payments insert" on public.payments for insert with check (true);
create policy "Payments update" on public.payments for update using (true);
create policy "Payments delete" on public.payments for delete using (true);

create policy "FoodDiary read" on public.food_diary_entries for select using (true);
create policy "FoodDiary insert" on public.food_diary_entries for insert with check (true);
create policy "FoodDiary update" on public.food_diary_entries for update using (true);
create policy "FoodDiary delete" on public.food_diary_entries for delete using (true);

create policy "DietPlans read" on public.diet_plans for select using (true);
create policy "DietPlans insert" on public.diet_plans for insert with check (true);
create policy "DietPlans update" on public.diet_plans for update using (true);
create policy "DietPlans delete" on public.diet_plans for delete using (true);

create policy "Prescriptions read" on public.prescriptions for select using (true);
create policy "Prescriptions insert" on public.prescriptions for insert with check (true);
create policy "Prescriptions update" on public.prescriptions for update using (true);
create policy "Prescriptions delete" on public.prescriptions for delete using (true);

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
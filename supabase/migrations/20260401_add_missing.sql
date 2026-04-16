-- ONNutrition - Add Missing Tables
-- Execute este SQL no Supabase SQL Editor para adicionar tabelas que faltam

-- ============================================
-- Adicionar nutri_id às tabelas existentes (se não existir)
-- ============================================

-- Add nutri_id to recipes if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.recipes ADD COLUMN nutri_id uuid references public.profiles(id) on delete cascade;
  END IF;
END $$;

-- Add nutri_id to appointments if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.appointments ADD COLUMN nutri_id uuid references public.profiles(id) on delete cascade;
  END IF;
END $$;

-- Add nutri_id to anamnesis if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anamnesis' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.anamnesis ADD COLUMN nutri_id uuid references public.profiles(id) on delete cascade;
  END IF;
END $$;

-- Add nutri_id to anthropometry if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anthropometry' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.anthropometry ADD COLUMN nutri_id uuid references public.profiles(id) on delete cascade;
  END IF;
END $$;

-- Add nutri_id to diagnosis_evolution if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diagnosis_evolution' AND column_name = 'nutri_id') THEN
    ALTER TABLE public.diagnosis_evolution ADD COLUMN nutri_id uuid references public.profiles(id) on delete cascade;
  END IF;
END $$;

-- ============================================
-- Criar tabelas que não existem
-- ============================================

-- Payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  nutri_id uuid references public.profiles(id) on delete cascade not null,
  patient_id uuid references public.patients(id) on delete cascade not null,
  patient_name text,
  amount numeric not null,
  date date not null,
  status text check (status in ('pago', 'pendente', 'atrasado')) default 'pendente',
  method text,
  description text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Food Diary table
create table if not exists public.food_diary_entries (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  nutri_id uuid references public.profiles(id) on delete cascade not null,
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
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Diet Plans table
create table if not exists public.diet_plans (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  nutri_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  observations text,
  meals jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Prescriptions table
create table if not exists public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  nutri_id uuid references public.profiles(id) on delete cascade not null,
  date timestamptz default timezone('utc'::text, now()) not null,
  prescription_type text check (prescription_type in ('suplemento', 'farmaco', 'preparado', 'dieta')),
  product_name text not null,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- ============================================
-- HABILITAR RLS NAS NOVAS TABELAS
-- ============================================
alter table public.payments enable row level security;
alter table public.food_diary_entries enable row level security;
alter table public.diet_plans enable row level security;
alter table public.prescriptions enable row level security;

-- ============================================
-- POLICIAS RLS
-- ============================================

-- Payments
create policy "Payments read own" on public.payments for select using (auth.uid() = nutri_id);
create policy "Payments insert own" on public.payments for insert with check (auth.uid() = nutri_id);
create policy "Payments update own" on public.payments for update using (auth.uid() = nutri_id);
create policy "Payments delete own" on public.payments for delete using (auth.uid() = nutri_id);

-- Food Diary
create policy "FoodDiary read own" on public.food_diary_entries for select using (auth.uid() = nutri_id);
create policy "FoodDiary insert own" on public.food_diary_entries for insert with check (auth.uid() = nutri_id);
create policy "FoodDiary update own" on public.food_diary_entries for update using (auth.uid() = nutri_id);
create policy "FoodDiary delete own" on public.food_diary_entries for delete using (auth.uid() = nutri_id);

-- Diet Plans
create policy "DietPlans read own" on public.diet_plans for select using (auth.uid() = nutri_id);
create policy "DietPlans insert own" on public.diet_plans for insert with check (auth.uid() = nutri_id);
create policy "DietPlans update own" on public.diet_plans for update using (auth.uid() = nutri_id);
create policy "DietPlans delete own" on public.diet_plans for delete using (auth.uid() = nutri_id);

-- Prescriptions
create policy "Prescriptions read own" on public.prescriptions for select using (auth.uid() = nutri_id);
create policy "Prescriptions insert own" on public.prescriptions for insert with check (auth.uid() = nutri_id);
create policy "Prescriptions update own" on public.prescriptions for update using (auth.uid() = nutri_id);
create policy "Prescriptions delete own" on public.prescriptions for delete using (auth.uid() = nutri_id);

-- ============================================
-- ÍNDICES
-- ============================================
create index if not exists idx_payments_nutri on public.payments(nutri_id);
create index if not exists idx_payments_patient on public.payments(patient_id);
create index if not exists idx_food_diary_patient on public.food_diary_entries(patient_id);
create index if not exists idx_food_diary_date on public.food_diary_entries(date);

-- ============================================
-- PERMISSÕES
-- ============================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
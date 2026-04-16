-- ONNutrition - Ultra Safe Migration
-- Execute este SQL no Supabase SQL Editor
-- Este script é completamente seguro - não falha mesmo se tabelas já existirem

-- 1. PROFILES
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    CREATE TABLE public.profiles (
      id uuid references auth.users on delete cascade primary key,
      email text unique not null,
      full_name text,
      role text default 'nutri',
      phone text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- 2. PATIENTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND table_schema = 'public') THEN
    CREATE TABLE public.patients (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid,
      name text not null,
      email text,
      phone text,
      gender text,
      birth_date date,
      cpf text,
      instagram text,
      objective text,
      activity_level text,
      food_restrictions text,
      history text,
      tags text[],
      status text default 'Ativo',
      current_status text default 'Aguardando',
      last_contact date,
      photo_url text,
      age int,
      current_weight numeric,
      target_weight numeric,
      height numeric,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- 3. PAYMENTS
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

-- 4. FOOD DIARY
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

-- 5. APPOINTMENTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public') THEN
    CREATE TABLE public.appointments (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid,
      patient_id uuid,
      title text not null,
      date timestamptz not null,
      duration int default 60,
      type text,
      status text default 'agendado',
      notes text,
      meeting_link text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- 6. ANAMNESIS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anamnesis' AND table_schema = 'public') THEN
    CREATE TABLE public.anamnesis (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid,
      nutri_id uuid,
      date timestamptz default now(),
      chief_complaint text,
      medical_history text,
      family_history text,
      surgical_history text,
      medications text,
      allergies text,
      eating_habits text,
      lifestyle text,
      physical_activity text,
      sleep_quality text,
      stress_level text,
      water_intake text,
      bowel_function text,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- 7. ANTHROPOMETRY
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anthropometry' AND table_schema = 'public') THEN
    CREATE TABLE public.anthropometry (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid,
      nutri_id uuid,
      date timestamptz default now(),
      weight numeric,
      height numeric,
      bmi numeric,
      waist_circumference numeric,
      hip_circumference numeric,
      arm_circumference numeric,
      skinfolds jsonb,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- 8. DIAGNOSIS EVOLUTION
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagnosis_evolution' AND table_schema = 'public') THEN
    CREATE TABLE public.diagnosis_evolution (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid,
      nutri_id uuid,
      date timestamptz default now(),
      evolution text not null,
      diagnosis text,
      plan text,
      next_appointment date,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- 9. DIET PLANS
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

-- 10. PRESCRIPTIONS
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

-- 11. RECIPES
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes' AND table_schema = 'public') THEN
    CREATE TABLE public.recipes (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid,
      title text not null,
      description text,
      category text,
      prep_time numeric,
      servings numeric,
      calories numeric,
      protein numeric,
      carbs numeric,
      fat numeric,
      ingredients text[],
      instructions text,
      image_url text,
      tags text[],
      is_public boolean default false,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  END IF;
EXCEPTION WHEN duplicate_table THEN null;
END $$;

-- ============================================
-- HABILITAR RLS
-- ============================================
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.payments enable row level security;
alter table public.food_diary_entries enable row level security;
alter table public.appointments enable row level security;
alter table public.anamnesis enable row level security;
alter table public.anthropometry enable row level security;
alter table public.diagnosis_evolution enable row level security;
alter table public.diet_plans enable row level security;
alter table public.prescriptions enable row level security;
alter table public.recipes enable row level security;

-- ============================================
-- POLICIES (ignora se já existir)
-- ============================================
-- Profiles
drop policy if exists "Profile read own" on public.profiles;
create policy "Profile read own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Profile update own" on public.profiles;
create policy "Profile update own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Profile insert own" on public.profiles;
create policy "Profile insert own" on public.profiles for insert with check (auth.uid() = id);

-- Patients
drop policy if exists "Patients read own" on public.patients;
create policy "Patients read own" on public.patients for select using (auth.uid() = nutri_id);
drop policy if exists "Patients insert own" on public.patients;
create policy "Patients insert own" on public.patients for insert with check (auth.uid() = nutri_id);
drop policy if exists "Patients update own" on public.patients;
create policy "Patients update own" on public.patients for update using (auth.uid() = nutri_id);
drop policy if exists "Patients delete own" on public.patients;
create policy "Patients delete own" on public.patients for delete using (auth.uid() = nutri_id);

-- Payments
drop policy if exists "Payments read own" on public.payments;
create policy "Payments read own" on public.payments for select using (auth.uid() = nutri_id);
drop policy if exists "Payments insert own" on public.payments;
create policy "Payments insert own" on public.payments for insert with check (auth.uid() = nutri_id);
drop policy if exists "Payments update own" on public.payments;
create policy "Payments update own" on public.payments for update using (auth.uid() = nutri_id);
drop policy if exists "Payments delete own" on public.payments;
create policy "Payments delete own" on public.payments for delete using (auth.uid() = nutri_id);

-- Food Diary
drop policy if exists "FoodDiary read own" on public.food_diary_entries;
create policy "FoodDiary read own" on public.food_diary_entries for select using (auth.uid() = nutri_id);
drop policy if exists "FoodDiary insert own" on public.food_diary_entries;
create policy "FoodDiary insert own" on public.food_diary_entries for insert with check (auth.uid() = nutri_id);
drop policy if exists "FoodDiary update own" on public.food_diary_entries;
create policy "FoodDiary update own" on public.food_diary_entries for update using (auth.uid() = nutri_id);
drop policy if exists "FoodDiary delete own" on public.food_diary_entries;
create policy "FoodDiary delete own" on public.food_diary_entries for delete using (auth.uid() = nutri_id);

-- Appointments
drop policy if exists "Appointments read own" on public.appointments;
create policy "Appointments read own" on public.appointments for select using (auth.uid() = nutri_id);
drop policy if exists "Appointments insert own" on public.appointments;
create policy "Appointments insert own" on public.appointments for insert with check (auth.uid() = nutri_id);
drop policy if exists "Appointments update own" on public.appointments;
create policy "Appointments update own" on public.appointments for update using (auth.uid() = nutri_id);
drop policy if exists "Appointments delete own" on public.appointments;
create policy "Appointments delete own" on public.appointments for delete using (auth.uid() = nutri_id);

-- Anamnesis
drop policy if exists "Anamnesis read own" on public.anamnesis;
create policy "Anamnesis read own" on public.anamnesis for select using (auth.uid() = nutri_id);
drop policy if exists "Anamnesis insert own" on public.anamnesis;
create policy "Anamnesis insert own" on public.anamnesis for insert with check (auth.uid() = nutri_id);
drop policy if exists "Anamnesis update own" on public.anamnesis;
create policy "Anamnesis update own" on public.anamnesis for update using (auth.uid() = nutri_id);
drop policy if exists "Anamnesis delete own" on public.anamnesis;
create policy "Anamnesis delete own" on public.anamnesis for delete using (auth.uid() = nutri_id);

-- Anthropometry
drop policy if exists "Anthropometry read own" on public.anthropometry;
create policy "Anthropometry read own" on public.anthropometry for select using (auth.uid() = nutri_id);
drop policy if exists "Anthropometry insert own" on public.anthropometry;
create policy "Anthropometry insert own" on public.anthropometry for insert with check (auth.uid() = nutri_id);
drop policy if exists "Anthropometry update own" on public.anthropometry;
create policy "Anthropometry update own" on public.anthropometry for update using (auth.uid() = nutri_id);
drop policy if exists "Anthropometry delete own" on public.anthropometry;
create policy "Anthropometry delete own" on public.anthropometry for delete using (auth.uid() = nutri_id);

-- Diagnosis Evolution
drop policy if exists "Diagnosis read own" on public.diagnosis_evolution;
create policy "Diagnosis read own" on public.diagnosis_evolution for select using (auth.uid() = nutri_id);
drop policy if exists "Diagnosis insert own" on public.diagnosis_evolution;
create policy "Diagnosis insert own" on public.diagnosis_evolution for insert with check (auth.uid() = nutri_id);
drop policy if exists "Diagnosis update own" on public.diagnosis_evolution;
create policy "Diagnosis update own" on public.diagnosis_evolution for update using (auth.uid() = nutri_id);
drop policy if exists "Diagnosis delete own" on public.diagnosis_evolution;
create policy "Diagnosis delete own" on public.diagnosis_evolution for delete using (auth.uid() = nutri_id);

-- Diet Plans
drop policy if exists "DietPlans read own" on public.diet_plans;
create policy "DietPlans read own" on public.diet_plans for select using (auth.uid() = nutri_id);
drop policy if exists "DietPlans insert own" on public.diet_plans;
create policy "DietPlans insert own" on public.diet_plans for insert with check (auth.uid() = nutri_id);
drop policy if exists "DietPlans update own" on public.diet_plans;
create policy "DietPlans update own" on public.diet_plans for update using (auth.uid() = nutri_id);
drop policy if exists "DietPlans delete own" on public.diet_plans;
create policy "DietPlans delete own" on public.diet_plans for delete using (auth.uid() = nutri_id);

-- Prescriptions
drop policy if exists "Prescriptions read own" on public.prescriptions;
create policy "Prescriptions read own" on public.prescriptions for select using (auth.uid() = nutri_id);
drop policy if exists "Prescriptions insert own" on public.prescriptions;
create policy "Prescriptions insert own" on public.prescriptions for insert with check (auth.uid() = nutri_id);
drop policy if exists "Prescriptions update own" on public.prescriptions;
create policy "Prescriptions update own" on public.prescriptions for update using (auth.uid() = nutri_id);
drop policy if exists "Prescriptions delete own" on public.prescriptions;
create policy "Prescriptions delete own" on public.prescriptions for delete using (auth.uid() = nutri_id);

-- Recipes
drop policy if exists "Recipes read own" on public.recipes;
create policy "Recipes read own" on public.recipes for select using (auth.uid() = nutri_id OR is_public = true);
drop policy if exists "Recipes insert own" on public.recipes;
create policy "Recipes insert own" on public.recipes for insert with check (auth.uid() = nutri_id);
drop policy if exists "Recipes update own" on public.recipes;
create policy "Recipes update own" on public.recipes for update using (auth.uid() = nutri_id);
drop policy if exists "Recipes delete own" on public.recipes;
create policy "Recipes delete own" on public.recipes for delete using (auth.uid() = nutri_id);

-- ============================================
-- Trigger para novos usuários
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'nutri'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Permissões
-- ============================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
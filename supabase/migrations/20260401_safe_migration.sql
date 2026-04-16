-- ONNutrition - Safe Migration
-- Execute este SQL no Supabase SQL Editor

-- ============================================
-- Verificar e criar perfil se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    create table public.profiles (
      id uuid references auth.users on delete cascade primary key,
      email text unique not null,
      full_name text,
      role text check (role in ('admin', 'nutri', 'patient')) default 'nutri',
      phone text,
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.profiles enable row level security;
    create policy "Profile read own" on public.profiles for select using (auth.uid() = id);
    create policy "Profile update own" on public.profiles for update using (auth.uid() = id);
    create policy "Profile insert own" on public.profiles for insert with check (auth.uid() = id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar patients se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients' AND table_schema = 'public') THEN
    create table public.patients (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid references public.profiles(id) on delete cascade not null,
      name text not null,
      email text,
      phone text,
      gender text check (gender in ('male', 'female', 'other')),
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
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.patients enable row level security;
    create policy "Patients read own" on public.patients for select using (auth.uid() = nutri_id);
    create policy "Patients insert own" on public.patients for insert with check (auth.uid() = nutri_id);
    create policy "Patients update own" on public.patients for update using (auth.uid() = nutri_id);
    create policy "Patients delete own" on public.patients for delete using (auth.uid() = nutri_id);
    create index idx_patients_nutri on public.patients(nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar payments se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    create table public.payments (
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
    alter table public.payments enable row level security;
    create policy "Payments read own" on public.payments for select using (auth.uid() = nutri_id);
    create policy "Payments insert own" on public.payments for insert with check (auth.uid() = nutri_id);
    create policy "Payments update own" on public.payments for update using (auth.uid() = nutri_id);
    create policy "Payments delete own" on public.payments for delete using (auth.uid() = nutri_id);
    create index idx_payments_nutri on public.payments(nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar food_diary_entries se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_diary_entries' AND table_schema = 'public') THEN
    create table public.food_diary_entries (
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
    alter table public.food_diary_entries enable row level security;
    create policy "FoodDiary read own" on public.food_diary_entries for select using (auth.uid() = nutri_id);
    create policy "FoodDiary insert own" on public.food_diary_entries for insert with check (auth.uid() = nutri_id);
    create policy "FoodDiary update own" on public.food_diary_entries for update using (auth.uid() = nutri_id);
    create policy "FoodDiary delete own" on public.food_diary_entries for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar appointments se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public') THEN
    create table public.appointments (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid references public.profiles(id) on delete cascade not null,
      patient_id uuid references public.patients(id) on delete cascade,
      title text not null,
      date timestamptz not null,
      duration int default 60,
      type text check (type in ('consulta', 'retorno', 'followup', 'avaliacao')),
      status text check (status in ('agendado', 'confirmado', 'realizado', 'cancelado', 'ausente')) default 'agendado',
      notes text,
      meeting_link text,
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.appointments enable row level security;
    create policy "Appointments read own" on public.appointments for select using (auth.uid() = nutri_id);
    create policy "Appointments insert own" on public.appointments for insert with check (auth.uid() = nutri_id);
    create policy "Appointments update own" on public.appointments for update using (auth.uid() = nutri_id);
    create policy "Appointments delete own" on public.appointments for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar anamnesis se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anamnesis' AND table_schema = 'public') THEN
    create table public.anamnesis (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid references public.patients(id) on delete cascade not null,
      nutri_id uuid references public.profiles(id) on delete cascade not null,
      date timestamptz default timezone('utc'::text, now()) not null,
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
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.anamnesis enable row level security;
    create policy "Anamnesis read own" on public.anamnesis for select using (auth.uid() = nutri_id);
    create policy "Anamnesis insert own" on public.anamnesis for insert with check (auth.uid() = nutri_id);
    create policy "Anamnesis update own" on public.anamnesis for update using (auth.uid() = nutri_id);
    create policy "Anamnesis delete own" on public.anamnesis for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar anthropometry se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anthropometry' AND table_schema = 'public') THEN
    create table public.anthropometry (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid references public.patients(id) on delete cascade not null,
      nutri_id uuid references public.profiles(id) on delete cascade not null,
      date timestamptz default timezone('utc'::text, now()) not null,
      weight numeric,
      height numeric,
      bmi numeric,
      waist_circumference numeric,
      hip_circumference numeric,
      arm_circumference numeric,
      skinfolds jsonb,
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.anthropometry enable row level security;
    create policy "Anthropometry read own" on public.anthropometry for select using (auth.uid() = nutri_id);
    create policy "Anthropometry insert own" on public.anthropometry for insert with check (auth.uid() = nutri_id);
    create policy "Anthropometry update own" on public.anthropometry for update using (auth.uid() = nutri_id);
    create policy "Anthropometry delete own" on public.anthropometry for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar diagnosis_evolution se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagnosis_evolution' AND table_schema = 'public') THEN
    create table public.diagnosis_evolution (
      id uuid default gen_random_uuid() primary key,
      patient_id uuid references public.patients(id) on delete cascade not null,
      nutri_id uuid references public.profiles(id) on delete cascade not null,
      date timestamptz default timezone('utc'::text, now()) not null,
      evolution text not null,
      diagnosis text,
      plan text,
      next_appointment date,
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.diagnosis_evolution enable row level security;
    create policy "Diagnosis read own" on public.diagnosis_evolution for select using (auth.uid() = nutri_id);
    create policy "Diagnosis insert own" on public.diagnosis_evolution for insert with check (auth.uid() = nutri_id);
    create policy "Diagnosis update own" on public.diagnosis_evolution for update using (auth.uid() = nutri_id);
    create policy "Diagnosis delete own" on public.diagnosis_evolution for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar diet_plans se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diet_plans' AND table_schema = 'public') THEN
    create table public.diet_plans (
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
    alter table public.diet_plans enable row level security;
    create policy "DietPlans read own" on public.diet_plans for select using (auth.uid() = nutri_id);
    create policy "DietPlans insert own" on public.diet_plans for insert with check (auth.uid() = nutri_id);
    create policy "DietPlans update own" on public.diet_plans for update using (auth.uid() = nutri_id);
    create policy "DietPlans delete own" on public.diet_plans for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar prescriptions se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions' AND table_schema = 'public') THEN
    create table public.prescriptions (
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
    alter table public.prescriptions enable row level security;
    create policy "Prescriptions read own" on public.prescriptions for select using (auth.uid() = nutri_id);
    create policy "Prescriptions insert own" on public.prescriptions for insert with check (auth.uid() = nutri_id);
    create policy "Prescriptions update own" on public.prescriptions for update using (auth.uid() = nutri_id);
    create policy "Prescriptions delete own" on public.prescriptions for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Verificar e criar recipes se não existir
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes' AND table_schema = 'public') THEN
    create table public.recipes (
      id uuid default gen_random_uuid() primary key,
      nutri_id uuid references public.profiles(id) on delete cascade not null,
      title text not null,
      description text,
      category text,
      prep_time numeric,
      servings numeric,
      calories numeric,
      protein numeric,
      carbs numeric,
      fat numeric,
      ingredients text[] not null,
      instructions text,
      image_url text,
      tags text[],
      is_public boolean default false,
      created_at timestamptz default timezone('utc'::text, now()) not null,
      updated_at timestamptz default timezone('utc'::text, now()) not null
    );
    alter table public.recipes enable row level security;
    create policy "Recipes read own" on public.recipes for select using (auth.uid() = nutri_id OR is_public = true);
    create policy "Recipes insert own" on public.recipes for insert with check (auth.uid() = nutri_id);
    create policy "Recipes update own" on public.recipes for update using (auth.uid() = nutri_id);
    create policy "Recipes delete own" on public.recipes for delete using (auth.uid() = nutri_id);
  END IF;
END $$;

-- ============================================
-- Função para novo usuário
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
-- Permissões finais
-- ============================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
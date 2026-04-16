-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('admin', 'user')) default 'user'
);

-- Create patients table
create table public.patients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  birth_date date,
  gender text check (gender in ('male', 'female', 'other')),
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create anamnesis table
create table public.anamnesis (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients on delete cascade not null,
  date timestamp with time zone not null,
  complaints text,
  history text,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create anthropometry table
create table public.anthropometry (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients on delete cascade not null,
  date timestamp with time zone not null,
  weight numeric not null,
  height numeric not null,
  bmi numeric,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create diagnosis_evolution table
create table public.diagnosis_evolution (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients on delete cascade not null,
  date timestamp with time zone not null,
  evolution text not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create compounded_prescriptions table
create table public.compounded_prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients on delete cascade not null,
  date timestamp with time zone not null,
  formula text not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_lists table
create table public.product_lists (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients on delete cascade not null,
  date timestamp with time zone not null,
  products text not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.anamnesis enable row level security;
alter table public.anthropometry enable row level security;
alter table public.diagnosis_evolution enable row level security;
alter table public.compounded_prescriptions enable row level security;
alter table public.product_lists enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Policies for patients
create policy "Users can view their own patients." on public.patients
  for select using (auth.uid() = created_by);

create policy "Users can insert their own patients." on public.patients
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own patients." on public.patients
  for update using (auth.uid() = created_by);

create policy "Users can delete their own patients." on public.patients
  for delete using (auth.uid() = created_by);

-- Policies for anamnesis
create policy "Users can view their own anamnesis." on public.anamnesis
  for select using (auth.uid() = created_by);

create policy "Users can insert their own anamnesis." on public.anamnesis
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own anamnesis." on public.anamnesis
  for update using (auth.uid() = created_by);

create policy "Users can delete their own anamnesis." on public.anamnesis
  for delete using (auth.uid() = created_by);

-- Policies for anthropometry
create policy "Users can view their own anthropometry." on public.anthropometry
  for select using (auth.uid() = created_by);

create policy "Users can insert their own anthropometry." on public.anthropometry
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own anthropometry." on public.anthropometry
  for update using (auth.uid() = created_by);

create policy "Users can delete their own anthropometry." on public.anthropometry
  for delete using (auth.uid() = created_by);

-- Policies for diagnosis_evolution
create policy "Users can view their own diagnosis_evolution." on public.diagnosis_evolution
  for select using (auth.uid() = created_by);

create policy "Users can insert their own diagnosis_evolution." on public.diagnosis_evolution
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own diagnosis_evolution." on public.diagnosis_evolution
  for update using (auth.uid() = created_by);

create policy "Users can delete their own diagnosis_evolution." on public.diagnosis_evolution
  for delete using (auth.uid() = created_by);

-- Policies for compounded_prescriptions
create policy "Users can view their own compounded_prescriptions." on public.compounded_prescriptions
  for select using (auth.uid() = created_by);

create policy "Users can insert their own compounded_prescriptions." on public.compounded_prescriptions
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own compounded_prescriptions." on public.compounded_prescriptions
  for update using (auth.uid() = created_by);

create policy "Users can delete their own compounded_prescriptions." on public.compounded_prescriptions
  for delete using (auth.uid() = created_by);

-- Policies for product_lists
create policy "Users can view their own product_lists." on public.product_lists
  for select using (auth.uid() = created_by);

create policy "Users can insert their own product_lists." on public.product_lists
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own product_lists." on public.product_lists
  for update using (auth.uid() = created_by);

create policy "Users can delete their own product_lists." on public.product_lists
  for delete using (auth.uid() = created_by);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

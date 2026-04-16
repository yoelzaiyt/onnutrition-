-- Initial migration to set up the database schema

-- Create a profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  role TEXT DEFAULT 'patient',
  web_diet_access BOOLEAN DEFAULT false,
  chat_access BOOLEAN DEFAULT false,
  food_frequency_access BOOLEAN DEFAULT false,
  metabolic_tracking_access BOOLEAN DEFAULT false,
  dysbiosis_risk_access BOOLEAN DEFAULT false,
  water_alert_access BOOLEAN DEFAULT false,
  has_logged_in BOOLEAN DEFAULT false,
  tele_link TEXT,
  nutri_id UUID REFERENCES profiles(id),

  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT role_check CHECK (role IN ('nutri', 'patient'))
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create an anamnesis table
CREATE TABLE IF NOT EXISTS anamnesis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nutri_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up RLS for anamnesis
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;

-- Create policies for anamnesis
CREATE POLICY "Users can view their own anamnesis." ON anamnesis
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = nutri_id);

CREATE POLICY "Nutris can insert anamnesis for patients." ON anamnesis
  FOR INSERT WITH CHECK (auth.uid() = nutri_id);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT,
  description TEXT,
  category TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  nutritional_analysis JSONB,
  reactions JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meals." ON meals
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = meals.patient_id AND nutri_id = auth.uid()
  ));

CREATE POLICY "Patients can insert their own meals." ON meals
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients and their nutris can update meals." ON meals
  FOR UPDATE USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = meals.patient_id AND nutri_id = auth.uid()
  ));

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  duration INTEGER,
  calories_burned INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercises." ON exercises
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = exercises.patient_id AND nutri_id = auth.uid()
  ));

CREATE POLICY "Patients can insert their own exercises." ON exercises
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  prep_time TEXT,
  difficulty TEXT,
  category TEXT,
  image TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are viewable by everyone." ON recipes
  FOR SELECT USING (true);

-- Create clinical_notes table
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nutri_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  type TEXT,
  content TEXT,
  professional TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clinical notes." ON clinical_notes
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = nutri_id);

CREATE POLICY "Nutris can insert clinical notes." ON clinical_notes
  FOR INSERT WITH CHECK (auth.uid() = nutri_id);

-- Create lab_exams table
CREATE TABLE IF NOT EXISTS lab_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  result TEXT,
  reference TEXT,
  status TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE lab_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lab exams." ON lab_exams
  FOR SELECT USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = lab_exams.patient_id AND nutri_id = auth.uid()
  ));

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'patient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

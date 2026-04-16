-- Módulo Infantil - Tabelas Supabase
-- Execute este script no Supabase SQL Editor

-- Tabela de perfis infantis
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  sex TEXT CHECK (sex IN ('male', 'female')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de medidas de crescimento
CREATE TABLE IF NOT EXISTS child_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,1),
  head_circumference_cm DECIMAL(5,1),
  imi DECIMAL(5,2),
  percentile_weight_age DECIMAL(5,1),
  percentile_height_age DECIMAL(5,1),
  percentile_imc_age DECIMAL(5,1),
  classification TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de alimentação infantil
CREATE TABLE IF NOT EXISTS child_diet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  nutritionist_id UUID REFERENCES profiles(id),
  diet_type TEXT,
  feeding_frequency TEXT,
  breastfeeding BOOLEAN DEFAULT false,
  introduced_foods TEXT[],
  restrictions TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  meals JSONB,
  nutritional_targets JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de refeições infantis
CREATE TABLE IF NOT EXISTS child_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  meal_name TEXT NOT NULL,
  meal_time TIMESTAMPTZ NOT NULL,
  foods JSONB NOT NULL,
  calories DECIMAL(6,2),
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  notes TEXT,
  status TEXT DEFAULT 'consumed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_diet ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_meals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- child_profiles
CREATE POLICY "Parents can manage own children" ON child_profiles
  FOR ALL USING (auth.uid() = parent_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutri', 'admin')
  ));

-- child_growth
CREATE POLICY "Parents and nutritionists can view growth" ON child_growth
  FOR ALL USING (auth.uid() IN (
    SELECT parent_id FROM child_profiles WHERE id = child_id
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutri', 'admin')
  ));

-- child_diet
CREATE POLICY "Diet access" ON child_diet
  FOR ALL USING (auth.uid() IN (
    SELECT parent_id FROM child_profiles WHERE id = child_id
  ) OR auth.uid() = nutritionist_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutri', 'admin')
  ));

-- child_meals
CREATE POLICY "Meals access" ON child_meals
  FOR ALL USING (auth.uid() IN (
    SELECT parent_id FROM child_profiles WHERE id = child_id
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutri', 'admin')
  ));
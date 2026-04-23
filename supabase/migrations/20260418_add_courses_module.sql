-- ============================================
-- 12. CURSOS MODULE (Formação Profissional)
-- ============================================

-- Cursos Profissionais
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  nutri_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null, -- nutricao_clinica, esportiva, metabolismo, comportamento_alimentar
  level text not null check (level in ('basico', 'intermediario', 'avancado')),
  duration_weeks integer not null,
  total_hours numeric,
  price numeric default 0,
  is_free boolean default false,
  status text not null default 'rascunho' check (status in ('rascunho', 'review', 'published', 'archived')),
  thumbnail_url text,
  trailer_url text,
  prerequisites text[], -- Array of course IDs
  learning_objectives text[], -- Array of objectives
  skills_gained text[], -- Array of skills
  certificate_template text, -- URL or template ID
  is_monetized boolean default false,
  revenue_share numeric default 70, -- Percentage for instructor
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Módulos dos Cursos
create table public.course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  "order" integer not null,
  duration_hours numeric,
  release_date date, -- For drip content
  is_preview boolean default false, -- Free preview module
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Aulas/Lições
create table public.course_lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  title text not null,
  description text,
  "type" text not null check ("type" in ('video', 'pdf', 'texto', 'quiz', 'estudo_caso', 'ao_vivo')),
  "order" integer not null,
  duration_minutes integer,
  video_url text,
  pdf_url text,
  content text, -- For text lessons
  quiz_data jsonb, -- For quiz questions
  case_study_data jsonb, -- For case studies
  is_preview boolean default false,
  downloadable_resources text[], -- Array of file URLs
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Inscrições dos Cursos
create table public.course_enrollments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'ativo' check (status in ('ativo', 'concluido', 'cancelado', 'pausado')),
  enrollment_date timestamptz default timezone('utc'::text, now()) not null,
  completion_date timestamptz,
  progress_percentage numeric default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  last_accessed timestamptz default timezone('utc'::text, now()) not null,
  certificate_issued boolean default false,
  certificate_url text,
  final_grade numeric, -- 0-100
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(course_id, student_id)
);

-- Progresso das Aulas
create table public.course_lesson_progress (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.course_enrollments(id) on delete cascade not null,
  lesson_id uuid references public.course_lessons(id) on delete cascade not null,
  completed boolean default false,
  completion_date timestamptz,
  time_spent_minutes integer default 0,
  last_position_seconds integer default 0, -- For video resume
  quiz_score numeric, -- 0-100
  attempts integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(enrollment_id, lesson_id)
);

-- Avaliações e Reviews dos Cursos
create table public.course_reviews (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(course_id, student_id) -- One review per student per course
);

-- Feed Científico (Artigos e Notícias)
create table public.scientific_feed (
  id uuid default gen_random_uuid() primary key,
  nutri_id uuid references public.profiles(id) on delete cascade set null, -- Who curated it
  title text not null,
  summary text not null,
  technical_summary text, -- IA generated technical summary
  source_url text,
  source_name text, -- Journal, website, etc.
  publication_date date not null,
  category text not null, -- nutricao, obesidade, diabetes, microbiota, performance
  evidence_level text not null check (evidence_level in ('alto', 'medio', 'baixo')),
  clinical_relevance text not null check (clinical_relevance in ('alta', 'media', 'baixa')),
  practical_application text,
  ai_insights jsonb, -- AI generated insights
  tags text[], -- For categorization
  is_featured boolean default false,
  read_time_minutes integer, -- Estimated read time
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Biblioteca Inteligente (Mistura de conteúdos)
create table public.intelligent_library (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  "type" text not null check ("type" in ('artigo', 'curso', 'estudo', 'video', 'pdf', 'material_ia')),
  content_url text, -- URL to the content
  file_url text, -- For uploaded files
  embedded_content text, -- For small content like articles
  ai_generated boolean default false,
  generation_prompt text, -- If AI generated, what was the prompt
  category text,
  tags text[],
  is_public boolean default false,
  is_featured boolean default false,
  view_count integer default 0,
  download_count integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Insights Automáticos (Alertas científicos)
create table public.scientific_insights (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text not null,
  impact_practical text not null,
  source_article_uuid uuid references public.scientific_feed(id) on delete set null,
  detected_at timestamptz default timezone('utc'::text, now()) not null,
  relevance_score numeric check (relevance_score >= 0 and relevance_score <= 1),
  expires_at timestamptz, -- When insight is no longer relevant
  is_read boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_lesson_progress enable row level security;
alter table public.course_reviews enable row level security;
alter table public.scientific_feed enable row level security;
alter table public.intelligent_library enable row level security;
alter table public.scientific_insights enable row level security;

-- ============================================
-- POLICIES (RLS)
-- ============================================

-- Courses: Nutris can manage their own, patients can see published
create policy "Courses manage own" on public.courses
  for all using (auth.uid() = nutri_id);

create policy "Courses read published" on public.courses
  for select using (status = 'published' OR auth.uid() = nutri_id);

-- Course Modules: Same as courses
create policy "CourseModules manage own" on public.course_modules
  for all using (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_id AND courses.nutri_id = auth.uid()
    )
  );

create policy "CourseModules read" on public.course_modules
  for select using (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_id AND (courses.status = 'published' OR courses.nutri_id = auth.uid())
    )
  );

-- Course Lessons: Same as modules
create policy "CourseLessons manage own" on public.course_lessons
  for all using (
    EXISTS (
      SELECT 1 FROM public.course_modules 
      WHERE course_modules.id = module_id AND 
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = course_modules.course_id AND courses.nutri_id = auth.uid()
      )
    )
  );

create policy "CourseLessons read" on public.course_lessons
  for select using (
    EXISTS (
      SELECT 1 FROM public.course_modules 
      WHERE course_modules.id = module_id AND 
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = course_modules.course_id AND (courses.status = 'published' OR courses.nutri_id = auth.uid())
      )
    )
  );

-- Enrollments: Students can manage their own, nutris can see enrollments in their courses
create policy "Enrollments manage own" on public.course_enrollments
  for all using (auth.uid() = student_id);

create policy "Enrollments read own" on public.course_enrollments
  for select using (auth.uid() = student_id);

create policy "Enrollments read course" on public.course_enrollments
  for select using (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_id AND courses.nutri_id = auth.uid()
    )
  );

-- Lesson Progress: Only the student can manage their progress
create policy "LessonProgress manage own" on public.course_lesson_progress
  for all using (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_enrollments.id = enrollment_id AND course_enrollments.student_id = auth.uid()
    )
  );

create policy "LessonProgress read own" on public.course_lesson_progress
  for select using (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_enrollments.id = enrollment_id AND course_enrollments.student_id = auth.uid()
    )
  );

-- Reviews: Students can manage their reviews, everyone can read
create policy "Reviews manage own" on public.course_reviews
  for all using (auth.uid() = student_id);

create policy "Reviews read" on public.course_reviews
  for select using (true); -- Anyone can read reviews

-- Scientific Feed: Nutris can manage their curated feed, everyone can read
create policy "ScientificFeed manage own" on public.scientific_feed
  for all using (auth.uid() = nutri_id OR nutri_id IS NULL);

create policy "ScientificFeed read" on public.scientific_feed
  for select using (true); -- Anyone can read scientific feed

-- Intelligent Library: Owners can manage, public items readable by all
create policy "IntelligentLibrary manage own" on public.intelligent_library
  for all using (auth.uid() = owner_id);

create policy "IntelligentLibrary read" on public.intelligent_library
  for select using (is_public = true OR auth.uid() = owner_id);

-- Scientific Insights: Everyone can read, system manages creation
create policy "ScientificInsights read" on public.scientific_insights
  for select using (true);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
create index idx_courses_nutri on public.courses(nutri_id);
create index idx_courses_category on public.courses(category);
create index idx_courses_status on public.courses(status);
create index idx_courses_price on public.courses(price);
create index idx_course_modules_course on public.course_modules(course_id);
create index idx_course_modules_order on public.course_modules("order");
create index idx_course_lessons_module on public.course_lessons(module_id);
create index idx_course_lessons_order on public.course_lessons("order");
create index idx_course_enrollments_student on public.course_enrollments(student_id);
create index idx_course_enrollments_course on public.course_enrollments(course_id);
create index idx_course_enrollments_status on public.course_enrollments(status);
create index idx_course_lesson_progress_enrollment on public.course_lesson_progress(enrollment_id);
create index idx_course_lesson_progress_lesson on public.course_lesson_progress(lesson_id);
create index idx_course_reviews_course on public.course_reviews(course_id);
create index idx_course_reviews_student on public.course_reviews(student_id);
create index idx_scientific_feed_category on public.scientific_feed(category);
create index idx_scientific_feed_evidence on public.scientific_feed(evidence_level);
create index idx_scientific_feed_relevance on public.scientific_feed(clinical_relevance);
create index idx_scientific_feed_date on public.scientific_feed(publication_date);
create index idx_intelligent_library_owner on public.intelligent_library(owner_id);
create index idx_intelligent_library_type on public.intelligent_library("type");
create index idx_intelligent_library_public on public.intelligent_library(is_public);
create index idx_scientific_insights_expires on public.scientific_insights(expires_at);
create index idx_scientific_insights_relevance on public.scientific_insights(relevance_score);

-- ============================================
-- PERMISSÕES
-- ============================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
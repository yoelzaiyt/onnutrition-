import { supabase } from "@/lib/supabase";
import { getDocuments, getDocumentById, addDocument, updateDocument, deleteDocument } from "@/lib/supabase-utils";

// Types for our course module
export interface Course {
  id: string;
  nutri_id: string;
  title: string;
  description: string;
  category: string;
  level: 'basico' | 'intermediario' | 'avancado';
  duration_weeks: number;
  total_hours: number | null;
  price: number;
  is_free: boolean;
  status: 'rascunho' | 'review' | 'published' | 'archived';
  thumbnail_url: string | null;
  trailer_url: string | null;
  prerequisites: string[]; // Array of course IDs
  learning_objectives: string[];
  skills_gained: string[];
  certificate_template: string | null;
  is_monetized: boolean;
  revenue_share: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order: number;
  duration_hours: number | null;
  release_date: string | null;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  type: 'video' | 'pdf' | 'texto' | 'quiz' | 'estudo_caso' | 'ao_vivo';
  order: number;
  duration_minutes: number | null;
  video_url: string | null;
  pdf_url: string | null;
  content: string | null;
  quiz_data: any | null;
  case_study_data: any | null;
  is_preview: boolean;
  downloadable_resources: string[]; // Array of file URLs
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  status: 'ativo' | 'concluido' | 'cancelado' | 'pausado';
  enrollment_date: string;
  completion_date: string | null;
  progress_percentage: number;
  last_accessed: string;
  certificate_issued: boolean;
  certificate_url: string | null;
  final_grade: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScientificFeedItem {
  id: string;
  nutri_id: string | null;
  title: string;
  summary: string;
  technical_summary: string | null;
  source_url: string | null;
  source_name: string | null;
  publication_date: string;
  category: string;
  evidence_level: 'alto' | 'medio' | 'baixo';
  clinical_relevance: 'alta' | 'media' | 'baixa';
  practical_application: string | null;
  ai_insights: any | null;
  tags: string[];
  is_featured: boolean;
  read_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface IntelligentLibraryItem {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  type: 'artigo' | 'curso' | 'estudo' | 'video' | 'pdf' | 'material_ia';
  content_url: string | null;
  file_url: string | null;
  embedded_content: string | null;
  ai_generated: boolean;
  generation_prompt: string | null;
  category: string | null;
  tags: string[];
  is_public: boolean;
  is_featured: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ScientificInsight {
  id: string;
  title: string;
  summary: string;
  impact_practical: string;
  source_article_uuid: string | null;
  detected_at: string;
  relevance_score: number;
  expires_at: string | null;
  is_read: boolean;
  created_at: string;
}

// Course Service Functions
export const courseService = {
  // Courses
  getCourses: async (filters: {
    category?: string;
    level?: string;
    status?: string;
    isFree?: boolean;
    search?: string;
    nutriId?: string;
  } = {}) => {
    let query = supabase.from('courses').select(`
      *,
      nutri_id:profiles(id, email, full_name)
    `);

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.level) query = query.eq('level', filters.level);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.isFree !== undefined) query = query.eq('is_free', filters.isFree);
    if (filters.nutriId) query = query.eq('nutri_id', filters.nutriId);
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data as Course[], error };
  },

  getCourseById: async (id: string) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        nutri_id:profiles(id, email, full_name)
      `)
      .eq('id', id)
      .single();

    return { data: data as Course | null, error };
  },

  createCourse: async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    return await addDocument<Course>('courses', courseData);
  },

  updateCourse: async (id: string, updates: Partial<Course>) => {
    return await updateDocument<Course>('courses', id, { ...updates, updated_at: new Date().toISOString() });
  },

  deleteCourse: async (id: string) => {
    return await deleteDocument('courses', id);
  },

  // Course Modules
  getCourseModules: async (courseId: string) => {
    const { data, error } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    return { data: data as CourseModule[], error };
  },

  createCourseModule: async (moduleData: Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>) => {
    return await addDocument<CourseModule>('course_modules', moduleData);
  },

  // Course Lessons
  getCourseLessons: async (moduleId: string) => {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order', { ascending: true });

    return { data: data as CourseLesson[], error };
  },

  createCourseLesson: async (lessonData: Omit<CourseLesson, 'id' | 'created_at' | 'updated_at'>) => {
    return await addDocument<CourseLesson>('course_lessons', lessonData);
  },

  // Enrollments
  getEnrollments: async (filters: {
    courseId?: string;
    studentId?: string;
    status?: string;
  } = {}) => {
    let query = supabase.from('course_enrollments').select(`
      *,
      course_id:courses(id, title, thumbnail_url),
      student_id:profiles(id, email, full_name)
    `);

    if (filters.courseId) query = query.eq('course_id', filters.courseId);
    if (filters.studentId) query = query.eq('student_id', filters.studentId);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('enrollment_date', { ascending: false });
    return { data: data as CourseEnrollment[], error };
  },

  enrollInCourse: async (enrollmentData: Omit<CourseEnrollment, 'id' | 'enrollment_date' | 'created_at' | 'updated_at'>) => {
    const dataWithTimestamps = {
      ...enrollmentData,
      enrollment_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return await addDocument<CourseEnrollment>('course_enrollments', dataWithTimestamps);
  },

  updateEnrollmentProgress: async (enrollmentId: string, progress: number) => {
    return await updateDocument<CourseEnrollment>('course_enrollments', enrollmentId, {
      progress_percentage: progress,
      last_accessed: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  },

  // Scientific Feed
  getScientificFeed: async (filters: {
    category?: string;
    evidenceLevel?: string;
    clinicalRelevance?: string;
    isFeatured?: boolean;
    limit?: number;
  } = {}) => {
    let query = supabase.from('scientific_feed').select('*');

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.evidenceLevel) query = query.eq('evidence_level', filters.evidenceLevel);
    if (filters.clinicalRelevance) query = query.eq('clinical_relevance', filters.clinicalRelevance);
    if (filters.isFeatured !== undefined) query = query.eq('is_featured', filters.isFeatured);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query.order('publication_date', { ascending: false });
    return { data: data as ScientificFeedItem[], error };
  },

  createScientificFeedItem: async (feedData: Omit<ScientificFeedItem, 'id' | 'created_at' | 'updated_at'>) => {
    const dataWithTimestamps = {
      ...feedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return await addDocument<ScientificFeedItem>('scientific_feed', dataWithTimestamps);
  },

  // Library
  getLibraryItems: async (filters: {
    type?: string;
    category?: string;
    isPublic?: boolean;
    ownerId?: string;
    search?: string;
  } = {}) => {
    let query = supabase.from('intelligent_library').select('*');

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.isPublic !== undefined) query = query.eq('is_public', filters.isPublic);
    if (filters.ownerId) query = query.eq('owner_id', filters.ownerId);
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},tags.cs.{${filters.search}}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data as IntelligentLibraryItem[], error };
  },

  addToLibrary: async (libraryData: Omit<IntelligentLibraryItem, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'>) => {
    const dataWithDefaults = {
      ...libraryData,
      view_count: 0,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return await addDocument<IntelligentLibraryItem>('intelligent_library', dataWithDefaults);
  },

  // Insights
  getScientificInsights: async (filters: {
    limit?: number;
    unreadOnly?: boolean;
  } = {}) => {
    let query = supabase.from('scientific_insights').select('*');

    if (filters.unreadOnly) query = query.eq('is_read', false);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query.order('detected_at', { ascending: false });
    return { data: data as ScientificInsight[], error };
  },

  markInsightAsRead: async (insightId: string) => {
    return await updateDocument<ScientificInsight>('scientific_insights', insightId, {
      is_read: true
    });
  }
};
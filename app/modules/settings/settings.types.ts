export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'nutricionista' | 'paciente';
  specialty?: string;
  crn?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
}

export interface AppSettings {
  notifications_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
  ai_assistance_level: 'low' | 'medium' | 'high';
}

export interface SettingsState {
  profile: UserProfile | null;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

import { UserProfile, AppSettings } from './settings.types';

const MOCK_PROFILE: UserProfile = {
  id: '1',
  full_name: 'Dra. Ana Silva',
  email: 'ana.silva@onnutrition.com.br',
  role: 'nutricionista',
  specialty: 'Nutrição Clínica e Esportiva',
  crn: 'CRN-3 12345',
  avatar_url: '',
  phone: '(11) 98765-4321',
  bio: 'Especialista em emagrecimento saudável e performance esportiva com mais de 10 anos de experiência.'
};

const MOCK_SETTINGS: AppSettings = {
  notifications_enabled: true,
  theme: 'light',
  language: 'pt-BR',
  ai_assistance_level: 'high'
};

export const settingsService = {
  async getProfile(): Promise<UserProfile> {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PROFILE), 500);
    });
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...MOCK_PROFILE, ...profile }), 800);
    });
  },

  async getSettings(): Promise<AppSettings> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_SETTINGS), 400);
    });
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...MOCK_SETTINGS, ...settings }), 600);
    });
  }
};

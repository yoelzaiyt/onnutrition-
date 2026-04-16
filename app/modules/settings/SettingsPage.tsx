'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Camera,
  Save,
  LogOut,
  Moon,
  Sun,
  Globe,
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { settingsService } from './settings.service';
import { UserProfile, AppSettings } from './settings.types';
import { useFirebase } from '@/app/components/layout/FirebaseProvider';
import Image from 'next/image';

interface SettingsPageProps {
  handleLogout: () => void;
}

export default function SettingsPage({ handleLogout }: SettingsPageProps) {
  const { user } = useFirebase();
  const isAdmin = user?.email === 'word.intelligence@gmail.com';
  const [activeTab, setActiveTab] = useState<'profile' | 'app' | 'security' | 'help'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, s] = await Promise.all([
          settingsService.getProfile(),
          settingsService.getSettings()
        ]);
        setProfile(p);
        setSettings(s);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await settingsService.updateProfile(profile);
      // Show success toast (not implemented)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await settingsService.updateSettings(newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 space-y-2">
          <TabButton 
            id="profile" 
            icon={User} 
            label="Perfil do Usuário" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <TabButton 
            id="app" 
            icon={Settings} 
            label="Preferências do App" 
            active={activeTab === 'app'} 
            onClick={() => setActiveTab('app')} 
          />
          <TabButton 
            id="security" 
            icon={Shield} 
            label="Segurança e Privacidade" 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
          />
          <TabButton 
            id="help" 
            icon={HelpCircle} 
            label="Ajuda e Suporte" 
            active={activeTab === 'help'} 
            onClick={() => setActiveTab('help')} 
          />
          
          <div className="pt-4 mt-4 border-t border-[#0B2B24]/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </div>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 bg-white rounded-3xl border border-[#0B2B24]/10 p-8 shadow-sm">
          {activeTab === 'profile' && profile && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B2B24]">Perfil do Usuário</h2>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#059669] transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-[#0B2B24]/5 flex items-center justify-center text-[#0B2B24]/20 border-2 border-white shadow-lg overflow-hidden">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt={user.displayName || ''} width={96} height={96} referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-12 h-12" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-[#27B494] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-[#0B2B24]">{user?.displayName || profile.full_name}</h3>
                  <p className="text-sm text-[#0B2B24]/50">{isAdmin ? 'Administrador' : 'Nutricionista'}</p>
                  <p className="text-xs text-[#0B2B24]/30 mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup 
                  label="Nome Completo" 
                  value={profile.full_name} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, full_name: e.target.value })} 
                />
                <InputGroup 
                  label="E-mail Profissional" 
                  value={profile.email} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, email: e.target.value })} 
                />
                <InputGroup 
                  label="Telefone" 
                  value={profile.phone || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, phone: e.target.value })} 
                />
                <InputGroup 
                  label="CRN" 
                  value={profile.crn || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, crn: e.target.value })} 
                />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0B2B24]/40 uppercase tracking-wider mb-2">Biografia Profissional</label>
                  <textarea 
                    className="w-full bg-[#F8FAFC] border border-[#0B2B24]/5 rounded-xl p-4 text-sm focus:border-[#10B981]/30 focus:bg-white outline-none transition-all min-h-[120px]"
                    value={profile.bio || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'app' && settings && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-[#0B2B24]">Preferências do App</h2>
              
              <div className="space-y-6">
                <ToggleGroup 
                  icon={Bell} 
                  label="Notificações Push" 
                  description="Receba alertas sobre consultas e mensagens." 
                  enabled={settings.notifications_enabled}
                  onChange={(val) => handleUpdateSettings({ notifications_enabled: val })}
                />
                
                <div className="h-px bg-[#0B2B24]/5" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-100 rounded-xl">
                      <Sun className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0B2B24]">Tema do Sistema</p>
                      <p className="text-xs text-[#0B2B24]/50">Escolha a aparência do aplicativo.</p>
                    </div>
                  </div>
                  <select 
                    className="bg-[#F8FAFC] border border-[#0B2B24]/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#10B981]/30"
                    value={settings.theme}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateSettings({ theme: e.target.value as any })}
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>

                <div className="h-px bg-[#0B2B24]/5" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-100 rounded-xl">
                      <Globe className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0B2B24]">Idioma</p>
                      <p className="text-xs text-[#0B2B24]/50">Defina o idioma da interface.</p>
                    </div>
                  </div>
                  <select 
                    className="bg-[#F8FAFC] border border-[#0B2B24]/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#10B981]/30"
                    value={settings.language}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateSettings({ language: e.target.value as any })}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>

                <div className="h-px bg-[#0B2B24]/5" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-purple-50 rounded-xl">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0B2B24]">Assistência de IA</p>
                      <p className="text-xs text-[#0B2B24]/50">Nível de sugestões inteligentes.</p>
                    </div>
                  </div>
                  <select 
                    className="bg-[#F8FAFC] border border-[#0B2B24]/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#10B981]/30"
                    value={settings.ai_assistance_level}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateSettings({ ai_assistance_level: e.target.value as any })}
                  >
                    <option value="low">Básico</option>
                    <option value="medium">Moderado</option>
                    <option value="high">Avançado</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'help') && (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="p-4 bg-gray-50 rounded-full">
                <Settings className="w-8 h-8 text-gray-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B2B24]">Em Desenvolvimento</h3>
                <p className="text-sm text-[#0B2B24]/50">Esta seção estará disponível em breve.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TabButton({ id, icon: Icon, label, active, onClick }: { id: string, icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
        active 
          ? 'bg-[#0B2B24] text-white shadow-lg shadow-[#0B2B24]/10' 
          : 'text-[#0B2B24]/50 hover:bg-white hover:text-[#0B2B24]'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-[#10B981]' : 'text-current'}`} />
      <span className="text-sm font-bold">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto text-white/30" />}
    </button>
  );
}

function InputGroup({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#0B2B24]/40 uppercase tracking-wider">{label}</label>
      <input 
        type="text" 
        className="w-full bg-[#F8FAFC] border border-[#0B2B24]/5 rounded-xl px-4 py-3 text-sm focus:border-[#10B981]/30 focus:bg-white outline-none transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function ToggleGroup({ icon: Icon, label, description, enabled, onChange }: { icon: any, label: string, description: string, enabled: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-gray-100 rounded-xl">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-bold text-[#0B2B24]">{label}</p>
          <p className="text-xs text-[#0B2B24]/50">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-[#10B981]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}

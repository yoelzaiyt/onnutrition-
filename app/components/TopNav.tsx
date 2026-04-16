'use client';

import React from 'react';
import { ChevronDown, Video, Book, Megaphone, Activity, HelpCircle, LifeBuoy, User, LogOut } from 'lucide-react';

import Logo from './Logo';

interface TopNavProps {
  activeView: string;
  setView: (view: any) => void;
  user: any;
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ activeView, setView, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Consultório', hasDropdown: true },
    { id: 'calendar', label: 'Agenda', hasDropdown: true },
    { id: 'patients', label: 'Pacientes', hasDropdown: true },
    { id: 'finance', label: 'Financeiro', hasDropdown: false },
    { id: 'anamnesis', label: 'Anamnese', hasDropdown: true },
    { id: 'recipes', label: 'Estudos', hasDropdown: true },
    { id: 'marketing', label: 'Marketing', hasDropdown: true },
    { id: 'video', label: 'Videoch', hasDropdown: false },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-16">
        <Logo iconSize={22} textSize="text-xl" />
        
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-1.5 text-[15px] font-bold transition-all ${
                activeView === item.id ? 'text-[#22B391]' : 'text-slate-500 hover:text-[#22B391]'
              }`}
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="w-4 h-4 opacity-40" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all">
          <div className="w-8 h-8 bg-[#22B391] rounded-lg flex items-center justify-center text-white font-black text-xs">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-black text-slate-900 truncate max-w-[100px]">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default TopNav;

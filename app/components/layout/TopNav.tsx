"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  ClipboardList,
  BookOpen,
  Settings,
  Activity,
  Utensils,
  ChevronRight,
  FileSpreadsheet,
  Sparkles,
  GraduationCap,
  QrCode,
} from "lucide-react";
import Logo from "@/app/components/ui/Logo";
import type { AppView } from "@/app/page";

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  children?: { id: AppView; label: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "education", label: "EXPLORAÇÃO", icon: LayoutDashboard },
  { id: "education", label: "MEUS CURSOS", icon: GraduationCap },
  { id: "education", label: "PESQUISA IA", icon: Sparkles },
  { id: "setup", label: "CONFIGURAÇÕES", icon: Settings },
];

interface TopNavProps {
  activeView: AppView;
  setView: (view: AppView) => void;
  user: any;
  userRole: string | null;
  onLogout: () => void;
  onSwitchRole: (role: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({
  activeView,
  setView,
  user,
  userRole,
  onLogout,
  onSwitchRole,
}) => {
  const [openDropdown, setOpenDropdown] = useState<AppView | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    } else {
      setView(item.id);
      setOpenDropdown(null);
    }
  };

  const handleChildClick = (childId: AppView) => {
    setView(childId);
    setOpenDropdown(null);
  };

  const isActive = (item: NavItem): boolean => {
    if (activeView === item.id) return true;
    return item.children?.some((c) => c.id === activeView) ?? false;
  };

  const isAdmin =
    userRole === "admin" || user?.email === "word.intelligence@gmail.com";

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.id === "setup") return isAdmin;
    if (item.id === "data") return isAdmin;
    if (item.id === "generate-data") return isAdmin;
    return true;
  });

  return (
    <nav
      ref={navRef}
      className="bg-[#030712] border-b border-white/5 px-6 py-0 flex items-center justify-between sticky top-0 z-50 shadow-2xl h-16"
    >
      {/* Logo */}
      <div className="flex items-center gap-10">
        <Logo iconSize={22} textSize="text-xl" />

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {filteredNavItems.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-1.5 px-4 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  isActive(item)
                    ? "text-blue-400 border-blue-400"
                    : "text-slate-500 border-transparent hover:text-white hover:border-white/10"
                }`}
              >
                {item.label}
                {item.children && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {/* Dropdown */}
              {item.children && openDropdown === item.id && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 py-2 z-50">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleChildClick(child.id)}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm font-bold transition-all hover:bg-slate-50 hover:text-[#22B391] ${
                        activeView === child.id
                          ? "text-[#22B391] bg-[#22B391]/5"
                          : "text-slate-600"
                      }`}
                    >
                      {child.label}
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side — User + Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-xl border border-white/10 cursor-default">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
            {user?.user_metadata?.full_name?.charAt(0) ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-black text-white truncate max-w-[120px]">
              {user?.user_metadata?.full_name ||
                user?.email?.split("@")[0] ||
                "Especialista"}
            </p>
            <button
              onClick={() =>
                onSwitchRole(userRole === "patient" ? "nutri" : "patient")
              }
              className="text-[9px] text-blue-400 font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              {userRole === "patient"
                ? "Mudar para Nutri"
                : "Mudar para Paciente"}
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          title="Sair"
        >
          <LogOut
            className="w-4.5 h-4.5"
            style={{ width: "18px", height: "18px" }}
          />
        </button>
      </div>
    </nav>
  );
};

export default TopNav;

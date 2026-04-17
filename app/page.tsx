"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import LandingPage from "@/app/components/layout/LandingPage";
import { LoginPage, RegisterPage } from "@/app/components/auth/AuthPages";
import FoodDiaryPage from "@/app/modules/foodDiary/FoodDiaryPage";
import RecipeLibrary from "@/app/components/features/RecipeLibrary";
import MedicalRecord from "@/app/components/features/MedicalRecord";
import SetupGuide from "@/app/components/features/SetupGuide";
import Logo from "@/app/components/ui/Logo";
import NutritionistDashboard from "@/app/components/features/NutritionistDashboard";
import ChildModule from "@/app/components/features/ChildModule";
import FinancialModule from "@/app/components/features/FinancialModule";
import PatientManagement from "@/app/components/features/PatientManagement";
import PatientFlowManager from "@/app/components/features/PatientFlowManager";
import PatientQRGenerator from "@/app/components/features/PatientQRGenerator";
import PatientProfilePage from "@/app/modules/patient/PatientProfilePage";
import Calendar from "@/app/components/ui/Calendar";
import TopNav from "@/app/components/layout/TopNav";
import DataImportExport from "@/app/components/features/DataImportExport";
import TestDataGenerator from "@/app/components/features/TestDataGenerator";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { LogOut } from "lucide-react";

// All valid views in the application
export type AppView =
  | "landing"
  | "login"
  | "register"
  | "education"
  | "setup";

const VIEW_LABELS: Record<AppView, string> = {
  landing: "",
  login: "",
  register: "",
  education: "Science Hub",
  setup: "Configurações",
};

const FULL_WIDTH_VIEWS: AppView[] = ["education", "setup"];

export default function Home() {
  const [view, setView] = useState<AppView>("education");
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Track auth listener to prevent re-registration on every view change (critical bug fix)
  const authListenerRegistered = useRef(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setUserRole(profile?.role || "nutri");
    } catch {
      setUserRole("nutri");
    }
  }, []);

  useEffect(() => {
    // If Supabase isn't configured, skip auth and go to demo mode
    if (!isSupabaseConfigured) {
      setIsAuthReady(true);
      return;
    }

    if (authListenerRegistered.current) return;
    authListenerRegistered.current = true;

    // Check initial session once
    const initAuth = async () => {
      try {
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();
        if (sessionUser) {
          setUser(sessionUser);
          await fetchUserProfile(sessionUser.id);
          setView("dashboard");
        }
      } catch (err) {
        console.error("initAuth error:", err);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();

    // Subscribe to future auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
          setView((prev) => {
            if (prev === "login" || prev === "register" || prev === "landing")
              return "dashboard";
            return prev;
          });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setUserRole(null);
          setView("landing");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
      authListenerRegistered.current = false;
    };
  }, [fetchUserProfile]); // No `view` dependency — prevents listener re-registration

  const handleLogin = useCallback((role?: string) => {
    if (role) setUserRole(role);
    setView("dashboard");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setUserRole(null);
      setShowLogoutModal(false);
      setView("landing");
    }
  }, []);

  // ---------- Loading splash ----------
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0B2B24] flex items-center justify-center">
        <div className="animate-pulse">
          <Logo hideText iconSize={32} />
        </div>
      </div>
    );
  }

  // ---------- Auth pages (full screen) ----------
  if (view === "landing") {
    return (
      <LandingPage
        onLogin={() => setView("login")}
        onRegister={() => setView("register")}
        onDemoMode={() => {
          setUser({
            id: "demo-patient-id",
            email: "paciente.demo@onnutrition.com",
            user_metadata: { full_name: "Paciente Demo" },
          });
          setUserRole("patient");
          setView("anamnesis");
        }}
        hasConfig={isSupabaseConfigured}
      />
    );
  }

  if (view === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={() => setView("register")}
        onBackToLanding={() => setView("landing")}
        onGoToLogin={() => setView("login")}
        onGoToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterPage
        onLogin={handleLogin}
        onRegister={() => setView("register")}
        onBackToLanding={() => setView("landing")}
        onGoToLogin={() => setView("login")}
        onGoToRegister={() => setView("register")}
      />
    );
  }

  // ---------- Main App Shell ----------
  const isFullWidth = FULL_WIDTH_VIEWS.includes(view);

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      <TopNav
        activeView={view}
        setView={(v: AppView) => {
          setView(v);
          if (v === "anamnesis") {
            setUserRole("patient");
          }
        }}
        user={user}
        userRole={userRole}
        onLogout={() => setShowLogoutModal(true)}
        onSwitchRole={(role: string) => {
          setUserRole(role);
          if (role === "patient") {
            setView("anamnesis");
          } else {
            setView("dashboard");
          }
        }}
      />

      <main className="flex-1 overflow-y-auto relative">
        <div
          className={`p-8 w-full mx-auto ${isFullWidth ? "max-w-none px-4 md:px-8" : "max-w-7xl"}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Breadcrumb */}
              {VIEW_LABELS[view] && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-[#22B391] rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Sistema Ativo
                  </span>
                  <h2 className="text-2xl font-black text-[#0B2B24] tracking-tighter ml-2">
                    {VIEW_LABELS[view]}
                  </h2>
                </div>
              )}

              {/* Route rendering */}
              {view === "education" && <PatientProfilePage />}
              {view === "setup" && <SetupGuide onBack={() => setView("education")} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-[#0B2B24]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <LogOut className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">
                Deseja realmente sair?
              </h3>
              <p className="text-slate-500 mb-10 leading-relaxed">
                Você precisará entrar novamente para acessar seus dados de
                nutrição e planos alimentares.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                >
                  Sair Agora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Logo from "@/app/components/ui/Logo";

interface AuthProps {
  onLogin: (userRole?: string) => void;
  onRegister: () => void;
  onBackToLanding: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<AuthProps> = ({
  onLogin,
  onGoToRegister,
  onBackToLanding,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasConfig = isSupabaseConfigured;
  const isDemoEmail =
    email.toLowerCase() === "demo@at.com" || email.toLowerCase() === "demo";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!hasConfig && !isDemoEmail) {
      // Demo Mode - only if no config AND not demo email
      setTimeout(() => {
        onLogin("nutri");
        setIsLoading(false);
      }, 1000);
      return;
    }

    // If Supabase is configured, always use it (even for demo@at.com)
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        // If auth fails with demo email, fallback to demo mode
        if (isDemoEmail && authError.message.includes("Invalid login")) {
          setTimeout(() => {
            onLogin("nutri");
            setIsLoading(false);
          }, 500);
          return;
        }
        throw authError;
      }

      if (authData.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        onLogin(profileData?.role || "nutri");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Fallback to demo mode on any error if demo email
      if (isDemoEmail) {
        setTimeout(() => {
          onLogin("nutri");
          setIsLoading(false);
        }, 500);
        return;
      }

      const isNetworkError =
        err?.message?.toLowerCase().includes("fetch") ||
        err?.name === "TypeError";

      if (isNetworkError) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        setError("Email ou senha incorretos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#22B391 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div
          className="flex justify-center mb-10 cursor-pointer"
          onClick={onBackToLanding}
        >
          <Logo textSize="text-3xl" iconSize={28} showTagline={true} />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 md:p-12 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-slate-500">Entre na sua conta para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#22B391] transition-colors" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all text-slate-900 placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-bold text-[#22B391] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#22B391] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all text-slate-900 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#22B391] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#1C9A7D] transition-all shadow-xl shadow-[#22B391]/20 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {!hasConfig ? "Entrar (Modo Demo)" : "Entrar"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {(!hasConfig || isDemoEmail) && (
              <p className="text-xs text-amber-600 text-center font-bold mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                ✨ Você está no Modo Demo. Use qualquer email e senha para
                entrar.
              </p>
            )}
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Não tem uma conta?{" "}
              <button
                onClick={onGoToRegister}
                className="text-[#22B391] font-bold hover:underline"
              >
                Criar conta grátis
              </button>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400 leading-relaxed max-w-[320px] mx-auto">
          Ao entrar, você concorda com nossos{" "}
          <a href="#" className="text-[#22B391] hover:underline">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="#" className="text-[#22B391] hover:underline">
            Política de Privacidade
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export const RegisterPage: React.FC<AuthProps> = ({
  onLogin,
  onGoToLogin,
  onBackToLanding,
}) => {
  const [selectedType, setSelectedType] = useState<"nutri" | "patient" | null>(
    null,
  );
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasConfig = isSupabaseConfigured;
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsLoading(true);
    setError(null);

    try {
      // Chamada para a API de registro (NutriCore) adaptada do snippet Express
      const apiResponse = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, email, password }),
      });

      if (!apiResponse.ok) {
        throw new Error("Falha na comunicação com a API de registro");
      }

      const apiData = await apiResponse.json();
      console.log("[NutriCore] API Response:", apiData);

      if (!hasConfig) {
        // Demo Mode: Prossegue após a chamada da API simulada
        setTimeout(() => {
          onLogin(selectedType);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: selectedType,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const finalRole =
          email === "word.imtelligence@gmail.com" ? "nutri" : selectedType;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            name,
            role: finalRole,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        onLogin(finalRole);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const isNetworkError =
        err.message?.toLowerCase().includes("fetch") ||
        err.message?.toLowerCase().includes("network") ||
        err.name === "TypeError";

      if (isNetworkError) {
        setError(
          "Erro de conexão: Verifique se as chaves do Supabase estão preenchidas no arquivo .env ou no painel de Segredos (⚙️).",
        );
      } else if (err.message === "User already registered") {
        setError("Este email já está em uso.");
      } else {
        setError("Ocorreu um erro ao criar sua conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#22B391 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div
          className="flex justify-center mb-10 cursor-pointer"
          onClick={onBackToLanding}
        >
          <Logo textSize="text-3xl" iconSize={28} showTagline={true} />
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 text-center">
          <p className="text-sm text-slate-400 font-bold mb-2">
            Passo {step} de 2
          </p>

          <h2 className="text-xl font-bold text-slate-800 mb-8">
            {step === 1 ? "Criar sua conta" : "Dados de acesso"}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setSelectedType("nutri")}
                className={`flex-1 p-6 border-2 rounded-2xl transition-all flex flex-col items-center gap-3 ${
                  selectedType === "nutri"
                    ? "border-[#22B391] bg-[#E9F7F4] text-[#22B391]"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                }`}
              >
                <Users
                  className={`w-8 h-8 ${selectedType === "nutri" ? "text-[#22B391]" : "text-slate-400"}`}
                />
                <span className="font-bold text-sm">Nutricionista</span>
              </button>

              <button
                onClick={() => setSelectedType("patient")}
                className={`flex-1 p-6 border-2 rounded-2xl transition-all flex flex-col items-center gap-3 ${
                  selectedType === "patient"
                    ? "border-[#22B391] bg-[#E9F7F4] text-[#22B391]"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                }`}
              >
                <User
                  className={`w-8 h-8 ${selectedType === "patient" ? "text-[#22B391]" : "text-slate-400"}`}
                />
                <span className="font-bold text-sm">Paciente</span>
              </button>
            </div>
          ) : (
            <form className="space-y-6 text-left" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all text-slate-900 placeholder:text-slate-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all text-slate-900 placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#22B391]/20 focus:border-[#22B391] transition-all text-slate-900 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </form>
          )}

          <div className="flex gap-4">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
              >
                Voltar
              </button>
            )}
            <button
              disabled={!selectedType || isLoading}
              onClick={step === 1 ? () => setStep(2) : handleRegister}
              className={`flex-[2] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${
                selectedType
                  ? "bg-[#22B391] text-white hover:bg-[#1C9A7D] shadow-[#22B391]/20"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {step === 1
                    ? "Continuar"
                    : !hasConfig
                      ? "Criar Conta (Modo Demo)"
                      : "Criar Conta"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              Já tem uma conta?{" "}
              <button
                onClick={onGoToLogin}
                className="text-[#22B391] font-bold hover:underline"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400 leading-relaxed max-w-[420px] mx-auto">
          Ao criar conta, você concorda com nossos{" "}
          <a href="#" className="text-[#22B391] hover:underline">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="#" className="text-[#22B391] hover:underline">
            Política de Privacidade
          </a>
        </p>
      </motion.div>
    </div>
  );
};

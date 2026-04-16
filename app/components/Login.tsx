'use client';

import React from 'react';
import { Leaf, LogIn, Shield, Bug, RefreshCw, AlertCircle } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { useSupabase } from './SupabaseProvider';

export default function Login() {
  const { login: firebaseLogin, authError: firebaseAuthError, setMockUser, loading: firebaseLoading, diagnostics: firebaseDiag, syncStatus, syncError } = useFirebase();
  const { login: supabaseLogin, authError: supabaseAuthError, loading: supabaseLoading, diagnostics: supabaseDiag } = useSupabase();
  const [showRedirectOption, setShowRedirectOption] = React.useState(false);

  const isLoading = firebaseLoading || supabaseLoading;

  const handleLoginWithRedirect = async () => {
    const { auth } = await import('@/firebase');
    const { GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');
    if (auth) {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    }
  };

  const handleForceBypass = () => {
    console.log('Login: Manual bypass triggered');
    setMockUser('word.intelligence@gmail.com');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('onnutrition_emergency_bypass', 'true');
        localStorage.setItem('onnutrition_force_admin', 'true');
        
        // Immediate DOM cleanup
        document.documentElement.classList.add('bypass-active');
        const ids = ['loading-fallback', 'client-loading-fallback', 'firebase-loading-overlay'];
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        
        window.location.href = '/?bypass=true&admin=true&t=' + Date.now();
      } catch (e) {
        window.location.href = '/?bypass=true&admin=true&t=' + Date.now();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B2B24] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl text-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#27B494]/5 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-20 h-20 bg-[#27B494] rounded-3xl flex items-center justify-center shadow-xl shadow-[#27B494]/20 mb-6">
            <Leaf className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0B2B24] tracking-tight">ONNutrition</h1>
          <p className="text-[#0B2B24]/60 mt-2 font-medium">Sistema Inteligente de Gestão Nutricional</p>
        </div>

        <div className="space-y-6 relative">
          {isLoading && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-10 h-10 border-4 rounded-full ${syncStatus === 'error' ? 'border-red-500' : 'border-[#27B494]/20 border-t-[#27B494] animate-spin'}`}>
                  {syncStatus === 'error' && <AlertCircle className="w-full h-full text-red-500 p-1" />}
                </div>
                <div className="text-center">
                  <p className={`${syncStatus === 'error' ? 'text-red-600' : 'text-[#27B494]'} text-[12px] font-black uppercase tracking-[0.2em]`}>
                    {syncStatus === 'error' ? 'Erro de Sincronismo' : 'Sincronizando Sistema'}
                  </p>
                  <p className="text-gray-400 text-[10px] mt-1">
                    {syncStatus === 'error' ? syncError : 'Verificando credenciais e conexão...'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-6 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${firebaseLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>Firebase {firebaseLoading ? '...' : 'OK'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${supabaseLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>Supabase {supabaseLoading ? '...' : 'OK'}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-[#0B2B24]/40 leading-relaxed px-4">
            Acesso restrito para administradores. Gerencie pacientes e planos alimentares com inteligência artificial.
          </p>

          {(firebaseAuthError || supabaseAuthError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-2xl text-left">
              <p className="font-bold mb-2 uppercase tracking-widest text-[10px]">Falha na Autenticação</p>
              {firebaseAuthError && <p className="mb-1">• Firebase: {firebaseAuthError}</p>}
              {supabaseAuthError && <p className="mb-1">• Supabase: {supabaseAuthError}</p>}
              
              <div className="mt-4 flex flex-col gap-2">
                <button 
                  onClick={() => setShowRedirectOption(true)}
                  className="text-[#27B494] font-bold underline text-[10px] uppercase text-center"
                >
                  Tentar Login via Redirecionamento
                </button>
                <button 
                  onClick={handleForceBypass}
                  className="bg-red-600 text-white py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest"
                >
                  Forçar Entrada (Bypass)
                </button>
              </div>
            </div>
          )}

          {showRedirectOption && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] p-4 rounded-2xl text-left">
              <p className="font-bold mb-1 uppercase tracking-widest">Modo de Redirecionamento</p>
              <p className="opacity-70">Este modo recarrega a página para autenticar. Use se as janelas pop-up estiverem bloqueadas.</p>
              <button 
                onClick={handleLoginWithRedirect}
                className="mt-3 w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20"
              >
                Iniciar Redirecionamento
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => {
                console.log('Login: Admin login clicked');
                firebaseLogin();
              }}
              className="w-full flex items-center justify-center gap-3 bg-[#0B2B24] text-white py-5 rounded-[2rem] font-black hover:bg-[#0B2B24]/90 transition-all shadow-xl shadow-[#0B2B24]/20 active:scale-[0.98] text-lg uppercase tracking-tight"
            >
              <Shield className="w-6 h-6" />
              Entrar como Administrador
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
              <span className="bg-white px-4 text-gray-300">Acesso de Emergência</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => {
                console.log('Login: SUPER BYPASS TRIGGERED');
                handleForceBypass();
              }}
              className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black hover:bg-red-700 transition-all active:scale-[0.98] text-lg uppercase tracking-widest shadow-xl shadow-red-600/20 border-4 border-white"
            >
              ENTRAR AGORA (FORÇAR)
            </button>

            <button 
              onClick={() => {
                console.log('Login: Mock Admin Login Clicked');
                try {
                  setMockUser('word.intelligence@gmail.com');
                  localStorage.setItem('onnutrition_force_admin', 'true');
                  localStorage.setItem('onnutrition_emergency_bypass', 'true');
                  document.documentElement.classList.add('bypass-active');
                  const el = document.getElementById('loading-fallback');
                  if (el) el.style.display = 'none';
                  setTimeout(() => { window.location.reload(); }, 500);
                } catch (e) {
                  console.error('Login: Error in mock login', e);
                }
              }}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-red-500/10 text-red-400 py-3 rounded-xl font-bold hover:bg-red-50 transition-all text-[10px] uppercase tracking-widest"
            >
              <Shield className="w-4 h-4" />
              Bypass Administrador
            </button>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => (window as any).ONN_DIAGNOSTICS?.toggle()}
                className="flex items-center gap-2 text-gray-300 hover:text-[#27B494] transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <Bug className="w-3 h-3" />
                Diagnóstico
              </button>
              <button 
                onClick={() => {
                  console.log('Login: SUPER REFRESH TRIGGERED');
                  localStorage.clear();
                  sessionStorage.clear();
                  // Also try to clear cookies if possible (though limited in iframe)
                  document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                  });
                  window.location.href = '/?t=' + Date.now();
                }}
                className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Total
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 text-gray-300 hover:text-[#27B494] transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                <RefreshCw className="w-3 h-3" />
                Recarregar
              </button>
            </div>
            
            <div className="pt-6 border-t border-gray-50">
              <p className="text-[9px] text-[#0B2B24]/20 uppercase tracking-[0.3em] font-black">
                ONNutrition v2.5 • Professional Edition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

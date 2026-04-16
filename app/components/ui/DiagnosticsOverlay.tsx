'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/app/components/layout/FirebaseProvider';
import { useSupabase } from '@/app/components/layout/SupabaseProvider';
import { Activity, Shield, Database, X, RefreshCw, Terminal } from 'lucide-react';

export default function DiagnosticsOverlay() {
  const firebase = useFirebase();
  const supabase = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Expose diagnostics to window for global access
    if (typeof window !== 'undefined') {
      (window as any).ONN_DIAGNOSTICS = {
        log: (msg: string) => {
          setLogs(prev => [
            `[${new Date().toLocaleTimeString()}] ${msg}`,
            ...prev.slice(0, 49)
          ]);
        },
        toggle: () => setIsOpen(prev => !prev)
      };

      // Triple click anywhere to toggle
      let clickCount = 0;
      let lastClick = 0;
      const handleGlobalClick = () => {
        const now = Date.now();
        if (now - lastClick < 500) {
          clickCount++;
        } else {
          clickCount = 1;
        }
        lastClick = now;
        if (clickCount >= 3) {
          setIsOpen(prev => !prev);
          clickCount = 0;
        }
      };
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10 overflow-hidden">
      <div className="bg-[#0B2B24] w-full max-w-4xl h-full max-h-[800px] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#27B494] rounded-xl flex items-center justify-center">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Painel de Diagnóstico</h2>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Monitoramento em Tempo Real</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <X className="text-white w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Firebase Status */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-orange-400 w-5 h-5" />
                <h3 className="text-white font-bold">Firebase Auth</h3>
              </div>
              <div className="space-y-3 text-sm">
                <StatusItem label="Configuração" value={firebase.diagnostics.configValid ? 'Válida' : 'Inválida'} status={firebase.diagnostics.configValid ? 'success' : 'error'} />
                <StatusItem label="Inicializado" value={firebase.diagnostics.authInitialized ? 'Sim' : 'Não'} status={firebase.diagnostics.authInitialized ? 'success' : 'warning'} />
                <StatusItem label="Carregando" value={firebase.loading ? 'Sim' : 'Não'} status={firebase.loading ? 'warning' : 'success'} />
                <StatusItem label="Usuário" value={firebase.user ? firebase.user.email || firebase.user.uid : 'Nenhum'} status={firebase.user ? 'success' : 'neutral'} />
                <StatusItem label="Último Evento" value={firebase.diagnostics.lastEvent} />
                {firebase.authError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px]">
                    {firebase.authError}
                  </div>
                )}
              </div>
            </div>

            {/* Supabase Status */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-emerald-400 w-5 h-5" />
                <h3 className="text-white font-bold">Supabase Auth</h3>
              </div>
              <div className="space-y-3 text-sm">
                <StatusItem label="Configuração" value={supabase.diagnostics.configValid ? 'Válida' : 'Inválida'} status={supabase.diagnostics.configValid ? 'success' : 'error'} />
                <StatusItem label="Inicializado" value={supabase.diagnostics.initialized ? 'Sim' : 'Não'} status={supabase.diagnostics.initialized ? 'success' : 'warning'} />
                <StatusItem label="Carregando" value={supabase.loading ? 'Sim' : 'Não'} status={supabase.loading ? 'warning' : 'success'} />
                <StatusItem label="Usuário" value={supabase.user ? supabase.user.email || supabase.user.id : 'Nenhum'} status={supabase.user ? 'success' : 'neutral'} />
                <StatusItem label="Último Evento" value={supabase.diagnostics.lastEvent} />
                {supabase.authError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px]">
                    {supabase.authError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Console Logs */}
          <div className="bg-black/40 rounded-3xl p-6 border border-white/5 flex flex-col h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Terminal className="text-white/40 w-5 h-5" />
                <h3 className="text-white font-bold">Logs de Eventos</h3>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] text-white/20 uppercase font-bold hover:text-white/40"
              >
                Limpar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 text-white/60">
              {logs.length === 0 ? (
                <p className="text-white/10 italic">Nenhum log registrado...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="border-l-2 border-white/5 pl-2 py-1 hover:bg-white/5 transition-all">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Página
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-4 rounded-2xl font-bold transition-all"
            >
              Reset Total
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, status = 'neutral' }: { label: string, value: string, status?: 'success' | 'warning' | 'error' | 'neutral' }) {
  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    neutral: 'bg-white/20'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{value}</span>
        <div className={`w-2 h-2 rounded-full ${colors[status]}`}></div>
      </div>
    </div>
  );
}

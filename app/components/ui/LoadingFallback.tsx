'use client';

import React, { useEffect, useState } from 'react';

export default function LoadingFallback() {
  const [visible, setVisible] = useState(true);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const fallback = document.getElementById('loading-fallback');
    if (fallback) {
      fallback.style.display = 'none';
    }
    
    // Show reset button after 4 seconds
    const timer = setTimeout(() => setShowReset(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleForceEnter = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).forceBypass) {
        (window as any).forceBypass();
      } else {
        localStorage.setItem('onnutrition_emergency_bypass', 'true');
        window.location.reload();
      }
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <div 
      id="client-loading-fallback"
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0B2B24] text-white z-[10000] p-6 text-center gap-6"
    >
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/10 border-t-[#27B494] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-[#27B494]/20 rounded-full blur-lg animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tighter">ONNutrition</h2>
        <p className="text-white/40 text-xs uppercase tracking-widest">Iniciando sistema...</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={handleForceEnter}
          className="w-full bg-[#27B494] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#27B494]/20 active:scale-95 transition-all"
        >
          ENTRAR AGORA (FORÇAR)
        </button>

        <button 
          onClick={() => (window as any).ONN_DIAGNOSTICS?.toggle()}
          className="w-full bg-white/5 text-white/40 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Ver Logs de Diagnóstico
        </button>

        {showReset && (
          <button 
            onClick={handleReset}
            className="w-full bg-white/5 text-white/40 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Limpar Cache e Reiniciar
          </button>
        )}
      </div>

      <p className="text-[10px] text-white/20 max-w-[200px]">
        Se o sistema não carregar em alguns segundos, use o botão verde acima.
      </p>
    </div>
  );
}

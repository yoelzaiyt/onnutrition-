'use client';

import React, { useEffect } from 'react';
import { FirebaseProvider, useFirebase } from './FirebaseProvider';
import { SupabaseProvider } from './SupabaseProvider';
import ErrorBoundary from './ErrorBoundary';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

const SyncIndicator = () => {
  const { syncStatus, isFirestoreConnected, syncError } = useFirebase();
  
  if (isFirestoreConnected === null) return null;

  return (
    <div className={`flex items-center gap-2 px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
      syncStatus === 'synced' ? 'bg-green-200 text-green-900' : 
      syncStatus === 'syncing' ? 'bg-blue-200 text-blue-900 animate-pulse' : 
      'bg-red-200 text-red-900'
    }`}>
      {syncStatus === 'synced' ? <Wifi size={10} /> : 
       syncStatus === 'syncing' ? <RefreshCw size={10} className="animate-spin" /> : 
       <WifiOff size={10} />}
      <span>
        {syncStatus === 'synced' ? 'Sincronizado' : 
         syncStatus === 'syncing' ? 'Sincronizando...' : 
         `Erro: ${syncError || 'Sincronização'}`}
      </span>
    </div>
  );
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);
  
  useEffect(() => {
    console.log('ClientLayout Mounted');
    if (typeof window !== 'undefined') {
      window.onerror = (msg, url, line, col, error) => {
        console.error('Global Error:', { msg, url, line, col, error });
      };
      window.onunhandledrejection = (event) => {
        console.error('Unhandled Rejection:', event.reason);
      };
      
      // Attempt to clear any stuck loading states in the DOM
      const fallback = document.getElementById('loading-fallback');
      if (fallback) {
        setTimeout(() => {
          fallback.style.opacity = '0';
          setTimeout(() => {
            fallback.style.display = 'none';
          }, 500);
        }, 1000); // Reduced to 1s for ultra-fast UX
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <SupabaseProvider>
        <FirebaseProvider>
        {/* Debug bar removed for production look */}
        
        {(() => {
          try {
            return children;
          } catch (e: any) {
            return (
              <div className="min-h-screen flex items-center justify-center bg-red-50 p-10 text-red-900">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100">
                  <h1 className="text-2xl font-bold mb-4">Falha na Inicialização</h1>
                  <p className="text-sm mb-6">Ocorreu um erro ao carregar os componentes principais do sistema.</p>
                  <div className="bg-red-50 p-4 rounded-xl font-mono text-[10px] mb-6 overflow-auto max-h-32">
                    {e.message}
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            );
          }
        })()}
      </FirebaseProvider>
    </SupabaseProvider>
  </ErrorBoundary>
  );
}

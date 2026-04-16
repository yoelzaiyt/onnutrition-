'use client';

import React, { useEffect } from 'react';
import { SupabaseProvider } from '@/app/components/layout/SupabaseProvider';
import ErrorBoundary from '@/app/components/ui/ErrorBoundary';

/**
 * ClientLayout
 * Camada de providers client-side.
 * Firebase foi removido — a autenticação e dados são gerenciados exclusivamente pelo Supabase.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Global error capture — registra no console sem travar a aplicação
    window.onerror = (msg, url, line, col, error) => {
      console.error('[Global Error]', { msg, url, line, col, error });
    };
    window.onunhandledrejection = (event) => {
      console.error('[Unhandled Promise Rejection]', event.reason);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </ErrorBoundary>
  );
}

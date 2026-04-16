'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface SupabaseContextType {
  user: SupabaseUser | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  diagnostics: {
    initialized: boolean;
    lastEvent: string;
    lastEventTime: number;
    configValid: boolean;
  };
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  authError: null,
  login: async () => {},
  logout: async () => {},
  diagnostics: {
    initialized: false,
    lastEvent: 'init',
    lastEventTime: Date.now(),
    configValid: false
  }
});

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState({
    initialized: false,
    lastEvent: 'init',
    lastEventTime: Date.now(),
    configValid: false
  });

  const updateDiag = (event: string) => {
    setDiagnostics(prev => ({
      ...prev,
      lastEvent: event,
      lastEventTime: Date.now()
    }));
    if (typeof window !== 'undefined') {
      (window as any).ONN_DIAGNOSTICS?.log(`Supabase: ${event}`);
    }
  };

  useEffect(() => {
    updateDiag('effect-mount');
    if (!supabase) {
      setLoading(false);
      setDiagnostics(prev => ({ ...prev, initialized: true, configValid: false }));
      updateDiag('config-invalid');
      return;
    }

    setDiagnostics(prev => ({ ...prev, configValid: true }));

    // Safety timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          console.warn('SupabaseProvider: getSession timed out after 5s. Forcing loading to false.');
          updateDiag('session-timeout-5s');
          return false;
        }
        return currentLoading;
      });
    }, 5000); // Increased to 5000ms for more stability

    // Get initial session
    updateDiag('get-session-start');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('SupabaseProvider: session retrieved for:', session?.user?.email || 'null');
      clearTimeout(timeoutId);
      
      const sessionUser = session?.user ?? null;
      
      if (sessionUser && sessionUser.email !== 'word.intelligence@gmail.com') {
        console.warn('SupabaseProvider: Non-admin user detected:', sessionUser.email);
        setAuthError('Acesso restrito apenas para administradores.');
        updateDiag('auth-denied-non-admin');
        await supabase.auth.signOut();
        setUser(null);
      } else {
        if (sessionUser) console.log('SupabaseProvider: Admin user confirmed:', sessionUser.email);
        setUser(sessionUser);
        updateDiag(sessionUser ? 'session-found' : 'session-null');
      }
      
      setLoading(false);
      console.log('SupabaseProvider: Loading set to false');
      setDiagnostics(prev => ({ ...prev, initialized: true }));
    }).catch(err => {
      console.error('SupabaseProvider: Error getting session', err);
      clearTimeout(timeoutId);
      setLoading(false);
      updateDiag(`session-error: ${err.message}`);
    });

    // Listen for auth changes
    updateDiag('onAuthStateChange-setup');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('SupabaseProvider: Auth state changed', _event, session?.user?.id);
      
      const sessionUser = session?.user ?? null;
      
      if (sessionUser && sessionUser.email !== 'word.intelligence@gmail.com') {
        console.warn('SupabaseProvider: Non-admin user detected, signing out');
        setAuthError('Acesso restrito apenas para administradores.');
        updateDiag('auth-denied-non-admin');
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(sessionUser);
        updateDiag(sessionUser ? 'session-found' : 'session-null');
      }
      
      setLoading(false);
      updateDiag(`auth-change: ${_event}`);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    updateDiag('login-initiated');
    if (!supabase) {
      setAuthError('Supabase não está configurado. Verifique as variáveis de ambiente.');
      updateDiag('login-failed: config-invalid');
      return;
    }
    setAuthError(null);
    const redirectTo = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });
      if (error) {
        setAuthError(error.message);
        updateDiag(`login-error: ${error.message}`);
      } else {
        updateDiag('login-redirect-start');
      }
    } catch (e: any) {
      setAuthError(e.message);
      updateDiag(`login-exception: ${e.message}`);
    }
  };

  const logout = async () => {
    updateDiag('logout-initiated');
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      updateDiag('logout-success');
    } catch (e) {
      updateDiag('logout-error');
    }
  };

  return (
    <SupabaseContext.Provider value={{ user, loading, authError, login, logout, diagnostics }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);

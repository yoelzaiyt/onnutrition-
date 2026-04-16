'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  isFirestoreConnected: boolean | null;
  syncStatus: 'synced' | 'syncing' | 'error';
  syncError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setMockUser: (email: string) => void;
  diagnostics: {
    authInitialized: boolean;
    lastEvent: string;
    lastEventTime: number;
    configValid: boolean;
  };
}

const FirebaseContext = createContext<FirebaseContextType>({ 
  user: null, 
  loading: true,
  authError: null,
  isFirestoreConnected: null,
  syncStatus: 'syncing',
  syncError: null,
  login: async () => {},
  logout: async () => {},
  setMockUser: () => {},
  diagnostics: {
    authInitialized: false,
    lastEvent: 'init',
    lastEventTime: Date.now(),
    configValid: false
  }
});

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [mockUser, setMockUserInternal] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState({
    authInitialized: false,
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
      (window as any).ONN_DIAGNOSTICS?.log(`Firebase: ${event}`);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSyncError = (e: any) => {
        console.error('FirebaseProvider: Global Sync Error detected', e.detail);
        setSyncStatus('error');
        setSyncError(e.detail?.error || 'Erro desconhecido');
        updateDiag(`sync-error: ${e.detail?.error || 'unknown'}`);
      };
      window.addEventListener('firestore-error', handleSyncError);
      return () => window.removeEventListener('firestore-error', handleSyncError);
    }
  }, []);

  useEffect(() => {
    console.log('FirebaseProvider: User state changed:', user?.email || 'null');
    if (typeof window !== 'undefined') {
      (window as any).ONN_DIAGNOSTICS?.log(`Firebase Auth: User=${user?.email || 'null'}`);
    }
  }, [user]);

  const login = async () => {
    updateDiag('login-initiated');
    console.log('FirebaseProvider: Login initiated');
    if (!auth) {
      console.error('Login: Auth not available');
      setAuthError('Sistema de autenticação indisponível no momento.');
      updateDiag('login-failed: auth-not-available');
      return;
    }
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      console.log('Login: Calling signInWithPopup');
      const result = await signInWithPopup(auth, provider);
      console.log('Login: signInWithPopup success', result.user.uid);
      updateDiag('login-success');
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(`Erro de login (${error.code || 'unknown'}): ${error.message || 'Erro desconhecido'}`);
      updateDiag(`login-error: ${error.code}`);
      
      // If popup is blocked, we might want to suggest redirect automatically
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        console.warn('Login: Popup blocked or cancelled');
        setAuthError('O navegador bloqueou a janela de login. Por favor, permita pop-ups ou use o botão de redirecionamento abaixo.');
      }
    }
  };

  const logout = async () => {
    updateDiag('logout-initiated');
    if (mockUser) {
      setMockUserInternal(null);
      if (typeof window !== 'undefined') localStorage.removeItem('onnutrition_mock_user');
      updateDiag('logout-success-mock');
      return;
    }
    if (!auth) return;
    try {
      await signOut(auth);
      updateDiag('logout-success');
    } catch (error) {
      console.error('Logout error:', error);
      updateDiag('logout-error');
    }
  };

  const setMockUser = (email: string) => {
    updateDiag('set-mock-user');
    const mock = {
      uid: 'mock-admin-uid',
      email: email,
      displayName: 'Administrador (Simulado)',
      photoURL: 'https://picsum.photos/seed/admin/200/200',
      emailVerified: true
    };
    setMockUserInternal(mock);
    setLoading(false); // Ensure loading stops
    if (typeof window !== 'undefined') {
      localStorage.setItem('onnutrition_mock_user', JSON.stringify(mock));
      localStorage.setItem('onnutrition_emergency_bypass', 'true'); // Also trigger bypass
    }
    updateDiag('mock-user-set');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMock = localStorage.getItem('onnutrition_mock_user');
      if (savedMock) {
        try {
          setMockUserInternal(JSON.parse(savedMock));
          setLoading(false); // Stop loading if we have a mock user
          updateDiag('mock-user-restored');
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    console.log('FirebaseProvider Effect - auth exists:', !!auth);
    updateDiag('effect-mount');
    
    // Check for emergency bypass immediately
    if (typeof window !== 'undefined') {
      const isBypass = localStorage.getItem('onnutrition_emergency_bypass') === 'true' || 
                       window.location.search.includes('bypass=true');
      if (isBypass) {
        console.log('FirebaseProvider: Emergency bypass active, disabling loading overlay');
        setLoading(false);
        updateDiag('bypass-active');
        return;
      }
    }

    if (!auth) {
      setLoading(false);
      setDiagnostics(prev => ({ ...prev, authInitialized: true, configValid: false }));
      updateDiag('auth-not-found');
      return;
    }

    setDiagnostics(prev => ({ ...prev, configValid: true }));

    // Safety timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          console.warn('FirebaseProvider: onAuthStateChanged timed out after 5s. Forcing loading to false.');
          updateDiag('auth-timeout-5s');
          return false;
        }
        return currentLoading;
      });
      setIsFirestoreConnected(current => current === null ? true : current);
    }, 5000); // Increased to 5000ms for more stability

    let unsubscribe: () => void = () => {};
    try {
      if (!auth) {
        console.warn('FirebaseProvider: Auth instance is null');
        updateDiag('auth-null');
        setLoading(false);
        return;
      }
      updateDiag('onAuthStateChanged-setup');
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          console.log('FirebaseProvider: onAuthStateChanged triggered. User:', user?.email || 'null');
          clearTimeout(timeoutId);
          
          if (user) {
            setUser(user);
            updateDiag('auth-user-found');
          } else {
            setUser(null);
            updateDiag('auth-user-null');
          }

          setLoading(false);
          console.log('FirebaseProvider: Loading set to false');
          setDiagnostics(prev => ({ ...prev, authInitialized: true }));

          // Test firestore connection when auth state is known
          if (user) {
            updateDiag('firestore-test-start');
            import('@/app/lib/firestore-utils').then(({ testFirestoreConnection }) => {
              testFirestoreConnection().then(connected => {
                console.log('FirebaseProvider: Firestore connection test result:', connected);
                setIsFirestoreConnected(connected);
                setSyncStatus(connected ? 'synced' : 'error');
                if (!connected) setSyncError('Cliente Offline');
                updateDiag(connected ? 'firestore-connected' : 'firestore-offline');
              });
            }).catch(err => {
              console.error('FirebaseProvider: Error loading firestore-utils:', err);
              updateDiag('firestore-test-import-error');
            });
          } else {
            setIsFirestoreConnected(true); // Assume OK if not logged in (for public docs)
            setSyncStatus('synced');
          }
        } catch (e: any) {
          console.error('FirebaseProvider: CRITICAL ERROR in onAuthStateChanged:', e);
          updateDiag(`auth-callback-error: ${e.message}`);
          setLoading(false);
        }
      });
    } catch (error: any) {
      console.error('FirebaseProvider: Error in onAuthStateChanged setup:', error);
      setLoading(false);
      setAuthError(`Erro crítico de inicialização: ${error.message}`);
      updateDiag(`auth-setup-error: ${error.message}`);
    }
    // Listen for custom firestore errors from other components
    const handleFirestoreError = (e: any) => {
      console.error('FirebaseProvider: Caught Firestore error from event', e.detail);
      setSyncStatus('error');
      setSyncError(e.detail.error);
      setIsFirestoreConnected(false);
    };
    window.addEventListener('firestore-error', handleFirestoreError);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      window.removeEventListener('firestore-error', handleFirestoreError);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ONN_DIAGNOSTICS?.log('FirebaseProvider Mounted');
    }
  }, []);

  return (
    <FirebaseContext.Provider value={{ 
      user: user || mockUser, 
      loading, 
      authError, 
      login, 
      logout,
      setMockUser,
      isFirestoreConnected,
      syncStatus,
      syncError,
      diagnostics
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);

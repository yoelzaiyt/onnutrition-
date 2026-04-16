/**
 * firestore-utils.ts  →  supabase-utils.ts (compatível)
 * Shim que mantém a API pública mas usa Supabase em vez de Firebase.
 * Isso evita quebrar importações existentes que chamam `testFirestoreConnection`.
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/** Testa se o Supabase está acessível */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.info('Supabase not configured — running in Demo Mode');
    return true; // Demo mode sempre "conectado"
  }
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.warn('Supabase connection test warning:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Supabase connection test failed:', err.message);
    return false;
  }
}

/** Mantido por compatibilidade — não faz nada no Supabase */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('[Supabase Error]', { operationType, path, error });
}

/** Simula subscribeToCollection para compatibilidade */
export function subscribeToCollection<T = any>(collection: string, callback: (data: T[]) => void, _queryConstraints?: any[]): () => void {
  console.log(`[Firestore] Simulated subscription to ${collection}`);
  callback([] as T[]);
  return () => {};
}

/** Simula addDocument para compatibilidade */
export async function addDocument(collection: string, data: any) {
  console.log(`[Firestore] Simulated add to ${collection}:`, data);
  return { id: 'mock-id', ...data };
}

/** Simula deleteDocument para compatibilidade */
export async function deleteDocument(collection: string, id: string) {
  console.log(`[Firestore] Simulated delete from ${collection}:`, id);
  return true;
}

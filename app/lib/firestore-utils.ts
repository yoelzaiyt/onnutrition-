/**
 * firestore-utils.ts - Wrapper que usa Supabase de verdade
 * Mantém a API pública compatível com código existente
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

export async function testFirestoreConnection(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.info('Supabase not configured — running in Demo Mode');
    return true;
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('[Supabase Error]', { operationType, path, error });
}

export function subscribeToCollection<T = any>(
  collection: string, 
  callback: (data: T[]) => void, 
  queryConstraints?: any[]
): () => void {
  if (!isSupabaseConfigured) {
    console.log(`[Firestore Demo] Simulated subscription to ${collection}`);
    callback([] as T[]);
    return () => {};
  }

  let query = supabase.from(collection).select('*');
  
  if (queryConstraints) {
    queryConstraints.forEach((constraint: any) => {
      if (constraint.field && constraint.operator && constraint.value) {
        query = query.eq(constraint.field, constraint.value);
      }
    });
  }

  const channel = supabase
    .channel(`realtime:${collection}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: collection }, (payload) => {
      console.log('[Firestore Realtime]', payload);
    })
    .subscribe();

  query.then(({ data, error }) => {
    if (error) {
      console.error(`[Firestore] Error fetching ${collection}:`, error);
      callback([] as T[]);
    } else {
      callback(data as T[]);
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function addDocument(collection: string, data: any) {
  if (!isSupabaseConfigured) {
    console.log(`[Firestore Demo] Simulated add to ${collection}:`, data);
    return { id: 'demo-id', ...data, created_at: new Date().toISOString() };
  }

  const { data: result, error } = await supabase
    .from(collection)
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error(`[Firestore] Error adding to ${collection}:`, error);
    throw error;
  }

  return result;
}

export async function deleteDocument(collection: string, id: string) {
  if (!isSupabaseConfigured) {
    console.log(`[Firestore Demo] Simulated delete from ${collection}:`, id);
    return true;
  }

  const { error } = await supabase
    .from(collection)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[Firestore] Error deleting from ${collection}:`, error);
    throw error;
  }

  return true;
}

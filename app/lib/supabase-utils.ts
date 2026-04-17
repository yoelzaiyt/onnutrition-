import { supabase } from "@/lib/supabase";

/**
 * Interface genérica para respostas do Supabase
 */
export interface DBResponse<T> {
  data: T | null;
  error: any;
}

/**
 * Insere um documento em uma tabela
 */
export async function addDocument<T>(tableName: string, data: any): Promise<DBResponse<T>> {
  const { data: result, error } = await supabase
    .from(tableName)
    .insert([data])
    .select()
    .single();

  return { data: result as T, error };
}

/**
 * Busca todos os documentos de uma tabela (com filtro opcional)
 */
export async function getDocuments<T>(
  tableName: string, 
  filter?: { column: string; value: any }
): Promise<DBResponse<T[]>> {
  let query = supabase.from(tableName).select("*");
  
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  const { data, error } = await query;
  return { data: data as T[], error };
}

/**
 * Busca um documento por ID
 */
export async function getDocumentById<T>(tableName: string, id: string): Promise<DBResponse<T>> {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  return { data: data as T, error };
}

/**
 * Atualiza um documento
 */
export async function updateDocument(tableName: string, id: string, updates: any) {
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

/**
 * Deleta um documento
 */
export async function deleteDocument(tableName: string, id: string) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", id);

  return { error };
}

/**
 * Helper para subscrever a mudanças (Real-time)
 */
export function subscribeToTable(tableName: string, callback: (payload: any) => void) {
  return supabase
    .channel(`public:${tableName}`)
    .on("postgres_changes", { event: "*", schema: "public", table: tableName }, callback)
    .subscribe();
}

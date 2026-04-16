import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { patientService, Patient } from './patientService';

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export interface ExportData {
  type: 'patients' | 'anthropometry' | 'prescriptions' | 'finance';
  data: any[];
  filename: string;
}

const CSV_DELIMITER = ',';
const CSV_LINE_BREAK = '\n';

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(CSV_DELIMITER) || str.includes('"') || str.includes(CSV_LINE_BREAK)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === CSV_DELIMITER && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export const dataService = {
  async exportPatients(nutriId: string): Promise<ExportData> {
    const patients = await patientService.getAll(nutriId);
    
    const headers = [
      'name', 'email', 'phone', 'status', 'birth_date', 'gender',
      'cpf', 'instagram', 'objective', 'activity_level',
      'food_restrictions', 'history', 'tags', 'created_at'
    ];
    
    const rows = patients.map(p => [
      p.name, p.email, p.phone, p.status, p.birth_date, p.gender,
      p.cpf, p.instagram, p.objective, p.activity_level,
      p.food_restrictions, p.history, (p.tags || []).join(';'), p.created_at
    ].map(escapeCSV).join(CSV_DELIMITER));
    
    const csv = [headers.join(CSV_DELIMITER), ...rows].join(CSV_LINE_BREAK);
    
    return {
      type: 'patients',
      data: patients,
      filename: `pacientes_${new Date().toISOString().split('T')[0]}.csv`
    };
  },

  async exportAnthropometry(patientIds: string[]): Promise<ExportData> {
    const allData: any[] = [];
    
    for (const patientId of patientIds) {
      if (!isSupabaseConfigured) {
        allData.push(
          { patient_id: patientId, weight: 70, height: 165, date: '2026-03-15', imc: 25.7 },
          { patient_id: patientId, weight: 68, height: 165, date: '2026-02-15', imc: 24.9 }
        );
        continue;
      }
      
      const { data } = await supabase
        .from('anthropometry')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
        
      if (data) allData.push(...data);
    }
    
    const headers = ['patient_id', 'date', 'weight', 'height', 'imc', 'fat_percentage', 'muscle_mass'];
    const rows = allData.map(d => [
      d.patient_id, d.date, d.weight, d.height, d.imc, d.fat_percentage, d.muscle_mass
    ].map(escapeCSV).join(CSV_DELIMITER));
    
    const csv = [headers.join(CSV_DELIMITER), ...rows].join(CSV_LINE_BREAK);
    
    return {
      type: 'anthropometry',
      data: allData,
      filename: `antropometria_${new Date().toISOString().split('T')[0]}.csv`
    };
  },

  async exportFinance(nutriId: string): Promise<ExportData> {
    const { financeService } = await import('./financeService');
    const payments = await financeService.getAll(nutriId);
    
    const headers = ['patient_name', 'amount', 'date', 'status', 'method', 'description'];
    const rows = payments.map(p => [
      p.patient_name, p.amount, p.date, p.status, p.method, p.description
    ].map(escapeCSV).join(CSV_DELIMITER));
    
    const csv = [headers.join(CSV_DELIMITER), ...rows].join(CSV_LINE_BREAK);
    
    return {
      type: 'finance',
      data: payments,
      filename: `financeiro_${new Date().toISOString().split('T')[0]}.csv`
    };
  },

  async importPatients(nutriId: string, csvContent: string): Promise<ImportResult> {
    const lines = csvContent.split(CSV_LINE_BREAK).filter(l => l.trim());
    if (lines.length < 2) {
      return { success: false, imported: 0, errors: ['CSV vazio ou sem dados'] };
    }
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const requiredFields = ['name', 'email'];
    
    const missing = requiredFields.filter(f => !headers.includes(f));
    if (missing.length > 0) {
      return { success: false, imported: 0, errors: [`Campos obrigatórios faltando: ${missing.join(', ')}`] };
    }
    
    const errors: string[] = [];
    let imported = 0;
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const row: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          if (header === 'tags') {
            row[header] = value ? value.split(';').map((t: string) => t.trim()) : [];
          } else {
            row[header] = value;
          }
        });
        
        row.nutri_id = nutriId;
        row.status = row.status || 'Ativo';
        
        if (!row.name || !row.email) {
          errors.push(`Linha ${i + 1}: Nome e email são obrigatórios`);
          continue;
        }
        
        await patientService.create(row);
        imported++;
      } catch (err) {
        errors.push(`Linha ${i + 1}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      }
    }
    
    return {
      success: errors.length === 0,
      imported,
      errors
    };
  },

  downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  async getAllPatientIds(nutriId: string): Promise<string[]> {
    const patients = await patientService.getAll(nutriId);
    return patients.map(p => p.id);
  }
};

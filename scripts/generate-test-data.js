const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_PATIENTS = [
  { name: 'Maria Oliveira', email: 'maria.oliveira@email.com', phone: '(11) 98888-0001', gender: 'Feminino', birth_date: '1992-05-15', objective: 'Emagrecimento Saudável', activity_level: 'Moderado', food_restrictions: 'Lactose', history: 'Paciente com histórico de ganho de peso nos últimos 2 anos.' },
  { name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 98888-0002', gender: 'Masculino', birth_date: '1985-08-22', objective: 'Hipertrofia Muscular', activity_level: 'Ativo', food_restrictions: '', history: 'Praticante de musculação há 3 anos.' },
  { name: 'Ana Costa', email: 'ana.costa@email.com', phone: '(11) 98888-0003', gender: 'Feminino', birth_date: '1990-03-10', objective: 'Manutenção de Peso', activity_level: 'Leve', food_restrictions: 'Glúten', history: 'Paciente celíaca.' },
  { name: 'Roberto Lima', email: 'roberto.lima@email.com', phone: '(11) 98888-0004', gender: 'Masculino', birth_date: '1978-11-25', objective: 'Controle de Diabetes', activity_level: 'Sedentário', food_restrictions: 'Açúcar', history: 'Diabetes Tipo 2 diagnosticado há 1 ano.' },
  { name: 'Luciana Alves', email: 'luciana.alves@email.com', phone: '(11) 98888-0005', gender: 'Feminino', birth_date: '1995-01-30', objective: 'Emagrecimento Rápido', activity_level: 'Moderado', food_restrictions: '', history: 'Jornalista com rotina estressante.' },
  { name: 'Carlos Souza', email: 'carlos.souza@email.com', phone: '(11) 98888-0006', gender: 'Masculino', birth_date: '1982-07-18', objective: 'Hipertrofia Muscular', activity_level: 'Muito Ativo', food_restrictions: 'Proteína do leite', history: 'Atleta amador de crossfit.' },
  { name: 'Beatriz Fernandes', email: 'beatriz.fernandes@email.com', phone: '(11) 98888-0007', gender: 'Feminino', birth_date: '1988-04-12', objective: 'Gestação Saudável', activity_level: 'Leve', food_restrictions: '', history: 'Gestante de 20 semanas.' },
  { name: 'Felipe Rocha', email: 'felipe.rocha@email.com', phone: '(11) 98888-0008', gender: 'Masculino', birth_date: '1993-09-05', objective: 'Melhora de Performance', activity_level: 'Muito Ativo', food_restrictions: '', history: 'Corredor amador.' },
];

async function generateTestData() {
  console.log('🔄 Gerando dados de teste...\n');
  
  const nutriId = 'demo-nutri-id';
  let count = 0;
  
  for (const patient of TEST_PATIENTS) {
    try {
      console.log(`  📋 Criando: ${patient.name}`);
      
      const { data, error } = await supabase
        .from('patients')
        .insert({
          nutri_id: nutriId,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          birth_date: patient.birth_date,
          objective: patient.objective,
          activity_level: patient.activity_level,
          food_restrictions: patient.food_restrictions,
          history: patient.history,
          status: 'Ativo',
          current_status: 'Em Consulta',
        })
        .select('id')
        .single();

      if (error) {
        console.log(`     ⚠️ ${error.message}`);
      } else {
        console.log(`     ✅ ID: ${data.id}`);
        count++;
        
        await supabase.from('goals').insert([
          { patient_id: data.id, nutri_id: nutriId, title: 'Reduzir peso corporal', category: 'Peso', start_value: 80, target_value: 70, current_value: 75, unit: 'kg', deadline: '2026-09-01', status: 'Em progresso' },
          { patient_id: data.id, nutri_id: nutriId, title: 'Aumentar consumo proteico', category: 'Alimentação', start_value: 60, target_value: 120, current_value: 90, unit: 'g', deadline: '2026-06-01', status: 'Em progresso' },
        ]);
        
        await supabase.from('recommendations').insert([
          { patient_id: data.id, nutri_id: nutriId, title: 'Higiene do Sono', content: '1. Evite telas 1h antes de dormir.\n2. Mantenha quarto escuro.\n3. Evite cafeína após 16h.', category: 'Hábitos' },
          { patient_id: data.id, nutri_id: nutriId, title: 'Hidratação', content: 'Beba pelo menos 2L de água por dia.', category: 'Alimentação' },
        ]);
        
        await supabase.from('medical_records').insert({
          patient_id: data.id,
          nutri_id: nutriId,
          clinical_history: `Histórico: ${patient.history}\n\nObjetivo: ${patient.objective}\n\nAtividade: ${patient.activity_level}`,
          nutritional_diagnosis: `Paciente apresenta necessidade de intervenção nutricional para ${patient.objective.toLowerCase()}.`,
        });
      }
    } catch (err) {
      console.log(`     ❌ Erro: ${err.message}`);
    }
  }
  
  console.log(`\n🎉 Concluído! ${count} pacientes criados.`);
}

generateTestData();

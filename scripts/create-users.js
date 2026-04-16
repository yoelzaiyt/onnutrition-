const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wyxyqghxtfvmkpanrdhe.supabase.co';
const supabaseKey = 'sb_publishable_zMA__WPLO2EAtL62vfm50g_a67P62Au';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
  console.log('Criando usuários no Supabase...');

  const users = [
    {
      email: 'word.intelligence@gmail.com',
      password: 'Admin123!',
      metadata: { full_name: 'Administrador', role: 'admin' }
    },
    {
      email: 'cassiaibj@gmail.com',
      password: 'Nutri123!',
      metadata: { full_name: 'Cássia Nutricionista', role: 'nutri' }
    }
  ];

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      });

      if (error) {
        console.log(`Erro ao criar ${user.email}:`, error.message);
      } else {
        console.log(`Usuário criado: ${user.email}`);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: user.email,
            full_name: user.metadata.full_name,
            role: user.metadata.role
          });

        if (profileError) {
          console.log(`Erro ao criar perfil:`, profileError.message);
        } else {
          console.log(`Perfil criado com role: ${user.metadata.role}`);
        }
      }
    } catch (err) {
      console.log(`Erro para ${user.email}:`, err.message);
    }
  }
}

createUsers();
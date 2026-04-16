import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role = 'nutri' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuração do Supabase incompleta' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email in auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const userList = users?.users ?? [];
    const user = userList.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado no Supabase Auth' }, { status: 404 });
    }

    // Update profile role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Perfil atualizado com sucesso',
      userId: user.id,
      role 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    usage: 'POST with { email: "user@email.com", role: "nutri|admin|patient" }' 
  });
}
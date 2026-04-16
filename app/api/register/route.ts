import { NextResponse } from 'next/server';

/**
 * API Route para simulação de cadastro (NutriCore)
 * Adaptado do snippet Express para Next.js App Router
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, email, password } = body;

    // Aqui você poderia adicionar lógica real de banco de dados ou integração
    // No momento, mantemos a simulação conforme solicitado no snippet original.
    
    console.log(`[NutriCore API] Novo registro solicitado: ${email} (${type})`);

    return NextResponse.json({
      message: "Usuário criado com sucesso",
      type,
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Erro ao processar o cadastro",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 400 });
  }
}

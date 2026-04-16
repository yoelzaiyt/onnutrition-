import { NextResponse } from 'next/server';
import { generateTestData } from '@/app/lib/testDataGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nutriId = body.nutriId || 'demo-nutri-id';
    
    const result = await generateTestData(nutriId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating test data:', error);
    return NextResponse.json(
      { success: false, patients: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] },
      { status: 500 }
    );
  }
}

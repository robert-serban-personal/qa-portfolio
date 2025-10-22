import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check what environment variables are available
    const envVars = {
      hasDATABASE_URL: !!process.env.DATABASE_URL,
      hasPOSTGRES_URL: !!process.env.POSTGRES_URL,
      hasPRISMA_DATABASE_URL: !!process.env.PRISMA_DATABASE_URL,
      DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 20),
      POSTGRES_URL_prefix: process.env.POSTGRES_URL?.substring(0, 20),
    };

    if (!prisma) {
      return NextResponse.json({ 
        error: 'Database not available. Please set up DATABASE_URL.',
        environmentVariables: envVars,
        message: 'Prisma client was not initialized. Check the logs for details.'
      }, { status: 503 });
    }

    // Test database connection
    await prisma.$connect();
    
    // Try to count users
    const userCount = await prisma.user.count();

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      userCount,
      environmentVariables: envVars
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({ 
      error: 'Database test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      environmentVariables: {
        hasDATABASE_URL: !!process.env.DATABASE_URL,
        hasPOSTGRES_URL: !!process.env.POSTGRES_URL,
        hasPRISMA_DATABASE_URL: !!process.env.PRISMA_DATABASE_URL,
      }
    }, { status: 500 });
  }
}

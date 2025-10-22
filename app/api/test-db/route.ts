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
      NODE_ENV: process.env.NODE_ENV,
    };

    console.log('Test DB endpoint called');
    console.log('Environment variables:', envVars);
    console.log('Prisma client:', prisma ? 'Available' : 'Not available');

    if (!prisma) {
      return NextResponse.json({ 
        error: 'Database not available. Please set up DATABASE_URL.',
        environmentVariables: envVars,
        message: 'Prisma client was not initialized. Check the logs for details.',
        debug: {
          prismaClient: prisma,
          prismaType: typeof prisma,
        }
      }, { status: 503 });
    }

    console.log('Attempting to connect to database...');
    // Test database connection
    await prisma.$connect();
    console.log('Connected successfully, counting users...');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      userCount,
      environmentVariables: envVars,
      debug: {
        prismaClient: 'Available',
        connectionTest: 'Passed',
      }
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
        NODE_ENV: process.env.NODE_ENV,
      },
      debug: {
        prismaClient: prisma ? 'Available' : 'Not available',
        errorType: typeof error,
        errorName: error instanceof Error ? error.name : 'Unknown',
      }
    }, { status: 500 });
  }
}

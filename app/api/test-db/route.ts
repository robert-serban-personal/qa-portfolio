import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ 
        error: 'Database not available. Please set up DATABASE_URL.' 
      }, { status: 503 });
    }

    // Test database connection
    await prisma.$connect();
    
    // Try to create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    // Try to create a test ticket
    const testTicket = await prisma.ticket.upsert({
      where: { id: 'test-ticket' },
      update: {},
      create: {
        id: 'test-ticket',
        title: 'Test Ticket',
        description: 'This is a test ticket to verify database connectivity.',
        status: 'TO_DO',
        priority: 'MEDIUM',
        type: 'TASK',
        reporterId: testUser.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      user: testUser,
      ticket: testTicket
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({ 
      error: 'Database test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined
    }, { status: 500 });
  }
}

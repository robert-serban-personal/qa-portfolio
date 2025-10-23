import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'No database URL found' 
      }, { status: 400 });
    }

    console.log('Creating Prisma client...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('Testing user query...');
    const userCount = await prisma.user.count();
    
    console.log('Testing ticket query...');
    const ticketCount = await prisma.ticket.count();
    
    console.log('Testing ticket creation...');
    const testTicket = await prisma.ticket.create({
      data: {
        title: 'Test Ticket',
        description: 'This is a test ticket',
        status: 'TO_DO',
        priority: 'MEDIUM',
        type: 'TASK',
        reporterId: (await prisma.user.findFirst())?.id || 'test-id',
        labels: {
          create: [
            { name: 'test' }
          ]
        }
      },
      include: {
        labels: true
      }
    });
    
    console.log('Cleaning up test ticket...');
    await prisma.ticket.delete({
      where: { id: testTicket.id }
    });
    
    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true,
      userCount,
      ticketCount,
      testTicketCreated: true,
      message: 'All database operations successful!'
    });

  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({ 
      error: 'Database test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}





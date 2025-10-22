import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'No database URL found. Please set DATABASE_URL or POSTGRES_URL in Vercel environment variables.' 
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Test connection
    await prisma.$connect();
    
    // Create sample users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      }),
      prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      }),
      prisma.user.upsert({
        where: { email: 'mike@example.com' },
        update: {},
        create: {
          name: 'Mike Johnson',
          email: 'mike@example.com',
        },
      }),
      prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
        },
      }),
    ]);

    // Create sample tickets
    const tickets = await Promise.all([
      prisma.ticket.create({
        data: {
          title: 'Fix login bug',
          description: 'Users are unable to log in with their credentials.',
          status: 'TO_DO',
          priority: 'HIGH',
          type: 'BUG',
          assigneeId: users[0].id,
          reporterId: users[1].id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          labels: {
            create: [
              { name: 'authentication' },
              { name: 'critical' },
            ],
          },
        },
      }),
      prisma.ticket.create({
        data: {
          title: 'Add dark mode',
          description: 'Implement dark mode toggle for better user experience.',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          type: 'FEATURE',
          assigneeId: users[2].id,
          reporterId: users[0].id,
          labels: {
            create: [
              { name: 'ui' },
              { name: 'enhancement' },
            ],
          },
        },
      }),
    ]);

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully!',
      usersCreated: users.length,
      ticketsCreated: tickets.length,
      databaseUrl: databaseUrl.substring(0, 20) + '...' // Hide sensitive info
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    
    return NextResponse.json({ 
      error: 'Database setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

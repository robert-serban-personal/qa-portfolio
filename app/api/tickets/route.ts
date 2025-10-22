import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // If no database is available, return empty array
    if (!prisma) {
      return NextResponse.json([]);
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        assignee: true,
        reporter: true,
        labels: true,
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // If no database is available, return error
    if (!prisma) {
      return NextResponse.json({ 
        error: 'Database not available. Please set up DATABASE_URL and run database migrations.' 
      }, { status: 503 });
    }

    const body = await request.json();
    const { title, description, priority, type, assigneeId, dueDate, labels } = body;

    // Create or find reporter (for now, use first user or create default)
    let reporter = await prisma.user.findFirst();
    if (!reporter) {
      reporter = await prisma.user.create({
        data: {
          name: 'System User',
          email: 'system@example.com',
        },
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        type: type || 'TASK',
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        reporterId: reporter.id,
        labels: {
          create: labels?.map((label: string) => ({
            name: label,
          })) || [],
        },
      },
      include: {
        assignee: true,
        reporter: true,
        labels: true,
        attachments: true,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Provide more specific error information
    if (error instanceof Error && 'code' in error && error.code === 'P2021') {
      return NextResponse.json({ 
        error: 'Database tables do not exist. Please run database migrations first.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create ticket', 
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
    }, { status: 500 });
  }
}


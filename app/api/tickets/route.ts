import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
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
          create: labels?.map((label: string) => ({ name: label })) || [],
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
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}


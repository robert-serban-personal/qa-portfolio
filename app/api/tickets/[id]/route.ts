import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // If no database is available, return 404
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignee: true,
        reporter: true,
        labels: true,
        attachments: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Convert to frontend format
    const convertedTicket = {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      dueDate: ticket.dueDate ? ticket.dueDate.toISOString() : null,
      attachments: ticket.attachments.map(att => ({
        ...att,
        uploadedAt: att.uploadedAt.toISOString(),
      })),
    };

    return NextResponse.json(convertedTicket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // If no database is available, return error
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, type, assigneeId, dueDate, labels } = body;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(type && { type }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(labels && {
          labels: {
            set: labels.map((labelName: string) => ({ name: labelName })),
            connectOrCreate: labels.map((labelName: string) => ({
              where: { name: labelName },
              create: { name: labelName },
            })),
          },
        }),
      },
      include: {
        assignee: true,
        reporter: true,
        labels: true,
        attachments: true,
      },
    });

    // Convert to frontend format
    const convertedTicket = {
      ...updatedTicket,
      createdAt: updatedTicket.createdAt.toISOString(),
      updatedAt: updatedTicket.updatedAt.toISOString(),
      dueDate: updatedTicket.dueDate ? updatedTicket.dueDate.toISOString() : null,
      attachments: updatedTicket.attachments.map(att => ({
        ...att,
        uploadedAt: att.uploadedAt.toISOString(),
      })),
    };

    return NextResponse.json(convertedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // If no database is available, return error
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const { id } = await params;
    await prisma.ticket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}


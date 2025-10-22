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
    console.log('PUT /api/tickets/[id] - Request body:', JSON.stringify(body, null, 2));
    const { title, description, status, priority, type, assigneeId, dueDate, labels, attachments, removeAttachmentId } = body;

    // Convert frontend format to database format
    const convertStatus = (status: string): 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' => {
      const statusMap: { [key: string]: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' } = {
        'To Do': 'TO_DO',
        'In Progress': 'IN_PROGRESS', 
        'In Review': 'IN_REVIEW',
        'Done': 'DONE'
      };
      return statusMap[status] || 'TO_DO';
    };

    const convertPriority = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
      const priorityMap: { [key: string]: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } = {
        'Low': 'LOW',
        'Medium': 'MEDIUM',
        'High': 'HIGH', 
        'Critical': 'CRITICAL'
      };
      return priorityMap[priority] || 'MEDIUM';
    };

    const convertType = (type: string): 'BUG' | 'FEATURE' | 'TASK' | 'EPIC' | 'STORY' => {
      const typeMap: { [key: string]: 'BUG' | 'FEATURE' | 'TASK' | 'EPIC' | 'STORY' } = {
        'Bug': 'BUG',
        'Feature': 'FEATURE',
        'Task': 'TASK',
        'Epic': 'EPIC',
        'Story': 'STORY'
      };
      return typeMap[type] || 'TASK';
    };

    // Prepare update data
    const updateData: any = {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status: convertStatus(status) }),
      ...(priority && { priority: convertPriority(priority) }),
      ...(type && { type: convertType(type) }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
    };

    // Handle labels separately to avoid issues
    if (labels && Array.isArray(labels)) {
      updateData.labels = {
        set: labels.map((labelName: string) => ({ name: labelName })),
        connectOrCreate: labels.map((labelName: string) => ({
          where: { name: labelName },
          create: { name: labelName },
        })),
      };
    }

    // Handle attachments separately
    if (attachments && attachments.length > 0) {
      updateData.attachments = {
        create: attachments.map((att: any) => ({
          name: att.name,
          size: att.size,
          type: att.type,
          url: att.url,
          uploadedAt: new Date(att.uploadedAt),
        })),
      };
    }

    // Handle attachment removal
    if (removeAttachmentId) {
      updateData.attachments = {
        delete: { id: removeAttachmentId },
      };
    }

    console.log('PUT /api/tickets/[id] - Update data:', JSON.stringify(updateData, null, 2));

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        assignee: true,
        reporter: true,
        labels: true,
        attachments: true,
      },
    });

    // Convert database format to frontend format
    const convertDbStatusToFrontend = (status: string): string => {
      const statusMap: { [key: string]: string } = {
        'TO_DO': 'To Do',
        'IN_PROGRESS': 'In Progress',
        'IN_REVIEW': 'In Review', 
        'DONE': 'Done'
      };
      return statusMap[status] || status;
    };

    const convertDbPriorityToFrontend = (priority: string): string => {
      const priorityMap: { [key: string]: string } = {
        'LOW': 'Low',
        'MEDIUM': 'Medium',
        'HIGH': 'High',
        'CRITICAL': 'Critical'
      };
      return priorityMap[priority] || priority;
    };

    const convertDbTypeToFrontend = (type: string): string => {
      const typeMap: { [key: string]: string } = {
        'BUG': 'Bug',
        'FEATURE': 'Feature', 
        'TASK': 'Task',
        'EPIC': 'Epic',
        'STORY': 'Story'
      };
      return typeMap[type] || type;
    };

    // Convert to frontend format
    const convertedTicket = {
      ...updatedTicket,
      status: convertDbStatusToFrontend(updatedTicket.status),
      priority: convertDbPriorityToFrontend(updatedTicket.priority),
      type: convertDbTypeToFrontend(updatedTicket.type),
      labels: updatedTicket.labels.map(label => label.name),
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
      error: 'Failed to update ticket', 
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? error.code : undefined,
    }, { status: 500 });
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


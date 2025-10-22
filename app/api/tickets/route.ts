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

    // Convert database format to frontend format
    const convertedTickets = tickets.map(ticket => ({
      ...ticket,
      status: convertDbStatusToFrontend(ticket.status),
      priority: convertDbPriorityToFrontend(ticket.priority),
      type: convertDbTypeToFrontend(ticket.type),
      labels: ticket.labels.map(label => label.name),
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      dueDate: ticket.dueDate ? ticket.dueDate.toISOString() : null,
      attachments: ticket.attachments.map(att => ({
        ...att,
        uploadedAt: att.uploadedAt.toISOString(),
      })),
    }));

    return NextResponse.json(convertedTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// Helper functions to convert database format to frontend format
function convertDbStatusToFrontend(status: string): string {
  const statusMap: { [key: string]: string } = {
    'TO_DO': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'IN_REVIEW': 'In Review', 
    'DONE': 'Done'
  };
  return statusMap[status] || status;
}

function convertDbPriorityToFrontend(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical'
  };
  return priorityMap[priority] || priority;
}

function convertDbTypeToFrontend(type: string): string {
  const typeMap: { [key: string]: string } = {
    'BUG': 'Bug',
    'FEATURE': 'Feature', 
    'TASK': 'Task',
    'EPIC': 'Epic',
    'STORY': 'Story'
  };
  return typeMap[type] || type;
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

    console.log('Creating ticket with data:', { title, description, priority, type, assigneeId, dueDate, labels });

    // Convert frontend status format to database format
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

    console.log('Using reporter:', reporter.id);

    // Create ticket without labels first
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: convertPriority(priority),
        type: convertType(type),
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        reporterId: reporter.id,
      },
      include: {
        assignee: true,
        reporter: true,
        labels: true,
        attachments: true,
      },
    });

    console.log('Ticket created successfully:', ticket.id);

    // Add labels separately if provided
    if (labels && labels.length > 0) {
      console.log('Adding labels:', labels);
      for (const label of labels) {
        await prisma.ticketLabel.create({
          data: {
            name: label,
            ticketId: ticket.id,
          },
        });
      }
      
      // Fetch updated ticket with labels
      const updatedTicket = await prisma.ticket.findUnique({
        where: { id: ticket.id },
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
        status: convertDbStatusToFrontend(updatedTicket!.status),
        priority: convertDbPriorityToFrontend(updatedTicket!.priority),
        type: convertDbTypeToFrontend(updatedTicket!.type),
        labels: updatedTicket!.labels.map(label => label.name),
        createdAt: updatedTicket!.createdAt.toISOString(),
        updatedAt: updatedTicket!.updatedAt.toISOString(),
        dueDate: updatedTicket!.dueDate ? updatedTicket!.dueDate.toISOString() : null,
        attachments: updatedTicket!.attachments.map(att => ({
          ...att,
          uploadedAt: att.uploadedAt.toISOString(),
        })),
      };
      
      return NextResponse.json(convertedTicket);
    }

    // Convert to frontend format
    const convertedTicket = {
      ...ticket,
      status: convertDbStatusToFrontend(ticket.status),
      priority: convertDbPriorityToFrontend(ticket.priority),
      type: convertDbTypeToFrontend(ticket.type),
      labels: ticket.labels.map(label => label.name),
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


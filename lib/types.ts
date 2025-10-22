export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assignee?: User;
  reporter: User;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  labels: string[];
  attachments: Attachment[];
}

export type TicketStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketType = 'Bug' | 'Feature' | 'Task' | 'Epic' | 'Story';

export interface CreateTicketData {
  title: string;
  description: string;
  priority: TicketPriority;
  type: TicketType;
  assigneeId?: string;
  dueDate?: Date;
  labels: string[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  assigneeId?: string;
  dueDate?: Date;
  labels?: string[];
}


import { Ticket, CreateTicketData, UpdateTicketData, User, TicketStatus, Attachment } from './types';

const STORAGE_KEY = 'qa-portfolio-tickets';
const USERS_STORAGE_KEY = 'qa-portfolio-users';

// Sample users for the system
const defaultUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com' },
];

export class TicketService {
  private static getTicketsFromStorage(): Ticket[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).map((ticket: any) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      dueDate: ticket.dueDate ? new Date(ticket.dueDate) : undefined,
    })) : [];
  }

  private static saveTicketsToStorage(tickets: Ticket[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }

  private static getUsersFromStorage(): User[] {
    if (typeof window === 'undefined') return defaultUsers;
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultUsers;
  }

  private static saveUsersToStorage(users: User[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  static getAllTickets(): Ticket[] {
    return this.getTicketsFromStorage();
  }

  static getTicketById(id: string): Ticket | undefined {
    return this.getTicketsFromStorage().find(ticket => ticket.id === id);
  }

  static createTicket(data: CreateTicketData): Ticket {
    const tickets = this.getTicketsFromStorage();
    const users = this.getUsersFromStorage();
    
    const newTicket: Ticket = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      status: 'To Do',
      priority: data.priority,
      type: data.type,
      assignee: data.assigneeId ? users.find(u => u.id === data.assigneeId) : undefined,
      reporter: users[0], // Default reporter for now
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: data.dueDate,
      labels: data.labels,
      attachments: [],
    };

    tickets.push(newTicket);
    this.saveTicketsToStorage(tickets);
    return newTicket;
  }

  static updateTicket(id: string, data: UpdateTicketData): Ticket | null {
    const tickets = this.getTicketsFromStorage();
    const users = this.getUsersFromStorage();
    const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

    if (ticketIndex === -1) return null;

    const updatedTicket: Ticket = {
      ...tickets[ticketIndex],
      ...data,
      assignee: data.assigneeId ? users.find(u => u.id === data.assigneeId) : tickets[ticketIndex].assignee,
      updatedAt: new Date(),
    };

    tickets[ticketIndex] = updatedTicket;
    this.saveTicketsToStorage(tickets);
    return updatedTicket;
  }

  static deleteTicket(id: string): boolean {
    const tickets = this.getTicketsFromStorage();
    const filteredTickets = tickets.filter(ticket => ticket.id !== id);
    
    if (filteredTickets.length === tickets.length) return false;
    
    this.saveTicketsToStorage(filteredTickets);
    return true;
  }

  static getAllUsers(): User[] {
    return this.getUsersFromStorage();
  }

  static getTicketsByStatus(status: TicketStatus): Ticket[] {
    return this.getTicketsFromStorage().filter(ticket => ticket.status === status);
  }

  static getTicketsByAssignee(assigneeId: string): Ticket[] {
    return this.getTicketsFromStorage().filter(ticket => ticket.assignee?.id === assigneeId);
  }

  static searchTickets(query: string): Ticket[] {
    const tickets = this.getTicketsFromStorage();
    const lowercaseQuery = query.toLowerCase();
    
    return tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(lowercaseQuery) ||
      ticket.description.toLowerCase().includes(lowercaseQuery) ||
      ticket.labels.some(label => label.toLowerCase().includes(lowercaseQuery))
    );
  }

  static addAttachment(ticketId: string, file: File): Ticket | null {
    const tickets = this.getTicketsFromStorage();
    const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);

    if (ticketIndex === -1) return null;

    const attachment: Attachment = {
      id: this.generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };

    const updatedTicket: Ticket = {
      ...tickets[ticketIndex],
      attachments: [...tickets[ticketIndex].attachments, attachment],
      updatedAt: new Date(),
    };

    tickets[ticketIndex] = updatedTicket;
    this.saveTicketsToStorage(tickets);
    return updatedTicket;
  }

  static removeAttachment(ticketId: string, attachmentId: string): Ticket | null {
    const tickets = this.getTicketsFromStorage();
    const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);

    if (ticketIndex === -1) return null;

    const ticket = tickets[ticketIndex];
    const attachment = ticket.attachments.find(att => att.id === attachmentId);
    
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }

    const updatedTicket: Ticket = {
      ...ticket,
      attachments: ticket.attachments.filter(att => att.id !== attachmentId),
      updatedAt: new Date(),
    };

    tickets[ticketIndex] = updatedTicket;
    this.saveTicketsToStorage(tickets);
    return updatedTicket;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}


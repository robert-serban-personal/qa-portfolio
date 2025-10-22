import { Ticket, CreateTicketData, UpdateTicketData, User, TicketStatus, Attachment } from './types';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

const STORAGE_KEY = 'qa-portfolio-tickets';
const USERS_STORAGE_KEY = 'qa-portfolio-users';

// Sample users for fallback
const defaultUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com' },
];

export class TicketService {
  private static async fetchWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackCall: () => T
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error);
      return fallbackCall();
    }
  }

  private static getTicketsFromStorage(): Ticket[] {
    console.log('💾 getTicketsFromStorage called');
    if (typeof window === 'undefined') {
      console.log('❌ No window object, returning empty array');
      return [];
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('💾 Raw stored data:', stored);
    
    if (!stored) {
      console.log('❌ No stored data, returning empty array');
      return [];
    }
    
    try {
      const parsed = JSON.parse(stored);
      console.log('📦 Parsed stored data:', parsed);
      
      const processed = parsed.map((ticket: any, index: number) => {
        console.log(`🎫 Processing ticket ${index}:`, ticket);
        return {
          ...ticket,
          createdAt: this.parseDate(ticket.createdAt),
          updatedAt: this.parseDate(ticket.updatedAt),
          dueDate: ticket.dueDate ? this.parseDate(ticket.dueDate) : undefined,
          attachments: ticket.attachments?.map((att: any) => ({
            ...att,
            uploadedAt: this.parseDate(att.uploadedAt)
          })) || [],
        };
      });
      
      console.log('✅ Processed tickets:', processed);
      return processed;
    } catch (error) {
      console.error('❌ Error parsing stored data:', error);
      return [];
    }
  }

  private static parseDate(dateString: string | Date): Date {
    console.log('🔍 parseDate called with:', { dateString, type: typeof dateString });
    
    if (!dateString) {
      console.log('📅 No dateString provided, returning current date');
      return new Date();
    }
    
    if (dateString instanceof Date) {
      console.log('📅 Already a Date object:', dateString);
      return dateString;
    }
    
    console.log('📅 Attempting to parse date string:', dateString);
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date string:', dateString, 'using current date');
      return new Date();
    }
    
    console.log('✅ Successfully parsed date:', date);
    return date;
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

  static async getAllTickets(): Promise<Ticket[]> {
    console.log('🚀 getAllTickets called');
    return this.fetchWithFallback(
      async () => {
        console.log('🌐 Fetching tickets from API:', `${API_BASE}/tickets`);
        const response = await fetch(`${API_BASE}/tickets`);
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const tickets = await response.json();
        console.log('📦 Raw tickets from API:', tickets);
        this.saveTicketsToStorage(tickets); // Cache for offline use
        return tickets;
      },
      () => {
        console.log('💾 Falling back to local storage');
        return this.getTicketsFromStorage();
      }
    );
  }

  static async getTicketById(id: string): Promise<Ticket | undefined> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${API_BASE}/tickets/${id}`);
        if (!response.ok) throw new Error('Failed to fetch ticket');
        return response.json();
      },
      () => this.getTicketsFromStorage().find(ticket => ticket.id === id)
    );
  }

  static async createTicket(data: CreateTicketData): Promise<Ticket> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${API_BASE}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create ticket');
        const ticket = await response.json();
        
        // Update local cache
        const tickets = this.getTicketsFromStorage();
        tickets.push(ticket);
        this.saveTicketsToStorage(tickets);
        
        return ticket;
      },
      () => {
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
          reporter: users[0],
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
    );
  }

  static async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket | null> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${API_BASE}/tickets/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update ticket');
        const ticket = await response.json();
        
        // Update local cache
        const tickets = this.getTicketsFromStorage();
        const index = tickets.findIndex(t => t.id === id);
        if (index !== -1) {
          tickets[index] = ticket;
          this.saveTicketsToStorage(tickets);
        }
        
        return ticket;
      },
      () => {
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
    );
  }

  static async deleteTicket(id: string): Promise<boolean> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${API_BASE}/tickets/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete ticket');
        
        // Update local cache
        const tickets = this.getTicketsFromStorage();
        const filteredTickets = tickets.filter(ticket => ticket.id !== id);
        this.saveTicketsToStorage(filteredTickets);
        
        return true;
      },
      () => {
        const tickets = this.getTicketsFromStorage();
        const filteredTickets = tickets.filter(ticket => ticket.id !== id);
        
        if (filteredTickets.length === tickets.length) return false;
        
        this.saveTicketsToStorage(filteredTickets);
        return true;
      }
    );
  }

  static async getAllUsers(): Promise<User[]> {
    return this.fetchWithFallback(
      async () => {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();
        this.saveUsersToStorage(users);
        return users;
      },
      () => this.getUsersFromStorage()
    );
  }

  static async getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
    const tickets = await this.getAllTickets();
    return tickets.filter(ticket => ticket.status === status);
  }

  static async getTicketsByAssignee(assigneeId: string): Promise<Ticket[]> {
    const tickets = await this.getAllTickets();
    return tickets.filter(ticket => ticket.assignee?.id === assigneeId);
  }

  static async searchTickets(query: string): Promise<Ticket[]> {
    const tickets = await this.getAllTickets();
    const lowercaseQuery = query.toLowerCase();
    
    return tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(lowercaseQuery) ||
      ticket.description.toLowerCase().includes(lowercaseQuery) ||
      ticket.labels.some(label => label.toLowerCase().includes(lowercaseQuery))
    );
  }

  static async addAttachment(ticketId: string, file: File): Promise<Ticket | null> {
    // For now, we'll use local storage for attachments
    // In production, you'd upload to a file storage service
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

  static async removeAttachment(ticketId: string, attachmentId: string): Promise<Ticket | null> {
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


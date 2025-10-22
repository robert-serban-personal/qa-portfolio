'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiSearch, HiFilter, HiRefresh } from 'react-icons/hi';
import { Ticket, TicketStatus, User } from '@/lib/types';
import { TicketService } from '@/lib/ticketServiceApi';
import CreateTicketModal from './CreateTicketModal';
import TicketCard from './TicketCard';
import TicketDetailModal from './TicketDetailModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';

const statusColumns: { status: TicketStatus; title: string; color: string }[] = [
  { status: 'To Do', title: 'To Do', color: 'bg-slate-500/20' },
  { status: 'In Progress', title: 'In Progress', color: 'bg-blue-500/20' },
  { status: 'In Review', title: 'In Review', color: 'bg-purple-500/20' },
  { status: 'Done', title: 'Done', color: 'bg-emerald-500/20' },
];

// DroppableColumn component for drag & drop
function DroppableColumn({ 
  column, 
  tickets, 
  onTicketClick, 
  onStatusChange,
  onEdit,
  onDelete,
  onDuplicate
}: { 
  column: { status: TicketStatus; title: string; color: string };
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: TicketStatus) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onDuplicate: (ticket: Ticket) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-4 transition-colors ${
        isOver ? 'bg-slate-700/50 border-emerald-400/50' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
          <h3 className="text-white font-semibold">{column.title}</h3>
        </div>
        <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full text-xs">
          {tickets.length}
        </span>
      </div>

      {/* Tickets */}
      <div className="space-y-3 min-h-[200px]">
        {tickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => onTicketClick(ticket)}
            onStatusChange={(newStatus) => onStatusChange(ticket, newStatus)}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
        
        {tickets.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No tickets</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TicketBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const allTickets = await TicketService.getAllTickets();
      const allUsers = await TicketService.getAllUsers();
      
      setTickets(allTickets);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    // Optimistically update the UI
    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, status: newStatus } : t
    ));

    // Update in the backend
    try {
      await TicketService.updateTicket(ticket.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      // Revert the optimistic update on error
      setTickets(prev => prev.map(t => 
        t.id === ticket.id ? { ...t, status: ticket.status } : t
      ));
    }
  };

  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    loadTickets();
  }, []);

  // Real-time updates disabled to reduce API calls
  // Updates will happen manually when tickets are created, updated, or deleted

  const handleTicketCreated = async () => {
    await loadTickets();
    
    // If we have a selected ticket open, update it with fresh data
    if (selectedTicket) {
      try {
        const freshTicket = await TicketService.getTicketById(selectedTicket.id);
        if (freshTicket) {
          setSelectedTicket(freshTicket);
        }
      } catch (error) {
        console.error('Error refreshing selected ticket:', error);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find(t => t.id === active.id);
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as TicketStatus;

    // Find the ticket and check if status actually changed
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    // Optimistically update the UI
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));

    // Update in the backend
    try {
      await TicketService.updateTicket(ticketId, { status: newStatus });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      // Revert the optimistic update on error
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: ticket.status } : t
      ));
    }
  };

  const getFilteredTickets = () => {
    let filtered = tickets;

    // Search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(lowercaseQuery) ||
        ticket.description.toLowerCase().includes(lowercaseQuery) ||
        ticket.labels.some(label => label.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Assignee filter
    if (filterAssignee) {
      filtered = filtered.filter(ticket => ticket.assignee?.id === filterAssignee);
    }

    // Priority filter
    if (filterPriority) {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }

    return filtered;
  };

  const getTicketsByStatus = (status: TicketStatus) => {
    return getFilteredTickets().filter(ticket => ticket.status === status);
  };

  const getColumnStats = (status: TicketStatus) => {
    const ticketsInColumn = getTicketsByStatus(status);
    return {
      count: ticketsInColumn.length,
      total: tickets.length
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Ticket Board</h1>
              <p className="text-slate-400">Manage your QA tickets and track progress</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Auto-updating every 5s</span>
                <span>•</span>
                <span>Last update: {lastUpdateTime.toLocaleTimeString()}</span>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
            >
              <HiPlus className="w-5 h-5" />
              Create Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>
            </div>

            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
            >
              <option value="">All Assignees</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <button
              onClick={loadTickets}
              className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-emerald-400/50 transition-all"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map((column, index) => {
              const ticketsInColumn = getTicketsByStatus(column.status);

              return (
                <motion.div
                  key={column.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DroppableColumn
                    column={column}
                    tickets={ticketsInColumn}
                    onTicketClick={(ticket) => {
                      setSelectedTicket(ticket);
                      setIsDetailModalOpen(true);
                    }}
                    onStatusChange={handleStatusChange}
                    onEdit={(ticket) => {
                      setSelectedTicket(ticket);
                      setIsDetailModalOpen(true);
                    }}
                    onDelete={async (ticket) => {
                      try {
                        await TicketService.deleteTicket(ticket.id);
                        setTickets(prev => prev.filter(t => t.id !== ticket.id));
                      } catch (error) {
                        console.error('Error deleting ticket:', error);
                      }
                    }}
                    onDuplicate={async (ticket) => {
                      try {
                        const duplicatedTicket = await TicketService.createTicket({
                          title: `${ticket.title} (Copy)`,
                          description: ticket.description,
                          priority: ticket.priority,
                          type: ticket.type,
                          assigneeId: ticket.assignee?.id,
                          dueDate: ticket.dueDate,
                          labels: ticket.labels,
                        });
                        setTickets(prev => [...prev, duplicatedTicket]);
                      } catch (error) {
                        console.error('Error duplicating ticket:', error);
                      }
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTicket ? (
              <div className="opacity-50">
                <TicketCard
                  ticket={activeTicket}
                  onClick={() => {}}
                  onStatusChange={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusColumns.map(column => {
            const stats = getColumnStats(column.status);
            return (
              <div key={column.status} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{stats.count}</div>
                <div className="text-slate-400 text-sm">{column.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={handleTicketCreated}
        onTicketDeleted={handleTicketCreated}
      />
    </div>
  );
}

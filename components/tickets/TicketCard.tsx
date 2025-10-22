'use client';

import { motion } from 'framer-motion';
import { HiTag, HiUser, HiCalendar, HiDotsVertical, HiPaperClip } from 'react-icons/hi';
import { Ticket, TicketPriority, TicketStatus } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  onStatusChange: (status: TicketStatus) => void;
}

const priorityColors = {
  Low: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
  Critical: 'bg-red-500/20 text-red-400 border-red-400/30',
};

const statusColors = {
  'To Do': 'bg-slate-500/20 text-slate-400 border-slate-400/30',
  'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-400/30',
  'In Review': 'bg-purple-500/20 text-purple-400 border-purple-400/30',
  'Done': 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30',
};

export default function TicketCard({ ticket, onClick, onStatusChange }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateInput: string | Date) => {
    console.log('📅 formatDate called with:', dateInput, 'type:', typeof dateInput);
    try {
      // Convert string to Date object if needed
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date after conversion:', dateInput);
        return 'Invalid Date';
      }
      
      const formatted = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
      console.log('✅ formatDate result:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ formatDate error:', error, 'dateInput:', dateInput);
      return 'Invalid Date';
    }
  };

  const isOverdue = ticket.dueDate && (() => {
    console.log('🔍 TicketCard checking overdue for ticket:', ticket.id, 'dueDate:', ticket.dueDate);
    try {
      const dueDate = new Date(ticket.dueDate);
      console.log('📅 Parsed dueDate:', dueDate);
      const isValid = !isNaN(dueDate.getTime());
      console.log('✅ Date is valid:', isValid);
      if (isValid) {
        const now = new Date();
        const isOverdue = now > dueDate;
        console.log('⏰ Is overdue:', isOverdue, 'now:', now, 'dueDate:', dueDate);
        return isOverdue;
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking overdue:', error);
      return false;
    }
  })();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -2 }}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-emerald-400/50 transition-all duration-300 group ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {ticket.title}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2">
            {ticket.description}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle menu actions
          }}
          className="text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <HiDotsVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Priority and Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>

      {/* Labels */}
      {ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.labels.slice(0, 3).map(label => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs border border-slate-600"
            >
              <HiTag className="w-3 h-3" />
              {label}
            </span>
          ))}
          {ticket.labels.length > 3 && (
            <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs border border-slate-600">
              +{ticket.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {ticket.assignee && (
            <div className="flex items-center gap-1">
              <HiUser className="w-3 h-3" />
              <span>{ticket.assignee.name}</span>
            </div>
          )}
          {ticket.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
              <HiCalendar className="w-3 h-3" />
              <span>{(() => {
                console.log('🎯 Rendering dueDate:', ticket.dueDate, 'type:', typeof ticket.dueDate);
                return formatDate(ticket.dueDate);
              })()}</span>
            </div>
          )}
          {ticket.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <HiPaperClip className="w-3 h-3" />
              <span>{ticket.attachments.length}</span>
            </div>
          )}
        </div>
        <span>{(() => {
          console.log('🎯 Rendering createdAt:', ticket.createdAt, 'type:', typeof ticket.createdAt);
          return formatDate(ticket.createdAt);
        })()}</span>
      </div>

      {/* Status Change Dropdown (appears on hover) */}
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <select
          value={ticket.status}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(e.target.value as TicketStatus);
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-white focus:border-emerald-400 focus:outline-none"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Done">Done</option>
        </select>
      </div>
    </motion.div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiTag, HiUser, HiCalendar, HiDotsVertical, HiPaperClip, HiPencil, HiTrash, HiDuplicate } from 'react-icons/hi';
import { Ticket, TicketPriority, TicketStatus } from '@/lib/types';
import { useDraggable } from '@dnd-kit/core';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  onStatusChange: (status: TicketStatus) => void;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
  onDuplicate?: (ticket: Ticket) => void;
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

export default function TicketCard({ ticket, onClick, onStatusChange, onEdit, onDelete, onDuplicate }: TicketCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: ticket.id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const formatDate = (dateInput: string | Date) => {
    try {
      // Convert string to Date object if needed
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const isOverdue = ticket.dueDate && (() => {
    try {
      const dueDate = new Date(ticket.dueDate);
      return !isNaN(dueDate.getTime()) && new Date() > dueDate;
    } catch {
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <HiDotsVertical className="w-4 h-4" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-6 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 min-w-[120px]">
              <div className="py-1">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(ticket);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                  >
                    <HiPencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(ticket);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                  >
                    <HiDuplicate className="w-4 h-4" />
                    Duplicate
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this ticket?')) {
                        onDelete(ticket);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2"
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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

      {/* Assignee - More Prominent */}
      {ticket.assignee && (
        <div className="mb-3 p-2 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="flex items-center gap-2">
            <HiUser className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-medium text-sm">{ticket.assignee.name}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          {ticket.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-orange-400'}`}>
              <HiCalendar className="w-3 h-3" />
              <span className="font-medium">Due: {formatDate(ticket.dueDate)}</span>
            </div>
          )}
          {ticket.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <HiPaperClip className="w-3 h-3" />
              <span className="font-medium">{ticket.attachments.length}</span>
            </div>
          )}
        </div>
        <div className="text-slate-500 text-right">
          <span>Created: {formatDate(ticket.createdAt)}</span>
        </div>
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


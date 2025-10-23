'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiX, HiPlus, HiCalendar, HiTag } from 'react-icons/hi';
import { CreateTicketData, TicketPriority, TicketType, User } from '@/lib/types';
import { TicketService } from '@/lib/ticketServiceApi';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }: CreateTicketModalProps) {
  const [formData, setFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    priority: 'Medium',
    type: 'Task',
    assigneeId: '',
    dueDate: undefined,
    labels: [],
  });
  const [newLabel, setNewLabel] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await TicketService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleInputChange = (field: keyof CreateTicketData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await TicketService.createTicket(formData);
      onTicketCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        type: 'Task',
        assigneeId: '',
        dueDate: undefined,
        labels: [],
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      id="create-ticket-modal-overlay"
      data-testid="create-ticket-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        id="create-ticket-modal"
        data-testid="create-ticket-modal"
      >
        <div 
          className="p-6 border-b border-slate-700"
          id="create-ticket-modal-header"
          data-testid="create-ticket-modal-header"
        >
          <div className="flex items-center justify-between">
            <h2 
              className="text-2xl font-bold text-white"
              id="create-ticket-modal-title"
              data-testid="create-ticket-modal-title"
            >
              Create New Ticket
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              id="create-ticket-close-button"
              data-testid="create-ticket-close-button"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="p-6 space-y-6"
          id="create-ticket-form"
          data-testid="create-ticket-form"
        >
          {/* Title */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
              placeholder="Enter ticket title..."
              id="create-ticket-title-input"
              data-testid="create-ticket-title-input"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all resize-none"
              placeholder="Describe the ticket in detail..."
              id="create-ticket-description-input"
              data-testid="create-ticket-description-input"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Priority <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as TicketPriority)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                id="create-ticket-priority-select"
                data-testid="create-ticket-priority-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {errors.priority && <p className="text-red-400 text-sm mt-1">{errors.priority}</p>}
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Type <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as TicketType)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                id="create-ticket-type-select"
                data-testid="create-ticket-type-select"
              >
                <option value="Bug">Bug</option>
                <option value="Feature">Feature</option>
                <option value="Task">Task</option>
                <option value="Epic">Epic</option>
                <option value="Story">Story</option>
              </select>
              {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Assignee</label>
            <select
              value={formData.assigneeId}
              onChange={(e) => handleInputChange('assigneeId', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
              id="create-ticket-assignee-select"
              data-testid="create-ticket-assignee-select"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Due Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.dueDate ? (formData.dueDate instanceof Date ? formData.dueDate.toISOString().split('T')[0] : new Date(formData.dueDate).toISOString().split('T')[0]) : ''}
                onChange={(e) => {
                  try {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    handleInputChange('dueDate', date && !isNaN(date.getTime()) ? date : undefined);
                  } catch {
                    handleInputChange('dueDate', undefined);
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all cursor-pointer"
                style={{ colorScheme: 'dark' }}
                id="create-ticket-due-date-input"
                data-testid="create-ticket-due-date-input"
              />
              <HiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
            <p className="text-slate-500 text-xs mt-1">Select a future date for the ticket deadline</p>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Labels</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                placeholder="Add a label..."
                id="create-ticket-label-input"
                data-testid="create-ticket-label-input"
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                id="create-ticket-add-label-button"
                data-testid="create-ticket-add-label-button"
              >
                <HiPlus className="w-5 h-5" />
              </button>
            </div>
            
            {formData.labels.length > 0 && (
              <div 
                className="flex flex-wrap gap-2"
                id="create-ticket-labels-container"
                data-testid="create-ticket-labels-container"
              >
                {formData.labels.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-400/30"
                    id={`create-ticket-label-${label}`}
                    data-testid={`create-ticket-label-${label}`}
                  >
                    <HiTag className="w-3 h-3" />
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="text-emerald-400 hover:text-white transition-colors"
                      id={`create-ticket-remove-label-${label}`}
                      data-testid={`create-ticket-remove-label-${label}`}
                    >
                      <HiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div 
            className="flex gap-4 pt-4"
            id="create-ticket-submit-buttons"
            data-testid="create-ticket-submit-buttons"
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              id="create-ticket-cancel-button"
              data-testid="create-ticket-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              id="create-ticket-submit-button"
              data-testid="create-ticket-submit-button"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


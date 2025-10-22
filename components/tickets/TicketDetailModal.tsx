'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiX, HiTag, HiUser, HiCalendar, HiPencil, HiTrash, HiPlus, HiPaperClip, HiDownload } from 'react-icons/hi';
import { Ticket, UpdateTicketData, TicketStatus, TicketPriority, TicketType, User, Attachment } from '@/lib/types';
import { TicketService } from '@/lib/ticketServiceApi';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
  onTicketDeleted: () => void;
}

export default function TicketDetailModal({ 
  ticket, 
  isOpen, 
  onClose, 
  onTicketUpdated, 
  onTicketDeleted 
}: TicketDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateTicketData>({});
  const [newLabel, setNewLabel] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (ticket) {
      setCurrentTicket(ticket);
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        type: ticket.type,
        assigneeId: ticket.assignee?.id || '',
        dueDate: ticket.dueDate,
        labels: ticket.labels,
      });
    }
    const loadUsers = async () => {
      try {
        const allUsers = await TicketService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, [ticket]);

  const formatDateOnly = (dateInput: string | Date) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (field: keyof UpdateTicketData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels?.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...(prev.labels || []), newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels?.filter(label => label !== labelToRemove) || []
    }));
  };

  const handleSave = async () => {
    if (!currentTicket) return;

    try {
      const updatedTicket = await TicketService.updateTicket(currentTicket.id, formData);
      if (updatedTicket) {
        onTicketUpdated();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentTicket) return;
    
    if (confirm('Are you sure you want to delete this ticket?')) {
      try {
        await TicketService.deleteTicket(currentTicket.id);
        onTicketDeleted();
        onClose();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const loadTicketData = async () => {
    if (!ticket) return;
    
    try {
      console.log('📎 Loading fresh ticket data...');
      const freshTicket = await TicketService.getTicketById(ticket.id);
      if (freshTicket) {
        console.log('📎 Fresh ticket data loaded:', freshTicket);
        console.log('📎 Fresh ticket attachments:', freshTicket.attachments);
        setCurrentTicket(freshTicket);
      }
    } catch (error) {
      console.error('📎 Error loading fresh ticket data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentTicket) return;
    
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('📎 Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ticketId: currentTicket.id
      });
      
      try {
        console.log('📎 Calling TicketService.addAttachment...');
        const updatedTicket = await TicketService.addAttachment(currentTicket.id, file);
        console.log('📎 Received updated ticket:', updatedTicket);
        
        if (updatedTicket) {
          console.log('📎 Setting currentTicket state...');
          console.log('📎 Updated ticket attachments:', updatedTicket.attachments);
          console.log('📎 Number of attachments in updated ticket:', updatedTicket.attachments?.length || 0);
          setCurrentTicket(updatedTicket);
          console.log('📎 Calling onTicketUpdated...');
          onTicketUpdated();
          
          // Force a small delay to ensure state is updated
          setTimeout(() => {
            console.log('📎 Force refreshing ticket data...');
            loadTicketData();
          }, 100);
          
          console.log('📎 File upload completed successfully');
        } else {
          console.error('📎 No updated ticket returned from addAttachment');
        }
      } catch (error) {
        console.error('📎 Error uploading attachment:', error);
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!currentTicket) return;
    
    try {
      const updatedTicket = await TicketService.removeAttachment(currentTicket.id, attachmentId);
      if (updatedTicket) {
        setCurrentTicket(updatedTicket);
        onTicketUpdated();
      }
    } catch (error) {
      console.error('Error removing attachment:', error);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    console.log('📅 TicketDetailModal formatDate called with:', dateInput, 'type:', typeof dateInput);
    try {
      // Convert string to Date object if needed
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date after conversion:', dateInput);
        return 'Invalid Date';
      }
      
      const formatted = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      console.log('✅ TicketDetailModal formatDate result:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ TicketDetailModal formatDate error:', error, 'dateInput:', dateInput);
      return 'Invalid Date';
    }
  };

  if (!isOpen || !currentTicket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Edit Ticket' : 'Ticket Details'}
              </h2>
              <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
                #{currentTicket.id.slice(-6)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <HiPencil className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <HiTrash className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-white">{currentTicket.title}</h3>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Description</label>
                {isEditing ? (
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all resize-none"
                  />
                ) : (
                  <div className="bg-slate-700/30 rounded-lg p-4 text-slate-300 whitespace-pre-wrap">
                    {currentTicket.description}
                  </div>
                )}
              </div>

              {/* Labels */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Labels</label>
                {isEditing ? (
                  <div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                        className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                        placeholder="Add a label..."
                      />
                      <button
                        onClick={handleAddLabel}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                      >
                        <HiPlus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.labels?.map(label => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-400/30"
                        >
                          <HiTag className="w-3 h-3" />
                          {label}
                          <button
                            onClick={() => handleRemoveLabel(label)}
                            className="text-emerald-400 hover:text-white transition-colors"
                          >
                            <HiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentTicket.labels.map(label => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm border border-emerald-400/30"
                      >
                        <HiTag className="w-3 h-3" />
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Status</label>
                {isEditing ? (
                  <select
                    value={formData.status || currentTicket.status}
                    onChange={(e) => handleInputChange('status', e.target.value as TicketStatus)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                ) : (
                  <span className="px-3 py-2 bg-slate-700/50 text-white rounded-lg">
                    {currentTicket.status}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Priority</label>
                {isEditing ? (
                  <select
                    value={formData.priority || currentTicket.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as TicketPriority)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                ) : (
                  <span className="px-3 py-2 bg-slate-700/50 text-white rounded-lg">
                    {currentTicket.priority}
                  </span>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Type</label>
                {isEditing ? (
                  <select
                    value={formData.type || currentTicket.type}
                    onChange={(e) => handleInputChange('type', e.target.value as TicketType)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  >
                    <option value="Bug">Bug</option>
                    <option value="Feature">Feature</option>
                    <option value="Task">Task</option>
                    <option value="Epic">Epic</option>
                    <option value="Story">Story</option>
                  </select>
                ) : (
                  <span className="px-3 py-2 bg-slate-700/50 text-white rounded-lg">
                    {currentTicket.type}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Assignee</label>
                {isEditing ? (
                  <select
                    value={formData.assigneeId || ''}
                    onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                    <HiUser className="w-4 h-4 text-slate-400" />
                    <span className="text-white">
                      {currentTicket.assignee ? currentTicket.assignee.name : 'Unassigned'}
                    </span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Due Date</label>
                {isEditing ? (
                  <div>
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
                    />
                    <p className="text-slate-500 text-xs mt-1">Select a future date for the ticket deadline</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                    <HiCalendar className="w-4 h-4 text-slate-400" />
                    <span className="text-white">
                      {currentTicket.dueDate ? formatDateOnly(currentTicket.dueDate) : 'No due date'}
                    </span>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Attachments</label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="*/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                    >
                      <HiPaperClip className="w-4 h-4" />
                      <span className="text-sm">Add Attachment</span>
                    </label>
                  </div>

                  {/* Attachments List */}
                  {currentTicket.attachments.length > 0 && (
                    <div className="space-y-2">
                      {currentTicket.attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-slate-700/30 border border-slate-600 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <HiPaperClip className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-white text-sm font-medium">{attachment.name}</p>
                              <p className="text-slate-400 text-xs">{formatFileSize(attachment.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={attachment.url}
                              download={attachment.name}
                              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                              <HiDownload className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <HiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Created</label>
                  <span className="text-slate-300 text-sm">{formatDate(currentTicket.createdAt)}</span>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Last Updated</label>
                  <span className="text-slate-300 text-sm">{formatDate(currentTicket.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky Footer */}
        {isEditing && (
          <div className="p-6 border-t border-slate-700 bg-slate-800/95 backdrop-blur-sm">
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}


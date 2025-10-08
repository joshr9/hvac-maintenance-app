// CreateTaskMobile.jsx - iOS/Todoist-style mobile task creation
import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Building,
  Briefcase,
  Clock,
  AlertCircle,
  Flag,
  CheckCircle
} from 'lucide-react';

const CreateTaskMobile = ({
  isOpen,
  onClose,
  onTaskCreated,
  allProperties,
  globalJobsData,
  fromMessage,
  apiCall
}) => {
  const [formData, setFormData] = useState({
    title: fromMessage ? `Task: ${fromMessage.content?.substring(0, 50)}...` : '',
    description: fromMessage ? fromMessage.content : '',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedTime: '',
    linkedToJobId: '',
    linkedToPropertyId: '',
  });

  const [expandedSections, setExpandedSections] = useState({
    details: false,
    priority: false,
    dueDate: false,
    links: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        status: 'PENDING',
        dueDate: formData.dueDate || null,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
        linkedToJobId: formData.linkedToJobId ? parseInt(formData.linkedToJobId) : null,
        linkedToPropertyId: formData.linkedToPropertyId ? parseInt(formData.linkedToPropertyId) : null,
      };

      const newTask = await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });

      onTaskCreated(newTask);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    LOW: 'text-gray-600 bg-gray-100',
    MEDIUM: 'text-blue-600 bg-blue-100',
    HIGH: 'text-orange-600 bg-orange-100',
    URGENT: 'text-red-600 bg-red-100'
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-dc-blue-600 font-medium"
        >
          Cancel
        </button>
        <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.title.trim()}
          className="text-dc-blue-600 font-semibold disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Task Title - Always visible */}
        <div className="p-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-lg font-medium border-0 border-b-2 border-gray-200 focus:border-dc-blue-500 focus:outline-none pb-2"
            placeholder="Task title"
            autoFocus
          />
        </div>

        {/* Expandable Sections */}
        <div className="bg-white">
          {/* Details Section */}
          <button
            onClick={() => toggleSection('details')}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Details</span>
            </div>
            {expandedSections.details ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.details && (
            <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 text-sm"
                placeholder="Add description..."
              />
            </div>
          )}

          {/* Priority Section */}
          <button
            onClick={() => toggleSection('priority')}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Flag className={`w-5 h-5 ${formData.priority === 'HIGH' || formData.priority === 'URGENT' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full ${priorityColors[formData.priority]}`}>
                {formData.priority}
              </span>
              {expandedSections.priority ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.priority && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 space-y-2">
              {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, priority }));
                    toggleSection('priority');
                  }}
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                    formData.priority === priority
                      ? 'bg-dc-blue-50 border-2 border-dc-blue-500'
                      : 'bg-white border-2 border-gray-200 active:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-gray-900">{priority}</span>
                  {formData.priority === priority && (
                    <CheckCircle className="w-5 h-5 text-dc-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Due Date Section */}
          <button
            onClick={() => toggleSection('dueDate')}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Due Date</span>
            </div>
            <div className="flex items-center gap-2">
              {formData.dueDate && (
                <span className="text-sm text-gray-600">
                  {new Date(formData.dueDate).toLocaleDateString()}
                </span>
              )}
              {expandedSections.dueDate ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.dueDate && (
            <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500"
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500"
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Links Section */}
          <button
            onClick={() => toggleSection('links')}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Link to Job/Property</span>
            </div>
            {expandedSections.links ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {expandedSections.links && (
            <div className="px-4 py-4 bg-gray-50 border-b border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Property
                </label>
                <select
                  value={formData.linkedToPropertyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedToPropertyId: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500"
                >
                  <option value="">Select a property...</option>
                  {allProperties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Job
                </label>
                <select
                  value={formData.linkedToJobId}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedToJobId: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500"
                >
                  <option value="">Select a job...</option>
                  {(globalJobsData.jobs || []).map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.jobNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTaskMobile;

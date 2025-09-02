import React, { useState } from 'react';
import { 
  Edit2, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  DollarSign,
  Save,
  X,
  MessageSquare,
  FileText,
  CheckCircle
} from 'lucide-react';

const OverviewTab = ({ job, onUpdate }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(job.description || '');
  const [isEditingCustomerNotes, setIsEditingCustomerNotes] = useState(false);
  const [editedCustomerNotes, setEditedCustomerNotes] = useState(job.customerNotes || '');
  const [isEditingInternalNotes, setIsEditingInternalNotes] = useState(false);
  const [editedInternalNotes, setEditedInternalNotes] = useState(job.internalNotes || '');

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSaveDescription = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedDescription })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setIsEditingDescription(false);
        if (onUpdate) {
          onUpdate(updatedJob);
        }
      } else {
        console.error('Failed to update job description');
        alert('Failed to update job description');
      }
    } catch (error) {
      console.error('Error updating job description:', error);
      alert('Error updating job description');
    }
  };

  const handleSaveCustomerNotes = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerNotes: editedCustomerNotes })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setIsEditingCustomerNotes(false);
        if (onUpdate) {
          onUpdate(updatedJob);
        }
      }
    } catch (error) {
      console.error('Error updating customer notes:', error);
      alert('Error updating customer notes');
    }
  };

  const handleSaveInternalNotes = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: editedInternalNotes })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setIsEditingInternalNotes(false);
        if (onUpdate) {
          onUpdate(updatedJob);
        }
      }
    } catch (error) {
      console.error('Error updating internal notes:', error);
      alert('Error updating internal notes');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Job Details Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(job.status)}`}>
                {job.status?.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(job.priority)}`}>
                {job.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Work Type</label>
              <p className="text-gray-900 mt-1">{job.workType?.replace('_', ' ')}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Property Address</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{job.property?.address || job.property?.name || 'No address'}</span>
              </div>
            </div>
            
            {job.assignedTechnician && (
              <div>
                <label className="text-sm font-medium text-gray-600">Assigned Technician</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{job.assignedTechnician}</span>
                </div>
              </div>
            )}

            {job.scheduledDate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(job.scheduledDate).toLocaleDateString()}
                    {job.scheduledTime && ` at ${job.scheduledTime}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <button
              onClick={() => setIsEditingDescription(!isEditingDescription)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          {isEditingDescription ? (
            <div className="space-y-3">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingDescription(false);
                    setEditedDescription(job.description || '');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{job.description || 'No description provided'}</p>
          )}
        </div>

        {/* Customer Notes - Editable */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Customer Notes
            </h3>
            <button
              onClick={() => setIsEditingCustomerNotes(!isEditingCustomerNotes)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          {isEditingCustomerNotes ? (
            <div className="space-y-3">
              <textarea
                value={editedCustomerNotes}
                onChange={(e) => setEditedCustomerNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Notes visible to customer"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCustomerNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingCustomerNotes(false);
                    setEditedCustomerNotes(job.customerNotes || '');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{job.customerNotes || 'No customer notes'}</p>
          )}
        </div>

        {/* Internal Notes - Editable */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Internal Notes
            </h3>
            <button
              onClick={() => setIsEditingInternalNotes(!isEditingInternalNotes)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          {isEditingInternalNotes ? (
            <div className="space-y-3">
              <textarea
                value={editedInternalNotes}
                onChange={(e) => setEditedInternalNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Internal notes for team"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveInternalNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingInternalNotes(false);
                    setEditedInternalNotes(job.internalNotes || '');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{job.internalNotes || 'No internal notes'}</p>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Financial Summary */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue:</span>
              <span className="text-lg font-semibold text-green-600">
                ${job.totalPrice ? parseFloat(job.totalPrice).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost:</span>
              <span className="text-lg font-semibold text-gray-900">
                ${job.totalCost ? parseFloat(job.totalCost).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profit Margin:</span>
                <span className={`text-lg font-semibold ${
                  (job.profitMargin && parseFloat(job.profitMargin) > 20) ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {job.profitMargin ? `${parseFloat(job.profitMargin).toFixed(1)}%` : '0.0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">{formatTimestamp(job.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">{formatTimestamp(job.updatedAt)}</span>
            </div>
            {job.estimatedDuration && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Duration:</span>
                <span className="text-gray-900">{job.estimatedDuration} minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Invoice
            </button>
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
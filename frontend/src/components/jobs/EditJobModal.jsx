import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, MapPin, AlertCircle } from 'lucide-react';

// Custom Dropdown Component (reuse from CreateJobModal)
const CustomDropdown = ({ value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EditJobModal = ({ isOpen, onClose, job, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [suites, setSuites] = useState([]);
  
  // Initialize form data with job values
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    workType: '',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    propertyId: '',
    suiteId: '',
    assignedTechnician: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 120,
    customerNotes: '',
    internalNotes: ''
  });

  // Load form data when job changes
  useEffect(() => {
    if (job) {
      setJobData({
        title: job.title || '',
        description: job.description || '',
        workType: job.workType || '',
        priority: job.priority || 'MEDIUM',
        status: job.status || 'SCHEDULED',
        propertyId: job.propertyId || '',
        suiteId: job.suiteId || '',
        assignedTechnician: job.assignedTechnician || '',
        scheduledDate: job.scheduledDate ? job.scheduledDate.split('T')[0] : '',
        scheduledTime: job.scheduledTime || '',
        estimatedDuration: job.estimatedDuration || 120,
        customerNotes: job.customerNotes || '',
        internalNotes: job.internalNotes || ''
      });
    }
  }, [job]);

  // Load properties on mount
  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen]);

  // Load suites when property changes
  useEffect(() => {
    if (jobData.propertyId) {
      loadSuites(jobData.propertyId);
    } else {
      setSuites([]);
    }
  }, [jobData.propertyId]);

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadSuites = async (propertyId) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/suites`);
      if (response.ok) {
        const data = await response.json();
        setSuites(data || []);
      }
    } catch (error) {
      console.error('Error loading suites:', error);
      setSuites([]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!jobData.title.trim()) {
        throw new Error('Job title is required');
      }
      if (!jobData.propertyId) {
        throw new Error('Property selection is required');
      }

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job');
      }

      const updatedJob = await response.json();
      
      if (onUpdate) {
        onUpdate(updatedJob);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating job:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !job) return null;

  // Options for dropdowns
  const workTypeOptions = [
    { value: 'HVAC_MAINTENANCE', label: 'HVAC Maintenance' },
    { value: 'HVAC_REPAIR', label: 'HVAC Repair' },
    { value: 'LANDSCAPING', label: 'Landscaping' },
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'GENERAL_MAINTENANCE', label: 'General Maintenance' },
    { value: 'SNOW_REMOVAL', label: 'Snow Removal' },
    { value: 'CLEANING', label: 'Cleaning' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const propertyOptions = properties.map(property => ({
    value: property.id,
    label: property.name
  }));

  const suiteOptions = suites.map(suite => ({
    value: suite.id,
    label: suite.name
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Job</h2>
            <p className="text-sm text-gray-600 mt-1">Job #{job.jobNumber}</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Job Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter job title"
              />
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type
              </label>
              <CustomDropdown
                value={jobData.workType}
                onChange={(value) => setJobData({...jobData, workType: value})}
                options={workTypeOptions}
                placeholder="Select work type"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <CustomDropdown
                value={jobData.priority}
                onChange={(value) => setJobData({...jobData, priority: value})}
                options={priorityOptions}
                placeholder="Select priority"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <CustomDropdown
                value={jobData.status}
                onChange={(value) => setJobData({...jobData, status: value})}
                options={statusOptions}
                placeholder="Select status"
              />
            </div>

            {/* Assigned Technician */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Technician
              </label>
              <input
                type="text"
                value={jobData.assignedTechnician}
                onChange={(e) => setJobData({...jobData, assignedTechnician: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter technician name"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Property */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property *
              </label>
              <CustomDropdown
                value={jobData.propertyId}
                onChange={(value) => setJobData({
                  ...jobData, 
                  propertyId: value,
                  suiteId: '' // Reset suite when property changes
                })}
                options={propertyOptions}
                placeholder="Select a property"
              />
            </div>

            {/* Suite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suite (Optional)
              </label>
              <CustomDropdown
                value={jobData.suiteId}
                onChange={(value) => setJobData({...jobData, suiteId: value})}
                options={suiteOptions}
                placeholder="Select a suite"
                disabled={!jobData.propertyId}
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={jobData.scheduledDate}
                onChange={(e) => setJobData({...jobData, scheduledDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Scheduled Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={jobData.scheduledTime}
                onChange={(e) => setJobData({...jobData, scheduledTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={jobData.estimatedDuration}
                onChange={(e) => setJobData({...jobData, estimatedDuration: parseInt(e.target.value) || 120})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={jobData.description}
              onChange={(e) => setJobData({...jobData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              placeholder="Enter job description"
            />
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Notes
              </label>
              <textarea
                value={jobData.customerNotes}
                onChange={(e) => setJobData({...jobData, customerNotes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
                placeholder="Notes visible to customer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Notes
              </label>
              <textarea
                value={jobData.internalNotes}
                onChange={(e) => setJobData({...jobData, internalNotes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
                placeholder="Internal notes for team"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Updating...' : 'Update Job'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobModal;
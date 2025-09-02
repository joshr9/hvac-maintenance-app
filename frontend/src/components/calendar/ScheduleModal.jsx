// components/calendar/ScheduleModal.jsx - COMPLETE WITH EDIT MODE
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Building,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  Sparkles,
  Save
} from 'lucide-react';

// Import your form components
import { FormField, FormGrid, Dropdown } from '../common/FormComponents';

const ScheduleModal = ({
  isOpen,
  onClose,
  onScheduleComplete,
  scheduleType = 'job',
  allProperties = [],
  initialDate = null,
  initialTime = null,
  suggestedAssignment = null,
  zones = [],
  teamMembers = [],
  job = null,
  editMode = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('');
  const [scheduleData, setScheduleData] = useState({
    title: '',
    description: '',
    scheduledDate: initialDate || '',
    scheduledTime: initialTime || '',
    estimatedDuration: 120,
    assignedTechnician: suggestedAssignment?.technician || '',
    priority: 'MEDIUM',
    workType: 'HVAC_INSPECTION',
    propertyId: '',
    suiteId: '',
    hvacUnitId: ''
  });

  // Load suggested assignment when modal opens
  useEffect(() => {
    if (suggestedAssignment) {
      setScheduleData(prev => ({
        ...prev,
        assignedTechnician: suggestedAssignment.technician
      }));
    }
  }, [suggestedAssignment]);

  // ✅ EDIT MODE: Load existing job data
  useEffect(() => {
    if (isOpen && job && (scheduleType === 'edit_job' || editMode)) {
      console.log('📝 Loading job for edit:', job);
      setScheduleData({
        title: job.title || '',
        description: job.description || '',
        scheduledDate: job.scheduledDate || initialDate || '',
        scheduledTime: job.scheduledTime || initialTime || '',
        estimatedDuration: job.estimatedDuration || 120,
        assignedTechnician: job.assignedTechnician || suggestedAssignment?.technician || '',
        priority: job.priority || 'MEDIUM',
        workType: job.workType || 'HVAC_INSPECTION',
        propertyId: job.propertyId?.toString() || '',
        suiteId: job.suiteId?.toString() || '',
        hvacUnitId: job.hvacUnitId?.toString() || ''
      });
      
      // Set property and suite dropdowns
      if (job.propertyId) {
        setSelectedProperty(job.propertyId.toString());
      }
      if (job.suiteId) {
        setSelectedSuite(job.suiteId.toString());
      }
    }
  }, [isOpen, job, scheduleType, editMode, initialDate, initialTime, suggestedAssignment]);

  // Form options
  const workTypeOptions = [
    { value: 'HVAC_INSPECTION', label: 'HVAC Inspection' },
    { value: 'HVAC_MAINTENANCE', label: 'HVAC Maintenance' },
    { value: 'HVAC_REPAIR', label: 'HVAC Repair' },
    { value: 'FILTER_REPLACEMENT', label: 'Filter Replacement' },
    { value: 'PREVENTIVE_MAINTENANCE', label: 'Preventive Maintenance' },
    { value: 'EMERGENCY_REPAIR', label: 'Emergency Repair' },
    { value: 'SYSTEM_INSTALLATION', label: 'System Installation' },
    { value: 'OTHER', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'HIGH', label: 'High Priority' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours (Full day)' }
  ];

  const teamMemberOptions = teamMembers.map(member => ({
    value: member.name,
    label: `${member.name} - ${member.role || 'Technician'}`
  }));

  // Property and suite handling
  const propertyOptions = allProperties.map(property => ({
    value: property.id.toString(),
    label: property.name || property.address
  }));

  const selectedPropertyData = selectedProperty ? 
    allProperties.find(p => p.id === parseInt(selectedProperty)) : null;

  const suiteOptions = selectedPropertyData?.suites?.map(suite => ({
    value: suite.id,
    label: suite.name || `Suite ${suite.id}`
  })) || [];

  const selectedSuiteData = selectedSuite ?
    selectedPropertyData?.suites?.find(s => s.id === parseInt(selectedSuite)) : null;

  const hvacUnitOptions = selectedSuiteData?.hvacUnits?.map(unit => ({
    value: unit.id,
    label: unit.label || unit.serialNumber || `Unit ${unit.id}`
  })) || [];

  // ✅ ENHANCED: Handle both CREATE and UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.title || !scheduleData.scheduledDate || !scheduleData.assignedTechnician) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEditMode = scheduleType === 'edit_job' || editMode;
      
      if (isEditMode && job) {
        // UPDATE existing job
        console.log('📝 Updating job:', job.id, scheduleData);
        
        const updateData = {
          ...scheduleData,
          propertyId: selectedProperty ? parseInt(selectedProperty) : null,
          suiteId: selectedSuite ? parseInt(selectedSuite) : null,
        };

        const response = await fetch(`/api/jobs/${job.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update job: ${errorText}`);
        }

        const updatedJob = await response.json();
        console.log('✅ Job updated successfully:', updatedJob);
        
        await onScheduleComplete(updatedJob);
      } else {
        // CREATE new job
        const jobData = {
          ...scheduleData,
          propertyId: selectedProperty ? parseInt(selectedProperty) : null,
          suiteId: selectedSuite ? parseInt(selectedSuite) : null,
          type: scheduleType
        };

        await onScheduleComplete(jobData);
      }
      
      // Reset form only for new jobs
      if (!isEditMode) {
        setScheduleData({
          title: '',
          description: '',
          scheduledDate: '',
          scheduledTime: '',
          estimatedDuration: 120,
          assignedTechnician: '',
          priority: 'MEDIUM',
          workType: 'HVAC_INSPECTION',
          propertyId: '',
          suiteId: '',
          hvacUnitId: ''
        });
        setSelectedProperty('');
        setSelectedSuite('');
      }
      
    } catch (error) {
      console.error('Error saving job:', error);
      alert(`Error ${scheduleType === 'edit_job' || editMode ? 'updating' : 'creating'} job. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ ENHANCED: Handle edit mode in type config
  const getTypeConfig = () => {
    switch (scheduleType) {
      case 'edit_job':
        return {
          title: '✏️ Edit Job',
          icon: Briefcase,
          color: 'from-green-500 to-green-600',
          description: 'Update job details and scheduling'
        };
      case 'job':
        return {
          title: 'Schedule New Job',
          icon: Briefcase,
          color: 'from-blue-500 to-blue-600',
          description: 'Create a new maintenance job'
        };
      case 'request':
        return {
          title: 'Schedule New Request',
          icon: AlertTriangle,
          color: 'from-orange-500 to-orange-600',
          description: 'Schedule an assessment request'
        };
      case 'task':
        return {
          title: 'Schedule New Task',
          icon: CheckCircle,
          color: 'from-purple-500 to-purple-600',
          description: 'Schedule a non-billable task'
        };
      default:
        return {
          title: 'Schedule Event',
          icon: Calendar,
          color: 'from-green-500 to-green-600',
          description: 'Schedule a calendar event'
        };
    }
  };

  const typeConfig = getTypeConfig();
  const Icon = typeConfig.icon;
  const isEditMode = scheduleType === 'edit_job' || editMode;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{typeConfig.title}</h3>
              <p className="text-gray-600 mt-1">{typeConfig.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Smart Assignment Alert */}
          {suggestedAssignment && !isEditMode && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Smart Assignment Suggestion</div>
                  <div className="text-sm text-blue-700">
                    Based on location and availability: <strong>{suggestedAssignment.technician}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </div>
            
            <FormGrid columns={2}>
              <FormField label="Title" required>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={scheduleData.title}
                  onChange={e => setScheduleData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter job title"
                  required
                />
              </FormField>

              <FormField label="Work Type" required>
                <Dropdown
                  value={scheduleData.workType}
                  onChange={(value) => setScheduleData(prev => ({ ...prev, workType: value }))}
                  options={workTypeOptions}
                  placeholder="Select work type..."
                />
              </FormField>
            </FormGrid>

            <FormField label="Description">
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows={3}
                value={scheduleData.description}
                onChange={e => setScheduleData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter job description"
              />
            </FormField>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="w-5 h-5" />
              Location
            </div>
            
            <FormGrid columns={3}>
              <FormField label="Property" required>
                <Dropdown
                  value={selectedProperty}
                  onChange={(value) => {
                    setSelectedProperty(value);
                    setSelectedSuite('');
                    setScheduleData(prev => ({ ...prev, propertyId: value, suiteId: '', hvacUnitId: '' }));
                  }}
                  options={propertyOptions}
                  placeholder="Select property..."
                />
              </FormField>

              <FormField label="Suite">
                <Dropdown
                  value={selectedSuite}
                  onChange={(value) => {
                    setSelectedSuite(value);
                    setScheduleData(prev => ({ ...prev, suiteId: value, hvacUnitId: '' }));
                  }}
                  options={suiteOptions}
                  placeholder="Select suite..."
                  disabled={!selectedProperty}
                />
              </FormField>

              <FormField label="HVAC Unit">
                <Dropdown
                  value={scheduleData.hvacUnitId}
                  onChange={(value) => setScheduleData(prev => ({ ...prev, hvacUnitId: value }))}
                  options={hvacUnitOptions}
                  placeholder="Select unit..."
                  disabled={!selectedSuite}
                />
              </FormField>
            </FormGrid>
          </div>

          {/* Scheduling */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Calendar className="w-5 h-5" />
              Schedule & Assignment
            </div>
            
            <FormGrid columns={2}>
              <FormField label="Date" required>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={scheduleData.scheduledDate}
                  onChange={e => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Time" required>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={scheduleData.scheduledTime}
                  onChange={e => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  required
                />
              </FormField>
            </FormGrid>

            <FormGrid columns={2}>
              <FormField label="Duration">
                <Dropdown
                  value={scheduleData.estimatedDuration}
                  onChange={(value) => setScheduleData(prev => ({ ...prev, estimatedDuration: parseInt(value) }))}
                  options={durationOptions}
                  placeholder="Select duration..."
                />
              </FormField>

              <FormField label="Priority">
                <Dropdown
                  value={scheduleData.priority}
                  onChange={(value) => setScheduleData(prev => ({ ...prev, priority: value }))}
                  options={priorityOptions}
                  placeholder="Select priority..."
                />
              </FormField>
            </FormGrid>

            <FormField label="Assigned Technician" required>
              <Dropdown
                value={scheduleData.assignedTechnician}
                onChange={(value) => setScheduleData(prev => ({ ...prev, assignedTechnician: value }))}
                options={teamMemberOptions}
                placeholder="Select team member..."
              />
            </FormField>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-8 py-3 bg-gradient-to-r ${typeConfig.color} text-white rounded-lg font-medium
                hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Update Job' : 
                   `Create ${scheduleType === 'job' ? 'Job' : scheduleType === 'request' ? 'Request' : scheduleType === 'task' ? 'Task' : 'Event'}`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
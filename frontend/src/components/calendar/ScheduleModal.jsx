// components/calendar/ScheduleModal.jsx (Enhanced for React Big Calendar)
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';
import moment from 'moment';

const ScheduleModal = ({ 
  isOpen, 
  onClose, 
  onScheduleComplete,
  allProperties = [],
  // New props for calendar integration
  initialDate = null,
  initialTime = null,
  initialTeamMember = null,
  scheduleType = 'job' // 'job', 'request', 'task', 'event'
}) => {
  const [scheduleData, setScheduleData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    estimatedDuration: 60,
    assignedTechnician: '',
    priority: 'MEDIUM',
    workType: 'HVAC_INSPECTION',
    propertyId: '',
    suiteId: '',
    hvacUnitId: '',
    showAvailability: true
  });

  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize form with calendar data
  useEffect(() => {
    if (isOpen) {
      const initialData = {
        title: '',
        description: '',
        date: initialDate ? moment(initialDate).format('YYYY-MM-DD') : '',
        time: initialTime || '',
        estimatedDuration: 60,
        assignedTechnician: initialTeamMember || '',
        priority: 'MEDIUM',
        workType: 'HVAC_INSPECTION',
        propertyId: '',
        suiteId: '',
        hvacUnitId: '',
        showAvailability: true
      };
      setScheduleData(initialData);
      setSelectedProperty('');
      setSelectedSuite('');
      setCurrentStep(1);
    }
  }, [isOpen, initialDate, initialTime, initialTeamMember]);

  if (!isOpen) return null;

  const workTypeOptions = [
    { value: 'HVAC_INSPECTION', label: 'HVAC Inspection', category: 'HVAC' },
    { value: 'HVAC_FILTER_CHANGE', label: 'Filter Change', category: 'HVAC' },
    { value: 'HVAC_FULL_SERVICE', label: 'Full Service', category: 'HVAC' },
    { value: 'HVAC_REPAIR', label: 'HVAC Repair', category: 'HVAC' },
    { value: 'PLUMBING_INSPECTION', label: 'Plumbing Inspection', category: 'Plumbing' },
    { value: 'PLUMBING_REPAIR', label: 'Plumbing Repair', category: 'Plumbing' },
    { value: 'ELECTRICAL_INSPECTION', label: 'Electrical Inspection', category: 'Electrical' },
    { value: 'ELECTRICAL_REPAIR', label: 'Electrical Repair', category: 'Electrical' },
    { value: 'LANDSCAPING', label: 'Landscaping', category: 'Exterior' },
    { value: 'SNOW_REMOVAL', label: 'Snow Removal', category: 'Exterior' },
    { value: 'CLEANING', label: 'Cleaning Service', category: 'Maintenance' },
    { value: 'OTHER', label: 'Other', category: 'General' }
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

  // Mock team members (replace with actual data)
  const teamMemberOptions = [
    { value: 'Mike Rodriguez', label: 'Mike Rodriguez', description: 'Lead Technician' },
    { value: 'Sarah Johnson', label: 'Sarah Johnson', description: 'HVAC Specialist' },
    { value: 'David Chen', label: 'David Chen', description: 'Maintenance Tech' },
    { value: 'Lisa Williams', label: 'Lisa Williams', description: 'Technician' }
  ];

  const propertyOptions = allProperties.map(property => ({
    value: property.id,
    label: property.name
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.title || !scheduleData.date || !scheduleData.assignedTechnician) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...scheduleData,
        propertyId: selectedProperty ? parseInt(selectedProperty) : null,
        suiteId: selectedSuite ? parseInt(selectedSuite) : null,
        type: scheduleType
      };

      const response = await fetch('/api/scheduled-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to schedule work');
      }

      onScheduleComplete();
    } catch (error) {
      console.error('Error scheduling work:', error);
      alert('Error scheduling work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (scheduleType) {
      case 'request': return 'Create New Request';
      case 'task': return 'Create New Task';
      case 'event': return 'Create New Event';
      default: return 'Schedule New Job';
    }
  };

  const getSubmitButtonText = () => {
    switch (scheduleType) {
      case 'request': return 'Create Request';
      case 'task': return 'Create Task';
      case 'event': return 'Create Event';
      default: return 'Schedule Job';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h4>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {scheduleType === 'event' ? 'Event Title' : 'Job Title'} *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={scheduleData.title}
                onChange={e => setScheduleData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={scheduleType === 'event' ? 'Team meeting, training session...' : 'HVAC Maintenance - Monthly Service'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
              <CustomDropdown
                value={scheduleData.workType}
                onChange={(value) => setScheduleData(prev => ({ ...prev, workType: value }))}
                options={workTypeOptions}
                placeholder="Select work type..."
                groupBy="category"
                showSearch={true}
                searchPlaceholder="Search work types..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              value={scheduleData.description}
              onChange={e => setScheduleData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of work to be performed..."
            />
          </div>

          {/* Date, Time, and Duration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={scheduleData.date}
                onChange={e => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={scheduleData.time}
                onChange={e => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
              <CustomDropdown
                value={scheduleData.estimatedDuration}
                onChange={(value) => setScheduleData(prev => ({ ...prev, estimatedDuration: parseInt(value) }))}
                options={durationOptions}
                placeholder="Select duration..."
              />
            </div>
          </div>

          {/* Assignment and Priority */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Technician *</label>
              <CustomDropdown
                value={scheduleData.assignedTechnician}
                onChange={(value) => setScheduleData(prev => ({ ...prev, assignedTechnician: value }))}
                options={teamMemberOptions}
                placeholder="Select team member..."
                showSearch={true}
                searchPlaceholder="Search team members..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <CustomDropdown
                value={scheduleData.priority}
                onChange={(value) => setScheduleData(prev => ({ ...prev, priority: value }))}
                options={priorityOptions}
                placeholder="Select priority..."
              />
            </div>
          </div>

          {/* Property Selection */}
          {scheduleType !== 'event' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property *</label>
                <CustomDropdown
                  value={selectedProperty}
                  onChange={(value) => {
                    setSelectedProperty(value);
                    setSelectedSuite('');
                    setScheduleData(prev => ({ ...prev, hvacUnitId: '' }));
                  }}
                  options={propertyOptions}
                  placeholder="Select property..."
                  showSearch={true}
                  searchPlaceholder="Search properties..."
                />
              </div>

              {/* Suite Selection */}
              {selectedProperty && suiteOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Suite/Unit (Optional)</label>
                  <CustomDropdown
                    value={selectedSuite}
                    onChange={setSelectedSuite}
                    options={[
                      { value: '', label: 'Property-wide (all suites)' },
                      ...suiteOptions
                    ]}
                    placeholder="Select suite or leave as property-wide..."
                    showSearch={suiteOptions.length > 5}
                    searchPlaceholder="Search suites..."
                  />
                </div>
              )}

              {/* HVAC Unit Selection */}
              {selectedSuite && hvacUnitOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">HVAC Unit (Optional)</label>
                  <CustomDropdown
                    value={scheduleData.hvacUnitId}
                    onChange={(value) => setScheduleData(prev => ({ ...prev, hvacUnitId: value }))}
                    options={[
                      { value: '', label: 'All HVAC units' },
                      ...hvacUnitOptions
                    ]}
                    placeholder="Select HVAC unit..."
                  />
                </div>
              )}
            </>
          )}

          {/* Show Availability Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Show Availability</h4>
              <p className="text-sm text-gray-600">Use team filters to customize shown availability</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={scheduleData.showAvailability}
                onChange={e => setScheduleData(prev => ({ ...prev, showAvailability: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Scheduling...' : getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
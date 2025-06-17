import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';

const ScheduleModal = ({ allProperties, onClose, onScheduleComplete }) => {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('');
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    time: '',
    maintenanceType: 'HVAC_INSPECTION',
    assignedTechnician: '',
    priority: 'MEDIUM',
    notes: '',
    propertyId: '',
    suiteId: '',
    hvacUnitId: ''
  });

  // Comprehensive work categories for property maintenance
  const workTypeOptions = [
    // HVAC
    { value: 'HVAC_INSPECTION', label: 'HVAC Inspection', category: 'HVAC' },
    { value: 'HVAC_FILTER_CHANGE', label: 'HVAC Filter Change', category: 'HVAC' },
    { value: 'HVAC_FULL_SERVICE', label: 'HVAC Full Service', category: 'HVAC' },
    { value: 'HVAC_REPAIR', label: 'HVAC Repair', category: 'HVAC' },
    { value: 'HVAC_INSTALLATION', label: 'HVAC Installation', category: 'HVAC' },
    
    // Grounds & Landscaping
    { value: 'DAY_PORTING', label: 'Day Porting', category: 'Grounds & Landscaping' },
    { value: 'WEEDING', label: 'Weeding', category: 'Grounds & Landscaping' },
    { value: 'LAWN_MAINTENANCE', label: 'Lawn Maintenance', category: 'Grounds & Landscaping' },
    { value: 'SEASONAL_CLEANUP', label: 'Seasonal Cleanup', category: 'Grounds & Landscaping' },
    { value: 'LANDSCAPING_REPAIR', label: 'Landscaping Repair', category: 'Grounds & Landscaping' },
    
    // Seasonal & Safety
    { value: 'SNOW_CHECKS', label: 'Snow Checks', category: 'Seasonal & Safety' },
    { value: 'EVENING_LIGHT_INSPECTION', label: 'Evening Light Inspections', category: 'Seasonal & Safety' },
    { value: 'WINTER_PREP', label: 'Winter Preparation', category: 'Seasonal & Safety' },
    { value: 'SPRING_STARTUP', label: 'Spring Startup', category: 'Seasonal & Safety' },
    { value: 'SECURITY_CHECK', label: 'Security Check', category: 'Seasonal & Safety' },
    
    // Cleaning & Janitorial
    { value: 'JANITORIAL_CLEANING', label: 'Janitorial Cleaning', category: 'Cleaning & Janitorial' },
    { value: 'DEEP_CLEANING', label: 'Deep Cleaning', category: 'Cleaning & Janitorial' },
    { value: 'CARPET_CLEANING', label: 'Carpet Cleaning', category: 'Cleaning & Janitorial' },
    { value: 'WINDOW_CLEANING', label: 'Window Cleaning', category: 'Cleaning & Janitorial' },
    
    // General Maintenance
    { value: 'PLUMBING_REPAIR', label: 'Plumbing Repair', category: 'General Maintenance' },
    { value: 'ELECTRICAL_REPAIR', label: 'Electrical Repair', category: 'General Maintenance' },
    { value: 'PAINTING', label: 'Painting', category: 'General Maintenance' },
    { value: 'ROOFING_INSPECTION', label: 'Roofing Inspection', category: 'General Maintenance' },
    { value: 'ROOFING_REPAIR', label: 'Roofing Repair', category: 'General Maintenance' },
    { value: 'GENERAL_REPAIR', label: 'General Repair', category: 'General Maintenance' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'HIGH', label: 'High Priority' }
  ];

  // ADD THIS MAPPING FUNCTION
  const mapWorkTypeToMaintenanceType = (workType) => {
    const mapping = {
      // HVAC mappings
      'HVAC_INSPECTION': 'INSPECTION',
      'HVAC_FILTER_CHANGE': 'FILTER_CHANGE',
      'HVAC_FULL_SERVICE': 'FULL_SERVICE',
      'HVAC_REPAIR': 'REPAIR',
      'HVAC_INSTALLATION': 'OTHER',
      
      // All other work types map to OTHER
      'DAY_PORTING': 'OTHER',
      'WEEDING': 'OTHER',
      'LAWN_MAINTENANCE': 'OTHER',
      'SEASONAL_CLEANUP': 'OTHER',
      'LANDSCAPING_REPAIR': 'OTHER',
      'SNOW_CHECKS': 'OTHER',
      'EVENING_LIGHT_INSPECTION': 'OTHER',
      'WINTER_PREP': 'OTHER',
      'SPRING_STARTUP': 'OTHER',
      'SECURITY_CHECK': 'OTHER',
      'JANITORIAL_CLEANING': 'OTHER',
      'DEEP_CLEANING': 'OTHER',
      'CARPET_CLEANING': 'OTHER',
      'WINDOW_CLEANING': 'OTHER',
      'PLUMBING_REPAIR': 'OTHER',
      'ELECTRICAL_REPAIR': 'OTHER',
      'PAINTING': 'OTHER',
      'ROOFING_INSPECTION': 'OTHER',
      'ROOFING_REPAIR': 'OTHER',
      'GENERAL_REPAIR': 'OTHER'
    };
    
    return mapping[workType] || 'OTHER';
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    setSelectedSuite('');
    setNewSchedule(prev => ({
      ...prev,
      propertyId,
      suiteId: '',
      hvacUnitId: ''
    }));
  };

  const handleSuiteChange = (suiteId) => {
    setSelectedSuite(suiteId);
    setNewSchedule(prev => ({
      ...prev,
      suiteId,
      hvacUnitId: ''
    }));
  };

  const handleScheduleSubmit = async () => {
    if (!newSchedule.date || !newSchedule.time || !newSchedule.assignedTechnician || !selectedProperty) {
      alert('Please fill in Date, Time, Technician, and Property');
      return;
    }

    // Only require suite for HVAC work or specific unit-based maintenance
    const requiresSuite = newSchedule.maintenanceType.startsWith('HVAC_') || 
                         ['JANITORIAL_CLEANING', 'DEEP_CLEANING', 'CARPET_CLEANING', 'WINDOW_CLEANING'].includes(newSchedule.maintenanceType);
    
    if (requiresSuite && !selectedSuite) {
      alert('This type of work requires selecting a specific suite');
      return;
    }

    try {
      // Map the frontend work type to database maintenance type
      const mappedMaintenanceType = mapWorkTypeToMaintenanceType(newSchedule.maintenanceType);
      
      // Get the work type label for notes
      const workTypeLabel = workTypeOptions.find(option => option.value === newSchedule.maintenanceType)?.label || newSchedule.maintenanceType;
      
      // Combine original notes with work type info if it's mapped to OTHER
      let enhancedNotes = newSchedule.notes;
      if (mappedMaintenanceType === 'OTHER' && !newSchedule.maintenanceType.startsWith('HVAC_')) {
        enhancedNotes = `${workTypeLabel}: ${newSchedule.notes}`.trim();
      }

      const payload = {
        ...newSchedule,
        maintenanceType: mappedMaintenanceType, // Use mapped value
        notes: enhancedNotes, // Include work type in notes
        suiteId: selectedSuite ? parseInt(selectedSuite) : null,
        hvacUnitId: newSchedule.hvacUnitId ? parseInt(newSchedule.hvacUnitId) : null,
        propertyId: parseInt(selectedProperty)
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch('/api/scheduled-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onScheduleComplete();
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Schedule error:', errorText);
        alert('Failed to schedule maintenance. Please check console for details.');
      }
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      alert('Error scheduling maintenance');
    }
  };

  // Get selected property's suites
  const propertyOptions = [
    ...allProperties.map(property => ({
      value: property.id,
      label: property.name
    }))
  ];

  const selectedPropertySuites = selectedProperty ? 
    allProperties.find(p => p.id === parseInt(selectedProperty))?.suites || [] : [];

  const suiteOptions = selectedPropertySuites.map(suite => ({
    value: suite.id,
    label: suite.name || suite.unitNumber || `Suite ${suite.id}`
  }));

  // Get selected suite's HVAC units (only show for HVAC work types)
  const selectedSuiteHVAC = selectedSuite ?
    selectedPropertySuites.find(s => s.id === parseInt(selectedSuite))?.hvacUnits || [] : [];

  const hvacUnitOptions = selectedSuiteHVAC.map(unit => ({
    value: unit.id,
    label: unit.label || unit.serialNumber || `Unit ${unit.id}`
  }));

  const isHVACWork = newSchedule.maintenanceType.startsWith('HVAC_');
  const requiresSuite = isHVACWork || 
                       ['JANITORIAL_CLEANING', 'DEEP_CLEANING', 'CARPET_CLEANING', 'WINDOW_CLEANING'].includes(newSchedule.maintenanceType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
              <Calendar className="w-5 h-5" style={{color: '#2a3a91'}} />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Schedule Maintenance Work</h4>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={newSchedule.date}
                onChange={e => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={newSchedule.time}
                onChange={e => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Work *</label>
            <CustomDropdown
              value={newSchedule.maintenanceType}
              onChange={(value) => setNewSchedule(prev => ({ ...prev, maintenanceType: value }))}
              options={workTypeOptions}
              placeholder="Select work type..."
              groupBy="category"
              showSearch={true}
              searchPlaceholder="Search work types..."
            />
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property *</label>
            <CustomDropdown
              value={selectedProperty}
              onChange={handlePropertyChange}
              options={propertyOptions}
              placeholder="Select property..."
              showSearch={true}
              searchPlaceholder="Search properties..."
            />
          </div>

          {/* Suite Selection - Now Optional */}
          {selectedProperty && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Suite/Unit {requiresSuite ? '*' : '(Optional)'}
              </label>
              {suiteOptions.length > 0 ? (
                <CustomDropdown
                  value={selectedSuite}
                  onChange={handleSuiteChange}
                  options={[
                    { value: '', label: 'Property-wide (all suites)' },
                    ...suiteOptions
                  ]}
                  placeholder="Select suite or leave as property-wide..."
                  showSearch={suiteOptions.length > 5}
                  searchPlaceholder="Search suites..."
                />
              ) : (
                <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                  No suites found for this property. Work will be scheduled property-wide.
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {requiresSuite 
                  ? 'This type of work requires a specific suite selection'
                  : 'Leave blank for property-wide work (e.g., landscaping, snow removal)'
                }
              </p>
            </div>
          )}

          {/* HVAC Unit Selection - Only for HVAC work */}
          {selectedSuite && isHVACWork && hvacUnitOptions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">HVAC Unit (Optional)</label>
              <CustomDropdown
                value={newSchedule.hvacUnitId}
                onChange={(value) => setNewSchedule(prev => ({ ...prev, hvacUnitId: value }))}
                options={[
                  { value: '', label: 'All HVAC units' },
                  ...hvacUnitOptions
                ]}
                placeholder="Select HVAC unit..."
              />
            </div>
          )}

          {/* Technician and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Technician *</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={newSchedule.assignedTechnician}
                onChange={e => setNewSchedule(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                placeholder="Technician or crew name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <CustomDropdown
                value={newSchedule.priority}
                onChange={(value) => setNewSchedule(prev => ({ ...prev, priority: value }))}
                options={priorityOptions}
                placeholder="Select priority..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Work Description & Notes</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              rows="4"
              value={newSchedule.notes}
              onChange={e => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe the work to be performed, special instructions, materials needed, etc..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleScheduleSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors shadow-lg"
              style={{backgroundColor: '#2a3a91'}}
            >
              <Calendar className="w-5 h-5" />
              Schedule Work
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
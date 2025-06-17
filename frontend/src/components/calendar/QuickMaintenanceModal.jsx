import React, { useState, useEffect } from 'react';
import { X, Wrench, Plus, Camera } from 'lucide-react';

const QuickMaintenanceModal = ({ isOpen, onClose, allProperties, onMaintenanceComplete }) => {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [maintenanceData, setMaintenanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    maintenanceType: 'INSPECTION',
    technician: '',
    notes: ''
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProperty('');
      setSelectedSuite('');
      setSelectedUnit('');
      setMaintenanceData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        maintenanceType: 'INSPECTION',
        technician: '',
        notes: ''
      });
      setPhotoFiles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    setSelectedSuite('');
    setSelectedUnit('');
  };

  const handleSuiteChange = (suiteId) => {
    setSelectedSuite(suiteId);
    setSelectedUnit('');
  };

  const selectedPropertyData = selectedProperty ? 
    allProperties.find(p => p.id === parseInt(selectedProperty)) : null;

  const selectedPropertySuites = selectedPropertyData?.suites || [];

  const selectedSuiteData = selectedSuite ? 
    selectedPropertySuites.find(s => s.id === parseInt(selectedSuite)) : null;

  const selectedSuiteHVAC = selectedSuiteData?.hvacUnits || [];

  const handleSubmit = async () => {
    // Check if HVAC units are available for this suite
    const hasHVACUnits = selectedSuiteHVAC.length > 0;
    
    // Basic validation
    if (!selectedProperty || !selectedSuite || !maintenanceData.technician || !maintenanceData.notes) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Only require HVAC unit selection if units exist
    if (hasHVACUnits && !selectedUnit) {
      alert('Please select an HVAC unit');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create maintenance log
      const maintenancePayload = {
        hvacUnitId: hasHVACUnits ? parseInt(selectedUnit) : null,
        technicianId: 1, // You might want to make this dynamic
        notes: maintenanceData.notes,
        maintenanceType: maintenanceData.maintenanceType,
        status: 'COMPLETED',
        createdAt: `${maintenanceData.date}T${maintenanceData.time}:00.000Z`,
        serviceTechnician: maintenanceData.technician
      };

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenancePayload)
      });

      if (!response.ok) {
        throw new Error('Failed to create maintenance record');
      }

      const savedLog = await response.json();

      // Upload photos if any
      if (photoFiles.length > 0) {
        for (let file of photoFiles) {
          const formData = new FormData();
          formData.append('photo', file);
          
          await fetch(`/api/maintenance/${savedLog.id}/photos`, {
            method: 'POST',
            body: formData
          });
        }
      }

      // Notify parent and close
      if (onMaintenanceComplete) {
        onMaintenanceComplete(savedLog);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      alert('Failed to save maintenance record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
              <Wrench className="w-5 h-5" style={{color: '#2a3a91'}} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Quick Maintenance Entry</h3>
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
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property *</label>
            <select
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              value={selectedProperty}
              onChange={e => handlePropertyChange(e.target.value)}
              required
            >
              <option value="">Select property...</option>
              {allProperties.map(property => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>
          </div>

          {/* Suite Selection */}
          {selectedProperty && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Suite/Unit *</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={selectedSuite}
                onChange={e => handleSuiteChange(e.target.value)}
                required
              >
                <option value="">Select suite...</option>
                {selectedPropertySuites.map(suite => (
                  <option key={suite.id} value={suite.id}>
                    {suite.name || suite.unitNumber || `Suite ${suite.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* HVAC Unit Selection - Show even if no units exist */}
          {selectedSuite && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                HVAC Unit {selectedSuiteHVAC.length > 0 ? '*' : '(None available)'}
              </label>
              {selectedSuiteHVAC.length > 0 ? (
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  value={selectedUnit}
                  onChange={e => setSelectedUnit(e.target.value)}
                  required
                >
                  <option value="">Select HVAC unit...</option>
                  {selectedSuiteHVAC.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                  No HVAC units found for this suite. You can add units later.
                </div>
              )}
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={maintenanceData.date}
                onChange={e => setMaintenanceData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={maintenanceData.time}
                onChange={e => setMaintenanceData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Maintenance Type and Technician */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={maintenanceData.maintenanceType}
                onChange={e => setMaintenanceData(prev => ({ ...prev, maintenanceType: e.target.value }))}
                required
              >
                <option value="INSPECTION">Inspection</option>
                <option value="FILTER_CHANGE">Filter Change</option>
                <option value="FULL_SERVICE">Full Service</option>
                <option value="REPAIR">Repair</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Technician *</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={maintenanceData.technician}
                onChange={e => setMaintenanceData(prev => ({ ...prev, technician: e.target.value }))}
                placeholder="Technician name"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes *</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              rows="4"
              value={maintenanceData.notes}
              onChange={e => setMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe the work performed, findings, recommendations..."
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photos (optional)</label>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg shadow hover:opacity-90 transition-colors cursor-pointer"
                   style={{backgroundColor: '#2a3a91'}}>
              <Camera className="w-4 h-4" />
              Add Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => setPhotoFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
            {photoFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {photoFiles.map((file, idx) => (
                  <div key={idx} className="w-16 h-16 relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Selected"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              style={{backgroundColor: '#2a3a91'}}
            >
              <Wrench className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Maintenance Record'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMaintenanceModal;
// MaintenanceRecordForm.jsx - Fixed with proper null checks

import React from 'react';
import { Plus, Calendar, FileText, Camera, Upload, X } from 'lucide-react';

const MAINTENANCE_TYPES = [
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'FILTER_CHANGE', label: 'Filter Change' },
  { value: 'FULL_SERVICE', label: 'Full Service' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'OTHER', label: 'Other' },
];

const MaintenanceRecordForm = ({
  selectedSuite,
  selectedUnit,
  setSelectedUnit,
  maintenanceType,
  setMaintenanceType,
  serviceDate,
  setServiceDate,
  maintenanceNote,
  setMaintenanceNote,
  photoFiles,
  setPhotoFiles,
  uploadStatus,
  formError,
  submitStatus,
  handleSubmit,
  setShowAddHVAC
}) => {
  // ✅ FIXED: Add null check for selectedSuite
  if (!selectedSuite) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading suite data...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
          <Plus className="w-5 h-5" style={{color: '#2a3a91'}} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Add Maintenance Record</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maintenance Type
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              value={maintenanceType}
              onChange={e => setMaintenanceType(e.target.value)}
              required
            >
              <option value="">Select maintenance type...</option>
              {MAINTENANCE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* ✅ FIXED: Added proper null checks for selectedSuite.hvacUnits */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            HVAC Unit
          </label>
          <div className="flex gap-3">
            <select
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              required
            >
              <option value="">Select HVAC unit...</option>
              {/* ✅ FIXED: Added optional chaining and proper null checks */}
              {selectedSuite?.hvacUnits && selectedSuite.hvacUnits.length > 0 ? (
                selectedSuite.hvacUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label || unit.name || unit.serialNumber || unit.filterSize || `Unit ${unit.id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>No HVAC units found. Please add one.</option>
              )}
            </select>
            <button
              className="px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors whitespace-nowrap"
              style={{backgroundColor: '#2a3a91'}}
              onClick={() => setShowAddHVAC(true)}
              type="button"
            >
              Add Unit
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maintenance Notes
          </label>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
            style={{'--tw-ring-color': '#2a3a91'}}
            onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
            rows="5"
            value={maintenanceNote}
            onChange={e => setMaintenanceNote(e.target.value)}
            placeholder="Describe the work performed, parts used, issues found, and any recommendations..."
            required
          />
        </div>
        
        {/* Photo Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Attach Photos (Optional)
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label 
              htmlFor="photo-upload" 
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Camera className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to add photos or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </span>
            </label>
          </div>

          {/* Photo Preview */}
          {photoFiles && photoFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Photos ({photoFiles.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photoFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {uploadStatus && (
            <div className="mt-2 text-sm font-medium" style={{color: '#2a3a91'}}>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Error Messages */}
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{formError}</p>
          </div>
        )}

        {/* Success Messages */}
        {submitStatus && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 font-medium">{submitStatus}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
            style={{backgroundColor: '#2a3a91'}}
          >
            <FileText className="w-4 h-4" />
            Save Maintenance Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceRecordForm;
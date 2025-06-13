/**
 * Props:
 * - selectedSuite: object (suite/unit the record is for)
 * - selectedUnit: string|number (ID of selected HVAC unit)
 * - setSelectedUnit: function (updates the selected unit)
 * - maintenanceType: string (type of maintenance)
 * - setMaintenanceType: function (updates the type)
 * - serviceDate: string (YYYY-MM-DD)
 * - setServiceDate: function (updates the date)
 * - maintenanceNote: string (record notes)
 * - setMaintenanceNote: function (updates the notes)
 * - photoFiles: array (selected photo files)
 * - setPhotoFiles: function (updates photoFiles)
 * - uploadStatus: string (status message for photo upload)
 * - formError: string (form error message)
 * - submitStatus: string (form submission status)
 * - handleSubmit: function (submit handler)
 * - setShowAddHVAC: function (shows the Add HVAC modal)
 */

import React from 'react';
import { Plus, Calendar, FileText } from 'lucide-react';

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
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
        <Plus className="w-5 h-5" style={{color: '#2a3a91'}} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Add Maintenance Record</h3>
    </div>

    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">        <div>
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

      {/* HVAC Unit Selection */}
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
            {selectedSuite.hvacUnits && selectedSuite.hvacUnits.length > 0 ? (
              selectedSuite.hvacUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name || unit.serialNumber || unit.filterSize || `Unit ${unit.id}`}
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
        ></textarea>
      </div>
      
      {/* Photo Upload Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Attach Photos (optional)
        </label>
        <label
          className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg shadow hover:opacity-90 transition-colors cursor-pointer mb-2"
          style={{backgroundColor: '#2a3a91'}}
        >
          <Plus className="w-4 h-4" />
          Choose Photos
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setPhotoFiles(Array.from(e.target.files))}
            className="hidden"
          />
        </label>
        {photoFiles.length > 0 && (
          <div className="flex gap-2 flex-wrap">
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
        {uploadStatus && <div className="text-sm mt-1" style={{color: '#2a3a91'}}>{uploadStatus}</div>}
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-500">
          All fields are required to save the maintenance record
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
          style={{backgroundColor: '#2a3a91'}}
        >
          <FileText className="w-5 h-5" />
          Save Maintenance Record
        </button>
      </div>
      
      {formError && (
        <div className="flex items-center gap-3 p-4 border rounded-lg" style={{backgroundColor: '#fef2f2', borderColor: '#ef4444'}}>
          <FileText className="w-5 h-5 flex-shrink-0" style={{color: '#ef4444'}} />
          <div className="font-medium" style={{color: '#b91c1c'}}>{formError}</div>
        </div>
      )}
      
      {submitStatus && (
        <div className="flex items-center gap-3 p-4 border rounded-lg" style={{backgroundColor: '#f0f9ff', borderColor: '#22c55e'}}>
          <FileText className="w-5 h-5 flex-shrink-0" style={{color: '#22c55e'}} />
          <div className="font-medium" style={{color: '#15803d'}}>{submitStatus}</div>
        </div>
      )}
    </div>
  </div>
);

export default MaintenanceRecordForm;
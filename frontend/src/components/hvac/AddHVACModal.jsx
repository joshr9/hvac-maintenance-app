/**
 * Props:
 * - showAddHVAC: boolean (modal open/closed)
 * - setShowAddHVAC: function (sets modal open/closed)
 * - newUnit: object (fields for the new unit)
 * - setNewUnit: function (updates newUnit fields)
 * - handleAddHVAC: function (submits new unit)
 * - addHVACStatus: string (status message)
 */

import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';

const AddHVACModal = ({
  showAddHVAC,
  setShowAddHVAC,
  newUnit,
  setNewUnit,
  handleAddHVAC,
  addHVACStatus,
}) => {
  if (!showAddHVAC) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
          onClick={() => setShowAddHVAC(false)}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
            <Plus className="w-5 h-5" style={{color: '#2a3a91'}} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Add HVAC Unit</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Label/Name</label>
            <input
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              placeholder="Enter unit name or label"
              value={newUnit.name}
              onChange={e => setNewUnit(n => ({ ...n, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
            <input
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              placeholder="Enter serial number"
              value={newUnit.serialNumber}
              onChange={e => setNewUnit(n => ({ ...n, serialNumber: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
            <input
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              placeholder="Enter model number"
              value={newUnit.model}
              onChange={e => setNewUnit(n => ({ ...n, model: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Install Date</label>
            <input
              type="date"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              value={newUnit.installDate}
              onChange={e => setNewUnit(n => ({ ...n, installDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Size</label>
            <input
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              placeholder="e.g., 16x20x1"
              value={newUnit.filterSize}
              onChange={e => setNewUnit(n => ({ ...n, filterSize: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
              rows="3"
              placeholder="Additional notes about this unit"
              value={newUnit.notes}
              onChange={e => setNewUnit(n => ({ ...n, notes: e.target.value }))}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={handleAddHVAC}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
              style={{backgroundColor: '#2a3a91'}}
            >
              <Plus className="w-4 h-4" />
              Add Unit
            </button>
            <button 
              type="button" 
              className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors" 
              onClick={() => setShowAddHVAC(false)}
            >
              Cancel
            </button>
          </div>
          
          {addHVACStatus && (
            <div className="pt-3">
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{backgroundColor: '#f0f9ff', color: '#2a3a91'}}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{addHVACStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddHVACModal;
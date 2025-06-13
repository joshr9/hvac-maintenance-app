/**
 * Props:
 * - selectedProperty: object (the currently selected property, with suites)
 * - setSelectedProperty: function (to reset property selection)
 * - handleSuiteSelect: function (called with the selected suite)
 */

import React from 'react';
import { Building, Home, ArrowLeft, MapPin } from 'lucide-react';

const SuiteSelectionStep = ({
  selectedProperty,
  setSelectedProperty,
  handleSuiteSelect
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-lg">
      {/* Property Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
              <Building className="w-6 h-6" style={{color: '#2a3a91'}} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedProperty.name}</h2>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {selectedProperty.address}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedProperty(null)}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Property
          </button>
        </div>
      </div>

      {/* Suites Grid */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Home className="w-5 h-5" />
          Select Suite or Unit
        </h3>
        
        {selectedProperty.suites && selectedProperty.suites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProperty.suites.map(suite => (
              <div 
                key={suite.id} 
                className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all group"
                style={{'--hover-border-color': '#2a3a91'}}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a3a91'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}
                onClick={() => handleSuiteSelect(suite)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg transition-colors">
                    <Home className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {suite.name || suite.unitNumber || `Suite ${suite.id}`}
                    </div>
                    {suite.unitNumber && (
                      <div className="text-sm text-gray-600">Unit: {suite.unitNumber}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No suites or units found for this property</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default SuiteSelectionStep;
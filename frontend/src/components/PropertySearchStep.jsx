/**
 * Props:
 * - searchQuery: string (current search input)
 * - setSearchQuery: function (updates the search input)
 * - filteredProperties: array (properties matching the search)
 * - handlePropertySelect: function (called with the selected property)
 */

import React from 'react';
import { Building, MapPin, Search } from 'lucide-react';

const PropertySearchStep = ({
  searchQuery,
  setSearchQuery,
  filteredProperties,
  handlePropertySelect
}) => (
  <div className="max-w-2xl mx-auto px-4"> {/* Add horizontal padding */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <Building className="w-12 h-12 mx-auto mb-4" style={{color: '#2a3a91'}} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Property</h2>
        <p className="text-gray-600">Search for a property to begin maintenance tracking</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-lg"
          style={{'--tw-ring-color': '#2a3a91'}}
          onFocus={e => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by property name or address..."
        />
      </div>

      {searchQuery && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <div 
                key={property.id}
                className="p-4 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-white transition-colors"
                onClick={() => handlePropertySelect(property)}
              >
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">{property.name}</div>
                    <div className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {property.address}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No properties found matching your search
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default PropertySearchStep;
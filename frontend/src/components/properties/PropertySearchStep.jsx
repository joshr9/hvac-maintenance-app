import React, { useState } from 'react';
import { Building, MapPin, Search, Plus } from 'lucide-react';
import AddPropertyModal from './AddPropertyModal';

const PropertySearchStep = ({
  searchQuery,
  setSearchQuery,
  filteredProperties,
  handlePropertySelect,
  properties, // Add this to refresh the property list
  setProperties // Add this to update the property list
}) => {
  const [showAddProperty, setShowAddProperty] = useState(false);

  const handlePropertyAdded = (newProperty) => {
    // Add the new property to the list
    if (setProperties) {
      setProperties(prev => [...prev, newProperty]);
    }
    
    // Optional: Auto-select the new property
    if (handlePropertySelect) {
      handlePropertySelect(newProperty);
    }
  };
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Property Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{backgroundColor: '#e8eafc'}}>
              <Building className="w-8 h-8" style={{color: '#2a3a91'}} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Select Property</h2>
            <p className="text-gray-600 text-lg">Search for a property to begin maintenance entry</p>
          </div>

          {/* Enhanced Search Box */}
          <div className="relative mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                className="w-full pl-14 pr-32 py-5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-lg shadow-sm bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by property name or address..."
              />
              {/* Add Property Button integrated into search */}
              <button
                onClick={() => setShowAddProperty(true)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 inline-flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm"
                style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)', boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'}}
                type="button"
                title="Add New Property"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
                {filteredProperties.length > 0 ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">
                        {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {filteredProperties.map(property => (
                        <div 
                          key={property.id}
                          className="p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50/50 transition-colors group"
                          onClick={() => handlePropertySelect(property)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                              <Building className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {property.name}
                              </div>
                              <div className="text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4" />
                                {property.address}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-sm text-blue-600 font-medium">Select →</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600 mb-4">No properties match your search criteria</p>
                    <button
                      onClick={() => setShowAddProperty(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors shadow-lg"
                      style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)', boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'}}
                      type="button"
                    >
                      <Plus className="w-5 h-5" />
                      Add "{searchQuery}" as New Property
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State - Show when no search query */}
          {!searchQuery && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50">
                <p className="text-gray-600 mb-4">Enter a property name or address to find existing properties</p>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                  <span>or</span>
                  <button
                    onClick={() => setShowAddProperty(true)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                    add a new property
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Scheduler Section
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <PropertyScheduler />
        </div> */}

        {/* Add Property Modal */}
        <AddPropertyModal
          isOpen={showAddProperty}
          onClose={() => setShowAddProperty(false)}
          onPropertyAdded={handlePropertyAdded}
        />
      </div>
    </div>
  );
};

export default PropertySearchStep;
// components/jobs/services/ServiceCatalogSelector.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Tag } from 'lucide-react';
import ServicePreviewCard from './ServicePreviewCard';

const ServiceCatalogSelector = ({ 
  onServiceSelect, 
  onCustomService,
  availableServices = [],
  loading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get unique categories
  const categories = ['all', ...new Set(availableServices.map(s => s.category))];
  
  // Filter services
  const filteredServices = availableServices.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Service</h3>
        <p className="text-sm text-gray-600">
          Choose from your service catalog or create a custom service for this job.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-sm"
            style={{'--tw-ring-color': '#2a3a91'}}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Services List */}
      {!loading && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredServices.map((service) => (
            <ServicePreviewCard
              key={service.id}
              service={service}
              onClick={() => onServiceSelect(service)}
            />
          ))}

          {/* No Results */}
          {filteredServices.length === 0 && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="font-medium mb-2">No services found</div>
              <div className="text-sm">
                No services match "{searchQuery}" 
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Service Option */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={onCustomService}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group"
        >
          <div className="text-center">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
            <div className="font-semibold text-gray-900 mb-2">Add Custom Service</div>
            <div className="text-sm text-gray-600">
              Create a one-time service, material, or custom line item for this job
            </div>
          </div>
        </button>
      </div>

      {/* Stats */}
      {!loading && availableServices.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900">{availableServices.length}</div>
              <div className="text-gray-600">Total Services</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{categories.length - 1}</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{filteredServices.length}</div>
              <div className="text-gray-600">Filtered Results</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalogSelector;
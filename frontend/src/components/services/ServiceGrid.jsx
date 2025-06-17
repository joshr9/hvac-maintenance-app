import React from 'react';
import { Tag, Upload } from 'lucide-react';
import ServiceCard from './ServiceCard';
import GlassCard from '../common/GlassCard';

const ServiceGrid = ({ 
  services = [], 
  loading = false,
  searchQuery = '',
  selectedCategory = 'all',
  onEditService,
  onDeleteService,
  onShowImportModal 
}) => {
  
  // Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Services Grid
  if (services.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            onEdit={onEditService}
            onDelete={onDeleteService}
          />
        ))}
      </div>
    );
  }

  // Empty State
  const hasFilters = searchQuery || selectedCategory !== 'all';
  
  return (
    <div className="text-center py-12">
      <GlassCard className="max-w-md mx-auto">
        <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No services found
        </h3>
        
        <p className="text-gray-600 mb-6">
          {hasFilters
            ? 'Try adjusting your search or filters to find services.'
            : 'Get started by importing your service catalog or adding services manually.'
          }
        </p>
        
        {hasFilters ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Search: "{searchQuery}" {selectedCategory !== 'all' && `in ${selectedCategory}`}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onShowImportModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)',
                boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'
              }}
            >
              <Upload className="w-4 h-4" />
              Import Services
            </button>
            
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Tag className="w-4 h-4" />
              Add Manually
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ServiceGrid;
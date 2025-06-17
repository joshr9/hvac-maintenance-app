// components/common/UniversalSearchDropdown.jsx
import React from 'react';
import { Search, MapPin, Briefcase, Wrench, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react';

const UniversalSearchDropdown = ({ 
  searchResults, 
  isLoading, 
  hasSearched, 
  totalCount, 
  onNavigate, 
  onClose,
  searchQuery 
}) => {
  
  const handleResultClick = (type, item) => {
    switch (type) {
      case 'properties':
        onNavigate('properties');
        // Could store selected property ID for navigation
        break;
      case 'jobs':
        onNavigate('jobs');
        // Could open specific job
        break;
      case 'services':
        onNavigate('services');
        // Could filter to specific service
        break;
    }
    onClose();
  };

  const renderPropertyResult = (property) => (
    <div 
      key={property.id}
      onClick={() => handleResultClick('properties', property)}
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{property.name}</div>
          <div className="text-sm text-gray-600">{property.address}</div>
          {property.suites && (
            <div className="text-xs text-gray-500 mt-1">
              {property.suites.length} suite{property.suites.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  const renderJobResult = (job) => (
    <div 
      key={job.id}
      onClick={() => handleResultClick('jobs', job)}
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Briefcase className="w-4 h-4 text-orange-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{job.title}</span>
            <span className="text-xs font-mono text-gray-500">{job.jobNumber}</span>
          </div>
          <div className="text-sm text-gray-600">{job.property?.name}</div>
          <div className="flex items-center gap-4 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {job.status.replace('_', ' ')}
            </span>
            {job.scheduledDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(job.scheduledDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  const renderServiceResult = (service) => (
    <div 
      key={service.id}
      onClick={() => handleResultClick('services', service)}
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Wrench className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{service.name}</div>
          <div className="text-sm text-gray-600">{service.category}</div>
          <div className="flex items-center gap-4 mt-1">
            {service.unitPrice && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <DollarSign className="w-3 h-3" />
                {parseFloat(service.unitPrice).toFixed(2)}
              </div>
            )}
            {service.durationMinutes && (
              <div className="text-xs text-gray-500">
                {service.durationMinutes} min
              </div>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  if (!hasSearched) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
      {isLoading ? (
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Searching across all systems...</div>
        </div>
      ) : totalCount === 0 ? (
        <div className="px-4 py-8 text-center">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 mb-1">No results found</div>
          <div className="text-xs text-gray-600">
            Try searching for properties, jobs, or services
          </div>
        </div>
      ) : (
        <>
          {/* Header with total count */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">
                {totalCount} result{totalCount !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {searchResults.properties?.length > 0 && (
                  <span>{searchResults.properties.length} properties</span>
                )}
                {searchResults.jobs?.length > 0 && (
                  <span>{searchResults.jobs.length} jobs</span>
                )}
                {searchResults.services?.length > 0 && (
                  <span>{searchResults.services.length} services</span>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {/* Properties */}
            {searchResults.properties?.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    🏢 Properties ({searchResults.properties.length})
                  </div>
                </div>
                {searchResults.properties.slice(0, 3).map(renderPropertyResult)}
                {searchResults.properties.length > 3 && (
                  <div className="px-4 py-2 text-center">
                    <button 
                      onClick={() => {
                        onNavigate('properties');
                        onClose();
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {searchResults.properties.length} properties →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Jobs */}
            {searchResults.jobs?.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                  <div className="text-xs font-semibold text-orange-900 uppercase tracking-wider">
                    💼 Jobs ({searchResults.jobs.length})
                  </div>
                </div>
                {searchResults.jobs.slice(0, 3).map(renderJobResult)}
                {searchResults.jobs.length > 3 && (
                  <div className="px-4 py-2 text-center">
                    <button 
                      onClick={() => {
                        onNavigate('jobs');
                        onClose();
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View all {searchResults.jobs.length} jobs →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Services */}
            {searchResults.services?.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                  <div className="text-xs font-semibold text-green-900 uppercase tracking-wider">
                    🔧 Services ({searchResults.services.length})
                  </div>
                </div>
                {searchResults.services.slice(0, 5).map(renderServiceResult)}
                {searchResults.services.length > 5 && (
                  <div className="px-4 py-2 text-center">
                    <button 
                      onClick={() => {
                        onNavigate('services');
                        onClose();
                      }}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      View all {searchResults.services.length} services →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UniversalSearchDropdown;
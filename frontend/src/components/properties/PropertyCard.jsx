// components/properties/PropertyCard.jsx - Simplified and User-Friendly
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2,
  Calendar,
  Settings,
  Users,
  Zap
} from 'lucide-react';

const PropertyCard = ({ property, onView, onEdit, onDelete, onNavigate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [jobCount, setJobCount] = useState(property.jobCount || 0);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Load job count when component mounts
  useEffect(() => {
    if (!property.jobCount && property.id) {
      loadJobCount();
    }
  }, [property.id]);

  const loadJobCount = async () => {
    try {
      setLoadingJobs(true);
      const response = await fetch(`/api/jobs?propertyId=${property.id}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and direct array responses
        const count = Array.isArray(data) ? data.length : (data.pagination?.total || 0);
        setJobCount(count);
      }
    } catch (error) {
      console.error('Error loading job count:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Calculate property metrics
  const suiteCount = property.suites?.length || 0;
  const unitCount = property.suites?.reduce((sum, suite) => sum + (suite.hvacUnits?.length || 0), 0) || 0;
  
  const handleAction = (action) => {
    setShowDropdown(false);
    action(property);
  };

  const handleViewJobs = () => {
    setShowDropdown(false);
    onNavigate('jobs', { propertyFilter: property.id });
  };

  const handleScheduleMaintenance = () => {
    setShowDropdown(false);
    onNavigate('maintenance', { selectedProperty: property });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                {property.name || `Property ${property.id}`}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
            </div>
          </div>
          
          {/* Actions Dropdown - Fixed positioning */}
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown Menu - Fixed z-index and positioning */}
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                  <button
                    onClick={() => handleAction(onView)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleAction(onEdit)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Property
                  </button>
                  
                  <div className="border-t border-gray-100 my-1" />
                  
                  <button
                    onClick={handleViewJobs}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Calendar className="w-4 h-4" />
                    View Jobs
                  </button>
                  
                  <button
                    onClick={handleScheduleMaintenance}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Schedule Maintenance
                  </button>
                  
                  <div className="border-t border-gray-100 my-1" />
                  
                  <button
                    onClick={() => handleAction(onDelete)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Property
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats - More Prominent and Cleaner */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-50 rounded-md">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{suiteCount}</p>
                <p className="text-xs text-gray-600">{suiteCount === 1 ? 'Suite' : 'Suites'}</p>
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-200" />
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-md">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{unitCount}</p>
                <p className="text-xs text-gray-600">HVAC {unitCount === 1 ? 'Unit' : 'Units'}</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200" />
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {loadingJobs ? '...' : jobCount}
                </p>
                <p className="text-xs text-gray-600">{jobCount === 1 ? 'Job' : 'Jobs'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action - More Prominent */}
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={() => onView(property)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
// components/properties/PropertiesListView.jsx
import React, { useState } from 'react';
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

const PropertiesListView = ({ 
  properties = [], 
  onView, 
  onEdit, 
  onDelete, 
  onNavigate 
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownToggle = (propertyId) => {
    setActiveDropdown(activeDropdown === propertyId ? null : propertyId);
  };

  const handleAction = (action, property) => {
    setActiveDropdown(null);
    action(property);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculatePropertyStats = (property) => {
    const suiteCount = property.suites?.length || 0;
    const unitCount = property.suites?.reduce((sum, suite) => 
      sum + (suite.hvacUnits?.length || 0), 0) || 0;
    return { suiteCount, unitCount };
  };

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">No properties match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4 text-sm font-semibold text-gray-700">
            Property Details
          </div>
          <div className="col-span-2 text-sm font-semibold text-gray-700">
            Suites
          </div>
          <div className="col-span-2 text-sm font-semibold text-gray-700">
            HVAC Units
          </div>
          <div className="col-span-2 text-sm font-semibold text-gray-700">
            Last Updated
          </div>
          <div className="col-span-2 text-sm font-semibold text-gray-700">
            Actions
          </div>
        </div>
      </div>

      {/* Property Rows */}
      <div className="divide-y divide-gray-200">
        {properties.map((property) => {
          const { suiteCount, unitCount } = calculatePropertyStats(property);
          
          return (
            <div 
              key={property.id} 
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Property Details */}
                <div className="col-span-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {property.name || `Property ${property.id}`}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-600 truncate">
                          {property.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suites Count */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {suiteCount}
                    </span>
                    <span className="text-xs text-gray-500">
                      {suiteCount === 1 ? 'suite' : 'suites'}
                    </span>
                  </div>
                </div>

                {/* HVAC Units Count */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {unitCount}
                    </span>
                    <span className="text-xs text-gray-500">
                      {unitCount === 1 ? 'unit' : 'units'}
                    </span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">
                    {formatDate(property.updatedAt || property.createdAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 justify-end">
                    {/* Quick Actions */}
                    <button
                      onClick={() => onView(property)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onNavigate('jobs', { propertyFilter: property.id })}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Jobs"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>

                    {/* More Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => handleDropdownToggle(property.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === property.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1">
                            <button
                              onClick={() => handleAction(onEdit, property)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Property
                            </button>

                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                onNavigate('maintenance', { selectedProperty: property });
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Schedule Maintenance
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                              onClick={() => handleAction(onDelete, property)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertiesListView;
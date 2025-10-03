// HVACPage.jsx - Mobile-Optimized Version (Preserving Your Exact Structure)
import React, { useState, useEffect } from 'react';
import {
  Wrench, Plus, Search, Building, MapPin, Zap, ChevronRight, ChevronDown,
  ArrowLeft, Clock, AlertTriangle, CheckCircle, RefreshCw, Home,
  Play, Check, Filter
} from 'lucide-react';

const HVACPage = ({ 
  onNavigate, 
  onOpenModal, 
  properties = [], 
  navigationData, 
  onDataRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('today');
  const [expandedProperties, setExpandedProperties] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const [hvacStats, setHvacStats] = useState({
    todayJobs: 0,
    overdueUnits: 0,
    completedToday: 0,
    totalUnits: 0,
    totalProperties: 0
  });

  useEffect(() => {
    fetchHVACStats();
  }, []);

  const fetchHVACStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/hvac-units/stats`);
      if (response.ok) {
        const data = await response.json();
        setHvacStats({
          todayJobs: data.todayJobs,
          overdueUnits: data.overdueUnits,
          completedToday: data.completedToday,
          totalUnits: data.totalUnits,
          totalProperties: properties.length
        });
      }
    } catch (err) {
      console.error('Error fetching HVAC stats:', err);
    }
  };

  const processPropertiesWithHVAC = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return properties.map(property => {
      const propertyUnits = [];
      let propertyTotalUnits = 0;
      let propertyOverdueUnits = 0;

      if (property.suites) {
        property.suites.forEach(suite => {
          if (suite.hvacUnits) {
            suite.hvacUnits.forEach(unit => {
              // Check if unit has scheduled maintenance
              const scheduledMaintenance = unit.scheduledMaintenance || [];
              const hasOverdue = scheduledMaintenance.some(sm => {
                const smDate = new Date(sm.date);
                smDate.setHours(0, 0, 0, 0);
                return smDate < today && (sm.status === 'SCHEDULED' || sm.status === 'IN_PROGRESS');
              });
              const hasToday = scheduledMaintenance.some(sm => {
                const smDate = new Date(sm.date);
                smDate.setHours(0, 0, 0, 0);
                return smDate.getTime() === today.getTime() && (sm.status === 'SCHEDULED' || sm.status === 'IN_PROGRESS');
              });

              const enhancedUnit = {
                ...unit,
                suiteName: suite.name || `Suite ${suite.id}`,
                suiteId: suite.id,
                propertyName: property.name || property.address,
                propertyAddress: property.address,
                isOverdue: hasOverdue,
                isToday: hasToday,
                priority: hasOverdue ? 'urgent' : 'normal'
              };
              propertyUnits.push(enhancedUnit);
              propertyTotalUnits++;
              if (enhancedUnit.isOverdue) propertyOverdueUnits++;
            });
          }
        });
      }

      return {
        ...property,
        hvacUnits: propertyUnits,
        totalUnits: propertyTotalUnits,
        overdueUnits: propertyOverdueUnits
      };
    });
  };

  const toggleProperty = (propertyId) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  const handleStartMaintenance = (unit, property) => {
    if (onNavigate) {
      const navigationData = {
        skipPropertySelection: true,
        selectedProperty: property,
        selectedSuite: {
          id: unit.suiteId,
          name: unit.suiteName,
          propertyId: property.id,
          hvacUnits: [unit]
        },
        selectedUnit: unit.id,
        unitData: unit,
        propertyName: unit.propertyName,
        suiteName: unit.suiteName
      };
      console.log('Navigating to maintenance with data:', navigationData);
      onNavigate('maintenance', navigationData);
    }
  };

  const filteredProperties = processPropertiesWithHVAC().filter(property => {
    if (!searchQuery) return true;
    return property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           property.address?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HVAC systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
      {/* ✅ MOBILE HEADER - Enhanced Touch Targets */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <Home className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">HVAC Work</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('maintenance')}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md min-h-[48px] text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Record</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={onDataRefresh}
              className="p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <RefreshCw className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* ✅ MOBILE STATS - Larger Cards, Better Scrolling */}
        <div className="px-4 pb-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 min-w-[160px] shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Today</span>
              </div>
              <div className="text-3xl font-bold">{hvacStats.todayJobs}</div>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-5 min-w-[160px] shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Overdue</span>
              </div>
              <div className="text-3xl font-bold">{hvacStats.overdueUnits}</div>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-5 min-w-[160px] shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Done</span>
              </div>
              <div className="text-3xl font-bold">{hvacStats.completedToday}</div>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-5 min-w-[160px] shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5" />
                <span className="text-sm font-medium">Properties</span>
              </div>
              <div className="text-3xl font-bold">{hvacStats.totalProperties}</div>
            </div>
          </div>
        </div>

        {/* ✅ VIEW TABS - Larger Touch Targets */}
        <div className="flex bg-gray-100 mx-4 rounded-xl p-1 mb-4">
          {[
            { id: 'today', label: 'Today', count: hvacStats.todayJobs },
            { id: 'overdue', label: 'Overdue', count: hvacStats.overdueUnits },
            { id: 'all', label: 'All', count: hvacStats.totalUnits }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors min-h-[48px] ${
                currentView === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 active:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* ✅ SEARCH BAR - Mobile Optimized */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, units, serial numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ✅ PROPERTIES LIST - Mobile Optimized Cards */}
      <div className="p-4">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">No properties found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const isExpanded = expandedProperties.has(property.id);
              
              return (
                <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* ✅ PROPERTY HEADER - Large Touch Target */}
                  <button
                    onClick={() => toggleProperty(property.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {property.name || property.address}
                        </h3>
                      </div>
                      
                      {property.address && (
                        <div className="flex items-center gap-2 text-gray-600 ml-9">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{property.address}</span>
                        </div>
                      )}
                      
                      {/* Property Stats */}
                      <div className="flex items-center gap-4 mt-3 ml-9">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{property.totalUnits || 0} units</span>
                        </div>
                        {property.overdueUnits > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">{property.overdueUnits} overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="p-2">
                      {isExpanded ? (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* ✅ HVAC UNITS - Mobile Optimized List */}
                  {isExpanded && property.hvacUnits && property.hvacUnits.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="divide-y divide-gray-100">
                        {property.hvacUnits.map((unit) => (
                          <div key={unit.id} className="p-6">
                            {/* Unit Info */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <h4 className="text-base font-semibold text-gray-900">
                                      {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                                    </h4>
                                  </div>
                                  
                                  <div className="space-y-1 ml-7">
                                    <p className="text-sm text-gray-600">
                                      {unit.suiteName}
                                    </p>
                                    {unit.serialNumber && (
                                      <p className="text-sm text-gray-500">
                                        SN: {unit.serialNumber}
                                      </p>
                                    )}
                                    {unit.filterSize && (
                                      <p className="text-sm text-gray-500">
                                        Filter: {unit.filterSize}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Status Badge */}
                                {unit.isOverdue && (
                                  <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    Overdue
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ✅ ACTION BUTTON - Large Touch Target */}
                            <button
                              onClick={() => handleStartMaintenance(unit, property)}
                              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg min-h-[56px]"
                            >
                              <Wrench className="w-5 h-5" />
                              <span className="text-base">Start Work</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* ✅ EMPTY STATE */}
                  {isExpanded && (!property.hvacUnits || property.hvacUnits.length === 0) && (
                    <div className="border-t border-gray-100 bg-gray-50 p-8">
                      <div className="text-center">
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No HVAC units found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          This property doesn't have any HVAC units configured yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add scrollbar hide utility */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .active\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default HVACPage;
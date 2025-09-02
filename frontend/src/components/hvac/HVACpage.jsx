// HVACPage.jsx - Grouped by Property with Collapsible Mobile-Friendly Design
import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Building,
  MapPin,
  Zap,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  Camera,
  RefreshCw,
  Home,
  Play,
  Check,
  Filter
} from 'lucide-react';

const HVACPage = ({ 
  onNavigate, 
  onOpenModal, 
  properties = [], 
  navigationData, 
  onDataRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('today'); // 'today', 'overdue', 'all'
  const [expandedProperties, setExpandedProperties] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Calculate stats from actual data structure
  const [hvacStats, setHvacStats] = useState({
    todayJobs: 0,
    overdueUnits: 0,
    completedToday: 0,
    totalUnits: 0,
    totalProperties: 0
  });

  // Process properties data to add HVAC info
  useEffect(() => {
    calculateStats();
  }, [properties]);

  const calculateStats = () => {
    let totalUnits = 0;
    let overdueUnits = 0;
    let todayJobs = 0;
    
    properties.forEach(property => {
      if (property.suites) {
        property.suites.forEach(suite => {
          if (suite.hvacUnits) {
            suite.hvacUnits.forEach(unit => {
              totalUnits++;
              // Mock some overdue logic - you'd replace with real logic
              if (Math.random() > 0.7) overdueUnits++;
              if (Math.random() > 0.8) todayJobs++;
            });
          }
        });
      }
    });

    setHvacStats({
      todayJobs,
      overdueUnits,
      completedToday: 0, // Would come from actual completed work
      totalUnits,
      totalProperties: properties.length
    });
  };

  // Process properties with HVAC context
  const processPropertiesWithHVAC = () => {
    return properties.map(property => {
      const propertyUnits = [];
      let propertyTotalUnits = 0;
      let propertyOverdueUnits = 0;
      let propertyTodayUnits = 0;

      if (property.suites) {
        property.suites.forEach(suite => {
          if (suite.hvacUnits) {
            suite.hvacUnits.forEach(unit => {
              const enhancedUnit = {
                ...unit,
                suiteName: suite.name || `Suite ${suite.id}`,
                suiteId: suite.id,
                propertyName: property.name || property.address,
                propertyAddress: property.address,
                // Mock status logic - replace with real maintenance data
                isOverdue: Math.random() > 0.7,
                isToday: Math.random() > 0.8,
                priority: Math.random() > 0.8 ? 'urgent' : Math.random() > 0.6 ? 'high' : 'medium',
                estimatedDuration: 60
              };
              
              propertyUnits.push(enhancedUnit);
              propertyTotalUnits++;
              if (enhancedUnit.isOverdue) propertyOverdueUnits++;
              if (enhancedUnit.isToday) propertyTodayUnits++;
            });
          }
        });
      }

      return {
        ...property,
        hvacUnits: propertyUnits,
        stats: {
          totalUnits: propertyTotalUnits,
          overdueUnits: propertyOverdueUnits,
          todayUnits: propertyTodayUnits
        }
      };
    });
  };

  const processedProperties = processPropertiesWithHVAC();

  // Filter properties based on current view and search
  const getFilteredProperties = () => {
    let filtered = processedProperties;

    // Apply search filter
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(property => {
        // Search property name/address
        if (property.name?.toLowerCase().includes(search) || 
            property.address?.toLowerCase().includes(search)) {
          return true;
        }
        
        // Search units within property
        return property.hvacUnits.some(unit => 
          unit.label?.toLowerCase().includes(search) ||
          unit.serialNumber?.toLowerCase().includes(search) ||
          unit.suiteName?.toLowerCase().includes(search) ||
          unit.model?.toLowerCase().includes(search)
        );
      });
    }

    // Apply view filter
    if (currentView === 'today') {
      filtered = filtered.filter(property => property.stats.todayUnits > 0);
    } else if (currentView === 'overdue') {
      filtered = filtered.filter(property => property.stats.overdueUnits > 0);
    }

    // Sort by urgency and unit count
    return filtered.sort((a, b) => {
      if (a.stats.overdueUnits !== b.stats.overdueUnits) {
        return b.stats.overdueUnits - a.stats.overdueUnits;
      }
      return b.stats.totalUnits - a.stats.totalUnits;
    });
  };

  const filteredProperties = getFilteredProperties();

  // Toggle property expansion
  const toggleProperty = (propertyId) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    setExpandedProperties(newExpanded);
  };

  // Handle unit actions
  const handleStartJob = (unit, property) => {
    // Navigate to maintenance form with pre-selected data
    onNavigate('maintenance', { 
      selectedProperty: property,
      selectedSuite: property.suites?.find(s => s.id === unit.suiteId),
      selectedUnit: unit.id
    });
  };

  const handleTakePhoto = (unit) => {
    // Direct camera access
    console.log('Open camera for unit:', unit);
  };

  const handleCompleteJob = (unit) => {
    // Quick completion
    console.log('Mark complete:', unit);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-green-500';
    }
  };

  const getStatusIcon = (unit) => {
    if (unit.isOverdue) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (unit.isToday) return <Clock className="w-4 h-4 text-blue-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HVAC systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">HVAC Work</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onDataRefresh}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Stats - Horizontal Scroll */}
        <div className="px-4 pb-4">
          <div className="flex gap-4 overflow-x-auto">
            <div className="flex-shrink-0 bg-blue-500 text-white rounded-xl p-4 min-w-[140px]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Today</span>
              </div>
              <div className="text-2xl font-bold">{hvacStats.todayJobs}</div>
            </div>
            
            <div className="flex-shrink-0 bg-red-500 text-white rounded-xl p-4 min-w-[140px]">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Overdue</span>
              </div>
              <div className="text-2xl font-bold">{hvacStats.overdueUnits}</div>
            </div>
            
            <div className="flex-shrink-0 bg-green-500 text-white rounded-xl p-4 min-w-[140px]">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Done</span>
              </div>
              <div className="text-2xl font-bold">{hvacStats.completedToday}</div>
            </div>
            
            <div className="flex-shrink-0 bg-purple-500 text-white rounded-xl p-4 min-w-[140px]">
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-4 h-4" />
                <span className="text-sm font-medium">Properties</span>
              </div>
              <div className="text-2xl font-bold">{hvacStats.totalProperties}</div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex bg-gray-100 mx-4 rounded-lg p-1 mb-4">
          {[
            { id: 'today', label: 'Today', count: hvacStats.todayJobs },
            { id: 'overdue', label: 'Overdue', count: hvacStats.overdueUnits },
            { id: 'all', label: 'All', count: hvacStats.totalUnits }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                currentView === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, units, serial numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Properties List - Grouped and Collapsible */}
      <div className="p-4 pb-32"> {/* ✅ FIXED: Increased bottom padding for fixed nav */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {currentView === 'today' ? 'No work scheduled today' : 
               currentView === 'overdue' ? 'No overdue units' : 'No properties found'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const isExpanded = expandedProperties.has(property.id);
              
              return (
                <div
                  key={property.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Property Header - Clickable */}
                  <button
                    onClick={() => toggleProperty(property.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {property.name || property.address}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{property.address}</span>
                        </div>
                        
                        {/* Property Stats */}
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <span className="text-blue-600 font-medium">
                            {property.stats.totalUnits} units
                          </span>
                          {property.stats.todayUnits > 0 && (
                            <span className="text-green-600 font-medium">
                              {property.stats.todayUnits} today
                            </span>
                          )}
                          {property.stats.overdueUnits > 0 && (
                            <span className="text-red-600 font-medium">
                              {property.stats.overdueUnits} overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {property.stats.totalUnits} {property.stats.totalUnits === 1 ? 'unit' : 'units'}
                        </div>
                        {property.stats.overdueUnits > 0 && (
                          <div className="text-xs text-red-600 font-medium">
                            {property.stats.overdueUnits} overdue
                          </div>
                        )}
                      </div>
                      
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* ✅ FIXED: Expanded Units List - Now renders immediately after each property header */}
                  {isExpanded && property.hvacUnits && property.hvacUnits.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="p-4 space-y-4">
                        {property.hvacUnits.map((unit) => (
                          <div
                            key={`${property.id}-${unit.suiteId}-${unit.id}`}
                            className={`bg-white rounded-lg border-l-4 ${getPriorityColor(unit.priority)} p-4 shadow-sm`}
                          >
                            {/* Unit Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusIcon(unit)}
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                                  </h4>
                                </div>
                                
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{unit.suiteName}</span>
                                  </div>
                                  
                                  {unit.filterSize && (
                                    <div className="flex items-center gap-2">
                                      <Filter className="w-3 h-3" />
                                      <span>Filter: {unit.filterSize}</span>
                                    </div>
                                  )}
                                  
                                  {unit.model && (
                                    <div className="text-xs text-gray-500">
                                      Model: {unit.model}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Duration Badge */}
                              <div className="bg-gray-100 px-2 py-1 rounded-md">
                                <span className="text-xs font-medium text-gray-600">
                                  ~{unit.estimatedDuration}min
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons - Mobile Friendly */}
                            <div className="grid grid-cols-3 gap-3">
                              <button
                                onClick={() => handleStartJob(unit, property)}
                                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                              >
                                <Play className="w-4 h-4" />
                                <span className="text-sm">Start</span>
                              </button>
                              
                              <button
                                onClick={() => handleTakePhoto(unit)}
                                className="flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                              >
                                <Camera className="w-4 h-4" />
                                <span className="text-sm">Photo</span>
                              </button>
                              
                              <button
                                onClick={() => handleCompleteJob(unit)}
                                className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Done</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* ✅ ADDED: Empty state for properties with no HVAC units */}
                  {isExpanded && (!property.hvacUnits || property.hvacUnits.length === 0) && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      <div className="text-center py-8">
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

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-center">
          <button
            onClick={() => onNavigate('maintenance')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Maintenance Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default HVACPage;
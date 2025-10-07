// PropertiesPage.jsx - iOS-Optimized with Grid/List Views
import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Plus,
  Search,
  Grid3X3,
  List,
  Users,
  Zap,
  MapPin,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

// Property-specific components
import PropertyCard from './PropertyCard';
import PropertiesListView from './PropertiesListView';
import AddPropertyModal from './AddPropertyModal';
import EditPropertyModal from './EditPropertyModal';
import PropertyDetailModal from './PropertyDetailModal';

const PropertiesPage = ({ onNavigate }) => {
  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mobile optimizations
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/properties`);
      if (response.ok) {
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll handler
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHeaderCollapsed(true);
      } else {
        setHeaderCollapsed(false);
      }
      setLastScrollY(currentScrollY);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Pull to refresh
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleTouchStart = (e) => {
      if (scrollContainer.scrollTop === 0) {
        setPullStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (pullStartY === 0 || scrollContainer.scrollTop > 0) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY;
      if (distance > 0 && distance < 120) {
        setPullDistance(distance);
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80) {
        setIsRefreshing(true);
        await loadProperties();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setPullStartY(0);
        }, 500);
      } else {
        setPullDistance(0);
        setPullStartY(0);
      }
    };

    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullStartY, pullDistance]);

  // Property stats calculation
  const propertyStats = useMemo(() => {
    const totalProperties = properties.length;
    const totalSuites = properties.reduce((sum, p) => sum + (p.suites?.length || 0), 0);
    const totalUnits = properties.reduce((sum, p) =>
      sum + (p.suites?.reduce((suiteSum, suite) =>
        suiteSum + (suite.hvacUnits?.length || 0), 0) || 0), 0);

    return { totalProperties, totalSuites, totalUnits };
  }, [properties]);

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties;

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = properties.filter(property =>
        property.name?.toLowerCase().includes(search) ||
        property.address?.toLowerCase().includes(search)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'address':
          return (a.address || '').localeCompare(b.address || '');
        case 'units':
          const aUnits = a.suites?.reduce((sum, suite) => sum + (suite.hvacUnits?.length || 0), 0) || 0;
          const bUnits = b.suites?.reduce((sum, suite) => sum + (suite.hvacUnits?.length || 0), 0) || 0;
          return bUnits - aUnits;
        case 'recent':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        default:
          return 0;
      }
    });

    return sorted;
  }, [properties, searchQuery, sortBy]);

  // Handle property actions
  const handleViewProperty = (property) => {
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = async (property) => {
    if (window.confirm(`Are you sure you want to delete "${property.name || property.address}"?`)) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/properties/${property.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setProperties(prev => prev.filter(p => p.id !== property.id));
        }
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const handlePropertyAdded = (newProperty) => {
    setProperties(prev => [newProperty, ...prev]);
    setShowAddModal(false);
  };

  const handlePropertyUpdated = (updatedProperty) => {
    setProperties(prev =>
      prev.map(p => p.id === updatedProperty.id ? updatedProperty : p)
    );
    setShowEditModal(false);
    setSelectedProperty(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-16 left-0 right-0 flex justify-center items-center z-50 transition-all duration-200"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)`, opacity: Math.min(pullDistance / 80, 1) }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            <RefreshCw className={`w-5 h-5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
        {/* Stats Row */}
        <div className={`px-4 py-3 overflow-hidden transition-all duration-300 ${headerCollapsed ? 'max-h-0 opacity-0 py-0' : 'max-h-32 opacity-100'}`}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Building className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-600">{propertyStats.totalProperties}</div>
              <div className="text-xs text-gray-600">Properties</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-600">{propertyStats.totalSuites}</div>
              <div className="text-xs text-gray-600">Suites</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-600">{propertyStats.totalUnits}</div>
              <div className="text-xs text-gray-600">Units</div>
            </div>
          </div>
        </div>

        {/* Search Bar & View Toggle */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Content */}
      <div className="p-4">
        {filteredAndSortedProperties.length === 0 ? (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No properties found' : 'No properties yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first property'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Property
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View - Visual cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedProperties.map((property) => {
              const suiteCount = property.suites?.length || 0;
              const unitCount = property.suites?.reduce((sum, suite) =>
                sum + (suite.hvacUnits?.length || 0), 0) || 0;

              return (
                <div
                  key={property.id}
                  onClick={() => handleViewProperty(property)}
                  className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl active:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {property.name || property.address}
                      </h3>
                      {property.address && property.name && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{property.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">Suites</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{suiteCount}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">HVAC Units</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{unitCount}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View - Detailed rows
          <div className="space-y-3">
            {filteredAndSortedProperties.map((property) => {
              const suiteCount = property.suites?.length || 0;
              const unitCount = property.suites?.reduce((sum, suite) =>
                sum + (suite.hvacUnits?.length || 0), 0) || 0;

              return (
                <div
                  key={property.id}
                  onClick={() => handleViewProperty(property)}
                  className="bg-white rounded-2xl p-5 shadow-lg active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {property.name || property.address}
                        </h3>
                      </div>

                      {property.address && property.name && (
                        <div className="flex items-center gap-2 text-gray-600 ml-9 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{property.address}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 ml-9">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {suiteCount} {suiteCount === 1 ? 'suite' : 'suites'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {unitCount} {unitCount === 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center z-20"
        style={{ boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)' }}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modals */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        onPropertyUpdated={handlePropertyUpdated}
      />

      <PropertyDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default PropertiesPage;

// components/properties/PropertiesPage.jsx - Complete with Modal Integration
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Users,
  Zap,
  MapPin
} from 'lucide-react';

// Common components
import PageWrapper from '../common/PageWrapper';
import PageHeader from '../common/PageHeader';
import CustomDropdown from '../common/CustomDropdown';
import Pagination from '../common/Pagination';

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
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Load properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Failed to load properties');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

    // Apply search filter
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = properties.filter(property =>
        property.name?.toLowerCase().includes(search) ||
        property.address?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
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

  // Paginated properties
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProperties.slice(startIndex, endIndex);
  }, [filteredAndSortedProperties, currentPage, itemsPerPage]);

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
        const response = await fetch(`/api/properties/${property.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setProperties(prev => prev.filter(p => p.id !== property.id));
        } else {
          throw new Error('Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const handleCreateProperty = () => {
    setShowAddModal(true);
  };

  // Modal handlers
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

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProperty(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProperty(null);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page
  };

  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Recently Updated' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'address', label: 'Address (A-Z)' },
    { value: 'units', label: 'Most HVAC Units' }
  ];

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProperties.length / itemsPerPage);
  const showPagination = totalPages > 1;

  // Loading state
  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Page Header */}
      <PageHeader
        title="Properties"
        subtitle="Manage all your property locations and their details"
        actionButton={
          <button
            onClick={handleCreateProperty}
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)',
              boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'
            }}
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{propertyStats.totalProperties}</h3>
              <p className="text-sm text-gray-600">Total Properties</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{propertyStats.totalSuites}</h3>
              <p className="text-sm text-gray-600">Total Suites</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{propertyStats.totalUnits}</h3>
              <p className="text-sm text-gray-600">HVAC Units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="sticky top-0 z-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Results Count */}
            <span className="text-sm text-gray-600">
              {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? 'property' : 'properties'}
            </span>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
                placeholder="Sort by..."
                className="min-w-[160px]"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {filteredAndSortedProperties.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No properties found' : 'No properties yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters.' 
                : 'Get started by adding your first property.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateProperty}
                className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)'}}
              >
                <Plus className="w-4 h-4" />
                Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Properties Display - Grid or List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onView={handleViewProperty}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : (
              <PropertiesListView
                properties={paginatedProperties}
                onView={handleViewProperty}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
                onNavigate={onNavigate}
              />
            )}

            {/* Pagination - Clean and Professional */}
            {showPagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSortedProperties.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[6, 12, 24, 48]}
                showPageSizes={true}
                showInfo={true}
                className="mt-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      <EditPropertyModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        property={selectedProperty}
        onPropertyUpdated={handlePropertyUpdated}
      />

      <PropertyDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        property={selectedProperty}
        onEdit={handleEditProperty}
        onDelete={handleDeleteProperty}
        onNavigate={onNavigate}
      />
    </PageWrapper>
  );
};

export default PropertiesPage;
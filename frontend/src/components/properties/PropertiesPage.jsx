import React, { useState, useEffect, useMemo } from 'react';
import { Building, Plus, Search, Users, Zap, MapPin, Edit3, Trash2, ChevronRight } from 'lucide-react';
import AddPropertyModal from './AddPropertyModal';
import EditPropertyModal from './EditPropertyModal';
import PropertyDetailModal from './PropertyDetailModal';

const PropertiesPage = ({ onNavigate }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadProperties(); }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties`);
      if (res.ok) setProperties(await res.json());
    } catch (e) {
      console.error('Error loading properties:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter(p =>
      p.name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  const handleView = (property) => { setSelectedProperty(property); setShowDetailModal(true); };
  const handleEdit = (property) => { setSelectedProperty(property); setShowEditModal(true); };

  const handleDelete = async (property, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${property.name || property.address}"? This cannot be undone.`)) return;
    setDeletingId(property.id);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${property.id}`, { method: 'DELETE' });
      if (res.ok) setProperties(prev => prev.filter(p => p.id !== property.id));
    } catch (e) {
      console.error('Error deleting:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePropertyAdded = (p) => { setProperties(prev => [p, ...prev]); setShowAddModal(false); };
  const handlePropertyUpdated = (p) => {
    setProperties(prev => prev.map(x => x.id === p.id ? p : x));
    setShowEditModal(false);
    setSelectedProperty(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F2F7' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F2F2F7' }}>
      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">
              {searchQuery ? 'No properties found' : 'No properties yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#101d40] text-white text-sm font-medium rounded-xl"
              >
                <Plus className="w-4 h-4" /> Add Property
              </button>
            )}
          </div>
        ) : (
          filtered.map(property => {
            const suiteCount = property.suites?.length || 0;
            const unitCount = property.suites?.reduce((s, suite) => s + (suite.hvacUnits?.length || 0), 0) || 0;
            const isDeleting = deletingId === property.id;

            return (
              <div
                key={property.id}
                className={`bg-white rounded-2xl overflow-hidden transition-opacity ${isDeleting ? 'opacity-40' : ''}`}
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
              >
                <button
                  className="w-full px-4 py-4 text-left active:bg-gray-50 transition-colors"
                  onClick={() => handleView(property)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
                        {property.name || property.address}
                      </h3>
                      {property.name && property.address && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {property.address}
                        </p>
                      )}
                      <div className="flex gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          <Users className="w-3 h-3" />{suiteCount} suites
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          <Zap className="w-3 h-3" />{unitCount} units
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                  </div>
                </button>

                {/* Edit / Delete actions */}
                <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(property); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(property, e)}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div className="h-20" />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 lg:bottom-6 right-5 w-14 h-14 bg-[#101d40] text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform z-20"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AddPropertyModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onPropertyAdded={handlePropertyAdded} />
      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedProperty(null); }}
        property={selectedProperty}
        onPropertyUpdated={handlePropertyUpdated}
      />
      <PropertyDetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedProperty(null); }}
        property={selectedProperty}
        onEdit={handleEdit}
        onDelete={(p) => handleDelete(p, { stopPropagation: () => {} })}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default PropertiesPage;

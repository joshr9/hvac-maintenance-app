import React, { useState, useEffect } from 'react';
import { Plus, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import ServiceStats from './ServiceStats';
import ServiceFilters from './ServiceFilters';
import ServiceGrid from './ServiceGrid';
import ImportModal from './ImportModal';

const ServiceCatalog = () => {
  // State management
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesRes, categoriesRes, statsRes] = await Promise.all([
        fetch(`/api/services?search=${searchQuery}&category=${selectedCategory}`),
        fetch('/api/services/categories'),
        fetch('/api/services/stats')
      ]);

      const servicesData = await servicesRes.json();
      const categoriesData = await categoriesRes.json();
      const statsData = await statsRes.json();

      setServices(servicesData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setServices([]);
      setCategories([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      setImportStatus('Importing...');
      const response = await fetch('/api/services/import-csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportStatus(`Success! Imported ${result.results.imported} services, skipped ${result.results.skipped} duplicates`);
        loadData(); // Refresh the list
        setShowImportModal(false);
      } else {
        setImportStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setImportStatus(`Error: ${error.message}`);
    }

    setTimeout(() => setImportStatus(''), 5000);
  };

  return (
    <div className="p-6" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Catalog</h1>
            <p className="text-gray-600 mt-2">
              Manage Dean Callan's services and pricing
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 backdrop-blur-sm"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg"
              style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)', boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'}}>
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
        </div>

        {/* Stats Component */}
        <ServiceStats 
          stats={stats} 
          categories={categories}
          loading={loading} 
        />

        {/* Filters Component */}
        <ServiceFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          importStatus={importStatus}
        />

        {/* Services Grid Component */}
        <ServiceGrid
          services={services}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onImport={() => setShowImportModal(true)}
        />

        {/* Import Modal */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCSV}
        />
      </div>
    </div>
  );
};

export default ServiceCatalog;
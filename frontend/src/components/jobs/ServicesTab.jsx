// components/jobs/ServicesTab.jsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ServicesList from './services/ServicesList';
import ServicesSummary from './services/ServicesSummary';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';

const ServicesTab = ({ jobId, onJobUpdate }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [totals, setTotals] = useState({
    totalCost: 0,
    totalPrice: 0,
    profitMargin: 0
  });

  // Load job services
  useEffect(() => {
    loadJobServices();
  }, [jobId]);

  // Calculate totals when services change
  useEffect(() => {
    calculateTotals();
  }, [services]);

  const loadJobServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data || []);
      }
    } catch (error) {
      console.error('Error loading job services:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalPrice = services.reduce((sum, service) => sum + parseFloat(service.totalPrice || 0), 0);
    const totalCost = services.reduce((sum, service) => sum + parseFloat(service.totalCost || 0), 0);
    const profitMargin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice) * 100 : 0;

    setTotals({
      totalCost,
      totalPrice,
      profitMargin
    });

    // Update job totals
    if (onJobUpdate) {
      onJobUpdate({
        totalCost,
        totalPrice,
        profitMargin
      });
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        await loadJobServices(); // Refresh the list
        setShowAddModal(false);
      } else {
        throw new Error('Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Error adding service');
    }
  };

  const handleEditService = async (serviceId, serviceData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        await loadJobServices(); // Refresh the list
        setEditingService(null);
      } else {
        throw new Error('Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error updating service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to remove this service?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadJobServices(); // Refresh the list
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Services & Line Items</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add services, materials, and other billable items to this job
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg"
              style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)'}}
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {/* Services List Component */}
          <ServicesList
            services={services}
            loading={loading}
            onEditService={setEditingService}
            onDeleteService={handleDeleteService}
            onAddService={() => setShowAddModal(true)}
          />
        </div>

        {/* Services Summary Component */}
        {services.length > 0 && (
          <ServicesSummary 
            totals={totals} 
            services={services}
          />
        )}
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddService}
        jobId={jobId}
      />

      {/* Edit Service Modal */}
      <EditServiceModal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        onSave={(data) => handleEditService(editingService.id, data)}
        service={editingService}
        jobId={jobId}
      />
    </>
  );
};

export default ServicesTab;
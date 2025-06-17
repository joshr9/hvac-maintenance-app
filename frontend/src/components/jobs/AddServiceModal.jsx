// components/jobs/AddServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import ServiceCatalogSelector from './services/ServiceCatalogSelector';
import ServiceDetailsForm from './services/ServiceDetailsForm';

const AddServiceModal = ({ isOpen, onClose, onSave, jobId }) => {
  const [serviceData, setServiceData] = useState({
    serviceId: null,
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
    notes: ''
  });
  
  const [availableServices, setAvailableServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showServiceSearch, setShowServiceSearch] = useState(true);

  // Load available services
  useEffect(() => {
    if (isOpen) {
      loadAvailableServices();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setServiceData({
        serviceId: null,
        serviceName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        unitCost: 0,
        notes: ''
      });
      setError('');
      setShowServiceSearch(true);
    }
  }, [isOpen]);

  const loadAvailableServices = async () => {
    try {
      const response = await fetch('/api/services?active=true');
      if (response.ok) {
        const data = await response.json();
        setAvailableServices(data || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleServiceSelect = (service) => {
    setServiceData({
      serviceId: service.id,
      serviceName: service.name,
      description: service.description || '',
      quantity: service.minimumQuantity || 1,
      unitPrice: service.unitPrice || 0,
      unitCost: service.unitCost || 0,
      notes: ''
    });
    setShowServiceSearch(false);
  };

  const handleCustomService = () => {
    setServiceData({
      serviceId: null,
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      unitCost: 0,
      notes: ''
    });
    setShowServiceSearch(false);
  };

  const handleInputChange = (field, value) => {
    setServiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!serviceData.serviceName.trim()) {
      setError('Service name is required');
      return;
    }

    if (parseFloat(serviceData.quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate totals
      const totalPrice = parseFloat(serviceData.quantity) * parseFloat(serviceData.unitPrice || 0);
      const totalCost = parseFloat(serviceData.quantity) * parseFloat(serviceData.unitCost || 0);
      
      const submitData = {
        ...serviceData,
        quantity: parseFloat(serviceData.quantity),
        unitPrice: parseFloat(serviceData.unitPrice || 0),
        unitCost: parseFloat(serviceData.unitCost || 0),
        totalPrice,
        totalCost
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving service:', error);
      setError('Failed to add service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Service to Job</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {showServiceSearch ? (
            // Service Selection Step
            <ServiceCatalogSelector
              onServiceSelect={handleServiceSelect}
              onCustomService={handleCustomService}
              availableServices={availableServices}
              loading={false}
            />
          ) : (
            // Service Details Form
            <ServiceDetailsForm
              serviceData={serviceData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={onClose}
              onBack={() => setShowServiceSearch(true)}
              isSubmitting={isSubmitting}
              error={error}
              showBackButton={true}
              submitButtonText="Add Service"
              submitButtonIcon={Save}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
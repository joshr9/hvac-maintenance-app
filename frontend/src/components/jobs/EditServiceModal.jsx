// components/jobs/EditServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import ServiceDetailsForm from './services/ServiceDetailsForm';

const EditServiceModal = ({ isOpen, onClose, onSave, service, jobId }) => {
  const [serviceData, setServiceData] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load service data when modal opens or service changes
  useEffect(() => {
    if (isOpen && service) {
      setServiceData({
        serviceName: service.serviceName || '',
        description: service.description || '',
        quantity: parseFloat(service.quantity) || 1,
        unitPrice: parseFloat(service.unitPrice) || 0,
        unitCost: parseFloat(service.unitCost) || 0,
        notes: service.notes || ''
      });
      setError('');
    }
  }, [isOpen, service]);

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
      setError('Failed to update service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <ServiceDetailsForm
            serviceData={serviceData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            error={error}
            showBackButton={false}
            submitButtonText="Save Changes"
            submitButtonIcon={Save}
            originalService={service}
          />
        </div>
      </div>
    </div>
  );
};

export default EditServiceModal;
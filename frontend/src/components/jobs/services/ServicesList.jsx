// components/jobs/services/ServicesList.jsx
import React, { useState } from 'react';
import ServiceRow from './ServiceRow';
import EmptyServicesState from './EmptyServicesState';
import ServiceBulkOperations from './ServiceBulkOperations';

const ServicesList = ({ 
  services = [], 
  loading = false,
  onEditService,
  onDeleteService,
  onDuplicateService,
  onAddService,
  enableBulkOperations = true,
  enableSelection = true
}) => {
  const [selectedServices, setSelectedServices] = useState([]);

  const handleSelectAll = () => {
    setSelectedServices(services.map(s => s.id));
  };

  const handleSelectNone = () => {
    setSelectedServices([]);
  };

  const handleServiceSelect = (serviceId, isSelected) => {
    if (isSelected) {
      setSelectedServices(prev => [...prev, serviceId]);
    } else {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
    }
  };

  const handleBulkDelete = async (serviceIds) => {
    for (const serviceId of serviceIds) {
      await onDeleteService(serviceId);
    }
    setSelectedServices([]);
  };

  const handleBulkDuplicate = async (serviceIds) => {
    for (const serviceId of serviceIds) {
      const service = services.find(s => s.id === serviceId);
      if (service && onDuplicateService) {
        await onDuplicateService(service);
      }
    }
    setSelectedServices([]);
  };

  const handleBulkDiscount = async ({ services: serviceIds, type, value }) => {
    // Implementation would depend on your API
    console.log('Bulk discount:', { serviceIds, type, value });
    // You'd call your bulk discount API here
    setSelectedServices([]);
  };

  const handleExportServices = (serviceIds) => {
    const servicesToExport = services.filter(s => serviceIds.includes(s.id));
    const csvContent = [
      ['Service Name', 'Description', 'Quantity', 'Unit Price', 'Total Price', 'Unit Cost', 'Total Cost'],
      ...servicesToExport.map(s => [
        s.serviceName,
        s.description || '',
        s.quantity,
        s.unitPrice,
        s.totalPrice,
        s.unitCost || '',
        s.totalCost || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-services.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return <EmptyServicesState onAddService={onAddService} />;
  }

  return (
    <div className="space-y-4">
      {/* Bulk Operations */}
      {enableBulkOperations && enableSelection && (
        <ServiceBulkOperations
          selectedServices={selectedServices}
          allServices={services}
          onSelectAll={handleSelectAll}
          onSelectNone={handleSelectNone}
          onBulkDelete={handleBulkDelete}
          onBulkDuplicate={onDuplicateService ? handleBulkDuplicate : undefined}
          onBulkDiscount={handleBulkDiscount}
          onExportServices={handleExportServices}
        />
      )}

      {/* Services Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {enableSelection && (
                  <th className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedServices.length === services.length && services.length > 0}
                      onChange={selectedServices.length === services.length ? handleSelectNone : handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Service</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Qty</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Pricing</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Total Cost</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  index={index}
                  onEdit={() => onEditService(service)}
                  onDelete={() => onDeleteService(service.id)}
                  onDuplicate={onDuplicateService ? () => onDuplicateService(service) : undefined}
                  isSelected={selectedServices.includes(service.id)}
                  onSelect={(e) => handleServiceSelect(service.id, e.target.checked)}
                  showSelection={enableSelection}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServicesList;
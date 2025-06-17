// components/jobs/services/ServiceRow.jsx
import React from 'react';
import ServiceActionButtons from './ServiceActionButtons';
import ServicePricingDisplay from './ServicePricingDisplay';

const ServiceRow = ({ 
  service, 
  index, 
  onEdit, 
  onDelete, 
  onDuplicate,
  isSelected = false,
  onSelect,
  showSelection = false
}) => {
  
  return (
    <tr className={`transition-colors ${
      isSelected 
        ? 'bg-blue-50 border-l-4 border-l-blue-400' 
        : index % 2 === 0 
          ? 'bg-gray-50/30 hover:bg-gray-100/50' 
          : 'bg-white/50 hover:bg-gray-50/50'
    }`}>
      {/* Selection Checkbox */}
      {showSelection && (
        <td className="py-4 px-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </td>
      )}

      {/* Service Details */}
      <td className="py-4 px-6">
        <div className="space-y-2">
          <div className="font-medium text-gray-900 text-sm">{service.serviceName}</div>
          
          {service.description && (
            <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {service.description}
            </div>
          )}
          
          {service.notes && (
            <div className="inline-block">
              <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                <span className="font-medium">Note:</span> {service.notes}
              </div>
            </div>
          )}
        </div>
      </td>

      {/* Quantity */}
      <td className="py-4 px-4 text-right">
        <span className="font-medium text-gray-900 text-sm">
          {parseFloat(service.quantity).toFixed(2)}
        </span>
      </td>

      {/* Pricing - Using ServicePricingDisplay */}
      <td className="py-4 px-4 text-right">
        <ServicePricingDisplay
          unitPrice={service.unitPrice}
          unitCost={service.unitCost}
          quantity={service.quantity}
          totalPrice={service.totalPrice}
          totalCost={service.totalCost}
          layout="compact"
          showProfit={true}
          showMargin={false}
        />
      </td>

      {/* Total Cost */}
      <td className="py-4 px-4 text-right">
        <span className="text-orange-600 font-medium text-sm">
          {service.totalCost ? `${parseFloat(service.totalCost).toFixed(2)}` : '-'}
        </span>
      </td>

      {/* Actions - Using ServiceActionButtons */}
      <td className="py-4 px-4">
        <div className="flex justify-center">
          <ServiceActionButtons
            service={service}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            layout="horizontal"
            showDuplicate={true}
            showView={false}
          />
        </div>
      </td>
    </tr>
  );
};

export default ServiceRow;
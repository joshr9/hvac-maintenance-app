// components/jobs/services/ServicePreviewCard.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import ServiceStatusBadges from './ServiceStatusBadges';
import ServicePricingDisplay from './ServicePricingDisplay';

const ServicePreviewCard = ({ service, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 border border-gray-200 rounded-lg hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-200 text-left group hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        {/* Service Info */}
        <div className="flex-1 min-w-0">
          {/* Service Name */}
          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
            {service.name}
          </div>
          
          {/* Description */}
          {service.description && (
            <div className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {service.description}
            </div>
          )}
          
          {/* Status Badges */}
          <div className="mb-3">
            <ServiceStatusBadges
              service={service}
              showCategory={true}
              showDuration={true}
              showBookable={true}
              showQuantityLimits={true}
              showPricing={false}
              layout="wrap"
            />
          </div>
          
          {/* Additional Service Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {service.quantityEnabled && (
              <span>Qty Enabled</span>
            )}
            {service.taxable && (
              <span>Taxable</span>
            )}
            {!service.active && (
              <span className="text-red-500 font-medium">Inactive</span>
            )}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="flex items-start gap-4 ml-4">
          <div className="text-right">
            <ServicePricingDisplay
              unitPrice={service.unitPrice}
              unitCost={service.unitCost}
              quantity={1}
              layout="compact"
              showProfit={service.unitCost > 0}
              showMargin={false}
            />
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors mt-1 flex-shrink-0" />
        </div>
      </div>
    </button>
  );
};

export default ServicePreviewCard;
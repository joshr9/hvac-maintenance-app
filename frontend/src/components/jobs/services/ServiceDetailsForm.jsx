// components/jobs/services/ServiceDetailsForm.jsx
import React from 'react';
import { Package, Calculator } from 'lucide-react';
import ServiceTotalsPreview from './ServiceTotalsPreview';

const ServiceDetailsForm = ({
  serviceData,
  onInputChange,
  onSubmit,
  onCancel,
  onBack,
  isSubmitting = false,
  error = '',
  showBackButton = false,
  submitButtonText = 'Add Service',
  submitButtonIcon: SubmitIcon = Package,
  originalService = null // For comparison in edit mode
}) => {
  
  // Calculate totals
  const totalPrice = parseFloat(serviceData.quantity || 0) * parseFloat(serviceData.unitPrice || 0);
  const totalCost = parseFloat(serviceData.quantity || 0) * parseFloat(serviceData.unitCost || 0);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Back Button */}
      {showBackButton && onBack && (
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            ← Back to service selection
          </button>
        </div>
      )}

      {/* Service Name & Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Name *
          </label>
          <input
            type="text"
            value={serviceData.serviceName}
            onChange={(e) => onInputChange('serviceName', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
            style={{'--tw-ring-color': '#2a3a91'}}
            placeholder="Enter service name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={serviceData.quantity}
            onChange={(e) => onInputChange('quantity', e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
            style={{'--tw-ring-color': '#2a3a91'}}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={serviceData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
          style={{'--tw-ring-color': '#2a3a91'}}
          rows="3"
          placeholder="Optional service description"
          disabled={isSubmitting}
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Unit Price ($) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={serviceData.unitPrice}
              onChange={(e) => onInputChange('unitPrice', e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{'--tw-ring-color': '#2a3a91'}}
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Unit Cost ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={serviceData.unitCost}
              onChange={(e) => onInputChange('unitCost', e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{'--tw-ring-color': '#2a3a91'}}
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Optional - for profit margin calculations
          </p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={serviceData.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
          style={{'--tw-ring-color': '#2a3a91'}}
          rows="2"
          placeholder="Optional notes about this service item"
          disabled={isSubmitting}
        />
      </div>

      {/* Totals Preview */}
      <ServiceTotalsPreview
        currentTotals={{ totalPrice, totalCost }}
        originalService={originalService}
        quantity={serviceData.quantity}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !serviceData.serviceName?.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)'}}
        >
          <SubmitIcon className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ServiceDetailsForm;
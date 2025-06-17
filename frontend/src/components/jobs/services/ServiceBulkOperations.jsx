// components/jobs/services/ServiceBulkOperations.jsx
import React, { useState } from 'react';
import { 
  Trash2, 
  Copy, 
  Edit3, 
  ArrowUpDown, 
  Calculator, 
  Download,
  CheckSquare,
  Square,
  Minus
} from 'lucide-react';

const ServiceBulkOperations = ({
  selectedServices = [],
  allServices = [],
  onSelectAll,
  onSelectNone,
  onBulkDelete,
  onBulkDuplicate,
  onBulkDiscount,
  onBulkReorder,
  onExportServices,
  disabled = false
}) => {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'

  const selectedCount = selectedServices.length;
  const allCount = allServices.length;
  const isAllSelected = selectedCount === allCount && allCount > 0;
  const isPartialSelected = selectedCount > 0 && selectedCount < allCount;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      onSelectNone();
    } else {
      onSelectAll();
    }
  };

  const handleBulkDiscount = () => {
    if (discountValue && selectedServices.length > 0) {
      onBulkDiscount({
        services: selectedServices,
        type: discountType,
        value: parseFloat(discountValue)
      });
      setShowDiscountModal(false);
      setDiscountValue(0);
    }
  };

  const calculateTotalValue = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = allServices.find(s => s.id === serviceId);
      return total + (parseFloat(service?.totalPrice || 0));
    }, 0);
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <button
          onClick={handleSelectAllToggle}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          disabled={disabled || allCount === 0}
        >
          <Square className="w-4 h-4" />
          Select all services
        </button>
        
        <div className="text-xs text-gray-500">
          ({allCount} total)
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAllToggle}
            className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            disabled={disabled}
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : isPartialSelected ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedCount} selected
          </button>
          
          <div className="text-sm text-blue-600">
            Total value: ${calculateTotalValue().toFixed(2)}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {/* Duplicate Services */}
          {onBulkDuplicate && (
            <button
              onClick={() => onBulkDuplicate(selectedServices)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
              disabled={disabled}
              title="Duplicate selected services"
            >
              <Copy className="w-3 h-3" />
              Duplicate
            </button>
          )}

          {/* Apply Discount */}
          {onBulkDiscount && (
            <button
              onClick={() => setShowDiscountModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-md transition-colors"
              disabled={disabled}
              title="Apply discount to selected services"
            >
              <Calculator className="w-3 h-3" />
              Discount
            </button>
          )}

          {/* Reorder Services */}
          {onBulkReorder && (
            <button
              onClick={() => onBulkReorder(selectedServices)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
              disabled={disabled}
              title="Reorder selected services"
            >
              <ArrowUpDown className="w-3 h-3" />
              Reorder
            </button>
          )}

          {/* Export Services */}
          {onExportServices && (
            <button
              onClick={() => onExportServices(selectedServices)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
              disabled={disabled}
              title="Export selected services"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          )}

          {/* Delete Services */}
          {onBulkDelete && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedCount} selected services?`)) {
                  onBulkDelete(selectedServices);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              disabled={disabled}
              title="Delete selected services"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}

          {/* Clear Selection */}
          <button
            onClick={onSelectNone}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2"
            disabled={disabled}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Apply Discount to {selectedCount} Services
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 px-3 py-2 text-sm rounded border ${
                      discountType === 'percentage'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 px-3 py-2 text-sm rounded border ${
                      discountType === 'fixed'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    Fixed Amount ($)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={discountType === 'percentage' ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  placeholder={discountType === 'percentage' ? '10' : '50.00'}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  Current total: ${calculateTotalValue().toFixed(2)}
                </div>
                {discountValue > 0 && (
                  <div className="text-sm font-medium text-green-600">
                    After discount: $
                    {discountType === 'percentage'
                      ? (calculateTotalValue() * (1 - discountValue / 100)).toFixed(2)
                      : (calculateTotalValue() - parseFloat(discountValue) * selectedCount).toFixed(2)
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBulkDiscount}
                disabled={!discountValue || discountValue <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Discount
              </button>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceBulkOperations;
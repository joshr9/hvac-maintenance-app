// components/jobs/services/ServiceTotalsPreview.jsx
import React from 'react';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';

const ServiceTotalsPreview = ({ 
  currentTotals, 
  originalService = null, 
  quantity = 1 
}) => {
  const { totalPrice = 0, totalCost = 0 } = currentTotals;
  const profit = totalPrice - totalCost;
  const margin = totalPrice > 0 ? (profit / totalPrice) * 100 : 0;

  // Original totals for comparison (edit mode)
  const originalTotalPrice = originalService ? parseFloat(originalService.totalPrice || 0) : null;
  const originalTotalCost = originalService ? parseFloat(originalService.totalCost || 0) : null;
  
  const showComparison = originalService && (originalTotalPrice !== null || originalTotalCost !== null);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        {showComparison ? 'Updated Totals' : 'Totals Preview'}
      </h4>
      
      {/* Current Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Quantity</div>
          <div className="text-lg font-semibold text-gray-900">
            {parseFloat(quantity).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 mb-1">Total Price</div>
          <div className="text-lg font-semibold text-green-700">
            ${totalPrice.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 mb-1">Total Cost</div>
          <div className="text-lg font-semibold text-orange-700">
            ${totalCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Profit Analysis */}
      {totalCost > 0 && (
        <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 mb-1">Profit Analysis</div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-purple-700">
                  ${profit.toFixed(2)} profit
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-700">
                    {margin.toFixed(1)}% margin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison with Original (Edit Mode) */}
      {showComparison && (
        <div className="pt-4 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Changes from Original:</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Comparison */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Revenue Change</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  ${originalTotalPrice?.toFixed(2) || '0.00'}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-green-600">
                  ${totalPrice.toFixed(2)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  totalPrice > (originalTotalPrice || 0)
                    ? 'bg-green-100 text-green-700'
                    : totalPrice < (originalTotalPrice || 0)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {totalPrice > (originalTotalPrice || 0) ? '+' : ''}
                  ${(totalPrice - (originalTotalPrice || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Cost Change</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  ${originalTotalCost?.toFixed(2) || '0.00'}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-semibold text-orange-600">
                  ${totalCost.toFixed(2)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  totalCost > (originalTotalCost || 0)
                    ? 'bg-red-100 text-red-700'
                    : totalCost < (originalTotalCost || 0)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {totalCost > (originalTotalCost || 0) ? '+' : ''}
                  ${(totalCost - (originalTotalCost || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      {!showComparison && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-700">
            <strong>Tip:</strong> Adding cost data helps track profit margins and job profitability.
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTotalsPreview;
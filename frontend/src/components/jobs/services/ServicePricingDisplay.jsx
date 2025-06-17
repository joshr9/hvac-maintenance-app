// components/jobs/services/ServicePricingDisplay.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, AlertTriangle } from 'lucide-react';

const ServicePricingDisplay = ({
  unitPrice = 0,
  unitCost = 0,
  quantity = 1,
  totalPrice = 0,
  totalCost = 0,
  layout = 'detailed', // 'compact' | 'detailed' | 'summary'
  showProfit = true,
  showMargin = true,
  currency = '$',
  highlightProfit = true
}) => {
  
  // Calculate values
  const calculatedTotalPrice = totalPrice || (parseFloat(unitPrice) * parseFloat(quantity));
  const calculatedTotalCost = totalCost || (parseFloat(unitCost) * parseFloat(quantity));
  const profit = calculatedTotalPrice - calculatedTotalCost;
  const margin = calculatedTotalPrice > 0 ? (profit / calculatedTotalPrice) * 100 : 0;
  
  // Determine profit status
  const getProfitStatus = () => {
    if (margin > 30) return 'excellent';
    if (margin > 20) return 'good';
    if (margin > 10) return 'fair';
    if (margin > 0) return 'low';
    return 'loss';
  };

  const profitStatus = getProfitStatus();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'loss': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProfitIcon = () => {
    if (margin > 0) return TrendingUp;
    if (margin < 0) return TrendingDown;
    return Minus;
  };

  if (layout === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">
          {currency}{calculatedTotalPrice.toFixed(2)}
        </span>
        {showProfit && calculatedTotalCost > 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(profitStatus)}`}>
            {React.createElement(getProfitIcon(), { className: "w-3 h-3" })}
            {margin.toFixed(0)}%
          </div>
        )}
      </div>
    );
  }

  if (layout === 'summary') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {currency}{calculatedTotalPrice.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">Revenue</div>
        </div>
        {calculatedTotalCost > 0 && (
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {currency}{calculatedTotalCost.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Cost</div>
          </div>
        )}
      </div>
    );
  }

  // Detailed layout (default)
  return (
    <div className="space-y-3">
      {/* Unit Pricing */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600 text-xs mb-1">Unit Price</div>
          <div className="font-medium text-gray-900">
            {currency}{parseFloat(unitPrice).toFixed(2)}
          </div>
        </div>
        {unitCost > 0 && (
          <div>
            <div className="text-gray-600 text-xs mb-1">Unit Cost</div>
            <div className="font-medium text-gray-700">
              {currency}{parseFloat(unitCost).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Total Pricing */}
      <div className="border-t border-gray-200 pt-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-600 text-xs mb-1">Total Price</div>
            <div className="text-lg font-semibold text-green-600">
              {currency}{calculatedTotalPrice.toFixed(2)}
            </div>
          </div>
          {calculatedTotalCost > 0 && (
            <div>
              <div className="text-gray-600 text-xs mb-1">Total Cost</div>
              <div className="text-lg font-semibold text-orange-600">
                {currency}{calculatedTotalCost.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profit Analysis */}
      {showProfit && calculatedTotalCost > 0 && (
        <div className={`p-3 rounded-lg border ${getStatusColor(profitStatus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {React.createElement(getProfitIcon(), { 
                className: `w-4 h-4 ${highlightProfit ? getStatusColor(profitStatus).split(' ')[0] : 'text-gray-600'}` 
              })}
              <span className="font-medium text-sm">
                {currency}{profit.toFixed(2)} profit
              </span>
            </div>
            {showMargin && (
              <div className="text-sm font-semibold">
                {margin.toFixed(1)}% margin
              </div>
            )}
          </div>
          
          {/* Profit Advice */}
          {profitStatus === 'loss' && (
            <div className="mt-2 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-700">
                This service is selling at a loss. Consider adjusting pricing.
              </div>
            </div>
          )}
          
          {profitStatus === 'low' && (
            <div className="mt-2 text-xs opacity-75">
              Low profit margin. Consider reviewing costs or pricing.
            </div>
          )}
          
          {profitStatus === 'excellent' && (
            <div className="mt-2 text-xs opacity-75">
              Excellent profit margin! This is a high-value service.
            </div>
          )}
        </div>
      )}

      {/* Quantity Display */}
      {quantity > 1 && (
        <div className="text-xs text-gray-500 text-center">
          Based on quantity: {parseFloat(quantity).toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default ServicePricingDisplay;
// components/jobs/services/ServicesSummary.jsx
import React from 'react';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';

const ServicesSummary = ({ totals, services = [] }) => {
  const { totalPrice = 0, totalCost = 0, profitMargin = 0 } = totals;
  
  const serviceCount = services.length;
  const averageServiceValue = serviceCount > 0 ? totalPrice / serviceCount : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h4 className="text-lg font-semibold text-gray-900">Financial Summary</h4>
        <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-700 mb-1">
            ${totalPrice.toFixed(2)}
          </div>
          <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
          <div className="text-xs text-blue-500 mt-1">
            Billable amount
          </div>
        </div>

        {/* Total Cost */}
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <div className="text-2xl font-bold text-orange-700 mb-1">
            ${totalCost.toFixed(2)}
          </div>
          <div className="text-sm text-orange-600 font-medium">Total Cost</div>
          <div className="text-xs text-orange-500 mt-1">
            Material & labor
          </div>
        </div>

        {/* Profit Margin */}
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-green-600 font-medium">Profit Margin</div>
          <div className="text-xs text-green-500 mt-1">
            ${(totalPrice - totalCost).toFixed(2)} profit
          </div>
        </div>

        {/* Average Service Value */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calculator className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">
              ${averageServiceValue.toFixed(0)}
            </span>
          </div>
          <div className="text-sm text-purple-600 font-medium">Avg. Service</div>
          <div className="text-xs text-purple-500 mt-1">
            Per line item
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      {serviceCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">
                {services.filter(s => s.unitCost && parseFloat(s.unitCost) > 0).length}
              </div>
              <div className="text-xs text-gray-600">Services with cost data</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">
                {services.filter(s => s.notes && s.notes.trim()).length}
              </div>
              <div className="text-xs text-gray-600">Services with notes</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">
                ${Math.max(...services.map(s => parseFloat(s.totalPrice || 0))).toFixed(0)}
              </div>
              <div className="text-xs text-gray-600">Highest value service</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSummary;
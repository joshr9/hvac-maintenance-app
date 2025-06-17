import React from 'react';
import { Edit, Trash2, Tag, Clock } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const ServiceCard = ({ service, onEdit, onDelete }) => {
  // Helper function to safely convert Prisma Decimal to number
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (value && typeof value.toNumber === 'function') return value.toNumber();
    if (value && typeof value.toString === 'function') return parseFloat(value.toString()) || 0;
    return parseFloat(value) || 0;
  };

  const formatCurrency = (value) => {
    const num = toNumber(value);
    return num.toFixed(2);
  };

  const getProfitMargin = () => {
    const price = toNumber(service.unitPrice);
    const cost = toNumber(service.unitCost);
    
    if (price && cost && price > 0) {
      const margin = ((price - cost) / price) * 100;
      return margin.toFixed(1);
    }
    return null;
  };

  const profitMargin = getProfitMargin();

  const handleEdit = () => {
    if (onEdit) onEdit(service);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(service);
  };

  return (
    <GlassCard hover={true}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              service.active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {service.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {service.description && (
            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {service.category}
            </div>
            
            {service.durationMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {service.durationMinutes}m
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Edit Service"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete Service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500 mb-1">Price</div>
          <div className="text-lg font-semibold text-green-600">
            ${formatCurrency(service.unitPrice)}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500 mb-1">Cost</div>
          <div className="text-lg font-semibold text-gray-900">
            ${formatCurrency(service.unitCost)}
          </div>
        </div>
        
        {profitMargin && (
          <div className="col-span-2">
            <div className="text-xs text-gray-500 mb-1">Profit Margin</div>
            <div className={`text-sm font-semibold ${
              parseFloat(profitMargin) > 20 
                ? 'text-green-600' 
                : parseFloat(profitMargin) > 10 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
            }`}>
              {profitMargin}%
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ServiceCard;
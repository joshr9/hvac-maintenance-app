// components/jobs/services/EmptyServicesState.jsx
import React from 'react';
import { Package, Plus } from 'lucide-react';

const EmptyServicesState = ({ onAddService }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        
        <h4 className="text-xl font-semibold text-gray-900 mb-3">
          No services added yet
        </h4>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Add services, materials, or other billable items to get started. 
          You can select from your service catalog or create custom items.
        </p>
        
        <button
          onClick={onAddService}
          className="inline-flex items-center gap-3 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg transform hover:scale-105"
          style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)'}}
        >
          <Plus className="w-5 h-5" />
          Add First Service
        </button>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Service catalog
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Custom items
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              Auto totals
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyServicesState;
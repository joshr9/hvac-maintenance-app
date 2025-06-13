import React from 'react';
import { Wrench, ClipboardList } from 'lucide-react';

const MaintenanceModeToggle = ({ mode, setMode }) => {
  return (
    <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
      <button
        type="button"
        onClick={() => setMode('quick')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
          mode === 'quick' 
            ? 'text-white shadow-sm' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
        style={mode === 'quick' ? {backgroundColor: '#2a3a91'} : {}}
      >
        <Wrench className="w-4 h-4" />
        Quick Maintenance
      </button>
      <button
        type="button"
        onClick={() => setMode('checklist')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
          mode === 'checklist' 
            ? 'text-white shadow-sm' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
        }`}
        style={mode === 'checklist' ? {backgroundColor: '#2a3a91'} : {}}
      >
        <ClipboardList className="w-4 h-4" />
        Full Inspection Checklist
      </button>
    </div>
  );
};

export default MaintenanceModeToggle;
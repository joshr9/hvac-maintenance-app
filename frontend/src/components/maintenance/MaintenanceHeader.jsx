import React from 'react';

const MaintenanceHeader = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center gap-3">
          <img 
            src="/DeanCallan.png" 
            alt="Dean Callan Logo" 
            className="w-20 h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">HVAC Maintenance Tracker</h1>
            <p className="text-gray-600">Manage property maintenance records</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHeader;

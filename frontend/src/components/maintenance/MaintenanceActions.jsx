import React from 'react';
import { FileText } from 'lucide-react';

const MaintenanceActions = ({ onDownloadReport }) => {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onDownloadReport}
        className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg shadow hover:opacity-90 transition-colors"
        style={{ 
          background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)', 
          boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)' 
        }}
      >
        <FileText className="w-5 h-5" />
        Download Report
      </button>
    </div>
  );
};

export default MaintenanceActions;
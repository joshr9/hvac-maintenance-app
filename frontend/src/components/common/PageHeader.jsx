// components/common/PageHeader.jsx (Reusable)
import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle, 
  actionButton,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>
      
      {actionButton && (
        <div className="flex items-center gap-3">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
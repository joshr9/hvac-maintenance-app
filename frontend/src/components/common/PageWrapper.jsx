// components/common/PageWrapper.jsx
import React from 'react';

const PageWrapper = ({ 
  children, 
  className = "",
  spacing = "space-y-6" // "space-y-6" for dashboard, "" for jobs/schedule
}) => {
  return (
    <div 
      className={`p-6 ${spacing} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', 
        minHeight: '100vh'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
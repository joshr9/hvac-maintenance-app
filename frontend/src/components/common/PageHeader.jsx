import React from 'react';

const PageHeader = ({ 
  title, 
  description, 
  actions = null,
  breadcrumb = null,
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-between mb-8 ${className}`}>
      <div className="flex-1">
        {breadcrumb && (
          <div className="mb-2">
            {breadcrumb}
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
        
        {description && (
          <p className="text-gray-600 mt-2">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 ml-6">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
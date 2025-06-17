// components/jobs/services/ServiceActionButtons.jsx
import React from 'react';
import { Edit2, Trash2, Copy, Eye, MoreVertical } from 'lucide-react';

const ServiceActionButtons = ({ 
  service, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onView,
  showDuplicate = true,
  showView = false,
  layout = 'horizontal' // 'horizontal' | 'vertical' | 'dropdown'
}) => {
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${service.serviceName}"?`)) {
      onDelete();
    }
  };

  const buttons = [
    {
      id: 'edit',
      icon: Edit2,
      label: 'Edit',
      onClick: onEdit,
      className: 'text-gray-400 hover:text-blue-600 hover:bg-blue-50',
      show: true
    },
    {
      id: 'duplicate',
      icon: Copy,
      label: 'Duplicate',
      onClick: onDuplicate,
      className: 'text-gray-400 hover:text-green-600 hover:bg-green-50',
      show: showDuplicate && onDuplicate
    },
    {
      id: 'view',
      icon: Eye,
      label: 'View Details',
      onClick: onView,
      className: 'text-gray-400 hover:text-purple-600 hover:bg-purple-50',
      show: showView && onView
    },
    {
      id: 'delete',
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      className: 'text-gray-400 hover:text-red-600 hover:bg-red-50',
      show: true
    }
  ].filter(button => button.show);

  if (layout === 'dropdown') {
    return (
      <div className="relative group">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
        
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block min-w-[120px]">
          {buttons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={button.onClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                title={button.label}
              >
                <Icon className="w-4 h-4" />
                {button.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className="flex flex-col gap-1">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <button
              key={button.id}
              onClick={button.onClick}
              className={`p-2 rounded-lg transition-colors ${button.className}`}
              title={button.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className="flex items-center gap-1">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.id}
            onClick={button.onClick}
            className={`p-2 rounded-lg transition-colors ${button.className}`}
            title={button.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};

export default ServiceActionButtons;
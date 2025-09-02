// JobActionsDropdown.jsx - Super simple fix for layout shift
import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  Calendar, 
  User, 
  CheckCircle
} from 'lucide-react';

const JobActionsDropdown = ({
  job,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onReschedule,
  onAssignTechnician,
  onStatusUpdate,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onView?.(job);
      },
      className: 'text-blue-700 hover:bg-blue-50'
    },
    {
      label: 'Edit Job',
      icon: Edit,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onEdit?.(job);
      },
      className: 'text-gray-700 hover:bg-gray-50'
    },
    ...(job.status !== 'COMPLETED' ? [{
      label: 'Mark Complete',
      icon: CheckCircle,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onStatusUpdate?.(job.id, { status: 'COMPLETED' });
      },
      className: 'text-green-700 hover:bg-green-50'
    }] : []),
    {
      label: 'Reschedule',
      icon: Calendar,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onReschedule?.(job);
      },
      className: 'text-orange-700 hover:bg-orange-50'
    },
    {
      label: 'Assign Technician',
      icon: User,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onAssignTechnician?.(job);
      },
      className: 'text-purple-700 hover:bg-purple-50'
    },
    {
      label: 'Duplicate Job',
      icon: Copy,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        onDuplicate?.(job);
      },
      className: 'text-gray-700 hover:bg-gray-50'
    },
    {
      label: 'Delete Job',
      icon: Trash2,
      onClick: (e) => {
        e.stopPropagation();
        setIsOpen(false);
        if (window.confirm('Are you sure you want to delete this job?')) {
          onDelete?.(job.id);
        }
      },
      className: 'text-red-700 hover:bg-red-50 border-t border-gray-200 mt-1 pt-3'
    }
  ];

  return (
    <div 
      ref={dropdownRef} 
      className="relative"
      style={{ 
        width: '32px', 
        height: '32px', 
        flexShrink: 0 
      }}
    >
      {/* ✅ FIXED SIZE: Button with exact dimensions */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          w-8 h-8 rounded-lg transition-colors duration-200 
          flex items-center justify-center
          ${isOpen 
            ? 'text-gray-700 bg-gray-100' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }
        `}
        style={{ 
          width: '32px', 
          height: '32px', 
          padding: '0',
          minWidth: '32px',
          minHeight: '32px'
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* ✅ ABSOLUTE: Dropdown that doesn't affect layout */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
          style={{
            zIndex: 10000,
            position: 'absolute',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left
                  transition-colors duration-150 ${action.className}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobActionsDropdown;
// components/calendar/components/MiniJobCard.jsx - Consistent with CalendarGrid sizing
import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Home, 
  AlertTriangle, 
  Zap, 
  Wrench,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';

const MiniJobCard = ({ 
  event, 
  onSelect, 
  onViewDetails,
  isDragging = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const job = event.job || event.resource || event;

  // Priority styling
  const getPriorityConfig = (priority) => {
    const configs = {
      URGENT: {
        icon: Zap,
        borderColor: 'border-l-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        iconColor: 'text-red-600'
      },
      HIGH: {
        icon: AlertTriangle,
        borderColor: 'border-l-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600'
      },
      MEDIUM: {
        icon: Wrench,
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600'
      },
      LOW: {
        icon: CheckCircle,
        borderColor: 'border-l-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-900',
        iconColor: 'text-green-600'
      }
    };
    return configs[priority] || configs.MEDIUM;
  };

  const config = getPriorityConfig(job.priority);
  const PriorityIcon = config.icon;

  // Get technician initials
  const getTechInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(event);
    }
  };

  return (
    <div
      className={`
        group relative bg-white rounded-lg border-l-4 shadow-sm cursor-pointer
        transition-all duration-200 ease-in-out
        ${config.borderColor} ${config.bgColor}
        ${isHovered ? 'shadow-md transform -translate-y-0.5' : 'shadow-sm'}
        ${isDragging ? 'opacity-75 shadow-lg' : ''}
        hover:shadow-md hover:-translate-y-0.5
        
        /* CONSISTENT SIZING with CalendarGrid - properly sized */
        min-w-[120px] max-w-[180px] m-1
        sm:min-w-[140px] sm:max-w-[200px]
        md:min-w-[160px] md:max-w-[240px]
        lg:min-w-[180px] lg:max-w-[260px]
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(job));
      }}
    >
      {/* Card Content - CONSISTENT PADDING */}
      <div className="
        p-2 sm:p-2 md:p-3 lg:p-3
        min-h-[50px] sm:min-h-[55px] md:min-h-[60px] lg:min-h-[65px]
      ">
        
        {/* Header Row - CONSISTENT SIZING */}
        <div className="flex items-start justify-between mb-1 sm:mb-1">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            <PriorityIcon className={`
              ${config.iconColor} flex-shrink-0
              w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4
            `} />
            <span className={`
              font-semibold truncate ${config.textColor}
              text-xs sm:text-sm md:text-sm lg:text-base
              leading-tight
            `}>
              {job.title || 'Untitled Job'}
            </span>
          </div>
          
          {/* Action Menu */}
          <button 
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) onViewDetails(job);
            }}
          >
            <MoreHorizontal className="w-3 h-3 sm:w-3 sm:h-3 text-gray-500" />
          </button>
        </div>

        {/* Property Info - Show on sm+ screens */}
        {job.property?.name && (
          <div className="hidden sm:flex items-center gap-1 sm:gap-2 mb-1">
            <Home className="w-3 h-3 sm:w-3 sm:h-3 text-gray-500" />
            <span className="
              text-gray-600 truncate
              text-xs sm:text-xs md:text-sm lg:text-sm
            ">
              {job.property.name}
            </span>
          </div>
        )}

        {/* Bottom Row - Technician & Time */}
        <div className="flex items-center justify-between">
          
          {/* Technician */}
          <div className="flex items-center gap-1 sm:gap-1">
            <div className="
              bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700
              w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5
              text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs
            ">
              {getTechInitials(job.assignedTechnician || job.technician)}
            </div>
            <span className="
              text-gray-600 truncate
              text-[9px] sm:text-[10px] md:text-xs lg:text-sm
              max-w-[40px] sm:max-w-[50px] md:max-w-[60px] lg:max-w-[80px]
            ">
              {job.assignedTechnician || job.technician || 'Unassigned'}
            </span>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-3 sm:h-3 text-gray-400" />
            <span className="
              text-gray-500 font-medium
              text-[9px] sm:text-[10px] md:text-xs lg:text-sm
            ">
              {event.start ? formatTime(event.start) : job.scheduledTime}
            </span>
          </div>
        </div>

        {/* Large Screen Extras - lg+ screens only */}
        <div className="hidden lg:block mt-2 pt-2 border-t border-gray-100">
          {job.jobNumber && (
            <div className="text-xs text-gray-500 font-mono">
              #{job.jobNumber}
            </div>
          )}
          {job.estimatedDuration && (
            <div className="text-xs text-gray-500 mt-1">
              ⏱️ {job.estimatedDuration}min
            </div>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-0 mb-1 z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
          <div className="font-semibold">{job.title}</div>
          <div className="text-gray-300">{job.property?.name}</div>
          <div className="text-gray-300">Priority: {job.priority}</div>
          {job.estimatedDuration && (
            <div className="text-gray-300">Duration: {job.estimatedDuration}min</div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Status Indicator */}
      <div className={`
        absolute top-1 right-1 rounded-full
        w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3
        ${job.status === 'completed' ? 'bg-green-500' :
          job.status === 'in-progress' ? 'bg-blue-500' :
          job.status === 'scheduled' ? 'bg-yellow-500' :
          'bg-gray-400'}
      `} />
    </div>
  );
};

export default MiniJobCard;
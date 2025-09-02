// components/timer/TimeEntryCard.jsx
import React from 'react';
import { Clock, Edit3, MapPin, FileText } from 'lucide-react';

const TimeEntryCard = ({ 
  entry, 
  onEdit, 
  onDelete, 
  showActions = true,
  className = '' 
}) => {
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getDurationColor = (minutes) => {
    if (minutes < 60) return 'text-yellow-600'; // Less than 1 hour
    if (minutes < 480) return 'text-green-600'; // 1-8 hours
    return 'text-blue-600'; // 8+ hours
  };

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow
      ${className}
    `}>
      <div className="flex items-start justify-between">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                Job #{entry.jobId}
              </span>
            </div>
            
            {entry.propertyAddress && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-40">
                  {entry.propertyAddress}
                </span>
              </div>
            )}
          </div>

          {/* Time Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
            <div>
              <span className="text-gray-500">Started:</span>
              <div className="font-medium">
                {formatDate(entry.startTime)}
              </div>
              <div className="text-gray-600">
                {formatTime(entry.startTime)}
              </div>
            </div>
            
            <div>
              <span className="text-gray-500">Ended:</span>
              <div className="font-medium">
                {entry.endTime ? formatDate(entry.endTime) : 'In Progress'}
              </div>
              <div className="text-gray-600">
                {formatTime(entry.endTime)}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">Duration:</span>
            <span className={`font-semibold ${getDurationColor(entry.totalMinutes)}`}>
              {formatDuration(entry.totalMinutes)}
            </span>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 font-medium">Notes:</span>
              </div>
              <p className="text-gray-700">{entry.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col gap-1 ml-4">
            <button
              onClick={() => onEdit?.(entry)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit time entry"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Technician: {entry.technicianName}</span>
        <span>ID: {entry.id}</span>
      </div>
    </div>
  );
};

export default TimeEntryCard;
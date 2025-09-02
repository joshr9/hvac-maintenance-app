// src/components/calendar/components/JobDragOverlay.jsx
import React from 'react';
import { MapPin, Clock, Timer, MoreHorizontal } from 'lucide-react';

export const JobDragOverlay = ({ job }) => {
  if (!job) return null;

  return (
    <div className="job-chip dragging relative p-3 rounded-lg border-2 bg-white shadow-2xl transform rotate-3 scale-105">
      {/* Job Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${
              job.priority === 'urgent' ? 'bg-red-500' :
              job.priority === 'high' ? 'bg-orange-500' :
              job.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            <span className="font-medium text-sm text-gray-900 truncate">
              {job.title || 'Untitled Job'}
            </span>
          </div>
        </div>
        <button className="opacity-50 p-0.5 rounded">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-1">
        {job.property?.name && (
          <div className="flex items-center gap-1 text-xs opacity-80">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{job.property.name}</span>
          </div>
        )}
        {job.scheduledTime && (
          <div className="flex items-center gap-1 text-xs opacity-80">
            <Clock className="w-3 h-3" />
            <span>{job.scheduledTime}</span>
          </div>
        )}
        {job.estimatedDuration && (
          <div className="flex items-center gap-1 text-xs opacity-80">
            <Timer className="w-3 h-3" />
            <span>{job.estimatedDuration}min</span>
          </div>
        )}
      </div>

      {/* Dragging indicator */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default JobDragOverlay
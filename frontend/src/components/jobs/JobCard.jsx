// components/jobs/JobCard.jsx - Enhanced with Timer Integration
import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Package, 
  Building,
  Wrench,
  Eye
} from 'lucide-react';
import JobActionsDropdown from './JobActionsDropdown';
import JobTimer from './JobTimer'; // NEW: Import timer component

const JobCard = ({ 
  job, 
  onView, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onReschedule, 
  onAssignTechnician, 
  onStatusUpdate,
  onTimerUpdate // NEW: Callback for timer updates
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  const formatPercentage = (percentage) => {
    if (!percentage) return '0.0%';
    return `${parseFloat(percentage).toFixed(1)}%`;
  };

  // Handle timer events
  const handleTimerStart = (jobId) => {
    // Update job status to IN_PROGRESS
    onStatusUpdate?.(jobId, { status: 'IN_PROGRESS' });
    onTimerUpdate?.('start', jobId);
  };

  const handleTimerStop = (jobId, timerData) => {
    // Update job status back to SCHEDULED
    onStatusUpdate?.(jobId, { status: 'SCHEDULED' });
    onTimerUpdate?.('stop', jobId, timerData);
  };

  const WorkIcon = Wrench;

  return (
    <div className="job-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-visible relative">
      {/* Header Section */}
      <div className="p-6">
        {/* Top Row - Status badges and Actions */}
        <div className="flex items-start justify-between mb-4">
          {/* Left side - Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              job.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
              job.status === 'DISPATCHED' ? 'bg-yellow-100 text-yellow-700' :
              job.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700 animate-pulse' : // NEW: Pulse for active
              job.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
              job.status === 'INVOICED' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {job.status === 'IN_PROGRESS' ? '🔄 IN PROGRESS' : job.status.replace('_', ' ')}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              job.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
              job.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
              job.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {job.priority}
            </span>
          </div>
          
          {/* Right side - Actions dropdown */}
          <JobActionsDropdown 
            job={job}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onReschedule={onReschedule}
            onAssignTechnician={onAssignTechnician}
          />
        </div>

        {/* Job Number and Title */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-gray-500">#{job.jobNumber}</span>
            {job.isRecurring && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                Recurring
              </span>
            )}
          </div>
          <div className="job-title-container">
            <h3 className="job-title text-lg font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
          </div>
        </div>

        {/* Property and Location Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>{job.property?.name || 'No property assigned'}</span>
          </div>
          
          {job.suite && (
            <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
              <span>Suite: {job.suite.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {job.scheduledDate 
                ? new Date(job.scheduledDate).toLocaleDateString()
                : 'Not scheduled'
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{job.assignedTechnician || 'Unassigned'}</span>
          </div>
        </div>

        {/* Work Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <WorkIcon className="w-4 h-4" />
            <span>{job.workType || 'General Maintenance'}</span>
          </div>
          
          {job.estimatedDuration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Est. {job.estimatedDuration} minutes</span>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        {(job.estimatedCost || job.actualCost) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Financial</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {job.estimatedCost && (
                <div>
                  <span className="text-gray-600">Estimated:</span>
                  <div className="font-medium">${formatCurrency(job.estimatedCost)}</div>
                </div>
              )}
              {job.actualCost && (
                <div>
                  <span className="text-gray-600">Actual:</span>
                  <div className="font-medium">${formatCurrency(job.actualCost)}</div>
                </div>
              )}
            </div>
            {job.profitMargin && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-600 text-sm">Profit Margin:</span>
                <div className={`font-medium ${
                  parseFloat(job.profitMargin) > 20 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(job.profitMargin)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ NEW: Timer Section */}
      <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Time Tracking</span>
          <div className="flex-1 ml-4">
            <JobTimer
              jobId={job.id}
              technicianName={job.assignedTechnician || 'Default User'}
              onTimerStart={handleTimerStart}
              onTimerStop={handleTimerStop}
              size="small"
              className="justify-end"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-2">
          {/* Quick View Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onView?.(job);
            }}
            className="px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          {/* Primary Action Button - Changes based on status */}
          {job.status !== 'IN_PROGRESS' && job.status !== 'COMPLETED' && (
            <button 
              onClick={() => onStatusUpdate?.(job.id, { status: 'IN_PROGRESS' })}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Start Job
            </button>
          )}
          
          {job.status === 'IN_PROGRESS' && (
            <button 
              onClick={() => onStatusUpdate?.(job.id, { status: 'COMPLETED' })}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Complete Job
            </button>
          )}
          
          {job.status === 'COMPLETED' && (
            <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium text-center">
              ✅ Completed
            </div>
          )}
          
          {/* Edit Button */}
          <button 
            onClick={() => onEdit?.(job)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
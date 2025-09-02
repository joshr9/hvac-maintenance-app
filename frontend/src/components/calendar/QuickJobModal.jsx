// components/calendar/QuickJobModal.jsx - Modern styled version
import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  MoreHorizontal,
  FileText,
  Phone,
  Settings,
  Copy
} from 'lucide-react';

const QuickJobModal = ({ 
  isOpen, 
  onClose, 
  job, 
  onEdit, 
  onViewDetails, 
  onUpdate,
  calendarContext = null
}) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  if (!isOpen || !job) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'MEDIUM':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'LOW':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Scheduled' };
      case 'IN_PROGRESS':
        return { icon: Play, color: 'text-green-600', bg: 'bg-green-100', label: 'In Progress' };
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' };
      case 'PAUSED':
        return { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Paused' };
      case 'CANCELLED':
        return { icon: X, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No time set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  const quickActions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails?.(job),
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      label: 'Edit Job',
      icon: Edit,
      onClick: () => onEdit?.(job),
      color: 'text-gray-600 hover:text-gray-700'
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: () => console.log('Duplicate job:', job.id),
      color: 'text-purple-600 hover:text-purple-700'
    },
    {
      label: 'Contact Customer',
      icon: Phone,
      onClick: () => console.log('Contact customer for job:', job.id),
      color: 'text-green-600 hover:text-green-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shadow-lg ${statusConfig.bg}`}>
                <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">#{job.jobNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(job.priority)}`}>
                    {job.priority} Priority
                  </span>
                  {job.isRecurring && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      🔄 Recurring
                    </span>
                  )}
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${statusConfig.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                  <span className={`text-sm font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {/* Action Menu */}
                {isActionMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {quickActions.map((action, index) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            action.onClick();
                            setIsActionMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${action.color} ${
                            index === 0 ? 'rounded-t-lg' : ''
                          } ${index === quickActions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'}`}
                        >
                          <ActionIcon className="w-4 h-4" />
                          <span className="font-medium">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Description */}
          {job.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {job.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scheduling */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Date</div>
                    <div className="text-sm text-gray-600">{formatDate(job.scheduledDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Time</div>
                    <div className="text-sm text-gray-600">{formatTime(job.scheduledTime)}</div>
                  </div>
                </div>
                
                {job.estimatedDuration && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Duration</div>
                      <div className="text-sm text-gray-600">{job.estimatedDuration} minutes</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Assignment */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location & Assignment
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Property</div>
                    <div className="text-sm text-gray-600">
                      {job.property?.name || 'No property assigned'}
                    </div>
                  </div>
                </div>
                
                {job.assignedTechnician && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Technician</div>
                      <div className="text-sm text-gray-600">{job.assignedTechnician}</div>
                    </div>
                  </div>
                )}
                
                {job.workType && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Work Type</div>
                      <div className="text-sm text-gray-600">
                        {job.workType.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calendar Context Info */}
          {calendarContext && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <span className="font-medium text-blue-900">Calendar Context:</span>
                <span className="text-blue-700 ml-1">
                  Viewing in {calendarContext.viewType} view
                  {calendarContext.resourceId && ` for ${calendarContext.viewType === 'team' ? 'technician' : 'zone'}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onViewDetails?.(job)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                View Full Details
              </button>
              
              <button
                onClick={() => onEdit?.(job)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Job
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickJobModal;
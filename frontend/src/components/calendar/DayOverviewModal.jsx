// components/calendar/DayOverviewModal.jsx - Modern styled version
import React, { useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Building, 
  User, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Plus,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react';

const DayOverviewModal = ({ isOpen, onClose, jobs = [], date }) => {
  // Helper function to get technician initials
  const getTechnicianInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Group jobs by time slots
  const groupedJobs = useMemo(() => {
    const groups = {};
    jobs.forEach(job => {
      const hour = job.scheduledTime ? parseInt(job.scheduledTime.split(':')[0]) : 0;
      const key = `${hour.toString().padStart(2, '0')}:00`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    });
    
    // Sort by time
    return Object.keys(groups)
      .sort()
      .map(time => ({
        time,
        displayTime: new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        }),
        jobs: groups[time]
      }));
  }, [jobs]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
    const inProgressJobs = jobs.filter(j => j.status === 'IN_PROGRESS').length;
    const urgentJobs = jobs.filter(j => j.priority === 'URGENT').length;
    const totalHours = jobs.reduce((sum, job) => sum + (job.estimatedDuration || 0), 0) / 60;
    const uniqueTechnicians = [...new Set(jobs.map(j => j.assignedTechnician).filter(Boolean))].length;

    return {
      totalJobs,
      completedJobs,
      inProgressJobs,
      urgentJobs,
      totalHours: Math.round(totalHours * 10) / 10,
      uniqueTechnicians
    };
  }, [jobs]);

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'PAUSED':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'SCHEDULED':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Selected Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Day Overview</h3>
                <p className="text-gray-600 mt-1">{formatDate(date)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalJobs}</span>
              </div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.completedJobs}</span>
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Play className="w-4 h-4 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.inProgressJobs}</span>
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.urgentJobs}</span>
              </div>
              <div className="text-sm text-gray-600">Urgent</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalHours}</span>
              </div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.uniqueTechnicians}</span>
              </div>
              <div className="text-sm text-gray-600">Technicians</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {jobs.length > 0 ? (
            <div className="p-6">
              {groupedJobs.map(({ time, displayTime, jobs: timeJobs }) => (
                <div key={time} className="mb-8 last:mb-0">
                  {/* Time Header */}
                  <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold">
                      <Clock className="w-4 h-4" />
                      {displayTime}
                    </div>
                    <div className="text-sm text-gray-500">
                      {timeJobs.length} job{timeJobs.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Jobs for this time */}
                  <div className="space-y-3">
                    {timeJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(job.status)}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(job.priority)}`}>
                              {job.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getTechnicianInitials(job.assignedTechnician)}
                            </div>
                            <span className="text-sm text-gray-600">{job.assignedTechnician}</span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{job.title}</h4>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{job.property?.name || 'No property'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.estimatedDuration || 0} min</span>
                          </div>
                          {job.scheduledTime && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(`2000-01-01T${job.scheduledTime}`).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No jobs scheduled</h4>
              <p className="text-gray-600 mb-4">This day is free of scheduled maintenance work.</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Schedule New Job
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                <Filter className="w-4 h-4" />
                Filter Jobs
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium">
                <TrendingUp className="w-4 h-4" />
                View Reports
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

export default DayOverviewModal;
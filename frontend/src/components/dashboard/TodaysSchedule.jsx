import React from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';

const TodaysSchedule = ({ jobs, onNavigate, onOpenModal }) => {
  const JobCard = ({ job }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
        case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'IN_PROGRESS': return 'bg-green-100 text-green-700';
        case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
        case 'COMPLETED': return 'bg-gray-100 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-gray-500">{job.jobNumber}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(job.priority)}`}>
                {job.priority}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">{job.title}</h4>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {job.property} - {job.suite}
            </p>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {job.time}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {job.technician}
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <p className="text-sm text-gray-600">{jobs.length} jobs scheduled</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('schedule')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View Calendar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No jobs scheduled for today</p>
            <button 
              onClick={() => onOpenModal('schedule')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Schedule a job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysSchedule;
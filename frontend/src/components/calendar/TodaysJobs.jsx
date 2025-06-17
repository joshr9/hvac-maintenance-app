import React from 'react';
import { Clock, MapPin } from 'lucide-react';

const TodaysJobs = ({ upcomingJobs }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': '#ef4444',
      'MEDIUM': '#f59e0b',
      'LOW': '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getMaintenanceTypeLabel = (type) => {
    const labels = {
      'INSPECTION': 'Inspection',
      'FILTER_CHANGE': 'Filter Change',
      'FULL_SERVICE': 'Full Service',
      'FULL_INSPECTION_CHECKLIST': 'Full Inspection',
      'REPAIR': 'Repair',
      'OTHER': 'Other'
    };
    return labels[type] || type;
  };

  const todaysJobs = upcomingJobs.filter(job => 
    new Date(job.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Today's Schedule
      </h3>
      
      {todaysJobs.length > 0 ? (
        <div className="space-y-3">
          {todaysJobs.map(job => (
            <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{backgroundColor: getPriorityColor(job.priority)}}
                ></div>
                <span className="text-sm font-medium">{job.time}</span>
                <span className="text-xs text-gray-600">{getMaintenanceTypeLabel(job.maintenanceType)}</span>
              </div>
              <div className="text-sm text-gray-700">{job.assignedTechnician}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.suite?.property?.name} - {job.suite?.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No jobs scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default TodaysJobs;
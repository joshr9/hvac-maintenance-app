import React from 'react';
import { Bell, MapPin } from 'lucide-react';

const UpcomingJobs = ({ upcomingJobs }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Upcoming Jobs
      </h3>
      
      {upcomingJobs.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {upcomingJobs.map(job => (
            <div key={job.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{backgroundColor: getPriorityColor(job.priority)}}
                  ></div>
                  <span className="text-sm font-medium">
                    {new Date(job.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-600">{job.time}</span>
                </div>
              </div>
              <div className="text-sm text-gray-700">{getMaintenanceTypeLabel(job.maintenanceType)}</div>
              <div className="text-xs text-gray-600">{job.assignedTechnician}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {job.suite?.property?.name} - {job.suite?.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming jobs</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingJobs;
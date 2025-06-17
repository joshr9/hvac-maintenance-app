import React from 'react';
import { X } from 'lucide-react';

const DayDetailsModal = ({ selectedDate, onClose }) => {
  const getMaintenanceTypeColor = (type) => {
    const colors = {
      'INSPECTION': '#3b82f6',
      'FILTER_CHANGE': '#10b981',
      'FULL_SERVICE': '#8b5cf6',
      'FULL_INSPECTION_CHECKLIST': '#2a3a91',
      'REPAIR': '#ef4444',
      'OTHER': '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate.date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Completed Maintenance */}
          {selectedDate.maintenance.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Completed Work</h4>
              {selectedDate.maintenance.map((log, idx) => (
                <div key={idx} className="p-3 border border-green-200 rounded-lg bg-green-50 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{getMaintenanceTypeLabel(log.maintenanceType)}</div>
                      <div className="text-sm text-gray-600">
                        {log.hvacUnit?.suite?.property?.name} - {log.hvacUnit?.suite?.name}
                      </div>
                      <div className="text-sm text-gray-700">{log.notes}</div>
                      {log.serviceTechnician && (
                        <div className="text-sm text-gray-600">by {log.serviceTechnician}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scheduled Jobs */}
          {selectedDate.scheduled.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">📅 Scheduled Work</h4>
              {selectedDate.scheduled.map((job, idx) => (
                <div key={idx} className={`p-3 border rounded-lg mb-2 ${job.status === 'COMPLETED' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{getMaintenanceTypeLabel(job.maintenanceType)}</div>
                      <div className="text-sm text-gray-600">
                        {job.suite?.property?.name} - {job.suite?.name}
                      </div>
                      <div className="text-sm text-gray-700">{job.assignedTechnician}</div>
                      {job.notes && <div className="text-sm text-gray-600">{job.notes}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{job.time}</div>
                      <div 
                        className="text-xs px-2 py-1 rounded-full text-white"
                        style={{backgroundColor: getPriorityColor(job.priority)}}
                      >
                        {job.priority}
                      </div>
                      {job.status === 'COMPLETED' && (
                        <div className="text-xs text-green-600 mt-1">✓ Completed</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedDate.maintenance.length === 0 && selectedDate.scheduled.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No maintenance activities for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetailsModal;
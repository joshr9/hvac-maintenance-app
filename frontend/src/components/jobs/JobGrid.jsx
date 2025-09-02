// components/jobs/JobGrid.jsx - Enhanced with Timer Support
import React from 'react';
import { Briefcase } from 'lucide-react';
import JobCard from './JobCard';

const JobGrid = ({ 
  jobs = [], 
  onView, 
  onEdit,
  onDelete,
  onDuplicate,
  onReschedule,
  onAssignTechnician,
  onStatusUpdate,
  onTimerUpdate, // NEW: Timer update handler
  hasFilters = false 
}) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-500 mb-4">
          {hasFilters
            ? 'Try adjusting your search or filters'
            : 'Get started by creating your first job using the "Create Job" button above'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onReschedule={onReschedule}
          onAssignTechnician={onAssignTechnician}
          onStatusUpdate={onStatusUpdate}
          onTimerUpdate={onTimerUpdate} // NEW: Pass timer handler to JobCard
        />
      ))}
    </div>
  );
};

export default JobGrid;
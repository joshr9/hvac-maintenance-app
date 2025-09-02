// JobsList.jsx - Complete version with Timer Integration
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';

// Components
import JobGrid from './JobGrid';
import JobStats from './JobStats';
import JobFilters from './JobFilters';
import JobDetailView from './JobDetailView';
import CreateJobModal from './CreateJobModal';
import EditJobModal from './EditJobModal';
import LateJobsPage from './LateJobsPage';

const JobsList = ({ 
  onJobCreated, 
  globalJobsData, 
  onDataRefresh 
}) => {
  // Core state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [showLateJobsPage, setShowLateJobsPage] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsResponse, propertiesResponse, statsResponse] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/properties'),
        fetch('/api/jobs/stats')
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const jobsList = Array.isArray(jobsData) ? jobsData : jobsData.jobs || [];
        setJobs(jobsList);
        setFilteredJobs(jobsList);
      } else {
        throw new Error('Failed to load jobs');
      }

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time job creation handler
  const handleJobCreated = useCallback((newJob) => {
    console.log('✅ New job created:', newJob);
    setJobs(prevJobs => [newJob, ...prevJobs]);
    applyFilters([newJob, ...jobs]);
    loadStats();
  }, [jobs]);

  // Separate stats loading for efficiency
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  // Data refresh callback for external triggers
  const handleDataRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // ✅ NEW: Handle timer updates
  const handleTimerUpdate = useCallback((action, jobId, timerData = null) => {
    console.log(`Timer ${action} for job ${jobId}`, timerData);
    
    // Refresh jobs data to get updated status
    loadData();
    
    // Show notification based on action
    if (action === 'start') {
      console.log('✅ Timer started successfully');
      // Optional: Show toast notification
    } else if (action === 'stop') {
      const minutes = timerData?.totalMinutes || 0;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const timeString = hours > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${remainingMinutes}m`;
      console.log(`⏹️ Timer stopped. Total time: ${timeString}`);
      // Optional: Show toast notification with time worked
    }
  }, [loadData]);

  // Filter application with proper late jobs handling
  const applyFilters = useCallback((jobsList = jobs) => {
    let filtered = [...jobsList];

    if (statusFilter !== 'all') {
      if (statusFilter === 'late') {
        // Proper late jobs filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(job => {
          const scheduledDate = new Date(job.scheduledDate);
          const isOverdue = scheduledDate < today;
          const isActiveStatus = ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS'].includes(job.status);
          return isOverdue && isActiveStatus;
        });
      } else {
        filtered = filtered.filter(job => job.status === statusFilter);
      }
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(job => job.priority === priorityFilter);
    }

    if (technicianFilter !== 'all') {
      filtered = filtered.filter(job => job.assignedTechnician === technicianFilter);
    }

    if (propertyFilter !== 'all') {
      filtered = filtered.filter(job => job.property?.id.toString() === propertyFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(search) ||
        job.jobNumber?.toLowerCase().includes(search) ||
        job.property?.name?.toLowerCase().includes(search) ||
        job.assignedTechnician?.toLowerCase().includes(search)
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, statusFilter, priorityFilter, technicianFilter, propertyFilter, searchTerm]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modal handlers
  const handleCreateJobClick = () => setShowCreateJob(true);
  const handleCloseCreateJob = () => setShowCreateJob(false);

  // Job view handler
  const handleJobView = (job) => {
    console.log('👁️ Opening job detail modal for:', job.jobNumber);
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  // Job edit handler - opens JobDetailView (FIXED)
  const handleJobEdit = (job) => {
    console.log('✏️ Opening job detail view for edit:', job.jobNumber);
    setSelectedJob(job);
    setShowJobDetail(true);  // ← FIXED: Opens JobDetailView instead of EditJobModal
  };

  // Job update handler for EditJobModal
  const handleJobUpdate = async (jobId, updateData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedJob = await response.json();
        
        // Update jobs list
        setJobs(prevJobs => 
          prevJobs.map(job => job.id === jobId ? updatedJob : job)
        );
        
        // Re-apply filters
        applyFilters();
        
        // Update stats
        loadStats();
        
        // Update selected job if it's currently selected
        if (selectedJob?.id === jobId) {
          setSelectedJob(updatedJob);
        }
        
        return updatedJob;
      } else {
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error; // Re-throw for EditJobModal to handle
    }
  };

  const handleJobDelete = async (job) => {
    if (window.confirm(`Are you sure you want to delete job ${job.jobNumber}?`)) {
      try {
        const response = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
        if (response.ok) {
          setJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
          loadStats();
          
          // Close modals if this job was selected
          if (selectedJob?.id === job.id) {
            setShowJobDetail(false);
            setShowEditJob(false);
            setSelectedJob(null);
          }
        } else {
          throw new Error('Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const handleStatusUpdate = async (jobId, updates) => {
    try {
      await handleJobUpdate(jobId, updates);
    } catch (error) {
      alert('Failed to update job status. Please try again.');
    }
  };

  const handleJobDuplicate = async (job) => {
    try {
      const duplicateData = {
        ...job,
        id: undefined,
        jobNumber: undefined,
        title: `${job.title} (Copy)`,
        status: 'SCHEDULED',
        createdAt: undefined,
        updatedAt: undefined
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        const newJob = await response.json();
        handleJobCreated(newJob);
      } else {
        throw new Error('Failed to duplicate job');
      }
    } catch (error) {
      console.error('Error duplicating job:', error);
      alert('Failed to duplicate job. Please try again.');
    }
  };

  const handleReschedule = (job) => {
    // Implementation for reschedule functionality
    console.log('Reschedule job:', job.jobNumber);
    handleJobEdit(job); // For now, open edit modal
  };

  const handleAssignTechnician = (job) => {
    // Implementation for assign technician functionality
    console.log('Assign technician to job:', job.jobNumber);
    handleJobEdit(job); // For now, open edit modal
  };

  // Late jobs handlers
  const handleLateJobsClick = () => {
    setStatusFilter('late');
  };

  const handleViewLateJobs = () => {
    setShowLateJobsPage(true);
  };

  // Determine if filters are active
  const hasFilters = statusFilter !== 'all' || priorityFilter !== 'all' || 
                     technicianFilter !== 'all' || propertyFilter !== 'all' || 
                     searchTerm !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all maintenance jobs</p>
          </div>
          <button 
            onClick={handleCreateJobClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>

        {/* Stats Component - Now uses API data with late jobs */}
        <JobStats 
          stats={stats} 
          showRecurring={true}
          showAlert={true}
          onLateJobsClick={handleLateJobsClick}
          onViewLateJobs={handleViewLateJobs}
        />

        {/* Filters Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6">
          <JobFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            technicianFilter={technicianFilter}
            propertyFilter={propertyFilter}
            searchTerm={searchTerm}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onTechnicianChange={setTechnicianFilter}
            onPropertyChange={setPropertyFilter}
            onSearchChange={setSearchTerm}
            jobs={jobs}
            properties={properties}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <JobGrid
            jobs={filteredJobs}
            onView={handleJobView}
            onEdit={handleJobEdit}
            onDelete={handleJobDelete}
            onDuplicate={handleJobDuplicate}
            onReschedule={handleReschedule}
            onAssignTechnician={handleAssignTechnician}
            onStatusUpdate={handleStatusUpdate}
            onTimerUpdate={handleTimerUpdate} // ✅ NEW: Timer handler
            hasFilters={hasFilters}
          />
        </div>
      </div>

      {/* MODALS */}
      
      {/* Job Detail Modal */}
    {/* Job Detail Modal */}
{showJobDetail && selectedJob && (
  <div style={{
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    overflow: 'auto'
  }}>
    <JobDetailView
      job={selectedJob}
      onClose={() => {
        console.log('🚪 Closing job detail view');
        setShowJobDetail(false);
        setSelectedJob(null);
      }}
      onUpdate={(updatedJob) => {
        console.log('✅ Job updated from detail view:', updatedJob);
        handleDataRefresh();
        setSelectedJob(updatedJob);
      }}
    />
  </div>
)}

      {/* Edit Job Modal */}
      {showEditJob && selectedJob && (
        <EditJobModal
          job={selectedJob}
          isOpen={showEditJob}
          onClose={() => {
            console.log('🚪 Closing edit job modal');
            setShowEditJob(false);
            setSelectedJob(null);
          }}
          onJobUpdated={(updatedJob) => {
            console.log('✅ Job updated successfully:', updatedJob);
            setShowEditJob(false);
            setSelectedJob(null);
          }}
          onJobUpdate={handleJobUpdate}
          allProperties={properties}
        />
      )}

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateJob}
        onClose={handleCloseCreateJob}
        allProperties={properties}
        onJobCreated={handleJobCreated}
        onDataRefresh={handleDataRefresh}
      />

      {/* Late Jobs Page */}
      {showLateJobsPage && (
        <LateJobsPage onBack={() => setShowLateJobsPage(false)} />
      )}
    </div>
  );
};

export default JobsList;
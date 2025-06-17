// components/jobs/JobsList.jsx - Corrected Complete File
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

// Import components from the same jobs folder
import JobStats from './JobStats';
import JobFilters from './JobFilters';
import JobGrid from './JobGrid';
import JobDetailView from './JobDetailView';  // Using JobDetailView for full-page edit functionality
import CreateJobModal from './CreateJobModal';

const JobsList = ({ onNavigate, onOpenModal, initialSearchQuery = '' }) => {
  // State management
  const [jobs, setJobs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  // Update search query when prop changes
  useEffect(() => {
    if (initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [jobsRes, propertiesRes, statsRes] = await Promise.all([
          fetch('/api/jobs').catch(() => ({ json: () => [] })),
          fetch('/api/properties').catch(() => ({ json: () => [] })),
          fetch('/api/jobs/dashboard/stats').catch(() => ({ json: () => ({}) }))
        ]);

        const jobsData = await jobsRes.json();
        const propertiesData = await propertiesRes.json();
        const statsData = await statsRes.json();

        const jobsArray = jobsData.jobs || jobsData;
        
        setJobs(Array.isArray(jobsArray) ? jobsArray : []);
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
        setStats(statsData || {});

      } catch (error) {
        console.error('Error loading jobs data:', error);
        setJobs([]);
        setProperties([]);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Event handlers
  const handleJobCreated = (newJob) => {
    setJobs(prevJobs => [newJob, ...prevJobs]);
    setStats(prevStats => ({
      ...prevStats,
      totalJobs: (prevStats.totalJobs || 0) + 1,
      scheduledJobs: (prevStats.scheduledJobs || 0) + 1
    }));
    setShowCreateJobModal(false);
  };

  const handleCreateJobClick = () => {
    setShowCreateJobModal(true);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  // Job update handler - updates both jobs list and selected job
  const handleJobUpdate = (updatedJob) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    setSelectedJob(updatedJob); // Keep selected job in sync
  };

  const handleCloseJobDetail = () => {
    setShowJobDetail(false);
    setSelectedJob(null);
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(newStatus === 'IN_PROGRESS' && { startedAt: new Date().toISOString() }),
          ...(newStatus === 'COMPLETED' && { completedAt: new Date().toISOString() })
        }),
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? updatedJob : job));
        // If this job is currently selected, update it too
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob(updatedJob);
        }
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status');
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.workType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || job.propertyId === parseInt(propertyFilter);
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || propertyFilter !== 'all';

  // If showing job detail view, render that as a full page replacement
  if (showJobDetail && selectedJob) {
    return (
      <JobDetailView 
        job={selectedJob}
        onClose={handleCloseJobDetail}
        onUpdate={handleJobUpdate}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-2">
              Manage all work orders and service jobs across your properties
            </p>
          </div>
          
          {/* Page-level Create Job Button */}
          <button
            onClick={handleCreateJobClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg"
            style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)', boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'}}
            type="button"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>

        {/* Stats Component */}
         <JobStats stats={stats} />

        {/* Filters Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6">
          <JobFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            propertyFilter={propertyFilter}
            setPropertyFilter={setPropertyFilter}
            properties={properties}
            filteredJobsCount={filteredJobs.length}
            totalJobsCount={jobs.length}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Jobs Grid Component */}
        <JobGrid
          jobs={filteredJobs}
          onView={handleViewJob}
          onStatusUpdate={handleStatusUpdate}
          hasFilters={hasActiveFilters}
        />

        {/* Create Job Modal */}
        <CreateJobModal
          isOpen={showCreateJobModal}
          onClose={() => setShowCreateJobModal(false)}
          allProperties={properties}
          onJobCreated={handleJobCreated}
        />
      </div>
    </div>
  );
};

export default JobsList;
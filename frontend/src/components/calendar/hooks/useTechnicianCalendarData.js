// hooks/useTechnicianCalendarData.js - Personal Data Only
import { useState, useEffect, useMemo } from 'react';

export const useTechnicianCalendarData = (technicianId, jobsRefreshTrigger = 0) => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load only technician's jobs
  useEffect(() => {
    loadMyJobs();
  }, [technicianId, jobsRefreshTrigger]);

  const loadMyJobs = async () => {
    if (!technicianId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch only jobs assigned to this technician
      const response = await fetch(`/api/technicians/${technicianId}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const jobsData = await response.json();
      setMyJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error('Error loading technician jobs:', err);
      setError(err.message);
      setMyJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate personal stats
  const myStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

    const todayJobs = myJobs.filter(job => job.scheduledDate === today);
    const thisWeekJobs = myJobs.filter(job => job.scheduledDate >= thisWeekStartStr);
    
    return {
      total: myJobs.length,
      today: todayJobs.length,
      thisWeek: thisWeekJobs.length,
      urgent: myJobs.filter(job => job.priority === 'URGENT').length,
      high: myJobs.filter(job => job.priority === 'HIGH').length,
      completed: myJobs.filter(job => job.status === 'COMPLETED').length,
      inProgress: myJobs.filter(job => job.status === 'IN_PROGRESS').length,
      scheduled: myJobs.filter(job => job.status === 'SCHEDULED').length,
      // This week's completed jobs
      completedThisWeek: thisWeekJobs.filter(job => job.status === 'COMPLETED').length
    };
  }, [myJobs]);

  // Refresh function
  const refreshJobs = async () => {
    await loadMyJobs();
  };

  // Update job status (technicians can do this)
  const updateJobStatus = async (jobId, newStatus, notes = '') => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus, 
          notes,
          updatedBy: technicianId,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to update job status');
      
      const updatedJob = await response.json();
      
      // Update local state
      setMyJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, ...updatedJob } : job
        )
      );
      
      return updatedJob;
    } catch (err) {
      console.error('Error updating job status:', err);
      throw err;
    }
  };

  return {
    myJobs,
    myStats,
    loading,
    error,
    refreshJobs,
    updateJobStatus
  };
};


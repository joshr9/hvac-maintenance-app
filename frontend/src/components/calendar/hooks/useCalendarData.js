// hooks/useCalendarData.js - Data Management Hook
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchJobs, 
  fetchTeamMembers, 
  transformJobToCalendarEvent 
} from '../calendarHelpers';

export const useCalendarData = (jobsRefreshTrigger = 0) => {
  // Data state
  const [allJobs, setAllJobs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [jobsRefreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, teamData] = await Promise.all([
        fetchJobs(),
        fetchTeamMembers()
      ]);
      
      setAllJobs(Array.isArray(jobsData) ? jobsData : []);
      setTeamMembers(Array.isArray(teamData) ? teamData : []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setAllJobs([]);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function for external use
  const refreshJobs = useCallback(async () => {
    try {
      const jobsData = await fetchJobs();
      setAllJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  }, []);

  // Separate scheduled and unscheduled jobs
  const { scheduledJobs, unscheduledJobs } = useMemo(() => {
    const scheduled = allJobs.filter(job => job.scheduledDate);
    const unscheduled = allJobs.filter(job => !job.scheduledDate);
    
    return {
      scheduledJobs: scheduled,
      unscheduledJobs: unscheduled
    };
  }, [allJobs]);

  // Calculate job statistics
  const jobStats = useMemo(() => {
    return {
      total: scheduledJobs.length,
      urgent: scheduledJobs.filter(job => job.priority === 'URGENT').length,
      high: scheduledJobs.filter(job => job.priority === 'HIGH').length,
      medium: scheduledJobs.filter(job => job.priority === 'MEDIUM').length,
      low: scheduledJobs.filter(job => job.priority === 'LOW').length,
      unscheduled: unscheduledJobs.length,
      technicians: new Set(
        scheduledJobs
          .map(job => job.assignedTechnician)
          .filter(Boolean)
      ).size
    };
  }, [scheduledJobs, unscheduledJobs]);

  // Group jobs by day for calendar rendering
  const jobsByDay = useMemo(() => {
    return scheduledJobs.reduce((acc, job) => {
      const dayKey = job.scheduledDate;
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(job);
      return acc;
    }, {});
  }, [scheduledJobs]);

  // Transform jobs to calendar events
  const calendarEvents = useMemo(() => {
    return scheduledJobs
      .map(job => transformJobToCalendarEvent(job, jobsByDay[job.scheduledDate] || []))
      .filter(Boolean);
  }, [scheduledJobs, jobsByDay]);

  // Add job function for external use
  const addJob = useCallback((newJob) => {
    setAllJobs(prevJobs => [newJob, ...prevJobs]);
  }, []);

  // Update job function for external use
  const updateJob = useCallback((jobId, updatedJob) => {
    setAllJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, ...updatedJob } : job
      )
    );
  }, []);

  // Remove job function for external use
  const removeJob = useCallback((jobId) => {
    setAllJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  }, []);

  return {
    // Data
    allJobs,
    teamMembers,
    loading,
    
    // Computed data
    scheduledJobs,
    unscheduledJobs,
    jobStats,
    jobsByDay,
    calendarEvents,
    
    // Functions
    refreshJobs,
    addJob,
    updateJob,
    removeJob,
    setAllJobs
  };
};

// hooks/useTechnicianHandlers.js - Personal Action Handlers
import { useCallback } from 'react';

export const useTechnicianHandlers = ({
  currentView,
  currentDate,
  setCurrentDate,
  setDayOverviewModal,
  setQuickJobModal,
  setStatusUpdateModal,
  updateJobStatus,
  refreshJobs
}) => {

  // Navigation handlers
  const navigateDate = useCallback((direction) => {
    const newDate = new Date(currentDate);
    
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    
    if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  }, [currentDate, currentView, setCurrentDate]);

  // Job interaction handlers
  const handleSelectEvent = useCallback((event) => {
    setQuickJobModal({
      isOpen: true,
      selectedJob: event.job
    });
  }, [setQuickJobModal]);

  const handleViewMoreJobs = useCallback((dayJobs) => {
    setDayOverviewModal({
      isOpen: true,
      jobs: dayJobs,
      date: dayJobs[0]?.scheduledDate
    });
  }, [setDayOverviewModal]);

  // Job status handlers
  const handleStartJob = useCallback(async (job) => {
    try {
      await updateJobStatus(job.id, 'IN_PROGRESS', 'Job started by technician');
      await refreshJobs();
    } catch (error) {
      console.error('Error starting job:', error);
      alert('Failed to start job. Please try again.');
    }
  }, [updateJobStatus, refreshJobs]);

  const handleCompleteJob = useCallback(async (job, notes = '') => {
    try {
      await updateJobStatus(job.id, 'COMPLETED', notes || 'Job completed by technician');
      await refreshJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
    }
  }, [updateJobStatus, refreshJobs]);

  const handleUpdateJobStatus = useCallback(async (job, newStatus, notes = '') => {
    try {
      await updateJobStatus(job.id, newStatus, notes);
      await refreshJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  }, [updateJobStatus, refreshJobs]);

  // Modal close handlers
  const closeDayOverview = useCallback(() => {
    setDayOverviewModal({ isOpen: false, jobs: [], date: null });
  }, [setDayOverviewModal]);

  const closeQuickJobModal = useCallback(() => {
    setQuickJobModal({ isOpen: false, selectedJob: null });
  }, [setQuickJobModal]);

  const closeStatusUpdateModal = useCallback(() => {
    setStatusUpdateModal({ isOpen: false, job: null });
  }, [setStatusUpdateModal]);

  return {
    // Navigation
    navigateDate,

    // Job interactions
    handleSelectEvent,
    handleViewMoreJobs,

    // Job status management
    handleStartJob,
    handleCompleteJob,
    handleUpdateJobStatus,

    // Modal handlers
    closeDayOverview,
    closeQuickJobModal,
    closeStatusUpdateModal
  };
};
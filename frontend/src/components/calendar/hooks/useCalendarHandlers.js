// hooks/useCalendarHandlers.js - Event Handlers Hook
import { useCallback } from 'react';
import { createJob as apiCreateJob, updateJob as apiUpdateJob } from '../calendarHelpers';

export const useCalendarHandlers = ({
  currentView,
  currentDate,
  setCurrentDate,
  setDayOverviewModal,
  setScheduleTypeModal,
  setScheduleModal,
  setQuickJobModal,
  scheduleTypeModal,
  activeFilters,
  setActiveFilters,
  allJobs,
  refreshJobs,
  onJobCreated
}) => {

  // Date navigation handlers
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
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  }, [currentDate, currentView, setCurrentDate]);

  // Date formatting
  const formatDateRange = useCallback(() => {
    if (currentView === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (currentView === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  }, [currentDate, currentView]);

  // Calendar event handlers
  const handleSelectSlot = useCallback((slotInfo) => {
    const selectedDate = slotInfo.start;
    const selectedTime = selectedDate.toTimeString().slice(0, 5);
    
    setScheduleTypeModal({
      isOpen: true,
      selectedDate: selectedDate.toISOString().split('T')[0],
      selectedTime: selectedTime,
      selectedSlot: slotInfo
    });
  }, [setScheduleTypeModal]);

const handleSelectEvent = useCallback((event) => {
  const job = event.job || event;
  console.log('🖱️ Job clicked for edit:', job);
  
  setScheduleModal({
    isOpen: true,
    type: 'edit_job',
    job: job,
    editMode: true,
    initialDate: job.scheduledDate || new Date().toISOString().split('T')[0],
    initialTime: job.scheduledTime || '09:00'
  });
}, [setScheduleModal]);


  // Job scheduling handlers
  const handleScheduleJob = useCallback(async (job) => {
    console.log('Schedule job:', job);
    // Implementation for scheduling unscheduled jobs
  }, []);

  const handleViewMoreJobs = useCallback((dayJobs) => {
    setDayOverviewModal({
      isOpen: true,
      jobs: dayJobs,
      date: dayJobs[0]?.scheduledDate
    });
  }, [setDayOverviewModal]);

  const handleScheduleTypeSelect = useCallback((type) => {
    setScheduleTypeModal(prev => ({ ...prev, isOpen: false }));
    setScheduleModal({
      isOpen: true,
      type: type,
      initialDate: scheduleTypeModal.selectedDate,
      initialTime: scheduleTypeModal.selectedTime
    });
  }, [setScheduleTypeModal, setScheduleModal, scheduleTypeModal]);

  const handleScheduleComplete = useCallback(async (scheduleData) => {
    try {
      const newJob = await apiCreateJob({
        title: scheduleData.title,
        description: scheduleData.description,
        workType: scheduleData.workType || 'MAINTENANCE',
        priority: scheduleData.priority || 'MEDIUM',
        status: 'SCHEDULED',
        scheduledDate: scheduleData.scheduledDate,
        scheduledTime: scheduleData.scheduledTime,
        estimatedDuration: scheduleData.estimatedDuration || 120,
        propertyId: scheduleData.propertyId,
        suiteId: scheduleData.suiteId,
        hvacUnitId: scheduleData.hvacUnitId,
        assignedTechnician: scheduleData.assignedTechnician,
      });

      await refreshJobs(); // Refresh the jobs list
      
      setScheduleModal({
        isOpen: false,
        type: null,
        initialDate: null,
        initialTime: null
      });

      if (onJobCreated) {
        onJobCreated(newJob);
      }
      
      console.log('Job created successfully:', newJob);
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job. Please try again.');
    }
  }, [refreshJobs, setScheduleModal, onJobCreated]);

  // Job management handlers
  const handleJobEdit = useCallback((job) => {
  console.log('✏️ Edit job:', job);
  setScheduleModal({
    isOpen: true,
    type: 'edit_job',
    job: job,
    initialDate: job.scheduledDate || new Date().toISOString().split('T')[0],
    initialTime: job.scheduledTime || '09:00'
  });
}, [setScheduleModal]);
  const handleJobViewDetails = useCallback((job) => {
    console.log('View job details:', job);
    // Implementation for viewing job details
  }, []);

  const handleJobUpdate = useCallback(async (jobId, updatedData) => {
    try {
      const updatedJob = await apiUpdateJob(jobId, updatedData);
      await refreshJobs(); // Refresh the jobs list
      console.log('Job updated successfully:', updatedJob);
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job. Please try again.');
    }
  }, [refreshJobs]);

  // Filter handlers
  const toggleFilter = useCallback((filterType) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  }, [setActiveFilters]);

  // Modal close handlers
  const closeModals = {
    closeDayOverview: useCallback(() => {
      setDayOverviewModal({ isOpen: false, jobs: [], date: null });
    }, [setDayOverviewModal]),

    closeScheduleTypeModal: useCallback(() => {
      setScheduleTypeModal({
        isOpen: false,
        selectedDate: null,
        selectedTime: null,
        selectedSlot: null
      });
    }, [setScheduleTypeModal]),

    closeScheduleModal: useCallback(() => {
      setScheduleModal({
        isOpen: false,
        type: null,
        initialDate: null,
        initialTime: null
      });
    }, [setScheduleModal]),

    closeQuickJobModal: useCallback(() => {
      setQuickJobModal({ isOpen: false, selectedJob: null });
    }, [setQuickJobModal])
  };

  return {
    // Navigation handlers
    navigateDate,
    formatDateRange,

    // Calendar event handlers
    handleSelectSlot,
    handleSelectEvent,
    
    // Job handlers
    handleScheduleJob,
    handleViewMoreJobs,
    handleScheduleTypeSelect,
    handleScheduleComplete,
    handleJobEdit,
    handleJobViewDetails,
    handleJobUpdate,

    // Filter handlers
    toggleFilter,

    // Modal handlers
    closeModals
  };
};
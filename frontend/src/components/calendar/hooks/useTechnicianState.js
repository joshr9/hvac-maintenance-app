// components/calendar/hooks/useTechnicianState.js - Simplified State Management for Technicians
import { useState } from 'react';

export const useTechnicianState = () => {
  // View state (simplified for technicians)
  const [currentView, setCurrentView] = useState('week'); // default to week view
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal state (limited modals for technicians)
  const [dayOverviewModal, setDayOverviewModal] = useState({
    isOpen: false,
    date: null,
    jobs: []
  });
  
  const [quickJobModal, setQuickJobModal] = useState({
    isOpen: false,
    job: null
  });

  // Navigation helpers
  const navigateDate = (action) => {
    const newDate = new Date(currentDate);
    
    switch (action) {
      case 'prev':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'next':
        if (currentView === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (currentView === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'today':
        newDate.setTime(new Date().getTime());
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Modal helpers
  const openDayOverview = (date, jobs) => {
    setDayOverviewModal({
      isOpen: true,
      date,
      jobs
    });
  };

  const closeDayOverview = () => {
    setDayOverviewModal({
      isOpen: false,
      date: null,
      jobs: []
    });
  };

  const openQuickJob = (job) => {
    setQuickJobModal({
      isOpen: true,
      job
    });
  };

  const closeQuickJob = () => {
    setQuickJobModal({
      isOpen: false,
      job: null
    });
  };

  return {
    // View state
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    navigateDate,
    
    // Modal state
    dayOverviewModal,
    setDayOverviewModal,
    quickJobModal,
    setQuickJobModal,
    
    // Modal helpers
    openDayOverview,
    closeDayOverview,
    openQuickJob,
    closeQuickJob
  };
};
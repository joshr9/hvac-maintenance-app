// hooks/useCalendarState.js - UI State Management Hook
import { useState } from 'react';

export const useCalendarState = () => {
  // Calendar view state
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarViewType, setCalendarViewType] = useState('combined'); // team, zone, combined

  // Filter state
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterTeamMember, setFilterTeamMember] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    urgent: true,
    high: true,
    medium: true,
    low: true
  });

  // Modal state
  const [dayOverviewModal, setDayOverviewModal] = useState({
    isOpen: false,
    jobs: [],
    date: null
  });

  const [scheduleTypeModal, setScheduleTypeModal] = useState({
    isOpen: false,
    selectedDate: null,
    selectedTime: null,
    selectedSlot: null
  });

  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    type: null,
    initialDate: null,
    initialTime: null
  });

  const [quickJobModal, setQuickJobModal] = useState({
    isOpen: false,
    selectedJob: null
  });

  // Additional UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUnscheduled, setShowUnscheduled] = useState(true);

  return {
    // Calendar view state
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    calendarViewType,
    setCalendarViewType,

    // Filter state
    filterProperty,
    setFilterProperty,
    filterTeamMember,
    setFilterTeamMember,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,

    // Modal state
    dayOverviewModal,
    setDayOverviewModal,
    scheduleTypeModal,
    setScheduleTypeModal,
    scheduleModal,
    setScheduleModal,
    quickJobModal,
    setQuickJobModal,

    // Additional UI state
    sidebarCollapsed,
    setSidebarCollapsed,
    showUnscheduled,
    setShowUnscheduled
  };
};
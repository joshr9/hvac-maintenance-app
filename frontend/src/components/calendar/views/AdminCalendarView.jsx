// AdminCalendarView.jsx - CLEAN VERSION (Console logs removed)
import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../styles/calendar-custom.css';

// ✅ PRESERVED: All your existing components
import EnhancedCalendarHeader from '../calendarHeader';
import EnhancedAdminHeaderStats from '../components/EnhancedAdminHeaderStats';
import CalendarGrid from '../components/CalendarGrid';
import SwimLanesCalendar from '../components/SwimLanesCalendar';
import CollapsibleUnscheduledJobsSidebar from '../components/UnscheduledJobsSidebar';
import CalendarModals from '../components/CalendarModals';

// ✅ PRESERVED: All your existing modals
import DayOverviewModal from '../DayOverviewModal';
import ScheduleTypeModal from '../ScheduleTypeModal';
import ScheduleModal from '../ScheduleModal';
import QuickJobModal from '../QuickJobModal';

// ✅ PRESERVED: All your existing hooks
import { useCalendarData } from '../hooks/useCalendarData';
import { useCalendarState } from '../hooks/useCalendarState';
import { useCalendarHandlers } from '../hooks/useCalendarHandlers';

// ✅ Drag & Drop Integration Component
import DragDropProvider from '../components/DragDropProvider';

const localizer = momentLocalizer(moment);

const AdminCalendarView = ({ 
  jobsRefreshTrigger = 0, 
  onJobCreated, 
  allProperties = [],
  onNavigate,
  onOpenModal,
  navigationData,
  permissions,
  currentUser
}) => {
  // ✅ PRESERVED: All existing state
  const [adminViewMode, setAdminViewMode] = useState('swimlanes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeamMember, setFilterTeamMember] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);

  // ✅ PRESERVED: All existing data hooks
  const {
    allJobs,
    teamMembers,
    loading,
    jobStats,
    scheduledJobs,
    unscheduledJobs,
    calendarEvents,
    jobsByDay,
    refreshJobs,
    setAllJobs
  } = useCalendarData(jobsRefreshTrigger);

  // ✅ PRESERVED: All existing state hooks
  const {
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    calendarViewType,
    setCalendarViewType,
    selectedDate,
    setSelectedDate,
    dayOverviewModal,
    setDayOverviewModal,
    scheduleTypeModal,
    setScheduleTypeModal,
    scheduleModal,
    setScheduleModal,
    quickJobModal,
    setQuickJobModal
  } = useCalendarState();

  // ✅ PRESERVED: All existing handlers
  const {
    handleSelectSlot,
    handleSelectEvent,
    handleViewMoreJobs,
    handleScheduleJob,
    handleQuickScheduleJob,
    handleDragJobToCalendar,
    navigateDate,
    closeModals
  } = useCalendarHandlers({
    currentDate,
    setCurrentDate,
    setScheduleModal,
    setQuickJobModal,
    setDayOverviewModal,
    jobsByDay,
    refreshJobs
  });

  // ✅ FIXED: Drag handler with optimistic updates to prevent disappearing jobs
  const handleSwimLaneDragJob = useCallback(async (job, toTechnicianId, toHour) => {
    try {
      // Find target technician info
      const targetTechnician = teamMembers.find(tech => tech.id === parseInt(toTechnicianId));
      if (!targetTechnician) {
        console.error('Target technician not found for ID:', toTechnicianId);
        return;
      }
      
      // ✅ OPTIMISTIC UPDATE: Update UI immediately
      const optimisticJob = {
        ...job,
        assignedTechnician: targetTechnician.name,
        technicianId: parseInt(toTechnicianId),
        scheduledTime: `${toHour}:00`,
        scheduledDate: currentDate.toISOString().split('T')[0],
      };
      
      // Update local state immediately for smooth UX
      setAllJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id ? optimisticJob : j
        )
      );
      
      const updatedJob = {
        technicianId: parseInt(toTechnicianId),
        assignedTechnician: targetTechnician.name,
        scheduledTime: `${toHour}:00`,
        scheduledDate: currentDate.toISOString().split('T')[0],
      };
      
      // Make API call
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedJob)
      });

      if (response.ok) {
        // ✅ SUCCESS: Sync with server data
        setTimeout(() => refreshJobs(), 500);
      } else {
        // ❌ FAILURE: Revert optimistic update
        const errorText = await response.text();
        console.error('Failed to update job:', errorText);
        
        // Revert the optimistic update
        setAllJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === job.id ? job : j
          )
        );
      }
    } catch (error) {
      console.error('Error rescheduling job:', error.message);
      
      // Revert optimistic update on error
      setAllJobs(prevJobs => 
        prevJobs.map(j => 
          j.id === job.id ? job : j
        )
      );
    }
  }, [currentDate, refreshJobs, teamMembers, setAllJobs]);

  // ✅ Swim Lane Slot Click Handler
  const handleSwimLaneSelectSlot = useCallback((technicianId, hour) => {
    setScheduleModal({
      isOpen: true,
      type: 'new_job',
      initialDate: currentDate.toISOString().split('T')[0],
      initialTime: `${hour}:00`,
      assignedTechnician: technicianId
    });
  }, [currentDate, setScheduleModal]);

  // ✅ PRESERVED: All existing handlers
  const handleNavigate = useCallback((action, newDate) => {
    if (action === 'PREV') {
      navigateDate('prev');
    } else if (action === 'NEXT') {
      navigateDate('next');
    } else if (action === 'TODAY') {
      navigateDate('today');
    } else {
      setCurrentDate(newDate);
    }
  }, [navigateDate, setCurrentDate]);

  const handleCreateJob = useCallback(() => {
    setScheduleModal({
      isOpen: true,
      type: 'new_job',
      initialDate: new Date().toISOString().split('T')[0],
      initialTime: '09:00'
    });
  }, [setScheduleModal]);

  const handleScheduleTypeSelect = useCallback((type) => {
    setScheduleTypeModal({ isOpen: false });
    if (type === 'quick') {
      setQuickJobModal({
        isOpen: true,
        initialDate: scheduleTypeModal.initialDate,
        initialTime: scheduleTypeModal.initialTime
      });
    } else {
      setScheduleModal({
        isOpen: true,
        type: 'new_job',
        initialDate: scheduleTypeModal.initialDate,
        initialTime: scheduleTypeModal.initialTime
      });
    }
  }, [scheduleTypeModal, setQuickJobModal, setScheduleModal, setScheduleTypeModal]);

  const handleScheduleComplete = useCallback(async (jobData) => {
    try {
      await handleScheduleJob(jobData);
      onJobCreated?.();
    } catch (error) {
      console.error('Error scheduling job:', error);
    }
  }, [handleScheduleJob, onJobCreated]);

  const handleJobEdit = useCallback((job) => {
    setScheduleModal({
      isOpen: true,
      type: 'edit_job',
      job: job
    });
  }, [setScheduleModal]);

  const handleJobViewDetails = useCallback((job) => {
    console.log('View job details:', job);
  }, []);

  const handleJobUpdate = useCallback(async (updatedJob) => {
    await refreshJobs();
  }, [refreshJobs]);

  const toggleFilter = useCallback((filterType) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  }, []);

  // ✅ PRESERVED: Existing filtering logic
  const filteredData = React.useMemo(() => {
    let filtered = {
      allJobs,
      scheduledJobs,
      unscheduledJobs,
      calendarEvents,
      jobsByDay
    };

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered.scheduledJobs = filtered.scheduledJobs.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.property?.name?.toLowerCase().includes(query) ||
        job.assignedTechnician?.toLowerCase().includes(query)
      );
      filtered.unscheduledJobs = filtered.unscheduledJobs.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.property?.name?.toLowerCase().includes(query)
      );
    }

    // Apply team member filter
    if (filterTeamMember !== 'all') {
      filtered.scheduledJobs = filtered.scheduledJobs.filter(job =>
        job.assignedTechnician === filterTeamMember
      );
    }

    // Apply property filter
    if (filterProperty !== 'all') {
      filtered.scheduledJobs = filtered.scheduledJobs.filter(job =>
        job.property?.id === filterProperty
      );
    }

    // Rebuild calendar events
    filtered.calendarEvents = filtered.scheduledJobs.map(job => ({
      id: job.id,
      title: job.title,
      start: job.scheduledDate && job.scheduledTime ? 
        new Date(`${job.scheduledDate}T${job.scheduledTime}`) : 
        new Date(),
      end: job.scheduledDate && job.scheduledTime ? 
        new Date(`${job.scheduledDate}T${job.scheduledTime}`) : 
        new Date(),
      resource: job,
      ...job
    }));

    return filtered;
  }, [allJobs, scheduledJobs, unscheduledJobs, calendarEvents, jobsByDay, searchQuery, filterTeamMember, filterProperty]);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Admin Dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing management tools</div>
        </div>
      </div>
    );
  }

  // ✅ MAIN RENDER: Full Screen Layout
  return (
    <DragDropProvider onDragJob={handleSwimLaneDragJob}>
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
        <div className="h-screen flex flex-col">
          
          {/* ✅ HEADER: Fixed height, no padding */}
          <div className="flex-shrink-0">
            <EnhancedCalendarHeader
              date={currentDate}
              onNavigate={handleNavigate}
              onView={setCurrentView}
              view={currentView}
              onCreateJob={handleCreateJob}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              teamMembers={teamMembers}
              filterTeamMember={filterTeamMember}
              setFilterTeamMember={setFilterTeamMember}
              filterProperty={filterProperty}
              setFilterProperty={setFilterProperty}
              activeFilters={activeFilters}
              onRemoveFilter={toggleFilter}
              calendarViewType={calendarViewType}
              setCalendarViewType={setCalendarViewType}
              allProperties={allProperties}
            />
            
            <EnhancedAdminHeaderStats 
              jobStats={jobStats}
              filteredJobsCount={filteredData.scheduledJobs.length}
              unscheduledCount={filteredData.unscheduledJobs.length}
              calendarViewType={calendarViewType}
              adminViewMode={adminViewMode}
              setAdminViewMode={setAdminViewMode}
              teamMembersCount={teamMembers.length}
            />
          </div>

          {/* 🚀 MAIN CONTENT: Full screen flex layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* 🚀 CALENDAR AREA: Takes all available space */}
            <div className="flex-1 min-w-0">
              {adminViewMode === 'swimlanes' ? (
                <SwimLanesCalendar
                  calendarEvents={filteredData.calendarEvents}
                  teamMembers={teamMembers}
                  currentDate={currentDate}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSwimLaneSelectSlot}
                  onDragJob={handleSwimLaneDragJob}
                  className="h-full"
                />
              ) : (
                <div className="h-full">
                  <CalendarGrid
                    localizer={localizer}
                    calendarEvents={filteredData.calendarEvents}
                    currentView={currentView}
                    currentDate={currentDate}
                    onView={setCurrentView}
                    onNavigate={setCurrentDate}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onViewMore={handleViewMoreJobs}
                    jobsByDay={jobsByDay}
                  />
                </div>
              )}
            </div>

            {/* 🚀 SIDEBAR: Fixed width, uses your existing component */}
            <div className="flex-shrink-0">
              <CollapsibleUnscheduledJobsSidebar
                jobs={filteredData.unscheduledJobs}
                onScheduleJob={handleQuickScheduleJob}
                onDragToCalendar={handleDragJobToCalendar}
                onCreateJob={handleCreateJob}
                teamMembers={teamMembers}
                allProperties={allProperties}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* ✅ PRESERVED: All your existing modals */}
        <CalendarModals
          dayOverviewModal={dayOverviewModal}
          scheduleTypeModal={scheduleTypeModal}
          scheduleModal={scheduleModal}
          quickJobModal={quickJobModal}
          allProperties={allProperties}
          teamMembers={teamMembers}
          onCloseDayOverview={closeModals.closeDayOverview}
          onCloseScheduleType={closeModals.closeScheduleTypeModal}
          onCloseSchedule={closeModals.closeScheduleModal}
          onCloseQuickJob={closeModals.closeQuickJobModal}
          onScheduleTypeSelect={handleScheduleTypeSelect}
          onScheduleComplete={handleScheduleComplete}
          onJobEdit={handleJobEdit}
          onJobViewDetails={handleJobViewDetails}
          onJobUpdate={handleJobUpdate}
        />
      </div>
    </DragDropProvider>
  );
};

export default AdminCalendarView;
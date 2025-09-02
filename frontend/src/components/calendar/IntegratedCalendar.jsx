// Enhanced IntegratedCalendar.jsx - Complete Professional Design System
import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar-custom.css';

// Enhanced components
import PageWrapper from '../common/PageWrapper';
import EnhancedCalendarHeader from './calendarHeader'; // New enhanced header
import CompactHeaderStats from './components/CompactHeaderStats';
import CalendarGrid from './components/CalendarGrid';
import CollapsibleUnscheduledJobsSidebar from './components/UnscheduledJobsSidebar'; // New collapsible
import CalendarModals from './components/CalendarModals';

// Your existing modals (keep all of them)
import DayOverviewModal from './DayOverviewModal';
import ScheduleTypeModal from './ScheduleTypeModal';
import ScheduleModal from './ScheduleModal';
import QuickJobModal from './QuickJobModal';

// Custom hooks for clean architecture
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarState } from './hooks/useCalendarState';
import { useCalendarHandlers } from './hooks/useCalendarHandlers';

const localizer = momentLocalizer(moment);

const EnhancedIntegratedCalendar = ({ 
  jobsRefreshTrigger = 0, 
  onJobCreated, 
  allProperties = [] 
}) => {
  // Custom hooks - clean separation of concerns
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

  const {
    // View state
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
    
    // UI state
    showUnscheduled,
    setShowUnscheduled
  } = useCalendarState();

  const {
    handleSelectSlot,
    handleSelectEvent,
    handleScheduleJob,
    handleViewMoreJobs,
    handleScheduleTypeSelect,
    handleScheduleComplete,
    handleJobEdit,
    handleJobViewDetails,
    handleJobUpdate,
    navigateDate,
    toggleFilter,
    formatDateRange,
    closeModals,
    handleDragJobToCalendar,
    handleQuickScheduleJob
  } = useCalendarHandlers({
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
    onJobCreated,
    setAllJobs
  });

  // Enhanced filtering logic with zone/team view
  const filteredData = useMemo(() => {
    let filtered = scheduledJobs.filter(job => {
      // Standard filters
      const matchesProperty = filterProperty === 'all' || 
                              job.property?.name?.toLowerCase().includes(filterProperty.toLowerCase());
      const matchesTeamMember = filterTeamMember === 'all' || 
                               job.assignedTechnician?.toLowerCase().includes(filterTeamMember.toLowerCase());
      const matchesSearch = searchQuery === '' ||
                           job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.property?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = activeFilters[job.priority?.toLowerCase()] !== false;

      return matchesProperty && matchesTeamMember && matchesSearch && matchesPriority;
    });

    // Apply zone/team view filtering
    if (calendarViewType === 'team') {
      filtered = filtered.filter(job => job.assignedTechnician);
    } else if (calendarViewType === 'zone') {
      filtered = filtered.filter(job => job.property?.zone);
    }

    // Filter unscheduled jobs with same criteria
    const filteredUnscheduled = unscheduledJobs.filter(job => {
      const matchesProperty = filterProperty === 'all' || 
                              job.property?.name?.toLowerCase().includes(filterProperty.toLowerCase());
      const matchesSearch = searchQuery === '' ||
                           job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.property?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = activeFilters[job.priority?.toLowerCase()] !== false;
      
      return matchesProperty && matchesSearch && matchesPriority;
    });

    return {
      scheduledJobs: filtered,
      unscheduledJobs: filteredUnscheduled
    };
  }, [scheduledJobs, unscheduledJobs, calendarViewType, filterProperty, filterTeamMember, searchQuery, activeFilters]);

  // Calendar events from filtered data with enhanced transformation
  const filteredCalendarEvents = useMemo(() => {
    return filteredData.scheduledJobs
      .map(job => {
        const dayKey = job.scheduledDate;
        const dayJobs = filteredData.scheduledJobs.filter(j => j.scheduledDate === dayKey);
        
        const startTime = job.scheduledTime || '09:00';
        const duration = job.estimatedDuration || 120;
        
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const start = new Date(job.scheduledDate);
        start.setHours(startHour, startMinute, 0, 0);
        
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);

        return {
          id: job.id,
          title: job.title,
          start: start,
          end: end,
          job: job,
          dayJobs: dayJobs,
          resource: job,
          // Enhanced properties for styling
          priority: job.priority,
          status: job.status,
          workType: job.workType
        };
      })
      .filter(Boolean);
  }, [filteredData.scheduledJobs]);

  // Header navigation handler (compatible with enhanced header)
  const handleNavigate = (action, newDate) => {
    if (action === 'PREV') {
      navigateDate('prev');
    } else if (action === 'NEXT') {
      navigateDate('next');
    } else if (action === 'TODAY') {
      navigateDate('today');
    } else {
      setCurrentDate(newDate);
    }
  };

  // Create job handler
  const handleCreateJob = () => {
    setScheduleModal({
      isOpen: true,
      type: 'new_job',
      initialDate: new Date().toISOString().split('T')[0],
      initialTime: '09:00'
    });
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-semibold text-gray-700">Loading Calendar...</div>
            <div className="text-sm text-gray-500 mt-2">Preparing your workspace</div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="h-screen flex flex-col">
          
          {/* ENHANCED HEADER - Modern gradient design with visual filters */}
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
            
            {/* COMPACT STATS BADGES - Essential info only */}
            <CompactHeaderStats 
              jobStats={jobStats}
              filteredJobsCount={filteredData.scheduledJobs.length}
              unscheduledCount={filteredData.unscheduledJobs.length}
              calendarViewType={calendarViewType}
            />
          </div>

          {/* MAIN CONTENT AREA - Enhanced layout with proper spacing */}
          <div className="flex-1 flex gap-6 p-6 min-h-0">
            
            {/* HERO CALENDAR - Large, readable job cards */}
            <div className="flex-1 min-w-0">
              <CalendarGrid
                localizer={localizer}
                calendarEvents={filteredCalendarEvents}
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

            {/* COLLAPSIBLE UNSCHEDULED SIDEBAR - Manager's command center */}
            {(filteredData.unscheduledJobs.length > 0 || showUnscheduled) && (
              <div className="flex-shrink-0">
                <CollapsibleUnscheduledJobsSidebar
                  jobs={filteredData.unscheduledJobs}
                  onScheduleJob={handleQuickScheduleJob}
                  onDragToCalendar={handleDragJobToCalendar}
                  teamMembers={teamMembers}
                  allProperties={allProperties}
                />
              </div>
            )}
          </div>

          {/* MINIMAL FOOTER - Essential status only */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  {filteredCalendarEvents.length} events displayed
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Business hours: 8 AM - 6 PM
                </span>
                {filteredData.unscheduledJobs.length > 0 && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {filteredData.unscheduledJobs.length} unscheduled jobs
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span>Last updated: {new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
                <div className="flex items-center gap-2">
                  <span>Priority:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" title="Urgent"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full" title="High"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Medium"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Low"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALL MODALS - Centralized management with enhanced styling */}
          <CalendarModals
            dayOverviewModal={dayOverviewModal}
            scheduleTypeModal={scheduleTypeModal}
            scheduleModal={scheduleModal}
            quickJobModal={quickJobModal}
            allProperties={allProperties}
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
      </div>
    </PageWrapper>
  );
};

export default EnhancedIntegratedCalendar;
// TechnicianCalendarView.jsx - Huge Focused Calendar for Field Workers
import React, { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../styles/calendar-custom.css';

// Simplified components for technician view
import PageWrapper from '../../common/PageWrapper';
import TechnicianHeader from '../components/TechnicianHeader';
import LargeCalendarGrid from '../components/LargeCalendarGrid';

// Limited modals (technicians can view but not create/schedule)
import DayOverviewModal from '../DayOverviewModal';
import QuickJobModal from '../QuickJobModal';

// Simplified hooks for technician data
import { useTechnicianCalendarData } from '../hooks/useTechnicianCalendarData';
import { useTechnicianState } from '../hooks/useTechnicianState';

const localizer = momentLocalizer(moment);

const TechnicianCalendarView = ({ 
  jobsRefreshTrigger = 0, 
  onNavigate,           // App-level navigation  
  onOpenModal,          // App-level modal management
  navigationData,       // Navigation state/data
  currentUser,
  permissions = {}
}) => {
  // Technician-specific data (only their jobs)
  const {
    myJobs,
    loading,
    myStats,
    refreshJobs
  } = useTechnicianCalendarData(currentUser.id, jobsRefreshTrigger);

  // Simplified state management
  const {
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    dayOverviewModal,
    setDayOverviewModal,
    quickJobModal,
    setQuickJobModal
  } = useTechnicianState();

  // Filter to only show user's assigned jobs
  const myScheduledJobs = useMemo(() => {
    return myJobs.filter(job => 
      job.scheduledDate && 
      (job.assignedTechnician === currentUser.name || 
       job.assignedTechnician === currentUser.email ||
       job.assignedTo === currentUser.id)
    );
  }, [myJobs, currentUser]);

  // Transform to calendar events with enhanced job cards
  const myCalendarEvents = useMemo(() => {
    return myScheduledJobs.map(job => {
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
        priority: job.priority,
        status: job.status,
        workType: job.workType
      };
    }).filter(Boolean);
  }, [myScheduledJobs]);

  // Simplified handlers (view-only, no scheduling)
  const handleSelectEvent = (event) => {
    setQuickJobModal({
      isOpen: true,
      selectedJob: event.job
    });
  };

  const handleViewMoreJobs = (dayJobs) => {
    setDayOverviewModal({
      isOpen: true,
      jobs: dayJobs,
      date: dayJobs[0]?.scheduledDate
    });
  };

  const handleNavigate = (action, newDate) => {
    const today = new Date();
    
    if (action === 'PREV') {
      const prevDate = new Date(currentDate);
      if (currentView === 'week') prevDate.setDate(prevDate.getDate() - 7);
      else if (currentView === 'month') prevDate.setMonth(prevDate.getMonth() - 1);
      else prevDate.setDate(prevDate.getDate() - 1);
      setCurrentDate(prevDate);
    } else if (action === 'NEXT') {
      const nextDate = new Date(currentDate);
      if (currentView === 'week') nextDate.setDate(nextDate.getDate() + 7);
      else if (currentView === 'month') nextDate.setMonth(nextDate.getMonth() + 1);
      else nextDate.setDate(nextDate.getDate() + 1);
      setCurrentDate(nextDate);
    } else if (action === 'TODAY') {
      setCurrentDate(today);
    } else {
      setCurrentDate(newDate);
    }
  };

  const closeDayOverview = () => {
    setDayOverviewModal({ isOpen: false, jobs: [], date: null });
  };

  const closeQuickJobModal = () => {
    setQuickJobModal({ isOpen: false, selectedJob: null });
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl font-semibold text-gray-700">Loading Your Schedule...</div>
            <div className="text-sm text-gray-500 mt-2">Getting your jobs ready</div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="h-screen flex flex-col">
          
          {/* SIMPLIFIED TECHNICIAN HEADER - Personal focus */}
          <div className="flex-shrink-0">
            <TechnicianHeader
              currentUser={currentUser}
              date={currentDate}
              onNavigate={handleNavigate}
              onView={setCurrentView}
              view={currentView}
              myStats={myStats}
              jobCount={myCalendarEvents.length}
            />
          </div>

          {/* MASSIVE CALENDAR - Takes up almost entire screen */}
          <div className="flex-1 p-6 min-h-0">
            <LargeCalendarGrid
              localizer={localizer}
              calendarEvents={myCalendarEvents}
              currentView={currentView}
              currentDate={currentDate}
              onView={setCurrentView}
              onNavigate={setCurrentDate}
              onSelectEvent={handleSelectEvent}
              onViewMore={handleViewMoreJobs}
              technicianFocused={true}
              currentUser={currentUser}
            />
          </div>

          {/* MINIMAL FOOTER - Personal status only */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Your Schedule: {myCalendarEvents.length} jobs today
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {myStats.completed || 0} completed this week
                </span>
                {myStats.urgent > 0 && (
                  <span className="flex items-center gap-2 font-medium text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {myStats.urgent} urgent jobs
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <span>Welcome, {currentUser.name}</span>
                <span>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>

          {/* LIMITED MODALS - View only, no scheduling capabilities */}
          <DayOverviewModal
            isOpen={dayOverviewModal.isOpen}
            onClose={closeDayOverview}
            jobs={dayOverviewModal.jobs}
            date={dayOverviewModal.date}
          />

          <QuickJobModal
            isOpen={quickJobModal.isOpen}
            onClose={closeQuickJobModal}
            job={quickJobModal.selectedJob}
            onEdit={permissions.canEdit ? () => {} : undefined}
            onViewDetails={() => {}}
            onUpdate={permissions.canUpdate ? () => {} : undefined}
            readOnly={!permissions.canEdit}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default TechnicianCalendarView;
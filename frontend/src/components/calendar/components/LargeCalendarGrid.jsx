// LargeCalendarGrid.jsx - Massive Technician-Focused Calendar
import React from 'react';
import { Calendar } from 'react-big-calendar';
import { AdaptiveJobEvent } from '../JobEventComponents';

const LargeCalendarGrid = ({
  localizer,
  calendarEvents,
  currentView,
  currentDate,
  onView,
  onNavigate,
  onSelectEvent,
  onViewMore,
  technicianFocused = false,
  currentUser
}) => {
  // Enhanced calendar component configuration for technicians
  const calendarComponents = {
    event: (props) => (
      <AdaptiveJobEvent 
        {...props} 
        dayJobs={props.event.dayJobs}
        onViewMore={onViewMore}
        technicianView={true}
        currentUser={currentUser}
      />
    ),
    toolbar: () => null, // We handle toolbar in TechnicianHeader
  };

  // Enhanced calendar formats for maximum readability
  const calendarFormats = {
    timeGutterFormat: (date, culture, localizer) => 
      localizer.format(date, 'h A', culture),
    
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'h:mm A', culture) + ' - ' +
      localizer.format(end, 'h:mm A', culture),
      
    dayHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'dddd M/D', culture),
      
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'MMM DD', culture) + ' - ' + 
      localizer.format(end, 'MMM DD', culture),
      
    monthHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'MMMM YYYY', culture)
  };

  // Enhanced event styling for technician focus
  const eventPropGetter = (event) => {
    const job = event.job;
    const priority = job.priority || 'MEDIUM';
    
    // Larger, more prominent styling for technician view
    const priorityStyles = {
      URGENT: {
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        color: '#ffffff',
        boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.4)',
        transform: 'scale(1.02)'
      },
      HIGH: {
        backgroundColor: '#f97316',
        borderColor: '#ea580c',
        color: '#ffffff',
        boxShadow: '0 6px 12px -3px rgba(249, 115, 22, 0.4)'
      },
      MEDIUM: {
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        color: '#ffffff',
        boxShadow: '0 6px 12px -3px rgba(59, 130, 246, 0.4)'
      },
      LOW: {
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        color: '#ffffff',
        boxShadow: '0 6px 12px -3px rgba(34, 197, 94, 0.4)'
      }
    };

    return {
      style: {
        ...priorityStyles[priority],
        border: '3px solid',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '700',
        padding: '8px 12px',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '60px'
      }
    };
  };

  // Enhanced day styling for technician focus
  const dayPropGetter = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPast = date < today && !isToday;
    
    let backgroundColor = '#ffffff';
    let className = 'transition-all duration-200';
    
    if (isToday) {
      backgroundColor = '#dbeafe';
      className += ' ring-4 ring-blue-300 ring-opacity-50 bg-blue-50';
    } else if (isWeekend) {
      backgroundColor = '#f8fafc';
    } else if (isPast) {
      backgroundColor = '#f1f5f9';
      className += ' opacity-75';
    }
    
    return {
      className,
      style: {
        backgroundColor,
        position: 'relative',
        minHeight: '100px' // Larger day cells for technician view
      }
    };
  };

  // Enhanced slot styling for better time visibility
  const slotPropGetter = (date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const isBusinessHours = hour >= 7 && hour < 19; // Extended for field work
    const isLunchTime = hour === 12;
    const isCurrentTime = (() => {
      const now = new Date();
      return date.getDate() === now.getDate() && 
             hour === now.getHours() && 
             Math.abs(minute - now.getMinutes()) < 30;
    })();
    
    let style = {
      transition: 'background-color 0.15s ease',
      minHeight: '40px' // Larger time slots for better visibility
    };
    
    let className = '';
    
    if (isCurrentTime) {
      style.backgroundColor = '#dbeafe';
      className = 'ring-2 ring-blue-400';
    } else if (isLunchTime) {
      style.backgroundColor = '#fef3c7';
    } else if (!isBusinessHours) {
      style.backgroundColor = '#f8f9fa';
      style.opacity = '0.6';
    } else {
      style.backgroundColor = '#ffffff';
    }
    
    return {
      style,
      className: `${className} technician-slot`
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden h-full flex flex-col">
      
      {/* Minimal Header - Just essential info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-blue-900">
            {currentView === 'week' ? '📅 Your Week' : '📋 Your Day'}
          </div>
          
          <div className="text-sm text-blue-700 font-medium">
            {calendarEvents.length} jobs scheduled
          </div>
        </div>
      </div>
      
      {/* MASSIVE CALENDAR - Takes up entire available space */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 calendar-container technician-calendar">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            
            // View Configuration
            view={currentView}
            onView={onView}
            date={currentDate}
            onNavigate={onNavigate}
            
            // Interaction Handlers - Limited for technicians
            selectable={false} // Technicians can't create new jobs
            onSelectEvent={onSelectEvent}
            
            // Enhanced Components and Styling
            components={calendarComponents}
            formats={calendarFormats}
            
            // Time Configuration - Extended for field work
            step={30}
            timeslots={2}
            min={new Date(2025, 0, 1, 6, 0)} // Earlier start
            max={new Date(2025, 0, 1, 20, 0)} // Later end
            scrollToTime={new Date(2025, 0, 1, 7, 0)}
            
            // Layout Options
            dayLayoutAlgorithm="no-overlap"
            popup={false}
            
            // Enhanced styling functions
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            slotPropGetter={slotPropGetter}
            
            // Technician-focused messages
            messages={{
              allDay: '🌟 All Day',
              previous: '← Previous',
              next: 'Next →',
              today: '📍 Today',
              month: '📅 Month',
              week: '📋 Week', 
              day: '📝 Day',
              agenda: '📋 Schedule',
              date: 'Date',
              time: 'Time',
              event: 'Job',
              noEventsInRange: '🎉 No jobs scheduled - enjoy your break!',
              showMore: total => `📋 +${total} more jobs`
            }}
          />
        </div>
        
        {/* Current Time Indicator - More prominent for technicians */}
        {(currentView === 'day' || currentView === 'week') && (
          <div className="absolute left-0 right-0 pointer-events-none z-20" 
               style={{
                 top: (() => {
                   const now = new Date();
                   const startHour = 6;
                   const hourHeight = 80; // Larger for technician view
                   const currentHour = now.getHours() + now.getMinutes() / 60;
                   return (currentHour - startHour) * hourHeight + 60;
                 })() + 'px'
               }}>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full ml-16 shadow-lg animate-pulse"></div>
              <div className="h-1 bg-red-500 flex-1 mr-6 rounded-full shadow-lg"></div>
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold mr-6">
                NOW
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimal Footer - Personal focus */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          
          {/* Left Side - Personal Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Your schedule</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Field hours: 7 AM - 7 PM</span>
            </div>
          </div>
          
          {/* Right Side - Quick Help */}
          <div className="text-xs text-gray-500">
            💡 <strong>Tip:</strong> Click any job to view details or update status
          </div>
        </div>
      </div>
    </div>
  );
};

export default LargeCalendarGrid;
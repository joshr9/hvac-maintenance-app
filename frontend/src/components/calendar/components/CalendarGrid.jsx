// components/calendar/components/CalendarGrid.jsx - Fixed Mini Job Card Rendering
import React from 'react';
import { Calendar } from 'react-big-calendar';
import { 
  Clock, 
  User, 
  Home, 
  AlertTriangle, 
  Zap, 
  Wrench,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';

const CalendarGrid = ({
  localizer,
  calendarEvents,
  currentView,
  currentDate,
  onView,
  onNavigate,
  onSelectSlot,
  onSelectEvent,
  onViewMore,
  jobsByDay
}) => {
  // Priority styling
  const getPriorityConfig = (priority) => {
    const configs = {
      URGENT: {
        icon: Zap,
        borderColor: 'border-l-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        iconColor: 'text-red-600'
      },
      HIGH: {
        icon: AlertTriangle,
        borderColor: 'border-l-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600'
      },
      MEDIUM: {
        icon: Wrench,
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600'
      },
      LOW: {
        icon: CheckCircle,
        borderColor: 'border-l-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-900',
        iconColor: 'text-green-600'
      }
    };
    return configs[priority] || configs.MEDIUM;
  };

  // Get technician initials
  const getTechInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

// Mini Job Card Component - PROPERLY SIZED (not oversized)
const MiniJobCard = ({ event }) => {
  const job = event.job || event.resource || event;
  const config = getPriorityConfig(job.priority);
  const PriorityIcon = config.icon;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  return (
    <div
      className={`
        mini-job-card group relative bg-white rounded-lg border-l-4 shadow-sm cursor-pointer
        transition-all duration-200 ease-in-out
        ${config.borderColor} ${config.bgColor}
        hover:shadow-md hover:-translate-y-0.5
        w-full h-full
        
        /* FIXED SIZING - Much smaller than before */
        min-h-[50px] p-2
        sm:min-h-[55px] sm:p-2
        md:min-h-[60px] md:p-3
        lg:min-h-[65px] lg:p-3
        xl:min-h-[70px] xl:p-3
      `}
      onClick={handleClick}
      style={{ 
        minWidth: '120px', 
        margin: '2px',
        zIndex: 10 
      }}
    >

      <div style={{backgroundColor: 'red', color: 'white', padding: '10px'}}>
  TEST - IF YOU SEE THIS RED BOX, WE'RE IN THE RIGHT COMPONENT
</div>
      {/* Header Row - Readable but not huge */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1 min-w-0 flex-1 sm:gap-2">
          <PriorityIcon className={`
            ${config.iconColor} flex-shrink-0
            w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4
          `} />
          <span className={`
            font-semibold truncate ${config.textColor}
            text-xs leading-tight
            sm:text-sm 
            md:text-sm
            lg:text-base
          `}>
            {job.title || 'Untitled Job'}
          </span>
        </div>
      </div>

      {/* Property Info - Show on sm+ screens */}
      {job.property?.name && (
        <div className="hidden sm:flex items-center gap-1 mb-1">
          <Home className="w-3 h-3 text-gray-500 sm:w-3 sm:h-3" />
          <span className="
            text-gray-600 truncate
            text-xs sm:text-xs md:text-sm
          ">
            {job.property.name}
          </span>
        </div>
      )}

      {/* Bottom Row - Technician & Time */}
      <div className="flex items-center justify-between">
        
        {/* Technician */}
        <div className="flex items-center gap-1">
          <div className="
            bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700
            w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4
            text-[8px] sm:text-[9px] md:text-[10px]
          ">
            {getTechInitials(job.assignedTechnician || job.technician)}
          </div>
          <span className="
            text-gray-600 truncate
            text-[9px] sm:text-[10px] md:text-xs
            max-w-[40px] sm:max-w-[50px] md:max-w-[60px]
          ">
            {job.assignedTechnician || job.technician || 'Unassigned'}
          </span>
        </div>
        
        {/* Time */}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 sm:w-3 sm:h-3 text-gray-400" />
          <span className="
            text-gray-500 font-medium
            text-[9px] sm:text-[10px] md:text-xs
          ">
            {job.scheduledTime || '9:00'}
          </span>
        </div>
      </div>

      {/* Status Indicator */}
      {job.status && (
        <div className={`
          absolute top-1 right-1 rounded-full
          w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3
          ${job.status === 'completed' ? 'bg-green-500' :
            job.status === 'in-progress' ? 'bg-blue-500' :
            job.status === 'scheduled' ? 'bg-yellow-500' :
            'bg-gray-400'}
        `} />
      )}
    </div>
  );
};

/*
SIZING COMPARISON:
OLD (too big): min-h-[120px] xl:p-4 text-xl
NEW (properly sized): min-h-[50px] to max 70px, text-xs to text-base

This will fix the oversized cards in Image 1 while keeping them readable.
*/

  // Enhanced calendar component configuration
  const calendarComponents = {
    event: MiniJobCard,
    toolbar: () => null, // We handle toolbar in CalendarHeader
  };

  // Enhanced calendar formats for better readability
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

  // Event styling to make mini cards work properly
  const eventPropGetter = (event) => {
    return {
      className: 'mini-job-event-container',
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '1px',
        margin: '1px',
        borderRadius: '0',
        height: 'auto',
        minHeight: '54px'
      }
    };
  };

  // Enhanced day prop getter for better visual hierarchy
  const dayPropGetter = (date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayKey = date.toISOString().split('T')[0];
    const dayJobs = jobsByDay[dayKey] || [];
    
    let className = 'calendar-day';
    let style = {
      transition: 'background-color 0.15s ease'
    };
    
    if (isToday) {
      className += ' today';
      style.backgroundColor = '#dbeafe';
    } else if (isWeekend) {
      style.backgroundColor = '#f8f9fa';
      style.opacity = '0.8';
    } else {
      style.backgroundColor = '#ffffff';
    }
    
    if (dayJobs.length > 0) {
      className += ' has-jobs';
    }
    
    return {
      className,
      style
    };
  };

  // Enhanced slot styling for better visual feedback
  const slotPropGetter = (date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const isBusinessHours = hour >= 8 && hour < 18;
    const isLunchTime = hour === 12;
    const isCurrentTime = (() => {
      const now = new Date();
      return date.getDate() === now.getDate() && 
             hour === now.getHours() && 
             Math.abs(minute - now.getMinutes()) < 30;
    })();
    
    let style = {
      transition: 'background-color 0.15s ease',
      minHeight: '60px' // Ensure enough space for mini cards
    };
    
    let className = 'calendar-time-slot';
    
    if (isCurrentTime) {
      style.backgroundColor = '#dbeafe';
      className += ' current-time';
    } else if (isLunchTime) {
      style.backgroundColor = '#fef3c7';
      className += ' lunch-time';
    } else if (!isBusinessHours) {
      style.backgroundColor = '#f8f9fa';
      style.opacity = '0.7';
      className += ' non-business-hours';
    } else {
      style.backgroundColor = '#ffffff';
    }
    
    return {
      style,
      className: `${className} hover:bg-blue-25 cursor-pointer`
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
      
      {/* Calendar Header with Job Count */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">
            {currentView === 'week' ? '📅 Admin Week View' : 
             currentView === 'day' ? '📋 Admin Day View' : 
             '🗓️ Admin Month View'}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              {calendarEvents.length} job cards
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              All Technicians
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Calendar Container */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 calendar-container">
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
            
            // Interaction Handlers
            selectable={true}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            
            // Enhanced Components and Styling
            components={calendarComponents}
            formats={calendarFormats}
            
            // Time Configuration - Optimized for mini cards
            step={60} // Hour increments
            timeslots={1} // One slot per hour
            min={new Date(2025, 0, 1, 6, 0)} // 6 AM start
            max={new Date(2025, 0, 1, 20, 0)} // 8 PM end
            scrollToTime={new Date(2025, 0, 1, 8, 0)} // Scroll to 8 AM
            
            // Layout Options
            dayLayoutAlgorithm="no-overlap"
            popup={false}
            
            // Enhanced styling functions
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            slotPropGetter={slotPropGetter}
            
            // Professional admin messages
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
              noEventsInRange: '📋 No jobs scheduled for this time period'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
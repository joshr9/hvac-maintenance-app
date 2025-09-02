// components/calendar/components/SwimLanesCalendar.jsx - FIXED VERSION
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  User, 
  Clock, 
  Plus, 
  AlertTriangle,
  Zap,
  CheckCircle,
  Coffee,
  Users
} from 'lucide-react';
import { useDragDrop, useDraggableJob, useDroppableSlot } from './DragDropProvider';

const SwimLanesCalendar = ({
  calendarEvents = [],
  teamMembers = [],
  currentDate,
  onSelectEvent,
  onSelectSlot,
  onDragJob,
  className = ''
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const { feedback } = useDragDrop();
  
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
      resizeObserver.disconnect();
    };
  }, []);

  // FIXED: Responsive layout detection - AGGRESSIVE BREAKPOINTS
  const isWide = containerWidth > 1600;  // Only very wide screens get cards
  const isMedium = containerWidth > 600 && containerWidth <= 1600;  // Most usage = horizontal bars  
  const isNarrow = containerWidth <= 600;

  // RESTORED: Adaptive time slots based on screen size
  const timeSlots = useMemo(() => {
    const slots = [];
    let startHour, endHour;
    
    if (isWide) {
      // Wide: Full day (8AM-6PM) = 11 slots
      startHour = 8;
      endHour = 18;
    } else if (isMedium) {
      // Medium: Business hours (8AM-6PM) = 11 slots  
      startHour = 8;
      endHour = 18;
    } else {
      // Narrow: Core hours (9AM-3PM) = 7 slots
      startHour = 9;
      endHour = 15;
    }
    
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push({
        hour,
        label: hour === 12 ? '12:00 PM' : 
               hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`,
        isLunchTime: hour === 12,
        isBusinessHours: hour >= 8 && hour <= 17
      });
    }
    return slots;
  }, [containerWidth]);

  const organizedJobs = useMemo(() => {
    const result = {};
    
    teamMembers.forEach(tech => {
      const techKey = tech.name;
      result[techKey] = {};
      timeSlots.forEach(slot => {
        result[techKey][slot.hour] = [];
      });
    });

    calendarEvents.forEach(event => {
      const job = event.job || event;
      const assignedTechName = job.assignedTechnician || job.technician || event.assignedTechnician;
      const eventHour = job.scheduledTime ? 
        new Date(`1970-01-01T${job.scheduledTime}`).getHours() : 
        new Date(event.start).getHours();
      
      const matchingTech = teamMembers.find(tech => 
        tech.name.toLowerCase().trim() === assignedTechName?.toLowerCase().trim()
      );
      
      if (matchingTech && result[matchingTech.name] && result[matchingTech.name][eventHour]) {
        result[matchingTech.name][eventHour].push(job);
      }
    });

    return result;
  }, [calendarEvents, teamMembers, timeSlots]);

  // RESTORED: Proper responsive JobChip with original card functionality
  const JobChip = ({ job, techName, hour }) => {
    const { dragHandleProps, style, isDragging } = useDraggableJob(
      `scheduled-${job.id}`, 
      job
    );

    const getPriorityColor = (priority) => {
      switch (priority?.toUpperCase()) {
        case 'URGENT': return 'bg-red-100 border-red-400 text-red-800';
        case 'HIGH': return 'bg-orange-100 border-orange-400 text-orange-800';
        case 'MEDIUM': return 'bg-blue-100 border-blue-400 text-blue-800';
        case 'LOW': return 'bg-green-100 border-green-400 text-green-800';
        default: return 'bg-gray-100 border-gray-400 text-gray-800';
      }
    };

    const getPriorityIcon = (priority) => {
      switch (priority?.toUpperCase()) {
        case 'URGENT': return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
        case 'HIGH': return <Zap className="w-4 h-4 flex-shrink-0" />;
        case 'MEDIUM': return <Clock className="w-4 h-4 flex-shrink-0" />;
        case 'LOW': return <CheckCircle className="w-4 h-4 flex-shrink-0" />;
        default: return null;
      }
    };

    const getPriorityBorderColor = (priority) => {
      switch (priority?.toUpperCase()) {
        case 'URGENT': return 'border-l-red-500';
        case 'HIGH': return 'border-l-orange-500';
        case 'MEDIUM': return 'border-l-blue-500';
        case 'LOW': return 'border-l-green-500';
        default: return 'border-l-gray-400';
      }
    };

    // RESTORED: Original cards for wide screens
    if (isWide) {
      return (
        <div
          style={style}
          className={`
            relative group cursor-pointer rounded-lg border-2 p-3 mb-2 
            transition-all duration-200 ${getPriorityColor(job.priority)}
            hover:shadow-md hover:-translate-y-0.5 min-h-[70px] text-sm overflow-hidden
            active:scale-95 touch-manipulation
            ${isDragging ? 'opacity-50 z-50' : ''}
          `}
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectEvent) {
              onSelectEvent({ job: job });
            }
          }}
        >
          {/* RESTORED: Original card content */}
          <div className="flex items-center gap-2 mb-2">
            {getPriorityIcon(job.priority)}
            <span className="font-bold text-sm leading-tight flex-1">
              {job.title || 'Untitled Job'}
            </span>
          </div>
          <div className="space-y-1 overflow-hidden">
            {job.property?.name && (
              <div className="text-xs opacity-80 truncate">
                📍 {job.property.name}
              </div>
            )}
            <div className="flex items-center justify-between text-xs opacity-80">
              {job.scheduledTime && (
                <span className="truncate">🕒 {job.scheduledTime}</span>
              )}
              {job.estimatedDuration && (
                <span className="truncate">⏱️ {job.estimatedDuration}min</span>
              )}
            </div>
            {job.jobNumber && (
              <div className="text-xs opacity-60 font-mono truncate">
                #{job.jobNumber}
              </div>
            )}
          </div>
        </div>
      );
    }

    // FIXED: Horizontal bars for medium screens
    if (isMedium) {
      return (
        <div
          style={style}
          className={`
            cursor-pointer hover:bg-gray-50 transition-colors 
            border-b border-gray-100 last:border-b-0 border-l-2 ${getPriorityBorderColor(job.priority)}
            ${isDragging ? 'opacity-50' : ''}
          `}
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectEvent) {
              onSelectEvent({ job: job });
            }
          }}
        >
          <div className="flex items-center gap-2 text-sm py-2 px-3">
            {getPriorityIcon(job.priority)}
            <span className="font-semibold text-gray-900 flex-1 truncate" style={{minWidth: '200px'}}>
              {job.title || 'Untitled Job'}
            </span>
            <span className="text-gray-700 font-medium flex-shrink-0">
              {job.scheduledTime || '9:00'}
            </span>
          </div>
        </div>
      );
    }

    // Narrow screens: minimal layout
    return (
      <div
        style={style}
        className={`
          cursor-pointer hover:bg-gray-50 transition-colors py-1 px-1
          ${isDragging ? 'opacity-50' : ''}
        `}
        {...dragHandleProps}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectEvent) {
            onSelectEvent({ job: job });
          }
        }}
      >
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {getPriorityIcon(job.priority)}
            <span className="font-semibold truncate">
              {job.title || 'Untitled Job'}
            </span>
          </div>
          <span className="text-sm font-medium">
            {job.scheduledTime || '9:00'}
          </span>
        </div>
      </div>
    );
  };

  // Time Slot Cell Component
  const TimeSlotCell = ({ techName, hour, jobs = [] }) => {
    const matchingTech = teamMembers.find(tech => tech.name === techName);
    const techId = matchingTech ? matchingTech.id : techName;
    
    const { setNodeRef, isOver } = useDroppableSlot(
      `slot-${techId}-${hour}`,
      { techId, hour, type: 'timeSlot' }
    );

    const isLunchTime = hour === 12;
    const isCurrentHour = new Date().getHours() === hour;

    const handleSlotClick = () => {
      if (onSelectSlot) {
        onSelectSlot(techId, hour);
      }
    };

    return (
      <div
        ref={setNodeRef}
        className={`
          relative border border-gray-200 p-2 transition-all duration-200
          hover:bg-gray-50 cursor-pointer overflow-hidden
          ${isWide ? 'min-h-[120px]' : isMedium ? 'min-h-[80px]' : 'min-h-[60px]'}
          ${isOver ? 'bg-blue-100 border-blue-300 border-2' : ''}
          ${isCurrentHour ? 'bg-blue-50 border-blue-200' : ''}
          ${isLunchTime ? 'bg-yellow-50' : ''}
        `}
        onClick={handleSlotClick}
      >
        {/* Current Time Indicator */}
        {isCurrentHour && (
          <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        )}

        {/* Drop Zone Indicator */}
        {isOver && (
          <div className="absolute inset-1 border-2 border-blue-400 border-dashed rounded bg-blue-50/50 flex items-center justify-center">
            <div className="text-blue-600 font-medium text-sm">Drop here</div>
          </div>
        )}

        {/* RESTORED: Responsive spacing for jobs */}
        <div className={`overflow-hidden ${isWide ? 'space-y-1' : 'space-y-0'}`}>
          {jobs.map((job, index) => (
            <JobChip key={job.id || index} job={job} techName={techName} hour={hour} />
          ))}
        </div>

        {/* Lunch Time Indicator */}
        {isLunchTime && jobs.length === 0 && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-yellow-600 font-medium text-xs flex items-center gap-1">
              <Coffee className="w-4 h-4" />
              Lunch Break
            </div>
          </div>
        )}

        {/* Add Job Button */}
        {jobs.length === 0 && !isLunchTime && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSlotClick();
              }}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Multiple Jobs Indicator */}
        {jobs.length >= 3 && (
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg z-10">
            {jobs.length}
          </div>
        )}
      </div>
    );
  };

  // Technician Row Component - FIXED: Match time header grid layout
  const TechnicianRow = ({ technician }) => {
    const techName = technician.name;
    const techJobs = organizedJobs[techName] || {};
    const totalJobs = Object.values(techJobs).reduce((sum, jobs) => sum + jobs.length, 0);
    const workloadColor = totalJobs > 8 ? 'text-red-600' : totalJobs > 5 ? 'text-orange-600' : 'text-green-600';

    return (
      <div className={`flex border-b border-gray-200 hover:bg-gray-50/50 transition-colors ${
        isWide ? 'min-h-[120px]' : isMedium ? 'min-h-[100px]' : 'min-h-[60px]'
      }`}>
        {/* Technician Info - Responsive width */}
        <div className={`flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 flex items-center ${
          isWide ? 'w-48' : isMedium ? 'w-40' : 'w-32'
        }`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-md">
            {technician.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{technician.name}</div>
            <div className={`text-sm font-medium ${workloadColor}`}>
              {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'}
            </div>
          </div>
        </div>

        {/* Time Slots - FIXED: Match time header grid layout */}
        <div className={`
          ${isWide ? 'flex-1 grid grid-cols-11 gap-0' : 'flex-1 overflow-hidden'}
        `}
        style={!isWide ? {
          display: 'grid',
          gridTemplateColumns: isMedium 
            ? `repeat(${timeSlots.length}, minmax(300px, 1fr))`
            : `repeat(${timeSlots.length}, minmax(140px, 1fr))`,
          minWidth: isMedium ? `${timeSlots.length * 300}px` : `${timeSlots.length * 140}px`
        } : {}}>
          {timeSlots.map(slot => (
            <TimeSlotCell
              key={`${techName}-${slot.hour}`}
              techName={techName}
              hour={slot.hour}
              jobs={techJobs[slot.hour] || []}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`bg-white shadow-lg flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Team Workload</h2>
              <p className="text-blue-100">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <div className="text-blue-100 text-sm">Technicians</div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Feedback Bar */}
      {feedback && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex-shrink-0">
          <div className="text-sm text-blue-800 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            {feedback}
          </div>
        </div>
      )}

              {/* FIXED: Single Scroll Container with Synchronized Header and Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto min-h-0"
        style={{ 
          overflowX: isWide ? 'hidden' : 'auto',
          overflowY: 'auto'
        }}
      >
        {/* Time Header - FIXED: Proper grid layout for wide screens */}
        <div className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex">
            <div className={`flex-shrink-0 bg-gray-200 border-r border-gray-300 p-3 font-semibold text-gray-700 ${
              isWide ? 'w-48' : isMedium ? 'w-40' : 'w-32'
            }`}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Technician
              </div>
            </div>
            {/* FIXED: Use simple grid-cols-11 for wide screens, complex grid for smaller */}
            <div className={`
              ${isWide ? 'flex-1 grid grid-cols-11 gap-0' : 'overflow-hidden'}
            `}
            style={!isWide ? {
              display: 'grid',
              gridTemplateColumns: isMedium 
                ? `repeat(${timeSlots.length}, minmax(300px, 1fr))`
                : `repeat(${timeSlots.length}, minmax(140px, 1fr))`,
              minWidth: isMedium ? `${timeSlots.length * 300}px` : `${timeSlots.length * 140}px`
            } : {}}
            >
              {timeSlots.map(slot => (
                <div
                  key={slot.hour}
                  className={`
                    p-3 border-r border-gray-200 text-center text-sm font-medium
                    ${slot.hour === new Date().getHours() ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}
                    ${slot.isLunchTime ? 'bg-yellow-50' : ''}
                  `}
                >
                  {/* FIXED: Always show full labels for wide screens */}
                  {isWide && <div>{slot.label}</div>}
                  {isMedium && !isWide && (
                    <div>
                      {slot.hour === 12 ? '12P' : slot.hour > 12 ? `${slot.hour - 12}P` : `${slot.hour}A`}
                    </div>
                  )}
                  {isNarrow && (
                    <div>
                      {slot.hour > 12 ? slot.hour - 12 : slot.hour}
                    </div>
                  )}
                  {slot.isLunchTime && (
                    <div className="text-xs text-yellow-600 mt-1">🍽️</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technician Rows - FIXED: FILL REMAINING SPACE */}
        <div className="min-h-0 flex-1">
          {teamMembers.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center p-4">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No team members found</p>
                <p className="text-sm">Add technicians to see their schedules</p>
              </div>
            </div>
          ) : (
            <>
              {teamMembers.map((technician, index) => (
                <TechnicianRow key={technician.id || index} technician={technician} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Footer - RESTORED responsive */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="hidden sm:inline">Drag jobs to reschedule</span>
              <span className="sm:hidden">Drag jobs</span>
            </span>
            <span className="flex items-center gap-1 hidden lg:flex">
              <Plus className="w-3 h-3" />
              Click slots to add jobs
            </span>
          </div>
          <div className="text-xs">
            {calendarEvents.length} jobs • {teamMembers.length} techs
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwimLanesCalendar;
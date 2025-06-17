import React, { useState, useEffect } from 'react';

const CalendarGrid = ({ 
  currentDate, 
  allMaintenanceLogs, 
  allScheduledJobs, 
  filterProperty, 
  onDateClick 
}) => {
  const [calendarDays, setCalendarDays] = useState([]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days with all data
  useEffect(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toDateString();
      
      // Get completed maintenance for this day (filtered by property if selected)
      let maintenanceForDay = allMaintenanceLogs.filter(log => {
        const logDate = new Date(log.createdAt);
        const matchesDate = logDate.toDateString() === dateString;
        const matchesProperty = filterProperty === 'all' || 
          log.hvacUnit?.suite?.propertyId === parseInt(filterProperty);
        return matchesDate && matchesProperty;
      });

      // Get scheduled jobs for this day (filtered by property if selected)
      let scheduledForDay = allScheduledJobs.filter(job => {
        const jobDate = new Date(job.date);
        const matchesDate = jobDate.toDateString() === dateString;
        const matchesProperty = filterProperty === 'all' || 
          job.suiteId === parseInt(filterProperty) ||
          job.suite?.propertyId === parseInt(filterProperty);
        return matchesDate && matchesProperty;
      });
      
      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date().setHours(0, 0, 0, 0),
        maintenance: maintenanceForDay,
        scheduled: scheduledForDay
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, allMaintenanceLogs, allScheduledJobs, filterProperty, currentMonth, currentYear]);

  const getMaintenanceTypeColor = (type) => {
    const colors = {
      'INSPECTION': '#3b82f6',
      'FILTER_CHANGE': '#10b981',
      'FULL_SERVICE': '#8b5cf6',
      'FULL_INSPECTION_CHECKLIST': '#2a3a91',
      'REPAIR': '#ef4444',
      'OTHER': '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': '#ef4444',
      'MEDIUM': '#f59e0b',
      'LOW': '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getMaintenanceTypeLabel = (type) => {
    const labels = {
      'INSPECTION': 'Inspection',
      'FILTER_CHANGE': 'Filter Change',
      'FULL_SERVICE': 'Full Service',
      'FULL_INSPECTION_CHECKLIST': 'Full Inspection',
      'REPAIR': 'Repair',
      'OTHER': 'Other'
    };
    return labels[type] || type;
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {calendarDays.map((day, index) => (
        <div
          key={index}
          className={`
            relative p-2 text-center text-sm cursor-pointer rounded-lg transition-colors min-h-[80px] flex flex-col items-center justify-start
            ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
            ${day.isToday ? 'bg-blue-100 font-bold ring-2 ring-blue-300' : ''}
            ${day.maintenance.length > 0 || day.scheduled.length > 0 ? 'hover:bg-gray-50' : ''}
            ${!day.isPast && day.isCurrentMonth ? 'hover:bg-green-50' : ''}
          `}
          onClick={() => onDateClick(day)}
        >
          <span className="mb-1">{day.date.getDate()}</span>
          
          {/* Completed maintenance indicators */}
          {day.maintenance.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-1">
              {day.maintenance.slice(0, 3).map((log, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 rounded-full"
                  style={{backgroundColor: getMaintenanceTypeColor(log.maintenanceType)}}
                  title={`Completed: ${getMaintenanceTypeLabel(log.maintenanceType)} at ${log.hvacUnit?.suite?.property?.name}`}
                ></div>
              ))}
              {day.maintenance.length > 3 && (
                <span className="text-xs text-gray-500">+{day.maintenance.length - 3}</span>
              )}
            </div>
          )}

          {/* Scheduled job indicators */}
          {day.scheduled.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {day.scheduled.slice(0, 3).map((job, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded border-2 ${job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-white'}`}
                  style={{borderColor: getPriorityColor(job.priority)}}
                  title={`Scheduled: ${getMaintenanceTypeLabel(job.maintenanceType)} - ${job.assignedTechnician}`}
                ></div>
              ))}
              {day.scheduled.length > 3 && (
                <span className="text-xs text-gray-500">+{day.scheduled.length - 3}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
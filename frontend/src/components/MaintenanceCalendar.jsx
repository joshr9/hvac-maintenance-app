import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileText, Wrench, Clock, Plus, Bell, X, User, MapPin } from 'lucide-react';

const MaintenanceCalendar = ({ selectedSuite, maintenanceLogs = [], onScheduleUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    time: '',
    maintenanceType: 'INSPECTION',
    assignedTechnician: '',
    priority: 'MEDIUM',
    notes: '',
    hvacUnitId: '',
    reminderDays: 1
  });

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load scheduled jobs from API
  useEffect(() => {
    if (selectedSuite?.id) {
      fetch(`/api/scheduled-maintenance/suite/${selectedSuite.id}`)
        .then(res => res.json())
        .then(data => setScheduledJobs(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Error loading scheduled jobs:', err);
          setScheduledJobs([]);
        });
    }
  }, [selectedSuite?.id]);

  // Save scheduled jobs via API
  const saveScheduledJobs = async (job) => {
    try {
      const response = await fetch('/api/scheduled-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(job)
      });

      if (response.ok) {
        const savedJob = await response.json();
        setScheduledJobs(prev => [...prev, savedJob]);
        if (onScheduleUpdate) {
          onScheduleUpdate([...scheduledJobs, savedJob]);
        }
        return savedJob;
      } else {
        throw new Error('Failed to save scheduled job');
      }
    } catch (error) {
      console.error('Error saving scheduled job:', error);
      alert('Failed to save scheduled job. Please try again.');
      return null;
    }
  };

  // Generate calendar days
  useEffect(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toDateString();
      
      // Get completed maintenance for this day
      const maintenanceForDay = maintenanceLogs.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate.toDateString() === dateString;
      });

      // Get scheduled jobs for this day
      const scheduledForDay = scheduledJobs.filter(job => {
        const jobDate = new Date(job.date);
        return jobDate.toDateString() === dateString;
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
  }, [currentDate, maintenanceLogs, scheduledJobs, currentMonth, currentYear]);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    if (day.maintenance.length > 0 || day.scheduled.length > 0) {
      setSelectedDate(day);
    } else if (!day.isPast) {
      // Allow scheduling on future dates
      setNewSchedule(prev => ({
        ...prev,
        date: day.date.toISOString().split('T')[0]
      }));
      setShowScheduleModal(true);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!newSchedule.date || !newSchedule.time || !newSchedule.assignedTechnician) {
      alert('Please fill in all required fields');
      return;
    }

    const scheduledJob = {
      ...newSchedule,
      suiteId: selectedSuite.id,
      hvacUnitId: newSchedule.hvacUnitId || null
    };

    const savedJob = await saveScheduledJobs(scheduledJob);
    
    if (savedJob) {
      // Schedule notification (in real app, this would be handled by backend)
      scheduleNotification(savedJob);

      setShowScheduleModal(false);
      setNewSchedule({
        date: '',
        time: '',
        maintenanceType: 'INSPECTION',
        assignedTechnician: '',
        priority: 'MEDIUM',
        notes: '',
        hvacUnitId: '',
        reminderDays: 1
      });
    }
  };

  const scheduleNotification = (job) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const jobDateTime = new Date(`${job.date}T${job.time}`);
      const reminderTime = new Date(jobDateTime.getTime() - (job.reminderDays * 24 * 60 * 60 * 1000));
      const now = new Date();

      if (reminderTime > now) {
        setTimeout(() => {
          new Notification('HVAC Maintenance Reminder', {
            body: `${job.maintenanceType} scheduled for ${job.date} at ${job.time}`,
            icon: '/DeanCallan.png'
          });
        }, reminderTime.getTime() - now.getTime());
      }
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const completeScheduledJob = async (jobId) => {
    try {
      const response = await fetch(`/api/scheduled-maintenance/${jobId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setScheduledJobs(prev => prev.map(job => 
          job.id === jobId ? updatedJob : job
        ));
      }
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Failed to complete job. Please try again.');
    }
  };

  const deleteScheduledJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this scheduled job?')) return;
    
    try {
      const response = await fetch(`/api/scheduled-maintenance/${jobId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setScheduledJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

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

  // Get upcoming scheduled jobs
  const upcomingJobs = scheduledJobs
    .filter(job => new Date(job.date) >= new Date().setHours(0, 0, 0, 0) && job.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
            <Calendar className="w-5 h-5" style={{color: '#2a3a91'}} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Maintenance Calendar</h3>
            <p className="text-sm text-gray-600">
              {selectedSuite ? `${selectedSuite.name || `Suite ${selectedSuite.id}`} - Click dates to view or schedule` : 'View and schedule maintenance'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={requestNotificationPermission}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Enable notifications"
            type="button"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
            style={{backgroundColor: '#2a3a91'}}
            type="button"
          >
            <Plus className="w-4 h-4" />
            Schedule
          </button>
        </div>
      </div>

      {/* Upcoming Jobs Summary */}
      {upcomingJobs.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming Jobs ({upcomingJobs.length})
          </h4>
          <div className="space-y-2">
            {upcomingJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{backgroundColor: getPriorityColor(job.priority)}}
                  ></div>
                  <span>{new Date(job.date).toLocaleDateString()} at {job.time}</span>
                  <span className="text-gray-600">- {getMaintenanceTypeLabel(job.maintenanceType)}</span>
                </div>
                <span className="text-gray-500">{job.assignedTechnician}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h4 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h4>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              relative p-2 text-center text-sm cursor-pointer rounded-lg transition-colors min-h-[70px] flex flex-col items-center justify-start
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
              ${day.isToday ? 'bg-blue-100 font-bold ring-2 ring-blue-300' : ''}
              ${day.maintenance.length > 0 || day.scheduled.length > 0 ? 'hover:bg-gray-50' : ''}
              ${!day.isPast && day.isCurrentMonth ? 'hover:bg-green-50' : ''}
            `}
            onClick={() => handleDateClick(day)}
          >
            <span className="mb-1">{day.date.getDate()}</span>
            
            {/* Completed maintenance indicators */}
            {day.maintenance.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mb-1">
                {day.maintenance.slice(0, 2).map((log, idx) => (
                  <div
                    key={idx}
                    className="w-2 h-2 rounded-full"
                    style={{backgroundColor: getMaintenanceTypeColor(log.maintenanceType)}}
                    title={`Completed: ${getMaintenanceTypeLabel(log.maintenanceType)}`}
                  ></div>
                ))}
                {day.maintenance.length > 2 && (
                  <span className="text-xs text-gray-500">+{day.maintenance.length - 2}</span>
                )}
              </div>
            )}

            {/* Scheduled job indicators */}
            {day.scheduled.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center">
                {day.scheduled.slice(0, 2).map((job, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded border-2 ${job.status === 'COMPLETED' ? 'bg-green-500' : 'bg-white'}`}
                    style={{borderColor: getPriorityColor(job.priority)}}
                    title={`Scheduled: ${getMaintenanceTypeLabel(job.maintenanceType)} - ${job.assignedTechnician}`}
                  ></div>
                ))}
                {day.scheduled.length > 2 && (
                  <span className="text-xs text-gray-500">+{day.scheduled.length - 2}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <strong className="block mb-1">Completed Work (filled dots):</strong>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries({
                'INSPECTION': 'Inspection',
                'FILTER_CHANGE': 'Filter Change',
                'FULL_INSPECTION_CHECKLIST': 'Full Inspection',
                'REPAIR': 'Repair'
              }).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{backgroundColor: getMaintenanceTypeColor(type)}}
                  ></div>
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <strong className="block mb-1">Scheduled Work (bordered squares):</strong>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-red-500 bg-white"></div>
                <span className="text-gray-600">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-yellow-500 bg-white"></div>
                <span className="text-gray-600">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-green-500 bg-white"></div>
                <span className="text-gray-600">Low Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {selectedDate.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h5>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Completed Maintenance */}
          {selectedDate.maintenance.length > 0 && (
            <div className="mb-4">
              <h6 className="text-sm font-semibold text-green-700 mb-2">✅ Completed Work</h6>
              <div className="space-y-2">
                {selectedDate.maintenance.map((log, index) => (
                  <div key={log.id || index} className="p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                        <Wrench className="w-4 h-4" style={{color: '#2a3a91'}} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{backgroundColor: getMaintenanceTypeColor(log.maintenanceType)}}
                          >
                            {getMaintenanceTypeLabel(log.maintenanceType)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {log.serviceTechnician && (
                            <span className="text-sm text-gray-600">
                              by {log.serviceTechnician}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">
                          {log.notes || 'No notes provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Jobs */}
          {selectedDate.scheduled.length > 0 && (
            <div className="mb-4">
              <h6 className="text-sm font-semibold text-blue-700 mb-2">📅 Scheduled Work</h6>
              <div className="space-y-2">
                {selectedDate.scheduled.map((job, index) => (
                  <div key={job.id || index} className={`p-3 border rounded-lg ${job.status === 'COMPLETED' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{backgroundColor: getMaintenanceTypeColor(job.maintenanceType)}}
                          >
                            {getMaintenanceTypeLabel(job.maintenanceType)}
                          </span>
                          <span 
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{backgroundColor: getPriorityColor(job.priority)}}
                          >
                            {job.priority}
                          </span>
                          <span className="text-sm text-gray-600">at {job.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          {job.assignedTechnician}
                        </div>
                        {job.notes && (
                          <div className="text-sm text-gray-700 mt-1">
                            {job.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {job.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => completeScheduledJob(job.id)}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              type="button"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => deleteScheduledJob(job.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              type="button"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {job.status === 'COMPLETED' && (
                          <span className="px-3 py-1 text-xs bg-green-500 text-white rounded">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Schedule Maintenance</h4>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={newSchedule.date}
                    onChange={e => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={newSchedule.time}
                    onChange={e => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance Type *</label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  value={newSchedule.maintenanceType}
                  onChange={e => setNewSchedule(prev => ({ ...prev, maintenanceType: e.target.value }))}
                  required
                >
                  <option value="INSPECTION">Inspection</option>
                  <option value="FILTER_CHANGE">Filter Change</option>
                  <option value="FULL_SERVICE">Full Service</option>
                  <option value="FULL_INSPECTION_CHECKLIST">Full Inspection Checklist</option>
                  <option value="REPAIR">Repair</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {selectedSuite?.hvacUnits && selectedSuite.hvacUnits.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">HVAC Unit</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={newSchedule.hvacUnitId}
                    onChange={e => setNewSchedule(prev => ({ ...prev, hvacUnitId: e.target.value }))}
                  >
                    <option value="">All units</option>
                    {selectedSuite.hvacUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Technician *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={newSchedule.assignedTechnician}
                    onChange={e => setNewSchedule(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                    placeholder="Technician name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={newSchedule.priority}
                    onChange={e => setNewSchedule(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reminder (days before)
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  value={newSchedule.reminderDays}
                  onChange={e => setNewSchedule(prev => ({ ...prev, reminderDays: parseInt(e.target.value) }))}
                >
                  <option value={0}>Day of</option>
                  <option value={1}>1 day before</option>
                  <option value={2}>2 days before</option>
                  <option value={7}>1 week before</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  rows="3"
                  value={newSchedule.notes}
                  onChange={e => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or special instructions..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleScheduleSubmit}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
                  style={{backgroundColor: '#2a3a91'}}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No maintenance message */}
      {maintenanceLogs.length === 0 && scheduledJobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No maintenance records or scheduled jobs</p>
          <p className="text-xs">Click "Schedule" to add jobs or click future dates to schedule maintenance</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCalendar;
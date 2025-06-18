// components/calendar/IntegratedCalendar.jsx (FIXED)
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Plus, Filter, Users, User, RotateCcw } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';
import ScheduleTypeModal from './ScheduleTypeModal';
// Temporarily commenting out JobDetailModal - add it back when you have it
// import JobDetailModal from '../jobs/JobDetailModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';

const localizer = momentLocalizer(moment);

const IntegratedCalendar = () => {
  // View and date state
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data state
  const [allProperties, setAllProperties] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Filter state
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterTeamMember, setFilterTeamMember] = useState('all');
  const [showResourceView, setShowResourceView] = useState(false);
  
  // Modal state
  const [showScheduleTypeModal, setShowScheduleTypeModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch properties
      const propertiesRes = await fetch('/api/properties');
      if (propertiesRes.ok) {
        const properties = await propertiesRes.json();
        setAllProperties(Array.isArray(properties) ? properties : []);
      }

      // Fetch jobs (combine scheduled maintenance and regular jobs)
      const scheduledRes = await fetch('/api/scheduled-maintenance/all');

      let allJobsData = [];
      
      if (scheduledRes.ok) {
        const scheduled = await scheduledRes.json();
        allJobsData = [...allJobsData, ...(Array.isArray(scheduled) ? scheduled : [])];
      }

      setAllJobs(allJobsData);

      // Mock team members (replace with actual API)
      setTeamMembers([
        { id: 1, name: 'Mike Rodriguez', role: 'Lead Technician', color: '#3b82f6' },
        { id: 2, name: 'Sarah Johnson', role: 'HVAC Specialist', color: '#10b981' },
        { id: 3, name: 'David Chen', role: 'Maintenance Tech', color: '#8b5cf6' },
        { id: 4, name: 'Lisa Williams', role: 'Technician', color: '#f59e0b' }
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform jobs data for React Big Calendar
  const calendarEvents = useMemo(() => {
    return allJobs
      .filter(job => {
        // Property filter
        const matchesProperty = filterProperty === 'all' || 
          job.propertyId === parseInt(filterProperty) ||
          job.suite?.propertyId === parseInt(filterProperty);
        
        // Team member filter
        const matchesTeam = filterTeamMember === 'all' || 
          job.assignedTechnician === filterTeamMember;
        
        return matchesProperty && matchesTeam && (job.scheduledDate || job.date);
      })
      .map(job => {
        const startDate = new Date(job.scheduledDate || job.date);
        
        // Add time if available
        if (job.scheduledTime || job.time) {
          const timeStr = job.scheduledTime || job.time;
          const [hours, minutes] = timeStr.split(':').map(Number);
          startDate.setHours(hours, minutes);
        }

        // Calculate end time based on duration
        const endDate = new Date(startDate);
        if (job.estimatedDuration) {
          endDate.setMinutes(endDate.getMinutes() + job.estimatedDuration);
        } else {
          endDate.setHours(endDate.getHours() + 1); // Default 1 hour
        }

        return {
          id: job.id,
          title: job.title || job.workType?.replace('_', ' ') || 'Scheduled Work',
          start: startDate,
          end: endDate,
          resource: job.assignedTechnician,
          job: job, // Keep original job data
          status: job.status,
          priority: job.priority
        };
      });
  }, [allJobs, filterProperty, filterTeamMember]);

  // View options for dropdown
  const viewOptions = [
    { value: 'month', label: 'Month View' },
    { value: 'week', label: 'Week View' },
    { value: 'day', label: 'Day View' },
    { value: 'agenda', label: 'Agenda View' }
  ];

  // Property filter options
  const propertyOptions = [
    { value: 'all', label: 'All Properties' },
    ...allProperties.map(property => ({
      value: property.id.toString(),
      label: property.name
    }))
  ];

  // Team member filter options
  const teamOptions = [
    { value: 'all', label: 'All Team Members' },
    ...teamMembers.map(member => ({
      value: member.name,
      label: member.name,
      description: member.role
    }))
  ];

  // Resources for resource view (team member columns)
  const resources = teamMembers.map(member => ({
    id: member.name,
    title: member.name
  }));

  // Event styling
  const eventStyleGetter = (event) => {
    const { status, priority } = event;
    
    let backgroundColor = '#3b82f6'; // Default blue
    let borderColor = backgroundColor;
    
    // Status colors
    switch (status) {
      case 'COMPLETED':
        backgroundColor = '#10b981';
        break;
      case 'IN_PROGRESS':
        backgroundColor = '#8b5cf6';
        break;
      case 'CANCELLED':
        backgroundColor = '#6b7280';
        break;
      case 'OVERDUE':
        backgroundColor = '#ef4444';
        break;
    }

    // Priority border
    if (priority === 'HIGH' || priority === 'URGENT') {
      borderColor = '#ef4444';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        color: 'white',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  // Event handlers
  const handleSelectEvent = (event) => {
    setSelectedJob(event.job);
    // For now, just log the job - replace with modal when you have JobDetailModal
    console.log('Job selected:', event.job);
  };

  const handleSelectSlot = ({ start, end, resource }) => {
    setSelectedSlot({ start, end, resource });
    setShowScheduleTypeModal(true);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Custom components for React Big Calendar
  const CustomEvent = ({ event }) => (
    <div className="p-1">
      <div className="font-semibold text-xs truncate">{event.title}</div>
      {event.job.property && (
        <div className="text-xs opacity-75 truncate">
          {event.job.property.name}
        </div>
      )}
    </div>
  );

  const CustomToolbar = () => null; // We'll use our own toolbar

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Schedule</h1>
              <p className="text-blue-100">Manage appointments and work orders</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowScheduleTypeModal(true)}
                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Schedule Work
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        {/* Custom Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* View Selector */}
          <div className="flex items-center gap-2">
            <CustomDropdown
              value={currentView}
              onChange={handleViewChange}
              options={viewOptions}
              className="min-w-[140px]"
            />
            
            <button
              onClick={goToToday}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Today
            </button>
          </div>

          {/* Date Display */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {moment(currentDate).format('MMMM YYYY')}
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Property Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <CustomDropdown
                value={filterProperty}
                onChange={setFilterProperty}
                options={propertyOptions}
                placeholder="All Properties"
                showSearch={allProperties.length > 10}
                searchPlaceholder="Search properties..."
                className="min-w-[180px]"
              />
            </div>

            {/* Team Filter */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <CustomDropdown
                value={filterTeamMember}
                onChange={setFilterTeamMember}
                options={teamOptions}
                placeholder="All Team Members"
                showSearch={teamMembers.length > 5}
                searchPlaceholder="Search team members..."
                className="min-w-[180px]"
              />
            </div>

            {/* Resource View Toggle */}
            {(currentView === 'day' || currentView === 'week') && (
              <button
                onClick={() => setShowResourceView(!showResourceView)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${showResourceView 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <User className="w-4 h-4" />
                Team Columns
              </button>
            )}
          </div>
        </div>

        {/* React Big Calendar */}
        <div className="calendar-container" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            resourceAccessor="resource"
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            resources={showResourceView ? resources : undefined}
            views={['month', 'week', 'day', 'agenda']}
            view={currentView}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
              toolbar: CustomToolbar
            }}
            step={60}
            timeslots={1}
            min={moment().hours(6).minutes(0).toDate()}
            max={moment().hours(22).minutes(0).toDate()}
            scrollToTime={moment().hours(8).minutes(0).toDate()}
            dayLayoutAlgorithm="no-overlap"
          />
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50/70 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h5>
          <div className="flex flex-wrap gap-4 text-xs">
            {[
              { status: 'SCHEDULED', color: '#3b82f6', label: 'Scheduled' },
              { status: 'IN_PROGRESS', color: '#8b5cf6', label: 'In Progress' },
              { status: 'COMPLETED', color: '#10b981', label: 'Completed' },
              { status: 'OVERDUE', color: '#ef4444', label: 'Overdue' },
              { status: 'CANCELLED', color: '#6b7280', label: 'Cancelled' }
            ].map(({ status, color, label }) => (
              <div key={status} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: color }}
                ></div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showScheduleTypeModal && (
        <ScheduleTypeModal
          isOpen={showScheduleTypeModal}
          onClose={() => {
            setShowScheduleTypeModal(false);
            setSelectedSlot(null);
          }}
          onScheduleComplete={() => {
            fetchAllData();
            setShowScheduleTypeModal(false);
            setSelectedSlot(null);
          }}
          allProperties={allProperties}
          initialDate={selectedSlot?.start}
          initialTime={selectedSlot?.start ? moment(selectedSlot.start).format('HH:mm') : undefined}
          initialTeamMember={selectedSlot?.resource}
        />
      )}

      {/* Job Detail Modal - Add back when you have the component */}
      {/* {selectedJob && (
        <JobDetailModal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
          onUpdate={fetchAllData}
        />
      )} */}
    </div>
  );
};

export default IntegratedCalendar;
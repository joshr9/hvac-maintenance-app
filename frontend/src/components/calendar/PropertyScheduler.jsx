import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import ScheduleModal from './ScheduleModal';
import TodaysJobs from './TodaysJobs';
import UpcomingJobs from './UpcomingJobs';
import DayDetailsModal from './DayDetailsModal';
import CustomDropdown from '../common/CustomDropdown';
import CustomPropertyDropdown from './CustomPropertyDropdown';

const PropertyScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [allMaintenanceLogs, setAllMaintenanceLogs] = useState([]);
  const [allScheduledJobs, setAllScheduledJobs] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [filterProperty, setFilterProperty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all properties with suites and HVAC units
      const propertiesRes = await fetch('/api/properties');
      if (!propertiesRes.ok) throw new Error('Failed to fetch properties');
      const properties = await propertiesRes.json();
      setAllProperties(Array.isArray(properties) ? properties : []);

      // Fetch all maintenance logs
      try {
        const logsRes = await fetch('/api/maintenance');
        if (logsRes.ok) {
          const logs = await logsRes.json();
          console.log('Loaded maintenance logs:', logs);
          setAllMaintenanceLogs(Array.isArray(logs) ? logs : []);
        } else {
          console.warn('Failed to fetch maintenance logs:', logsRes.status);
          setAllMaintenanceLogs([]);
        }
      } catch (logError) {
        console.error('Error fetching maintenance logs:', logError);
        setAllMaintenanceLogs([]);
      }

      // Fetch all scheduled jobs
      try {
        const scheduledRes = await fetch('/api/scheduled-maintenance/all');
        if (scheduledRes.ok) {
          const contentType = scheduledRes.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const scheduled = await scheduledRes.json();
            console.log('Loaded scheduled jobs:', scheduled);
            setAllScheduledJobs(Array.isArray(scheduled) ? scheduled : []);
          } else {
            console.warn('Scheduled maintenance endpoint returned non-JSON response');
            setAllScheduledJobs([]);
          }
        } else if (scheduledRes.status === 404) {
          console.warn('Scheduled maintenance endpoint not found - this is expected if the feature is not yet implemented');
          setAllScheduledJobs([]);
        } else {
          console.warn('Failed to fetch scheduled jobs:', scheduledRes.status);
          setAllScheduledJobs([]);
        }
      } catch (scheduleError) {
        console.error('Error fetching scheduled jobs:', scheduleError);
        setAllScheduledJobs([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

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
      setShowScheduleModal(true);
    }
  };

  const handleScheduleComplete = () => {
    fetchAllData(); // Refresh data
    setShowScheduleModal(false);
  };

  // Get upcoming jobs for quick overview
  const upcomingJobs = allScheduledJobs
    .filter(job => {
      const jobDate = new Date(job.date);
      const isUpcoming = jobDate >= new Date().setHours(0, 0, 0, 0) && job.status === 'SCHEDULED';
      const matchesFilter = filterProperty === 'all' || 
        job.suite?.propertyId === parseInt(filterProperty);
      return isUpcoming && matchesFilter;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchAllData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/DeanCallan.png" 
                alt="Dean Callan Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Property Maintenance Scheduler</h1>
                <p className="text-gray-600">Dispatch and track maintenance across all properties</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors shadow-lg"
                style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)', boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'}}
                type="button"
              >
                <Plus className="w-5 h-5" />
                Schedule Work
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="xl:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Property Filter - only show if managing multiple properties */}
                {allProperties.length > 3 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <CustomDropdown
                      value={filterProperty}
                      onChange={setFilterProperty}
                      options={[
                        { value: 'all', label: 'All Properties' },
                        ...allProperties.map(property => ({
                          value: property.id.toString(),
                          label: property.name
                        }))
                      ]}
                      placeholder="Select property..."
                      showSearch={allProperties.length > 10}
                      searchPlaceholder="Search properties..."
                      className="min-w-[220px]"
                    />
                  </div>
                )}
              </div>

              {/* Calendar Grid Component */}
              <CalendarGrid 
                currentDate={currentDate}
                allMaintenanceLogs={allMaintenanceLogs}
                allScheduledJobs={allScheduledJobs}
                filterProperty={filterProperty}
                onDateClick={handleDateClick}
              />

              {/* Legend */}
              <div className="mt-4 p-3 bg-gray-50/70 rounded-lg backdrop-blur-sm">
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
                            style={{backgroundColor: type === 'INSPECTION' ? '#3b82f6' : type === 'FILTER_CHANGE' ? '#10b981' : type === 'FULL_INSPECTION_CHECKLIST' ? '#2a3a91' : '#ef4444'}}
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TodaysJobs upcomingJobs={upcomingJobs} />
            <UpcomingJobs upcomingJobs={upcomingJobs} />
          </div>
        </div>

        {/* Modals */}
        {selectedDate && (
          <DayDetailsModal 
            selectedDate={selectedDate}
            onClose={() => setSelectedDate(null)}
          />
        )}

        {showScheduleModal && (
          <ScheduleModal
            allProperties={allProperties}
            onClose={() => setShowScheduleModal(false)}
            onScheduleComplete={handleScheduleComplete}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyScheduler;
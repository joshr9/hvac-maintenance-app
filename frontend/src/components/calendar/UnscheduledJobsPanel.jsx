// components/calendar/UnscheduledJobsPanel.jsx - Modern styled version
import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Clock,
  Building,
  User,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Eye,
  Briefcase,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';

const UnscheduledJobsPanel = ({ jobs = [], onScheduleJob }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Helper function to get technician initials
  const getTechnicianInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter jobs based on search and priority
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.property?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  // Priority counts for filter buttons
  const priorityCounts = {
    all: jobs.length,
    URGENT: jobs.filter(j => j.priority === 'URGENT').length,
    HIGH: jobs.filter(j => j.priority === 'HIGH').length,
    MEDIUM: jobs.filter(j => j.priority === 'MEDIUM').length,
    LOW: jobs.filter(j => j.priority === 'LOW').length
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyIndicator = (priority) => {
    if (priority === 'URGENT') {
      return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Unscheduled Jobs</h3>
            <p className="text-gray-600 mt-1">Jobs waiting to be scheduled</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg font-semibold">
            <CalendarIcon className="w-4 h-4" />
            <span>{filteredJobs.length} of {jobs.length}</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
          >
            {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs by title, number, or property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                {Object.entries(priorityCounts).map(([priority, count]) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      priorityFilter === priority
                        ? priority === 'all' 
                          ? 'bg-blue-600 text-white'
                          : getPriorityColor(priority).replace('bg-', 'bg-').replace('text-', 'text-').replace('100', '500').replace('700', 'white')
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {priority === 'all' ? 'All' : priority} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="p-6">
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 hover:scale-[1.02]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {job.jobNumber}
                        </span>
                        {getUrgencyIndicator(job.priority)}
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Priority and Technician */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getTechnicianInitials(job.assignedTechnician)}
                        </div>
                        <span className="text-xs text-gray-600 truncate max-w-20">
                          {job.assignedTechnician}
                        </span>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {job.title}
                    </h4>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{job.property?.name || 'No property'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{job.estimatedDuration || 0} min</span>
                      </div>
                      {job.workType && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.workType.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onScheduleJob(job)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium flex items-center justify-center gap-2 group"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Schedule
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                      
                      <button className="text-gray-400 hover:text-gray-600 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              // No jobs at all
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">All jobs are scheduled!</h4>
                <p className="text-gray-600 mb-4">Great work keeping everything organized.</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
                  <Plus className="w-4 h-4" />
                  Create New Job
                </button>
              </div>
            ) : (
              // No jobs match filters
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No jobs match your filters</h4>
                <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPriorityFilter('all');
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Show All Jobs
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UnscheduledJobsPanel;
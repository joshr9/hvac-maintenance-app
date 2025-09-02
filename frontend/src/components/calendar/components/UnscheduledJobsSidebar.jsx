// components/calendar/components/UnscheduledJobsSidebar.jsx - Enhanced with Drag & Drop
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Building,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Timer,
  Coffee
} from 'lucide-react';
import { useDragDrop, useDraggableJob } from './DragDropProvider';

const CollapsibleUnscheduledJobsSidebar = ({ 
  jobs = [], 
  onScheduleJob, 
  onDragToCalendar, 
  onCreateJob,
  teamMembers = [],
  allProperties = [],
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  
  const { feedback } = useDragDrop();

  // ✅ ENHANCED: Draggable Job Card Component
  const DraggableJobCard = ({ job, index }) => {
    const { dragHandleProps, style, isDragging } = useDraggableJob(
      `unscheduled-${job.id}`, 
      job
    );

    const getPriorityStyles = (priority) => {
      const styles = {
        urgent: { 
          bg: 'bg-red-50', 
          border: 'border-red-200', 
          text: 'text-red-900', 
          badge: 'bg-red-500',
          glow: 'shadow-red-100' 
        },
        high: { 
          bg: 'bg-orange-50', 
          border: 'border-orange-200', 
          text: 'text-orange-900', 
          badge: 'bg-orange-500',
          glow: 'shadow-orange-100' 
        },
        medium: { 
          bg: 'bg-blue-50', 
          border: 'border-blue-200', 
          text: 'text-blue-900', 
          badge: 'bg-blue-500',
          glow: 'shadow-blue-100' 
        },
        low: { 
          bg: 'bg-green-50', 
          border: 'border-green-200', 
          text: 'text-green-900', 
          badge: 'bg-green-500',
          glow: 'shadow-green-100' 
        }
      };
      return styles[priority] || styles.medium;
    };

    const styles = getPriorityStyles(job.priority);

    return (
      <div
        style={style}
        className={`
          group relative overflow-hidden rounded-xl border-2 p-4 mb-3 cursor-grab active:cursor-grabbing
          transition-all duration-200 hover:shadow-xl hover:-translate-y-1
          ${styles.bg} ${styles.border} ${styles.glow}
          ${isDragging ? 'opacity-50 z-50 rotate-3 scale-105' : ''}
        `}
        {...dragHandleProps}
      >
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 transform translate-x-10 -translate-y-10"></div>
        
        {/* Job Header */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Drag Handle Indicator */}
              <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-70 transition-opacity">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </div>
              
              {/* Priority Badge */}
              <div className={`w-4 h-4 rounded-full ${styles.badge} shadow-lg flex-shrink-0`}></div>
              
              {/* Job Title */}
              <h3 className={`font-semibold text-sm ${styles.text} truncate flex-1`}>
                {job.title || 'Untitled Job'}
              </h3>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleJob?.(job);
                }}
                className="p-1 hover:bg-white/30 rounded transition-colors"
                title="Schedule Job"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-3">
            {job.property?.name && (
              <div className="flex items-center gap-2 text-xs opacity-80">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{job.property.name}</span>
              </div>
            )}
            
            {job.estimatedDuration && (
              <div className="flex items-center gap-2 text-xs opacity-80">
                <Timer className="w-3 h-3 flex-shrink-0" />
                <span>{job.estimatedDuration} minutes</span>
              </div>
            )}
            
            {job.description && (
              <p className="text-xs opacity-70 line-clamp-2">
                {job.description}
              </p>
            )}
            
            {job.createdAt && (
              <div className="flex items-center gap-2 text-xs opacity-60">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Drag Indicator Overlay */}
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg">
              <ArrowRight className="w-4 h-4" />
              Drag to Schedule
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ ENHANCED: Filtering and Sorting
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.property?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(job => job.priority === filterPriority);
    }

    // Apply property filter
    if (filterProperty !== 'all') {
      filtered = filtered.filter(job => job.property?.id === filterProperty);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'title':
          return a.title?.localeCompare(b.title) || 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, filterPriority, filterProperty, sortBy]);

  // ✅ ENHANCED: Collapsed View
  if (isCollapsed) {
    return (
      <div className={`w-20 bg-white border-l border-gray-200 shadow-lg flex flex-col ${className}`}>
        {/* Collapsed Header */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center group"
            title="Expand Sidebar"
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        {/* Collapsed Stats */}
        <div className="flex-1 flex flex-col items-center justify-center p-3">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
              <span className="text-orange-600 font-bold text-lg">{jobs.length}</span>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-900 mb-1">Jobs</div>
              <div className="text-xs text-gray-500 mb-1">Need</div>
              <div className="text-xs text-gray-500">Scheduling</div>
            </div>
          </div>
          
          {/* Priority indicators */}
          <div className="space-y-1 mb-4">
            {['urgent', 'high', 'medium', 'low'].map(priority => {
              const count = jobs.filter(job => job.priority === priority).length;
              if (count === 0) return null;
              const colors = {
                urgent: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-blue-500',
                low: 'bg-green-500'
              };
              return (
                <div key={priority} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors[priority]}`}></div>
                  <span className="text-xs text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Collapsed Create Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => onCreateJob?.()}
            className="w-full p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors flex items-center justify-center group"
            title="Create New Job"
          >
            <Plus className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Expanded View
  return (
    <div className={`w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Unscheduled Jobs</h2>
                <p className="text-sm opacity-90">
                  {filteredAndSortedJobs.length} of {jobs.length} jobs
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 text-orange-100 hover:bg-white/10 rounded-lg transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Feedback Bar */}
      {feedback && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="text-sm text-blue-800 font-medium">{feedback}</div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Created</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">
              {jobs.length === 0 ? 'All caught up!' : 'No matching jobs'}
            </p>
            <p className="text-sm opacity-75">
              {jobs.length === 0 ? 'No unscheduled jobs' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredAndSortedJobs.map((job, index) => (
              <DraggableJobCard key={job.id} job={job} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <button
          onClick={() => onCreateJob?.()}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create New Job
        </button>
        
        {/* Quick Actions */}
        {jobs.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-4">
            <button 
              onClick={() => {
                // Auto-schedule functionality
                console.log('Auto-schedule all jobs');
              }}
              className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Auto-schedule all
            </button>
            <span className="text-gray-400">•</span>
            <button 
              onClick={() => {
                // Bulk assign functionality
                console.log('Bulk assign technician');
              }}
              className="text-xs text-gray-600 hover:text-green-600 transition-colors font-medium"
            >
              Bulk assign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleUnscheduledJobsSidebar;
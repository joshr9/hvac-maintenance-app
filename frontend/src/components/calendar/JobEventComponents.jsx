import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle, 
  Wrench, 
  Home,
  Plus,
  Eye,
  Calendar,
  Timer,
  CheckCircle2,
  Phone
} from 'lucide-react';

// Utility function shared by all components
const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Enhanced priority styles with better contrast and readability
const getPriorityStyles = (priority) => {
  const styles = {
    URGENT: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      text: 'text-white',
      shadow: 'shadow-lg shadow-red-500/25',
      ring: 'ring-2 ring-red-300',
      pulse: true
    },
    HIGH: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      text: 'text-white',
      shadow: 'shadow-lg shadow-orange-500/25',
      ring: 'ring-2 ring-orange-300',
      pulse: false
    },
    MEDIUM: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-white',
      shadow: 'shadow-lg shadow-blue-500/25',
      ring: 'ring-2 ring-blue-300',
      pulse: false
    },
    LOW: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      text: 'text-white',
      shadow: 'shadow-lg shadow-green-500/25',
      ring: 'ring-2 ring-green-300',
      pulse: false
    }
  };
  return styles[priority] || styles.MEDIUM;
};

// Work type icons and colors
const getWorkTypeIcon = (workType) => {
  const icons = {
    MAINTENANCE: { icon: Wrench, color: 'text-blue-200' },
    INSPECTION: { icon: Eye, color: 'text-green-200' },
    REPAIR: { icon: AlertTriangle, color: 'text-red-200' },
    INSTALLATION: { icon: Plus, color: 'text-purple-200' },
    HVAC: { icon: Timer, color: 'text-orange-200' },
    PLUMBING: { icon: Wrench, color: 'text-blue-200' },
    ELECTRICAL: { icon: AlertTriangle, color: 'text-yellow-200' },
    GENERAL: { icon: Home, color: 'text-gray-200' }
  };
  return icons[workType] || icons.GENERAL;
};

// MUCH LARGER, MORE READABLE Job Event Card
const ReadableJobEvent = ({ event, onViewMore }) => {
  const [isHovered, setIsHovered] = useState(false);
  const job = event.job;
  const priority = job.priority || 'MEDIUM';
  const styles = getPriorityStyles(priority);
  const { icon: WorkIcon, color: iconColor } = getWorkTypeIcon(job.workType);
  
  const getDuration = () => {
    const duration = job.estimatedDuration || 120;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTechnicianInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      className={`relative w-full h-full min-h-[120px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform ${
        isHovered ? 'scale-105 z-20' : 'scale-100 z-10'
      } ${styles.shadow} ${styles.bg} ${isHovered ? styles.ring : ''} ${
        styles.pulse ? 'animate-pulse' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Main Content */}
      <div className="relative h-full p-4 text-white">
        
        {/* Header Row - Job Title & Priority */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <WorkIcon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm truncate leading-tight">
                {job.title}
              </h3>
              <p className="text-xs opacity-90 font-medium">
                #{job.jobNumber}
              </p>
            </div>
          </div>
          
          {/* Priority Badge */}
          <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
            {priority}
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="space-y-2 text-xs">
          
          {/* Property & Location */}
          <div className="flex items-center gap-2">
            <Home className="w-3.5 h-3.5 flex-shrink-0 opacity-90" />
            <span className="font-medium truncate">
              {job.property?.name || 'Unknown Property'}
            </span>
          </div>
          
          {/* Time & Duration */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 opacity-90" />
            <span className="font-medium">
              {formatTime(event.start)} • {getDuration()}
            </span>
          </div>

          {/* Technician with Avatar */}
          {job.assignedTechnician && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                {getTechnicianInitials(job.assignedTechnician)}
              </div>
              <span className="font-medium truncate">
                {job.assignedTechnician}
              </span>
            </div>
          )}

          {/* Suite/Unit if available */}
          {job.suite && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 opacity-90" />
              <span className="font-medium">
                Unit {job.suite}
              </span>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
          <div className={`h-full transition-all duration-300 ${
            job.status === 'COMPLETED' ? 'bg-green-400 w-full' :
            job.status === 'IN_PROGRESS' ? 'bg-blue-400 w-3/4' :
            job.status === 'SCHEDULED' ? 'bg-yellow-400 w-1/4' :
            'bg-gray-400 w-0'
          }`}></div>
        </div>

        {/* Hover Overlay with Quick Actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-center">
            <div className="text-center space-y-3">
              <div>
                <div className="text-sm font-bold">{job.title}</div>
                <div className="text-xs opacity-90">#{job.jobNumber}</div>
              </div>
              
              {job.description && (
                <div className="text-xs opacity-80 line-clamp-3 px-2">
                  {job.description}
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2">
                <button className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors">
                  <Eye className="w-3 h-3 inline mr-1" />
                  Details
                </button>
                <button className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium hover:bg-white/30 transition-colors">
                  <Phone className="w-3 h-3 inline mr-1" />
                  Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Multi-Job Summary Card for High Density Days
const MultiJobSummaryCard = ({ dayJobs, onViewMore }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get priority distribution
  const priorityCounts = dayJobs.reduce((acc, job) => {
    const priority = job.priority || 'MEDIUM';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const getHighestPriority = () => {
    if (priorityCounts.URGENT) return 'URGENT';
    if (priorityCounts.HIGH) return 'HIGH';
    if (priorityCounts.MEDIUM) return 'MEDIUM';
    return 'LOW';
  };

  const highestPriority = getHighestPriority();
  const styles = getPriorityStyles(highestPriority);

  return (
    <div className="w-full h-full min-h-[140px] space-y-2">
      
      {/* Summary Header */}
      <div className={`${styles.bg} ${styles.shadow} rounded-xl p-3 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-bold text-sm">
              {dayJobs.length} Jobs Today
            </span>
          </div>
          
          {/* Priority Distribution Dots */}
          <div className="flex gap-1">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const pStyles = getPriorityStyles(priority);
              return (
                <div
                  key={priority}
                  className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm text-xs flex items-center justify-center font-bold"
                  title={`${count} ${priority.toLowerCase()} priority`}
                >
                  {count}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Time Range */}
        <div className="text-xs opacity-90">
          {dayJobs.length > 0 && (
            <span>
              {formatTime(dayJobs[0].scheduledTime)} - {formatTime(dayJobs[dayJobs.length - 1].scheduledTime)}
            </span>
          )}
        </div>
      </div>

      {/* Compact Job List */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {dayJobs.slice(0, 3).map((job, index) => {
          const jobStyles = getPriorityStyles(job.priority || 'MEDIUM');
          return (
            <div
              key={job.id || index}
              className={`p-2 rounded-lg ${jobStyles.bg} text-white cursor-pointer transition-all duration-200 hover:scale-102`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs font-medium truncate">{job.title}</span>
                </div>
                <span className="text-xs opacity-90">
                  {job.scheduledTime || '9:00 AM'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {dayJobs.length > 3 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewMore(dayJobs);
          }}
          className="w-full p-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" />
          +{dayJobs.length - 3} More Jobs
        </button>
      )}
    </div>
  );
};

// Adaptive Job Event Component
export const AdaptiveJobEvent = ({ event, dayJobs, onViewMore }) => {
  const jobCount = dayJobs?.length || 1;
  
  // Use readable single job card for low density
  if (jobCount <= 1) {
    return <ReadableJobEvent event={event} onViewMore={onViewMore} />;
  }
  
  // Use summary card for multiple jobs
  return <MultiJobSummaryCard dayJobs={dayJobs} onViewMore={onViewMore} />;
};

export default AdaptiveJobEvent;
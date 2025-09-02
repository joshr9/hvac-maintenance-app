// CompactHeaderStats.jsx - Essential Info Badges
import React from 'react';
import { 
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

const CompactHeaderStats = ({ 
  jobStats, 
  filteredJobsCount, 
  unscheduledCount,
  calendarViewType 
}) => {
  const statBadges = [
    {
      icon: Calendar,
      label: 'Scheduled',
      value: filteredJobsCount,
      total: jobStats.total,
      color: 'blue',
      trend: filteredJobsCount !== jobStats.total ? `${jobStats.total - filteredJobsCount} filtered` : null
    },
    {
      icon: AlertTriangle,
      label: 'Urgent',
      value: jobStats.urgent,
      color: jobStats.urgent > 0 ? 'red' : 'gray',
      pulse: jobStats.urgent > 0
    },
    {
      icon: Users,
      label: 'Technicians',
      value: jobStats.technicians,
      color: 'green'
    },
    {
      icon: Clock,
      label: 'Unscheduled',
      value: unscheduledCount,
      color: unscheduledCount > 0 ? 'orange' : 'gray',
      highlight: unscheduledCount > 0
    }
  ];

  const getBadgeStyle = (color, pulse = false, highlight = false) => {
    const baseClass = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    
    const colorMap = {
      blue: `${baseClass} bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100`,
      red: `${baseClass} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100`,
      green: `${baseClass} bg-green-50 text-green-700 border border-green-200 hover:bg-green-100`,
      orange: `${baseClass} bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100`,
      gray: `${baseClass} bg-gray-50 text-gray-600 border border-gray-200`
    };

    let className = colorMap[color] || colorMap.gray;
    
    if (pulse) {
      className += " animate-pulse";
    }
    
    if (highlight) {
      className += " ring-2 ring-orange-300 ring-opacity-50";
    }

    return className;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        
        {/* Left: Essential Stats Badges */}
        <div className="flex items-center gap-4">
          {statBadges.map(({ icon: Icon, label, value, total, color, trend, pulse, highlight }) => (
            <div 
              key={label}
              className={getBadgeStyle(color, pulse, highlight)}
              title={trend}
            >
              <Icon className="w-4 h-4" />
              <span className="font-semibold">{value}</span>
              {total !== undefined && total !== value && (
                <span className="text-xs opacity-75">/{total}</span>
              )}
              <span className="text-xs opacity-80">{label}</span>
              {trend && (
                <span className="text-xs opacity-60 ml-1">({trend})</span>
              )}
            </div>
          ))}
        </div>

        {/* Right: View Context & Quick Stats */}
        <div className="flex items-center gap-4">
          
          {/* Current View Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 text-sm">
            <Activity className="w-4 h-4" />
            <span className="font-medium">
              {calendarViewType === 'team' ? 'Team View' : 
               calendarViewType === 'zone' ? 'Zone View' : 
               'All Jobs'}
            </span>
          </div>

          {/* Completion Rate */}
          {jobStats.total > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">
                {Math.round(((jobStats.total - jobStats.unscheduled) / jobStats.total) * 100)}%
              </span>
              <span className="text-xs opacity-80">Scheduled</span>
            </div>
          )}

          {/* Quick Insights */}
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </div>
      </div>

      {/* Optional: Priority Distribution Bar (Minimal) */}
      {jobStats.total > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Priority:</span>
          <div className="flex h-1.5 bg-gray-200 rounded-full overflow-hidden flex-1 max-w-xs">
            {jobStats.urgent > 0 && (
              <div 
                className="bg-red-500 h-full"
                style={{ width: `${(jobStats.urgent / jobStats.total) * 100}%` }}
                title={`${jobStats.urgent} urgent jobs`}
              />
            )}
            {jobStats.high > 0 && (
              <div 
                className="bg-orange-500 h-full"
                style={{ width: `${(jobStats.high / jobStats.total) * 100}%` }}
                title={`${jobStats.high} high priority jobs`}
              />
            )}
            {jobStats.medium > 0 && (
              <div 
                className="bg-yellow-500 h-full"
                style={{ width: `${(jobStats.medium / jobStats.total) * 100}%` }}
                title={`${jobStats.medium} medium priority jobs`}
              />
            )}
            {jobStats.low > 0 && (
              <div 
                className="bg-green-500 h-full"
                style={{ width: `${(jobStats.low / jobStats.total) * 100}%` }}
                title={`${jobStats.low} low priority jobs`}
              />
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {jobStats.urgent > 0 && <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{jobStats.urgent}</span>}
            {jobStats.high > 0 && <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div>{jobStats.high}</span>}
            {jobStats.medium > 0 && <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div>{jobStats.medium}</span>}
            {jobStats.low > 0 && <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div>{jobStats.low}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactHeaderStats;
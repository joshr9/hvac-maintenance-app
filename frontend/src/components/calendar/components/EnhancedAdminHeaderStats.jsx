// components/calendar/components/EnhancedAdminHeaderStats.jsx - Your Design + Drag & Drop Feedback
import React from 'react';
import { 
  Calendar, 
  AlertTriangle, 
  Users, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Eye
} from 'lucide-react';

const EnhancedAdminHeaderStats = ({ 
  jobStats = {}, 
  filteredJobsCount = 0, 
  unscheduledCount = 0,
  calendarViewType = 'combined',
  adminViewMode = 'swimlanes',
  setAdminViewMode,
  teamMembersCount = 0,
  // ✅ NEW: Only add this prop for drag & drop feedback
  feedback = ''
}) => {
  // Calculate completion percentage
  const totalJobs = filteredJobsCount + unscheduledCount;
  const scheduledPercentage = totalJobs > 0 ? Math.round((filteredJobsCount / totalJobs) * 100) : 0;

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Stats Row */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Side - Key Metrics */}
          <div className="flex items-center gap-8">
            
            {/* Scheduled Jobs */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{filteredJobsCount}</div>
                <div className="text-sm text-gray-500">Scheduled</div>
              </div>
            </div>

            {/* Urgent Jobs */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                (jobStats.urgent || 0) > 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  (jobStats.urgent || 0) > 0 ? 'text-red-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  (jobStats.urgent || 0) > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {jobStats.urgent || 0}
                </div>
                <div className="text-sm text-gray-500">Urgent</div>
              </div>
            </div>

            {/* Technicians */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{teamMembersCount}</div>
                <div className="text-sm text-gray-500">Technicians</div>
              </div>
            </div>

            {/* Unscheduled */}
            {unscheduledCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{unscheduledCount}</div>
                  <div className="text-sm text-gray-500">Unscheduled</div>
                </div>
              </div>
            )}

            {/* ✅ NEW: Drag & Drop Feedback (only show when there's feedback) */}
            {feedback && (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                feedback.startsWith('✅') ? 'bg-green-100 text-green-800' :
                feedback.startsWith('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                feedback.startsWith('❌') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {feedback}
              </div>
            )}

          </div>

          {/* Right Side - Progress & Controls */}
          <div className="flex items-center gap-6">
            
            {/* Completion Progress */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{scheduledPercentage}%</div>
                <div className="text-sm text-gray-500">Scheduled</div>
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${scheduledPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setAdminViewMode('swimlanes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  adminViewMode === 'swimlanes' 
                    ? 'bg-white text-blue-700 shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-current rounded opacity-60"></div>
                  <div className="w-1 h-4 bg-current rounded opacity-80"></div>
                  <div className="w-1 h-4 bg-current rounded"></div>
                </div>
                Swim Lanes
              </button>
              <button
                onClick={() => setAdminViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  adminViewMode === 'calendar' 
                    ? 'bg-white text-blue-700 shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Secondary Info Row */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          
          {/* Left - Filters & Context */}
          <div className="flex items-center gap-6 text-gray-600">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              All Jobs
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {scheduledPercentage}% Scheduled
            </span>
            <span>Last updated: {new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}</span>
          </div>

          {/* Right - Current View Context */}
          <div className="flex items-center gap-4 text-gray-500">
            <span>
              {adminViewMode === 'swimlanes' ? '🏊‍♂️ Workload Management View' : '📅 Time Management View'}
            </span>
            <div className="flex items-center gap-2">
              <span>Priority:</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" title="Urgent"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full" title="High"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Medium"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Low"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminHeaderStats;
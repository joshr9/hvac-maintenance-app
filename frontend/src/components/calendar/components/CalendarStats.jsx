// Enhanced CalendarStats.jsx - Rich Visual Design
import React from 'react';
import { 
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Eye
} from 'lucide-react';

const CalendarStats = ({ 
  jobStats, 
  filteredJobsCount, 
  calendarViewType 
}) => {
  // Calculate completion rate and trends
  const completionRate = jobStats.total > 0 ? Math.round((jobStats.total - jobStats.unscheduled) / jobStats.total * 100) : 0;
  const urgentPercentage = jobStats.total > 0 ? Math.round(jobStats.urgent / jobStats.total * 100) : 0;
  
  const statCards = [
    {
      title: 'Scheduled Today',
      value: filteredJobsCount,
      total: jobStats.total,
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      description: 'Active on calendar',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Urgent Priority',
      value: jobStats.urgent,
      percentage: urgentPercentage,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      description: 'Need immediate attention',
      trend: '-5%',
      trendUp: false
    },
    {
      title: 'Active Technicians',
      value: jobStats.technicians,
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      description: 'Currently assigned',
      trend: '+2',
      trendUp: true
    },
    {
      title: 'Awaiting Schedule',
      value: jobStats.unscheduled,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      description: 'In queue',
      trend: '-3',
      trendUp: false
    }
  ];

  const priorityData = [
    { label: 'Urgent', count: jobStats.urgent, color: 'bg-red-500', lightColor: 'bg-red-100', textColor: 'text-red-600' },
    { label: 'High', count: jobStats.high, color: 'bg-orange-500', lightColor: 'bg-orange-100', textColor: 'text-orange-600' },
    { label: 'Medium', count: jobStats.medium, color: 'bg-yellow-500', lightColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { label: 'Low', count: jobStats.low, color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-600' }
  ];

  const maxCount = Math.max(...priorityData.map(p => p.count));

  return (
    <div className="space-y-8">
      
      {/* Enhanced Statistics Cards with Gradients and Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ title, value, total, percentage, icon: Icon, gradient, bgGradient, description, trend, trendUp }) => (
          <div
            key={title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 transform translate-x-16 -translate-y-16"></div>
            
            <div className="relative p-6">
              {/* Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${trendUp ? '' : 'rotate-180'}`} />
                    {trend}
                  </div>
                )}
              </div>
              
              {/* Main Value */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                    {value}
                  </span>
                  {total !== undefined && total !== value && (
                    <span className="text-lg text-gray-500">/ {total}</span>
                  )}
                  {percentage !== undefined && (
                    <span className="text-sm font-medium text-gray-600">({percentage}%)</span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
                  <p className="text-gray-600 text-sm">{description}</p>
                </div>
              </div>

              {/* Progress Bar for cards that have totals */}
              {total !== undefined && total > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${(value / total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Priority Breakdown and View Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Priority Breakdown - More Visual */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Priority Distribution</h3>
            </div>
          </div>
          
          <div className="p-6">
            {/* Priority Bars with Animation */}
            <div className="space-y-4">
              {priorityData.map(({ label, count, color, lightColor, textColor }) => (
                <div key={label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color} shadow-sm`}></div>
                      <span className="font-medium text-gray-700">{label} Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500">jobs</span>
                    </div>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md`}
                        style={{ 
                          width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%',
                          minWidth: count > 0 ? '8px' : '0px'
                        }}
                      ></div>
                    </div>
                    {/* Percentage Label */}
                    {jobStats.total > 0 && (
                      <div className={`absolute right-2 top-0 h-full flex items-center`}>
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {Math.round((count / jobStats.total) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{jobStats.total}</div>
                  <div className="text-sm text-gray-600">Total Jobs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Current View Context */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-xl">
                {calendarViewType === 'team' ? <Users className="w-5 h-5 text-white" /> : 
                 calendarViewType === 'zone' ? <MapPin className="w-5 h-5 text-white" /> : 
                 <Target className="w-5 h-5 text-white" />}
              </div>
              <h3 className="text-lg font-bold text-gray-900">Current View</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* View Type Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">View Mode</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  calendarViewType === 'team' ? 'bg-blue-100 text-blue-800' :
                  calendarViewType === 'zone' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {calendarViewType === 'team' ? 'Team Members' : 
                   calendarViewType === 'zone' ? 'By Zones' : 
                   'All Jobs'}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {calendarViewType === 'team' ? 'Organized by technician assignments' :
                 calendarViewType === 'zone' ? 'Grouped by property zones' :
                 'Combined overview of all activities'}
              </p>
            </div>
            
            {/* Job Display Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">Displaying</span>
                </div>
                <span className="text-blue-900 font-bold">{filteredJobsCount} of {jobStats.total}</span>
              </div>

              {filteredJobsCount !== jobStats.total && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 text-sm font-medium">
                    {jobStats.total - filteredJobsCount} jobs hidden by filters
                  </span>
                </div>
              )}

              {jobStats.unscheduled > 0 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 text-sm font-medium">
                    {jobStats.unscheduled} jobs need scheduling
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                  <Zap className="w-4 h-4" />
                  Auto-schedule urgent jobs
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  View completed today
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarStats;
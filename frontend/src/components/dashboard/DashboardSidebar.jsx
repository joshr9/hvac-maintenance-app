import React from 'react';
import { 
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  Camera,
  Target
} from 'lucide-react';

const DashboardSidebar = ({ recentActivity, upcomingJobs, dashboardStats, onNavigate }) => {
  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'job_completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'job_started': return <Clock className="w-5 h-5 text-blue-600" />;
        case 'quote_sent': return <DollarSign className="w-5 h-5 text-purple-600" />;
        case 'photo_uploaded': return <Camera className="w-5 h-5 text-orange-600" />;
        default: return <Activity className="w-5 h-5 text-gray-600" />;
      }
    };

    return (
      <div className="flex items-start gap-3 p-3 hover:bg-gray-50/50 rounded-lg transition-colors">
        <div className="mt-0.5">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
          <p className="text-sm text-gray-600">{activity.description}</p>
          {activity.technician && (
            <p className="text-xs text-gray-500 mt-1">by {activity.technician}</p>
          )}
          {activity.amount && (
            <p className="text-sm font-medium text-green-600 mt-1">{activity.amount}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button 
              onClick={() => onNavigate('jobs')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="p-2">
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* Upcoming Jobs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Upcoming Jobs</h3>
        </div>
        <div className="p-4 space-y-3">
          {upcomingJobs.map((day) => (
            <div key={day.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{day.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{day.count} jobs</span>
                <div className={`w-2 h-2 rounded-full ${
                  day.priority === 'HIGH' ? 'bg-red-500' :
                  day.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)'}}>
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">This Month</h3>
            <p className="text-sm text-gray-600">Performance overview</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Avg Job Value</span>
            <span className="font-semibold text-gray-900">${dashboardStats.avgJobValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Technician Utilization</span>
            <span className="font-semibold text-gray-900">{dashboardStats.technicianUtilization}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Jobs Completed</span>
            <span className="font-semibold text-gray-900">{dashboardStats.completedThisWeek}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
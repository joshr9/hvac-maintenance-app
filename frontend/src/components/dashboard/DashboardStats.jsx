import React from 'react';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  CheckCircle,
  TrendingUp, 
  TrendingDown
} from 'lucide-react';

const DashboardStats = ({ stats }) => {
  const StatCard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`} style={{background: `linear-gradient(135deg, ${color.includes('blue') ? '#2a3a91' : color.includes('orange') ? '#f59e0b' : color.includes('green') ? '#10b981' : '#8b5cf6'} 0%, ${color.includes('blue') ? '#3b4ae6' : color.includes('orange') ? '#fbbf24' : color.includes('green') ? '#34d399' : '#a78bfa'} 100%)`}}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Jobs"
        value={stats.totalJobs}
        change={stats.jobsChange}
        icon={Briefcase}
        color="bg-blue-600"
      />
      <StatCard
        title="Active Jobs"
        value={stats.activeJobs}
        change={stats.activeChange}
        icon={Clock}
        color="bg-orange-600"
      />
      <StatCard
        title="Revenue (MTD)"
        value={stats.revenueThisMonth}
        change={stats.revenueChange}
        icon={DollarSign}
        color="bg-green-600"
        prefix="$"
      />
      <StatCard
        title="Completed This Week"
        value={stats.completedThisWeek}
        change={stats.completedChange}
        icon={CheckCircle}
        color="bg-purple-600"
      />
    </div>
  );
};

export default DashboardStats;
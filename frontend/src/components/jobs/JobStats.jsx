// components/jobs/JobStats.jsx
import React from 'react';
import { Briefcase, Clock, Activity, Award } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, change, prefix = '', suffix = '' }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0 pr-4"> {/* Add flex-1 min-w-0 for text, pr-4 for spacing */}
        <p className="text-sm font-medium text-gray-600 mb-1 leading-tight">{title}</p> {/* Add leading-tight */}
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+{change}%</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}> {/* Add flex-shrink-0 */}
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const JobStats = ({ stats = {} }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Jobs"
        value={stats.totalJobs || 0}
        icon={Briefcase}
        color="bg-blue-600"
      />
      <StatCard
        title="Active Jobs"
        value={stats.scheduledJobs || 0}
        icon={Clock}
        color="bg-orange-600"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgressJobs || 0}
        icon={Activity}
        color="bg-green-600"
      />
      <StatCard
        title="Completed"
        value={stats.completedThisWeek || 0}
        icon={Award}
        color="bg-yellow-600"
      />
    </div>
  );
};

export default JobStats;
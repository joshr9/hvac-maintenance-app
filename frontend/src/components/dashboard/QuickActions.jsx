import React from 'react';
import { 
  Wrench,
  Calendar,
  MapPin,
  Eye,
  ArrowRight
} from 'lucide-react';

const QuickActions = ({ onNavigate, onOpenModal, activeJobs }) => {
  const QuickActionCard = ({ title, description, icon: Icon, color, onClick, badge = null }) => (
    <button
      onClick={onClick}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left w-full group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform`} style={{background: `linear-gradient(135deg, ${color.includes('blue') ? '#2a3a91' : color.includes('green') ? '#10b981' : color.includes('purple') ? '#8b5cf6' : '#f59e0b'} 0%, ${color.includes('blue') ? '#3b4ae6' : color.includes('green') ? '#34d399' : color.includes('purple') ? '#a78bfa' : '#fbbf24'} 100%)`}}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {badge && (
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex items-center text-blue-600 text-sm font-medium mt-3 group-hover:text-blue-700">
        <span>Get started</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Quick Maintenance"
          description="Log HVAC maintenance quickly"
          icon={Wrench}
          color="bg-blue-600"
          onClick={() => onOpenModal('maintenance')}
        />
        <QuickActionCard
          title="Schedule Work"
          description="Create new job or appointment"
          icon={Calendar}
          color="bg-green-600"
          onClick={() => onOpenModal('schedule')}
        />
        <QuickActionCard
          title="Property Search"
          description="Find and manage properties"
          icon={MapPin}
          color="bg-purple-600"
          onClick={() => onOpenModal('propertySearch')}
        />
        <QuickActionCard
          title="View All Jobs"
          description="Manage active work orders"
          icon={Eye}
          color="bg-orange-600"
          onClick={() => onNavigate('jobs')}
          badge={activeJobs}
        />
      </div>
    </div>
  );
};

export default QuickActions;
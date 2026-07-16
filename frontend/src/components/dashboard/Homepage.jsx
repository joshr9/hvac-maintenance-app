import React, { useState, useEffect } from 'react';
import { Wrench, Building, Zap, Plus, ArrowRight, Briefcase, MessageSquare, CheckSquare, BarChart3, Clock, Shield } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

const StatCard = ({ value, label, color = 'text-[#101d40]' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const ActionCard = ({ icon: Icon, label, description, color, borderColor, onClick }) => (
  <button
    onClick={onClick}
    className={`bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition-all flex items-center justify-between gap-3 group text-left w-full`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold text-[15px] text-gray-900">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{description}</div>
      </div>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
  </button>
);

const Homepage = ({ onNavigate, onOpenModal }) => {
  const { user } = useAuthContext();
  const [hvacStats, setHvacStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [jobStats, setJobStats] = useState({});
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.organizationRole === 'org:admin' || user?.organizationRole === 'admin';

  useEffect(() => {
    const load = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const [hvacRes, propsRes, jobsRes] = await Promise.all([
          fetch(`${apiUrl}/api/hvac-units/stats`),
          fetch(`${apiUrl}/api/properties`),
          fetch(`${apiUrl}/api/jobs/stats`),
        ]);
        if (hvacRes.ok) setHvacStats(await hvacRes.json());
        if (propsRes.ok) { const d = await propsRes.json(); setProperties(Array.isArray(d) ? d : []); }
        if (jobsRes.ok) setJobStats(await jobsRes.json());
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#101d40] border-t-transparent" />
      </div>
    );
  }

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-6 pb-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-400 mb-0.5">Good {getGreeting()}</p>
          <h1 className="text-2xl font-bold text-gray-900">{firstName} 👋</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={hvacStats?.totalUnits ?? 0} label="HVAC Units" />
          <StatCard value={properties.length} label="Properties" />
          <StatCard value={jobStats?.totalJobs ?? 0} label="Total Jobs" />
          <StatCard value={jobStats?.lateJobs ?? 0} label="Overdue" color={jobStats?.lateJobs > 0 ? 'text-red-500' : 'text-[#101d40]'} />
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-0.5">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <ActionCard icon={Plus} label="Log Maintenance" description="Quick entry for any unit" color="bg-green-50 text-green-600" onClick={() => onNavigate('maintenance')} />
            <ActionCard icon={Briefcase} label="Jobs" description={`${jobStats?.totalJobs ?? 0} work orders`} color="bg-blue-50 text-blue-600" onClick={() => onNavigate('jobs')} />
            <ActionCard icon={Zap} label="HVAC Systems" description={`${hvacStats?.totalUnits ?? 0} units tracked`} color="bg-[#101d40]/5 text-[#101d40]" onClick={() => onNavigate('hvac')} />
            <ActionCard icon={Building} label="Properties" description={`${properties.length} locations`} color="bg-purple-50 text-purple-600" onClick={() => onNavigate('properties')} />
            <ActionCard icon={MessageSquare} label="Team Chat" description="Messages & channels" color="bg-indigo-50 text-indigo-600" onClick={() => onNavigate('messaging')} />
            <ActionCard icon={CheckSquare} label="Tasks" description="Assign & track work" color="bg-orange-50 text-orange-600" onClick={() => onNavigate('tasks')} />
            <ActionCard icon={Clock} label="Timesheets" description="Your time entries" color="bg-teal-50 text-teal-600" onClick={() => onNavigate('timeHistory')} />
            {isAdmin && (
              <ActionCard icon={BarChart3} label="Reports" description="Export maintenance data" color="bg-yellow-50 text-yellow-600" onClick={() => onNavigate('reports')} />
            )}
            {isAdmin && (
              <ActionCard icon={Shield} label="Admin" description="System management" color="bg-red-50 text-red-500" onClick={() => onNavigate('admin')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning,';
  if (h < 17) return 'afternoon,';
  return 'evening,';
}

export default Homepage;

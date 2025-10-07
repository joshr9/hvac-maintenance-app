import React, { useState, useEffect } from 'react';
import {
  Wrench, Building, Zap, Clock, AlertTriangle, CheckCircle,
  Calendar, ArrowRight, Plus, TrendingUp, Activity
} from 'lucide-react';

/* PRESERVED - Components kept for potential future use
import WelcomeSection from './WelcomeSection';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import TodaysSchedule from './TodaysSchedule';
import DashboardSidebar from './DashboardSidebar';
*/

const Homepage = ({ onNavigate, onOpenModal }) => {
  const [hvacStats, setHvacStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real HVAC data from API
  useEffect(() => {
    const loadHVACDashboard = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';

        // Fetch HVAC stats
        const statsResponse = await fetch(`${apiUrl}/api/hvac-units/stats`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setHvacStats(stats);
        }

        // Fetch properties
        const propsResponse = await fetch(`${apiUrl}/api/properties`);
        if (propsResponse.ok) {
          const props = await propsResponse.json();
          setProperties(Array.isArray(props) ? props : []);
        }

        // Fetch recent maintenance logs
        const logsResponse = await fetch(`${apiUrl}/api/maintenance-logs?limit=5`);
        if (logsResponse.ok) {
          const logs = await logsResponse.json();
          setRecentMaintenance(Array.isArray(logs) ? logs : []);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHVACDashboard();
  }, []);

  /* PRESERVED - Old mock data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setTimeout(() => {
        setDashboardStats({
          totalJobs: 127,
          jobsChange: +12,
          activeJobs: 23,
          activeChange: +3,
          completedThisWeek: 18,
          completedChange: +5,
          revenueThisMonth: 45680,
          revenueChange: +15.3,
          avgJobValue: 380,
          technicianUtilization: 84
        });

        // Old mock data - preserved for reference
      }, 1000);
    };
    loadDashboardData();
  }, []);
  */

  if (loading) {
    return (
      <div className="p-6" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gray-200 h-96 rounded-xl"></div>
              <div className="bg-gray-200 h-96 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HVAC Management Dashboard</h1>
          <p className="text-gray-600">Quick overview of your HVAC systems and maintenance</p>
        </div>

        {/* HVAC Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-medium">Today's Work</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{hvacStats?.todayJobs || 0}</p>
              </div>
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-medium">Overdue</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{hvacStats?.overdueUnits || 0}</p>
              </div>
              <div className="p-2 md:p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{hvacStats?.completedToday || 0}</p>
              </div>
              <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-medium">Total Units</p>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">{hvacStats?.totalUnits || 0}</p>
              </div>
              <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                <Zap className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onNavigate('hvac')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-6 shadow-lg transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">HVAC Systems</h3>
                <p className="text-sm text-blue-100">View all units</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenModal('maintenance')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-6 shadow-lg transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Quick Entry</h3>
                <p className="text-sm text-green-100">Log maintenance</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('properties')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-6 shadow-lg transition-all duration-300 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Building className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Properties</h3>
                <p className="text-sm text-purple-100">{properties.length} locations</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-600" />
              Recent Maintenance
            </h2>
            <button
              onClick={() => onNavigate('hvac')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentMaintenance.length > 0 ? (
            <div className="space-y-3">
              {recentMaintenance.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.maintenanceType || 'Maintenance'}</p>
                      <p className="text-sm text-gray-600">
                        {log.hvacUnit?.label || `Unit ${log.hvacUnitId}`} • {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    log.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No recent maintenance records</p>
              <button
                onClick={() => onOpenModal('maintenance')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log First Maintenance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
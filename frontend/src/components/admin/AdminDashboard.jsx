// components/admin/AdminDashboard.jsx - Administrative Dashboard with Job Generation
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Activity, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Calendar,
  Users,
  Building,
  Wrench
} from 'lucide-react';
import ManualJobGenerator from './ManualJobGenerator';

const AdminDashboard = ({ 
  globalJobsData, 
  onJobsGenerated, 
  onDataRefresh,
  properties = []
}) => {
  const [systemStats, setSystemStats] = useState({});
  const [templates, setTemplates] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [templatesResponse, systemResponse] = await Promise.all([
        fetch('/api/recurring-job-templates'),
        fetch('/api/jobs/stats')
      ]);

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData || []);
      }

      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setSystemStats(systemData);
      }

      // Mock recent activity - replace with real API call
      setRecentActivity([
        {
          id: 1,
          type: 'job_generated',
          message: 'Weekly HVAC jobs generated automatically',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: 2,
          type: 'template_created',
          message: 'New recurring template "Boulder Weekly Cleaning" created',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'info'
        },
        {
          id: 3,
          type: 'system_alert',
          message: '2 late jobs require immediate attention',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'warning'
        }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTemplates = templates.filter(t => t.isActive);
  const inactiveTemplates = templates.filter(t => !t.isActive);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              System management and recurring job automation
            </p>
          </div>
          
          <button
            onClick={onDataRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {globalJobsData.jobs?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Jobs</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {activeTemplates.length}
                </div>
                <div className="text-sm text-gray-600">Active Templates</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </div>
                <div className="text-sm text-gray-600">Properties</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {systemStats.automationRate || 0}%
                </div>
                <div className="text-sm text-gray-600">Automation Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Generation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manual Job Generator */}
            <ManualJobGenerator onJobsGenerated={onJobsGenerated} />

            {/* Template Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Template Status Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Active Templates</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{activeTemplates.length}</div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Inactive Templates</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{inactiveTemplates.length}</div>
                </div>
              </div>

              {/* Recent Templates */}
              {activeTemplates.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recent Templates</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeTemplates.slice(0, 5).map(template => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">
                            {template.frequency.toLowerCase()} • {template.workType.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.lastGenerated 
                            ? `Last: ${new Date(template.lastGenerated).toLocaleDateString()}`
                            : 'Never generated'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - System Activity */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Scheduler</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Running</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="text-gray-500 text-sm">2 hours ago</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : activity.status === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{activity.message}</div>
                      <div className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">View All Templates</div>
                  <div className="text-sm text-gray-500">Manage recurring job templates</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">System Settings</div>
                  <div className="text-sm text-gray-500">Configure scheduler and preferences</div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Export Data</div>
                  <div className="text-sm text-gray-500">Download jobs and reports</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
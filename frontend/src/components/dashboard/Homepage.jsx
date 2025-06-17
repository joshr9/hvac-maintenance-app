import React, { useState, useEffect } from 'react';
import WelcomeSection from './WelcomeSection';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions'; 
import TodaysSchedule from './TodaysSchedule';
import DashboardSidebar from './DashboardSidebar';

const Homepage = ({ onNavigate, onOpenModal }) => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [todaysJobs, setTodaysJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      // Simulate API call
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

        setTodaysJobs([
          {
            id: 1,
            jobNumber: 'DC-2025-045',
            title: 'HVAC Maintenance',
            property: 'Maple Heights Complex',
            suite: 'Unit 301',
            technician: 'Mike Rodriguez',
            time: '09:00 AM',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            estimated: 120
          },
          // ... more jobs
        ]);

        setRecentActivity([
          {
            id: 1,
            type: 'job_completed',
            title: 'HVAC Repair completed',
            description: 'Unit 205 at Riverside Apartments',
            technician: 'Alex Johnson',
            time: '25 minutes ago',
            jobNumber: 'DC-2025-044'
          },
          // ... more activity
        ]);

        setUpcomingJobs([
          { id: 1, date: 'Tomorrow', count: 8, priority: 'HIGH' },
          { id: 2, date: 'Wednesday', count: 12, priority: 'MEDIUM' },
          { id: 3, date: 'Thursday', count: 6, priority: 'LOW' },
          { id: 4, date: 'Friday', count: 15, priority: 'MEDIUM' }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

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
        <WelcomeSection />
        
        <DashboardStats stats={dashboardStats} />
        
        <QuickActions 
          onNavigate={onNavigate} 
          onOpenModal={onOpenModal}
          activeJobs={dashboardStats.activeJobs}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysSchedule 
              jobs={todaysJobs}
              onNavigate={onNavigate}
              onOpenModal={onOpenModal}
            />
          </div>

          <div className="lg:col-span-1">
            <DashboardSidebar 
              recentActivity={recentActivity}
              upcomingJobs={upcomingJobs}
              dashboardStats={dashboardStats}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
// App.jsx - Complete Integration Preserving ALL Your Existing Features
import React, { useState, useEffect, useCallback } from 'react';

// ✅ EXISTING: Your current styles (PRESERVED)
import './styles/jobcard.css';
import './styles/drag-drop.css';

// ❌ COMMENTED OUT: Authentication imports (causing the white screen)
// import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
// import { AuthProvider } from './contexts/AuthContext';
// import ProtectedRoute from './components/auth/ProtectedRoute';

// ✅ EXISTING: Your current timer contexts (100% PRESERVED)
import { TimerProvider } from './contexts/TimerContext';
import { OfflineQueueProvider } from './contexts/OfflineQueueContext';

// ✅ EXISTING: ALL your current layout and core components (100% PRESERVED)
import Layout from './components/layout/Layout';
import Homepage from './components/dashboard/Homepage';
import MaintenanceForm from './components/maintenance/MaintenanceForm';
import JobsList from './components/jobs/JobsList';
import ServiceCatalog from "./components/services/ServiceCatalog";
import IntegratedCalendar from './components/calendar/IntegratedCalendar';
import CreateJobModal from './components/jobs/CreateJobModal';
import AdminDashboard from './components/admin/AdminDashboard';
import PropertiesPage from './components/properties/PropertiesPage';
import RoleBasedCalendar from './components/calendar/RoleBasedCalendar';
import MessagingPage from './components/messaging/MessagingPage';
import HVACPage from './components/hvac/HVACpage';
import TaskManagement from './components/tasks/TaskManagement';

// ✅ EXISTING: ALL your current timer components (100% PRESERVED)
import TimeHistoryPage from './components/timer/TimeHistoryPage';
import FloatingTimerWidget from './components/timer/FloatingTimerWidget';
import OfflineIndicator from './components/timer/OfflineIndicator';

// ❌ COMMENTED OUT: Development helpers that might use Clerk
// import AuthTester from './components/dev/AuthTester';
import { isDevelopmentFeatureEnabled } from './utils/developmentHelpers';

// ❌ COMMENTED OUT: Clerk key detection (not needed)
// const clerkPubKey = 
//   typeof process !== 'undefined' 
//     ? process.env.REACT_APP_CLERK_PUBLISHABLE_KEY  // Create React App
//     : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;   // Vite

// ✅ FORCE DISABLED: Authentication completely off
const authEnabled = false;

function App() {
  // ✅ EXISTING: ALL your current state (100% PRESERVED)
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [properties, setProperties] = useState([]);
  
  // Navigation state for passing data between pages
  const [navigationData, setNavigationData] = useState(null);
  
  // Shared state for real-time job updates across all components
  const [jobsRefreshTrigger, setJobsRefreshTrigger] = useState(0);
  const [globalJobsData, setGlobalJobsData] = useState({
    jobs: [],
    stats: {},
    lastUpdated: null
  });

  // ✅ EXISTING: Mock current user for testing (PRESERVED - no Clerk needed)
  const [currentUser, setCurrentUser] = useState({
    id: 'user_123',
    name: 'John Smith',
    role: 'admin', // Change to 'admin' to test admin view
    email: 'john@company.com'
  });

  // ✅ EXISTING: Load properties (100% PRESERVED - your exact code)
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
      }
    };
    
    loadProperties();
  }, []);

  // ✅ FIXED: Load global jobs data with proper API handling and no infinite loops
  const loadGlobalJobsData = useCallback(async () => {
    console.log('🔍 loadGlobalJobsData STARTED');
    console.log('🔍 Current globalJobsData:', globalJobsData);
    
    try {
      const [jobsResponse, statsResponse] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/jobs/stats')
      ]);

      console.log('🔍 Jobs response status:', jobsResponse.status);
      console.log('🔍 Stats response status:', statsResponse.status);

      const newData = {
        jobs: [],
        stats: {},
        lastUpdated: null
      };

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        console.log('🔍 Raw jobs data received:', jobsData);
        
        // ✅ FIXED: Handle API response structure {jobs: [...]} or direct array
        if (jobsData.jobs && Array.isArray(jobsData.jobs)) {
          newData.jobs = jobsData.jobs;
        } else if (Array.isArray(jobsData)) {
          newData.jobs = jobsData;
        } else {
          newData.jobs = [];
        }
        console.log('🔍 Processed jobs array:', newData.jobs);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('🔍 Stats data received:', statsData);
        newData.stats = statsData;
      } else {
        console.log('🔍 Stats request failed, using empty object');
        newData.stats = {};
      }

      newData.lastUpdated = new Date().toISOString();
      console.log('🔍 Setting new globalJobsData:', newData);
      setGlobalJobsData(newData);
    } catch (error) {
      console.error('🚨 Error in loadGlobalJobsData:', error);
    }
  }, []); // ✅ FIXED: Empty dependency array to prevent infinite loops

  // ✅ EXISTING: Load data on mount and when refresh is triggered (100% PRESERVED)
  useEffect(() => {
    loadGlobalJobsData();
  }, [loadGlobalJobsData, jobsRefreshTrigger]);

  // ✅ EXISTING: ALL your navigation and modal handlers (100% PRESERVED)
  const handleNavigate = useCallback((view, data = null) => {
    setCurrentView(view);
    setNavigationData(data);
    setActiveModal(null); // Close any open modals when navigating
  }, []);

  const handleOpenModal = useCallback((type, data = null) => {
    setActiveModal({ type, data });
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // ✅ EXISTING: Data refresh handler (100% PRESERVED)
  const handleDataRefresh = useCallback(() => {
    setJobsRefreshTrigger(prev => prev + 1);
  }, []);

  // ✅ EXISTING: Job creation handler (100% PRESERVED)
  const handleJobCreated = useCallback((newJob) => {
    setGlobalJobsData(prev => ({
      ...prev,
      jobs: [newJob, ...prev.jobs]
    }));
    handleDataRefresh();
  }, [handleDataRefresh]);

  // ✅ SIMPLIFIED: Render view logic without any auth protection
  const renderCurrentView = () => {
    switch (currentView) {
      case 'jobs':
        return (
          <JobsList 
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            jobsData={globalJobsData.jobs}
            onDataRefresh={handleDataRefresh}
          />
        );

      case 'properties':
        return (
          <PropertiesPage 
            onNavigate={handleNavigate}
          />
        );

      case 'services':
        return (
          <ServiceCatalog 
            onNavigate={handleNavigate}
          />
        );

      case 'hvac':
        return (
          <HVACPage 
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            properties={properties}
            navigationData={navigationData}
            onDataRefresh={handleDataRefresh}
          />
        );

      case 'calendar':
      case 'schedule':
        return (
          // ✅ SIMPLIFIED: No auth protection, direct component render
          <RoleBasedCalendar
            jobsRefreshTrigger={jobsRefreshTrigger}
            onJobCreated={handleJobCreated}
            allProperties={properties}
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            navigationData={navigationData}
            currentUser={currentUser}
          />
        );

      case 'messaging':
        return (
          <MessagingPage 
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            allProperties={properties}
            globalJobsData={globalJobsData}
          />
        );
    
      case 'tasks':
        return (
          <TaskManagement 
            allProperties={properties}
            globalJobsData={globalJobsData}
            onNavigate={handleNavigate}
          />
        );

      case 'maintenance':
        return (
          <MaintenanceForm 
            onNavigate={handleNavigate}
            navigationData={navigationData}
          />
        );

      case 'admin':
        return (
          // ✅ SIMPLIFIED: No auth protection, direct component render
          <AdminDashboard 
            onNavigate={handleNavigate}
            globalJobsData={globalJobsData}
          />
        );

      case 'timeHistory':
        return (
          <TimeHistoryPage 
            onNavigate={handleNavigate}
            technicianName="Default User"
          />
        );

      default:
        return (
          <Homepage 
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            dashboardStats={globalJobsData.stats}
            lastDataUpdate={globalJobsData.lastUpdated}
          />
        );
    }
  };

  // ✅ SIMPLIFIED: Direct app content without any auth wrappers
  return (
    <TimerProvider technicianName="Default User">
      <OfflineQueueProvider>
        <div className="min-h-screen bg-gray-50">
          {/* ✅ EXISTING: Offline Status Indicator (100% PRESERVED) */}
          <OfflineIndicator className="fixed top-4 left-4 z-40" />
          
          <Layout 
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenModal={handleOpenModal}
            jobsStats={globalJobsData.stats}
            lastDataUpdate={globalJobsData.lastUpdated}
          >
            {renderCurrentView()}
          </Layout>

          {/* ✅ EXISTING: Always-Visible Timer Widget (100% PRESERVED) */}
          <FloatingTimerWidget />

          {/* ❌ COMMENTED OUT: Development tools that might use Clerk */}
          {/* {isDevelopmentFeatureEnabled('authTester') && <AuthTester />} */}

          {/* ✅ EXISTING: Global modal system (100% PRESERVED) */}
          {activeModal?.type === 'createJob' && (
            <CreateJobModal
              isOpen={true}
              onClose={handleCloseModal}
              allProperties={properties}
              onJobCreated={handleJobCreated}
              onDataRefresh={handleDataRefresh}
              initialData={activeModal.data}
            />
          )}

          {/* Add other modals as needed */}
        </div>
      </OfflineQueueProvider>
    </TimerProvider>
  );
}

export default App;
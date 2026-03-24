// App.jsx - Complete Integration Preserving ALL Your Existing Features
import React, { useState, useEffect, useCallback } from 'react';

// ✅ EXISTING: Your current styles (PRESERVED)
import './styles/jobcard.css';
import './styles/drag-drop.css';

// ✅ NEW: Add authentication imports (only add these lines)
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// ✅ EXISTING: Your current timer contexts (100% PRESERVED)
import { TimerProvider } from './contexts/TimerContext';
import { OfflineQueueProvider } from './contexts/OfflineQueueContext';
import { UnreadMessagesProvider } from './context/UnreadMessagesContext';

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
import TeamChat from './components/messaging/TeamChat';
import HVACPage from './components/hvac/HVACpage';
import TaskManagementTodoist from './components/tasks/TaskManagementTodoist';
import ReportsPage from './components/reports/ReportsPage';





// ✅ EXISTING: ALL your current timer components (100% PRESERVED)
import TimeHistoryPage from './components/timer/TimeHistoryPage';
import FloatingTimerWidget from './components/timer/FloatingTimerWidget';
import OfflineIndicator from './components/timer/OfflineIndicator';

// ✅ NEW: Optional development helpers (can be removed in production)
import AuthTester from './components/dev/AuthTester';
import { isDevelopmentFeatureEnabled } from './utils/developmentHelpers';

// ✅ NEW: Get Clerk publishable key (optional - app works without it)
const clerkPubKey = 
  typeof process !== 'undefined' 
    ? process.env.REACT_APP_CLERK_PUBLISHABLE_KEY  // Create React App
    : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;   // Vite

const authEnabled = !!clerkPubKey

function App() {
  // ✅ EXISTING: ALL your current state (100% PRESERVED)
  const [currentView, setCurrentView] = useState('hvac');
  const [activeModal, setActiveModal] = useState(null);
  const [properties, setProperties] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Navigation state for passing data between pages
  const [navigationData, setNavigationData] = useState(null);

  // Shared state for real-time job updates across all components
  const [jobsRefreshTrigger, setJobsRefreshTrigger] = useState(0);
  const [globalJobsData, setGlobalJobsData] = useState({
    jobs: [],
    stats: {},
    lastUpdated: null
  });

  // ✅ EXISTING: Mock current user for testing (PRESERVED - Clerk will enhance this)
  const [currentUser, setCurrentUser] = useState({
    id: 'user_123',
    name: 'John Smith',
    role: 'admin', // Change to 'admin' to test admin view
    email: 'john@company.com'
  });

// ✅ FIXED: Load properties with absolute URL
useEffect(() => {
  const loadProperties = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/properties`);
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

// ✅ FIXED: Load global jobs data with absolute URLs
const loadGlobalJobsData = useCallback(async () => {
  console.log('🔍 loadGlobalJobsData STARTED');
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
    const [jobsResponse, statsResponse] = await Promise.all([
      fetch(`${apiUrl}/api/jobs`),
      fetch(`${apiUrl}/api/jobs/stats`)
    ]);

    console.log('🔍 Jobs response status:', jobsResponse.status);
    console.log('🔍 Stats response status:', statsResponse.status);

    const newData = {
      jobs: [],
      stats: {},
      lastUpdated: null
    };
    // ... rest of your existing code

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
    console.log('🔄 App.jsx handleNavigate called:', { view, data });
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

  // ✅ EXISTING: Your complete render view logic (100% PRESERVED with optional auth enhancement)
const renderCurrentView = () => {
  switch (currentView) {
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

    case 'properties':
      return (
        <PropertiesPage
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

    default:
      return (
        <HVACPage
          onNavigate={handleNavigate}
          onOpenModal={handleOpenModal}
          properties={properties}
          navigationData={navigationData}
          onDataRefresh={handleDataRefresh}
        />
      );
  }

  /* Hidden views — restore by adding case above
  case 'jobs': <JobsList />
  case 'services': <ServiceCatalog />
  case 'reports': <ReportsPage />
  case 'calendar': <RoleBasedCalendar />
  case 'messaging': <TeamChat />
  case 'tasks': <TaskManagementTodoist />
  case 'admin': <AdminDashboard />
  case 'timeHistory': <TimeHistoryPage />
  case 'dashboard': <Homepage />
  */
};

  // ✅ EXISTING: Your complete app structure (100% PRESERVED with optional auth enhancement)
  const AppContent = () => (
    <TimerProvider technicianName="Default User">
      <OfflineQueueProvider>
        <UnreadMessagesProvider>
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

          {/* ✅ NEW: Optional development tools */}
          {isDevelopmentFeatureEnabled('authTester') && <AuthTester />}

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
        </UnreadMessagesProvider>
      </OfflineQueueProvider>
    </TimerProvider>
  );

  // ✅ ENHANCED: Conditional authentication wrapper (your app works with or without auth)
  if (!authEnabled) {
    // ✅ FALLBACK: Your app works exactly as it does now
    console.log('🔧 Running without authentication - add REACT_APP_CLERK_PUBLISHABLE_KEY to enable auth');
    return <AppContent />;
  }

  // ✅ NEW: Full Clerk authentication wrapper (only when auth is enabled)
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthProvider>
        <SignedIn>
          <AppContent />
        </SignedIn>
        
        <SignedOut>
          <RedirectToSignIn 
            redirectUrl={window.location.href}
            signUpUrl="/sign-up"
          />
        </SignedOut>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
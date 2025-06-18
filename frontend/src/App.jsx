import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Homepage from './components/dashboard/Homepage';
import MaintenanceForm from './components/maintenance/MaintenanceForm';
import JobsList from './components/jobs/JobsList';
import ServiceCatalog from "./components/services/ServiceCatalog";
import IntegratedCalendar from './components/calendar/IntegratedCalendar';
import CreateJobModal from './components/jobs/CreateJobModal';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [properties, setProperties] = useState([]);

  // Load properties when app starts
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

  // Navigation handler
  const handleNavigate = (view) => {
    setCurrentView(view);
    // Close any open modals when navigating
    setActiveModal(null);
  };

  // Modal handlers
  const handleOpenModal = (modalType) => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // Render current view content
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Homepage 
            onNavigate={handleNavigate} 
            onOpenModal={handleOpenModal} 
          />
        );
      
      case 'properties':
        return <MaintenanceForm />;
      
      case 'jobs':
        return (
          <JobsList 
            onNavigate={handleNavigate} 
            onOpenModal={handleOpenModal} 
          />
        );

      case 'services':
        return (
          <ServiceCatalog 
            onNavigate={handleNavigate} 
            onOpenModal={handleOpenModal} 
          />
        );
      
     case 'schedule':
      return <IntegratedCalendar />;
      
      case 'invoices':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
                <p className="text-gray-600 mb-6">Invoice management system coming soon...</p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">💳 Billing Integration</h3>
                  <p className="text-sm text-green-700">Automated invoicing from completed jobs</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'quotes':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quotes</h2>
                <p className="text-gray-600 mb-6">Quote management system coming soon...</p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibent text-purple-900 mb-2">📋 Estimate Builder</h3>
                  <p className="text-sm text-purple-700">Professional quote generation</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'timesheets':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Timesheets</h2>
                <p className="text-gray-600 mb-6">Time tracking system coming soon...</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">⏰ Time Tracking</h3>
                  <p className="text-sm text-blue-700">Employee time and attendance</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'expenses':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Expenses</h2>
                <p className="text-gray-600 mb-6">Expense tracking system coming soon...</p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">💰 Expense Management</h3>
                  <p className="text-sm text-yellow-700">Track materials and operational costs</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
                <p className="text-gray-600 mb-6">Business intelligence coming soon...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-indigo-900 mb-2">📈 Performance Metrics</h3>
                    <p className="text-sm text-indigo-700">KPI tracking and analysis</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-pink-900 mb-2">💹 Financial Reports</h3>
                    <p className="text-sm text-pink-700">Revenue and profit analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'team':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Management</h2>
                <p className="text-gray-600 mb-6">Employee management system coming soon...</p>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-900 mb-2">👥 Staff Management</h3>
                  <p className="text-sm text-teal-700">Technician scheduling and performance</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600 mb-6">Application configuration...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">🔧 System Settings</h3>
                    <p className="text-sm text-gray-700">App configuration and preferences</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">👤 User Management</h3>
                    <p className="text-sm text-gray-700">User roles and permissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <Homepage 
            onNavigate={handleNavigate} 
            onOpenModal={handleOpenModal} 
          />
        );
    }
  };

  // Get page-specific header actions
  const getHeaderActions = () => {
    switch (currentView) {
      case 'jobs':
        return (
          <button 
            onClick={() => handleOpenModal('createJob')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Job
          </button>
        );

      case 'services':
        return (
          <>
            <button 
              onClick={() => handleOpenModal('importServices')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Import CSV
            </button>
            <button 
              onClick={() => handleOpenModal('createService')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Service
            </button>
          </>
        );
      
      case 'properties':
        return (
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Search
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={handleNavigate}
      onOpenModal={handleOpenModal}
      headerActions={getHeaderActions()}
    >
      {renderCurrentView()}
      
      {/* Modal Handling */}
      {activeModal === 'createJob' && (
        <CreateJobModal 
          isOpen={true}
          onClose={handleCloseModal}
          allProperties={properties}
          onJobCreated={(newJob) => {
            console.log('New job created:', newJob);
            handleCloseModal();
            if (currentView === 'jobs') {
              window.location.reload();
            }
          }}
        />
      )}
      
      {activeModal === 'maintenance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Maintenance</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Navigate to the Properties section to access the full HVAC maintenance system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleCloseModal();
                  handleNavigate('properties');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Properties
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'schedule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Work</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Navigate to the Schedule section to access the calendar and scheduling system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleCloseModal();
                  handleNavigate('schedule');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Schedule
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'propertySearch' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Property Search</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Navigate to the Properties section to search and manage properties.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleCloseModal();
                  handleNavigate('properties');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Properties
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
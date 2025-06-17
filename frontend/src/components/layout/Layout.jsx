import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import UniversalSearchBar from '../common/UniversalSearchBar';

const Layout = ({ 
  children, 
  currentView = 'dashboard',
  onNavigate,
  onOpenModal,
  pageTitle,
  showPageHeader = true,
  headerActions = null,
  user = { name: 'Admin User', email: 'admin@deancallan.com', initials: 'DC' }
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock notifications - replace with real data
  useEffect(() => {
    setNotifications([
      { id: 1, type: 'urgent', message: 'HVAC repair needed at Maple Heights', time: '5 min ago' },
      { id: 2, type: 'info', message: 'Monthly reports ready for review', time: '1 hour ago' },
      { id: 3, type: 'success', message: 'Job DC-2025-045 completed', time: '2 hours ago' }
    ]);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const defaultPageTitles = {
    dashboard: 'Dashboard',
    jobs: 'Jobs Management',
    schedule: 'Schedule & Calendar',
    properties: 'Properties',
    invoices: 'Invoices',
    quotes: 'Quotes',
    timesheets: 'Timesheets',
    expenses: 'Expenses',
    reports: 'Reports & Analytics',
    team: 'Team Management',
    settings: 'Settings'
  };

  const displayTitle = pageTitle || defaultPageTitles[currentView] || 'Dean Callan PM';

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenModal={onOpenModal}
        isOpen={isDesktopSidebarOpen}
        onToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
      />
      
      {/* Mobile Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenModal={onOpenModal}
        isMobile={true}
        isOpen={isMobileSidebarOpen}
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-2">
                <img 
                  src="/DeanCallan.png" 
                  alt="Dean Callan PM" 
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {displayTitle}
                </h1>
              </div>
            </div>
            
            {/* Mobile actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative user-menu"
              >
                <span className="text-white text-sm font-medium">{user.initials}</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3">
            <UniversalSearchBar
              currentView={currentView}
              onNavigate={onNavigate}
              className="w-full"
            />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                
                {showPageHeader && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Universal Search Bar */}
                <UniversalSearchBar
                  currentView={currentView}
                  onNavigate={onNavigate}
                  className="w-80 hidden xl:block"
                />

                {/* Header Actions */}
                {headerActions && (
                  <div className="flex items-center gap-2">
                    {headerActions}
                  </div>
                )}
                
                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* User Menu */}
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.initials}</span>
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                      
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      
                      <button 
                        onClick={() => onNavigate('settings')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Notification Toast (if needed) */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`
                max-w-sm bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300
                ${notification.type === 'urgent' ? 'border-red-500' : 
                  notification.type === 'success' ? 'border-green-500' : 'border-blue-500'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-2 h-2 rounded-full mt-2
                  ${notification.type === 'urgent' ? 'bg-red-500' : 
                    notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}
                `} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <LogOut className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Layout;
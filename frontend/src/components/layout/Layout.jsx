// components/layout/Layout.jsx - Enhanced with Sign-Out Functionality
import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Home,
  Briefcase,
  Calendar,
  CalendarDays,
  Inbox,
  Building,
  FileText,
  DollarSign,
  Clock,
  BarChart3,
  Wrench,
  Plus,
  Search,
  Users,
  Receipt,
  Tag,
  MessageSquare,
  Shield,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  Award,
  UserCircle,
  HelpCircle
} from 'lucide-react';

// ✅ NEW: Clerk authentication imports
import { useUser, SignOutButton, useAuth } from '@clerk/clerk-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUnreadMessages } from '../../context/UnreadMessagesContext';

// Import Universal Search Bar
import UniversalSearchBar from '../common/UniversalSearchBar';


// ✅ NEW: User Menu Component
const UserMenu = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error)  {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.user-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative user-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          {user?.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt={user.name || 'User'} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user?.name || 'User'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {user?.role || 'User'}
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.name || 'User'} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </div>
                <div className="text-xs text-blue-600 font-medium capitalize">
                  {user?.role || 'User'} Access
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Handle profile click
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              Profile Settings
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // Handle preferences click
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Preferences
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // Handle help click
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help & Support
            </button>
          </div>

          {/* Sign Out Section */}
          <div className="border-t border-gray-200 py-2">
            <SignOutButton>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ ENHANCED: QuickStats Component - Always visible at bottom
const QuickStats = ({ stats = {}, lastUpdated }) => {
  const hasLateJobs = (stats.lateJobs || 0) > 0;
  
  return (
    <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-gray-900">{stats.totalJobs || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Active:</span>
              <span className="font-semibold text-gray-900">{stats.scheduledJobs || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasLateJobs ? 'bg-red-500 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-gray-600">Overdue:</span>
              <span className={`font-semibold ${hasLateJobs ? 'text-red-600' : 'text-gray-900'}`}>
                {stats.lateJobs || 0}
              </span>
            </div>
          </div>

          {/* Right side - Last Updated */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>
              {lastUpdated ? 
                `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 
                'Live data'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT: Enhanced Layout
const Layout = ({ 
  currentView = 'dashboard', 
  onNavigate, 
  onOpenModal,
  jobsStats = {},
  lastDataUpdate,
  children 
}) => {
  // ✅ NEW: Auth integration
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { user: authUser } = useAuthContext();

  // Use auth user if available, fallback to clerk user
  const currentUser = authUser || clerkUser;

  // ✅ NEW: Unread messages tracking
  const { unreadCount, hasUnread, markAsRead } = useUnreadMessages();

  // ✅ PRESERVED: All existing state management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState(null);

  // ✅ NEW: Sign-out handling
  const handleSignOut = async () => {
    try {
      // Clear any local storage or app state here
      localStorage.removeItem('timer-state');
      localStorage.removeItem('app-preferences');
      
      // The SignOutButton component handles the actual sign-out
      console.log('🔓 User signed out successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Focused navigation — Properties & HVAC only
  // All other sections preserved in code, not shown in UI
  const navigationSections = [
    {
      title: "HVAC",
      items: [
        {
          id: 'hvac',
          label: 'HVAC Systems',
          icon: Zap,
          description: 'Units, properties & maintenance',
          badge: null
        },
        {
          id: 'properties',
          label: 'Properties',
          icon: Building,
          description: 'Manage properties & suites',
          badge: null
        }
      ]
    }
  ];

  /* Hidden sections — restore when needed
  const hiddenSections = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'messaging', label: 'Team Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'maintenance', label: 'Quick Entry', icon: Plus, isAction: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'timeHistory', label: 'Timesheets', icon: Clock },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];
  */

  // ✅ PRESERVED: All existing utility functions
  const getPageTitle = () => {
    const viewTitles = {
      hvac: 'HVAC Systems',
      properties: 'Properties',
      maintenance: 'Log Work',
    };
    return viewTitles[currentView] || 'Dean Callan PM';
  };

  const handleNavigation = (viewId) => {
    setIsSidebarOpen(false);
    onNavigate(viewId);
  };

  const handleOpenModal = (modalType) => {
    setIsSidebarOpen(false);
    onOpenModal?.(modalType);
  };

  // Real notifications state
  const [notifications, setNotifications] = useState([]);

  // Notifications paused — only HVAC & Properties are active views
  // Restore when jobs/messaging/tasks are re-enabled

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // ✅ ELEGANT: Navigation Item Component with 2025 styling
  const NavItem = ({ item, isActive, isCollapsed }) => {
    const isHovered = hoveredNavItem === item.id;

    return (
      <li>
        <button
          onClick={() => item.isAction ? handleOpenModal('maintenance') : handleNavigation(item.id)}
          onMouseEnter={() => setHoveredNavItem(item.id)}
          onMouseLeave={() => setHoveredNavItem(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200
            ${isActive
              ? 'bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30'
              : 'text-dc-blue-100/80 hover:bg-white/10 hover:text-white'
            }
            ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
            ${item.isAction ? 'border border-white/20 hover:border-white/30' : ''}
            ${isCollapsed ? 'justify-center px-3' : ''}
          `}
          disabled={item.comingSoon}
        >
          <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${item.badgeColor || (item.badge === 'NEW'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300')
                      } ${item.badgeColor ? 'text-white' : ''}
                    `}>
                      {item.badge}
                    </span>
                  )}
                  {item.comingSoon && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-dc-blue-200">
                      Soon
                    </span>
                  )}
                </div>
                {!isActive && (
                  <p className="text-xs text-dc-blue-300/60 truncate">{item.description}</p>
                )}
              </div>
            </>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && isHovered && (
            <div className="fixed left-20 bg-gray-900 text-white px-3 py-2 rounded-xl text-sm whitespace-nowrap z-50 shadow-xl">
              {item.label}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>
      </li>
    );
  };

  // ✅ PRESERVED: Sidebar content
  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`flex items-center gap-3 p-6 border-b border-dc-blue-700/20 ${
        isDesktopSidebarCollapsed ? 'justify-center' : ''
      }`}>
        <div className={`flex items-center ${isDesktopSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img
            src="/DeanCallan.png"
            alt="Dean Callan PM"
            className={`object-contain transition-all duration-300 ${
              isDesktopSidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'
            }`}
          />
          {!isDesktopSidebarCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Dean Callan PM</h1>
              <p className="text-sm text-dc-blue-200">Property Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 p-4 overflow-y-auto transition-all duration-300 ${
        isDesktopSidebarCollapsed ? 'space-y-4' : 'space-y-6'
      }`}>
        {navigationSections.map((section) => (
          <div key={section.title}>
            {!isDesktopSidebarCollapsed && (
              <h3 className="text-xs font-semibold text-dc-blue-400 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
            )}
            <ul className={isDesktopSidebarCollapsed ? 'space-y-3' : 'space-y-1'}>
              {section.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={currentView === item.id}
                  isCollapsed={isDesktopSidebarCollapsed}
                />
              ))}
            </ul>
          </div>
        ))}

        {/* Task sub-nav hidden — restore when tasks view is re-enabled */}
      </nav>

      {/* Footer */}
      {!isDesktopSidebarCollapsed && (
        <div className="p-4 border-t border-dc-blue-700/20">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">System Status</p>
                <p className="text-xs text-dc-blue-200">All systems operational</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-gradient-to-b from-dc-blue-900 to-dc-blue-800 border-r border-dc-blue-700/20 shadow-xl transition-all duration-300 ${
        isDesktopSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-gradient-to-b from-dc-blue-900 to-dc-blue-800 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ✅ ENHANCED: Top Navigation with Sign-Out */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Desktop Hamburger Menu */}
              <button
                onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Mobile Hamburger Menu — hidden on mobile, replaced by bottom tab bar */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Universal Search - Hidden on mobile for HVAC page */}
              {currentView !== 'hvac' && (
                <div className="hidden md:block">
                  <UniversalSearchBar onNavigate={onNavigate} />
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.some(n => n.type === 'urgent') && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.type === 'urgent' ? 'bg-red-500' :
                                notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm text-gray-500">No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ NEW: Enhanced User Menu with Sign-Out */}
              <UserMenu 
                user={currentUser} 
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          {children}
        </main>

        {/* iOS Bottom Tab Bar — mobile only */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex">
            {navigationSections[0].items.map(item => {
              const isActive = currentView === item.id ||
                (item.id === 'hvac' && currentView === 'maintenance');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                    isActive ? '' : 'text-gray-400'
                  }`}
                  style={isActive ? { color: '#101d40' } : {}}
                >
                  <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 w-10 h-0.5 rounded-full" style={{ backgroundColor: '#101d40' }} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* QuickStats removed per user request */}
      </div>
    </div>
  );
};

export default Layout;
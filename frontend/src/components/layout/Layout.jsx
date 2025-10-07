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
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { useAuthContext } from '../../contexts/AuthContext';

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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-30">
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
  const { user: authUser } = useAuthContext();
  
  // Use auth user if available, fallback to clerk user
  const currentUser = authUser || clerkUser;

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

  // ✅ STREAMLINED: HVAC-focused navigation (keeping unused items for future)
  const navigationSections = [
    {
      title: "MAIN",
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          description: 'Overview & quick stats',
          badge: null
        },
        /* HIDDEN - May use later
        {
          id: 'jobs',
          label: 'Jobs',
          icon: Briefcase,
          description: 'Manage work orders',
          badge: jobsStats.lateJobs ? `${jobsStats.lateJobs} late` : null
        },
        {
          id: 'calendar',
          label: 'Schedule',
          icon: Calendar,
          description: 'View and manage schedule',
          badge: null
        },
        */
        {
          id: 'messaging',
          label: 'Team Chat',
          icon: MessageSquare,
          description: 'Team communication & messages',
          badge: null
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: CheckSquare,
          description: 'Organize and track team tasks',
          badge: null
        },
        {
          id: 'properties',
          label: 'Properties',
          icon: Building,
          description: 'Manage properties & locations',
          badge: null
        }
      ]
    },
    {
      title: "SERVICES & TOOLS",
      items: [
        /* HIDDEN - May use later
        {
          id: 'services',
          label: 'Service Catalog',
          icon: Tag,
          description: 'Manage services',
          badge: null
        },
        */
        {
          id: 'hvac',
          label: 'HVAC Systems',
          icon: Wrench,
          description: 'HVAC management & maintenance',
          badge: null
        },
        {
          id: 'maintenance',
          label: 'Quick Entry',
          icon: Plus,
          description: 'Add maintenance record',
          badge: null,
          isAction: true
        }
      ]
    },
    {
      title: "BUSINESS & ANALYTICS",
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: BarChart3,
          description: 'Analytics and insights',
          badge: 'SOON',
          comingSoon: true
        },
        /* HIDDEN - May use later
        {
          id: 'invoices',
          label: 'Invoicing',
          icon: Receipt,
          description: 'Manage billing',
          badge: null,
          comingSoon: true
        },
        */
        {
          id: 'timeHistory',
          label: 'Timesheets',
          icon: Clock,
          description: 'Time tracking & history',
          badge: 'NEW'
        }
        /* HIDDEN - May use later
        {
          id: 'expenses',
          label: 'Expenses',
          icon: DollarSign,
          description: 'Expense tracking',
          badge: null,
          comingSoon: true
        }
        */
      ]
    }
    /* HIDDEN - System Management section
    {
      title: "System Management",
      items: [
        {
          id: 'admin',
          label: 'Admin Dashboard',
          icon: Shield,
          description: 'System management',
          badge: 'NEW'
        },
        {
          id: 'team',
          label: 'Team',
          icon: Users,
          description: 'Team management',
          badge: null,
          comingSoon: true
        }
      ]
    }
    */
  ];

  // ✅ PRESERVED: All existing utility functions
  const getPageTitle = () => {
    const viewTitles = {
      dashboard: 'Dashboard',
      jobs: 'Jobs Management',
      calendar: 'Schedule & Calendar',
      properties: 'Properties Management',
      services: 'Service Catalog',
      hvac: 'HVAC Systems', 
      reports: 'Reports & Analytics',
      admin: 'Admin Dashboard',
      maintenance: 'Quick Maintenance Entry',
      timeHistory: 'Timesheets & Time Tracking'
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

  // ✅ PRESERVED: Mock notifications (your existing logic)
  const notifications = [
    { id: 1, type: 'urgent', message: 'Job #1234 is overdue', time: '5 minutes ago' },
    { id: 2, type: 'success', message: 'Maintenance completed for Oak Street', time: '2 hours ago' },
    { id: 3, type: 'info', message: 'New property added: Elm Avenue', time: '1 day ago' }
  ];

  // ✅ PRESERVED: Navigation Item Component
  const NavItem = ({ item, isActive, isCollapsed }) => {
    const isHovered = hoveredNavItem === item.id;
    
    return (
      <li>
        <button
          onClick={() => item.isAction ? handleOpenModal('maintenance') : handleNavigation(item.id)}
          onMouseEnter={() => setHoveredNavItem(item.id)}
          onMouseLeave={() => setHoveredNavItem(null)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
            ${isActive 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${item.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
            ${item.isAction ? 'border border-blue-200 hover:border-blue-300 hover:bg-blue-50' : ''}
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
                      ${item.badge === 'NEW' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                  {item.comingSoon && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
              </div>
            </>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && isHovered && (
            <div className="fixed left-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-50 shadow-lg">
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
      <div className={`flex items-center gap-3 p-4 border-b border-gray-200 ${
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
              <h1 className="text-lg font-bold text-gray-900">Dean Callan PM</h1>
              <p className="text-sm text-gray-600">Property Management</p>
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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
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
      </nav>

      {/* Footer */}
      {!isDesktopSidebarCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System Status</p>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isDesktopSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 bg-white shadow-xl">
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

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'urgent' ? 'bg-red-500' :
                              notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
        <main className="flex-1 overflow-auto pb-16">
          {children}
        </main>

        {/* ✅ PRESERVED: Always-Visible QuickStats at Bottom (hidden on HVAC page) */}
        {currentView !== 'hvac' && <QuickStats stats={jobsStats} lastUpdated={lastDataUpdate} />}
      </div>
    </div>
  );
};

export default Layout;
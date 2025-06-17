import React, { useState } from 'react';
import { 
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
  Settings,
  Menu,
  X,
  Users,
  Receipt,
  Tag
} from 'lucide-react';

const Sidebar = ({ 
  currentView, 
  onNavigate, 
  onOpenModal,
  isMobile = false,
  isOpen = true,
  onToggle 
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  // Navigation items configuration
  const navigationSections = [
    {
      title: "Core Operations",
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Home, 
          onClick: () => onNavigate('dashboard'),
          badge: null
        },
        { 
          id: 'jobs', 
          label: 'Jobs', 
          icon: Briefcase, 
          onClick: () => onNavigate('jobs'),
          badge: '12' // Example: active jobs count
        },
        { 
          id: 'schedule', 
          label: 'Schedule', 
          icon: Calendar, 
          onClick: () => onNavigate('schedule'),
          badge: null
        },
        { 
          id: 'properties', 
          label: 'Properties', 
          icon: Building, 
          onClick: () => onNavigate('properties'),
          badge: null
        }
      ]
    },
    {
      title: "Business Operations",
      items: [
        { 
      id: 'services', 
      label: 'Services', 
      icon: Tag,  // Add this import: import { Tag } from 'lucide-react';
      onClick: () => onNavigate('services'),
      badge: null
        },
        { 
          id: 'invoices', 
          label: 'Invoices', 
          icon: FileText, 
          onClick: () => onNavigate('invoices'),
          badge: '3', // Example: pending invoices
          comingSoon: true
        },
        { 
          id: 'quotes', 
          label: 'Quotes', 
          icon: DollarSign, 
          onClick: () => onNavigate('quotes'),
          badge: null,
          comingSoon: true
        },
        { 
          id: 'timesheets', 
          label: 'Timesheets', 
          icon: Clock, 
          onClick: () => onNavigate('timesheets'),
          badge: null,
          comingSoon: true
        },
        { 
          id: 'expenses', 
          label: 'Expenses', 
          icon: Receipt, 
          onClick: () => onNavigate('expenses'),
          badge: null,
          comingSoon: true
        }
      ]
    },
    {
      title: "Quick Actions",
      items: [
        { 
          id: 'quick-maintenance', 
          label: 'Quick Maintenance', 
          icon: Wrench, 
          onClick: () => onOpenModal('maintenance'),
          badge: null,
          isAction: true
        },
        { 
          id: 'schedule-work', 
          label: 'Schedule Work', 
          icon: Plus, 
          onClick: () => onOpenModal('schedule'),
          badge: null,
          isAction: true
        },
        { 
          id: 'property-search', 
          label: 'Property Search', 
          icon: Search, 
          onClick: () => onOpenModal('propertySearch'),
          badge: null,
          isAction: true
        }
      ]
    },
    {
      title: "Administration",
      items: [
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: BarChart3, 
          onClick: () => onNavigate('reports'),
          badge: null
        },
        { 
          id: 'team', 
          label: 'Team', 
          icon: Users, 
          onClick: () => onNavigate('team'),
          badge: null,
          comingSoon: true
        },
        { 
          id: 'settings', 
          label: 'Settings', 
          icon: Settings, 
          onClick: () => onNavigate('settings'),
          badge: null
        }
      ]
    }
  ];

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    const isHovered = hoveredItem === item.id;
    
    return (
      <li>
        <button
          onClick={item.onClick}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          disabled={item.comingSoon}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group relative
            ${isActive 
              ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]' 
              : item.comingSoon 
                ? 'text-gray-400 cursor-not-allowed' 
                : item.isAction
                  ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${isHovered && !item.comingSoon && !isActive ? 'transform translate-x-1' : ''}
          `}
        >
          <Icon 
            className={`
              w-5 h-5 transition-transform duration-200
              ${isActive ? 'text-white' : item.isAction ? 'text-blue-600' : 'text-gray-500'}
              ${isHovered && !item.comingSoon ? 'scale-110' : ''}
            `} 
          />
          
          <span className="font-medium flex-1">
            {item.label}
          </span>
          
          {/* Badge */}
          {item.badge && (
            <span className={`
              inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold min-w-[20px] h-5
              ${isActive 
                ? 'bg-white text-blue-600' 
                : item.isAction
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }
            `}>
              {item.badge}
            </span>
          )}
          
          {/* Coming Soon Label */}
          {item.comingSoon && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              Soon
            </span>
          )}
          
          {/* Hover Effect */}
          {isHovered && !item.comingSoon && !isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-lg opacity-50 pointer-events-none" />
          )}
        </button>
      </li>
    );
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="/DeanCallan.png" 
            alt="Dean Callan PM" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dean Callan PM</h1>
            <p className="text-sm text-gray-600">Property Management</p>
          </div>
        </div>
        
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onToggle}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <NavItem 
                  key={item.id} 
                  item={item} 
                  isActive={currentView === item.id}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
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
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
        
        {/* Mobile sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className={`
      hidden lg:flex lg:flex-col h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300
      ${isOpen ? 'w-80' : 'w-20'}
    `}>
      {isOpen ? (
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      ) : (
        // Collapsed sidebar
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-center mb-8">
            <img 
              src="/DeanCallan.png" 
              alt="Dean Callan PM" 
              className="w-8 h-8 object-contain"
            />
          </div>
          
          <nav className="flex-1 space-y-4">
            {navigationSections.flatMap(section => section.items).map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  disabled={item.comingSoon}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : item.comingSoon 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                  
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

// Demo component to show sidebar in action
const SidebarDemo = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const handleNavigate = (view) => {
    setCurrentView(view);
    setIsMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };

  const handleOpenModal = (modalType) => {
    console.log(`Opening ${modalType} modal`);
    setIsMobileSidebarOpen(false); // Close mobile sidebar when opening modal
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenModal={handleOpenModal}
        isOpen={isDesktopSidebarOpen}
        onToggle={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
      />
      
      {/* Mobile Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenModal={handleOpenModal}
        isMobile={true}
        isOpen={isMobileSidebarOpen}
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
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
              <h1 className="text-lg font-semibold text-gray-900">Dean Callan PM</h1>
            </div>
            
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {currentView.replace('-', ' ')}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome back, Admin</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">DC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                {currentView.replace('-', ' ')} View
              </h3>
              <p className="text-gray-600 mb-6">
                This is where the {currentView} content would be displayed.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
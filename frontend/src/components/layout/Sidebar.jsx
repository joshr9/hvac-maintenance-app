// components/layout/Sidebar.jsx - Enhanced version of your existing sidebar
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
          badge: null,
          description: 'Overview and analytics'
        },
        { 
          id: 'jobs', 
          label: 'Jobs', 
          icon: Briefcase, 
          onClick: () => onNavigate('jobs'),
          badge: '8', // Your actual badge
          description: 'Manage work orders'
        },
        { 
          id: 'schedule', 
          label: 'Schedule', 
          icon: Calendar, 
          onClick: () => onNavigate('schedule'),
          badge: null,
          description: 'View and manage schedule'
        },
        { 
          id: 'properties', 
          label: 'Properties', 
          icon: Building, 
          onClick: () => onNavigate('properties'),
          badge: null,
          description: 'Manage properties & locations'
        },
        { 
        id: 'timeHistory', 
        label: 'My Time', 
        icon: Clock, 
        onClick: () => onNavigate('timeHistory'),
        badge: 'NEW',
        description: 'Time entries & history'
      }
      ]
    },
    {
      title: "Services & Tools",
      items: [
        { 
          id: 'services', 
          label: 'Service Catalog', 
          icon: Tag,
          onClick: () => onNavigate('services'),
          badge: null,
          description: 'Manage services'
        },
        { 
          id: 'quick-maintenance', 
          label: 'Quick Entry', 
          icon: Plus, 
          onClick: () => onOpenModal('maintenance'),
          badge: null,
          isAction: true,
          description: 'Add maintenance record'
        }
      ]
    },
    {
      title: "Business Operations",
      items: [
        { 
          id: 'invoices', 
          label: 'Invoicing', 
          icon: Receipt, 
          onClick: () => onNavigate('invoices'),
          badge: null,
          comingSoon: true,
          description: 'Manage billing'
        },
        { 
          id: 'quotes', 
          label: 'Quotes', 
          icon: DollarSign, 
          onClick: () => onNavigate('quotes'),
          badge: null,
          comingSoon: true,
          description: 'Generate estimates'
        },
        { 
          id: 'timesheets', 
          label: 'Timesheets', 
          icon: Clock, 
          onClick: () => onNavigate('timesheets'),
          badge: null,
          comingSoon: true,
          description: 'Track time'
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: BarChart3, 
          onClick: () => onNavigate('reports'),
          badge: null,
          comingSoon: true,
          description: 'Analytics and insights'
        }
      ]
    }
  ];

  // Enhanced NavItem with hover tooltips
  const NavItem = ({ item, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = item.icon;

    return (
      <li className="relative">
        <button
          onClick={item.onClick}
          disabled={item.comingSoon}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-300 relative group
            ${isActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]' 
              : item.comingSoon 
                ? 'text-gray-400 cursor-not-allowed' 
                : item.isAction
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
            }
            ${isHovered && !item.comingSoon && !isActive ? 'transform translate-x-1' : ''}
          `}
        >
          <Icon 
            className={`
              w-5 h-5 transition-all duration-300 flex-shrink-0 mx-auto
              ${isActive ? 'text-white' : item.isAction ? 'text-blue-600' : 'text-gray-500'}
              ${isHovered && !isActive ? 'scale-110' : ''}
            `} 
          />
          
          {/* Show label and details when expanded */}
          {isOpen && (
            <>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className={`text-xs truncate ${
                  isActive ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              
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
            </>
          )}

          {/* Collapsed state badge */}
          {!isOpen && item.badge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          )}

          {/* Hover effect overlay */}
          {isHovered && !item.comingSoon && !isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent rounded-lg opacity-50 pointer-events-none" />
          )}
        </button>

        {/* Enhanced Tooltip for collapsed state */}
        {!isOpen && isHovered && (
          <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
              <div className="font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-300 mt-1">{item.description}</div>
              )}
              {item.badge && (
                <div className="text-xs text-blue-300 mt-1">
                  {item.badge} items
                </div>
              )}
              {/* Tooltip arrow */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        )}
      </li>
    );
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`border-b border-gray-200 transition-all duration-300 ${
        isOpen ? 'p-6' : 'p-4'
      }`}>
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
          <img 
            src="/DeanCallan.png" 
            alt="Dean Callan PM" 
            className={`object-contain transition-all duration-300 ${
              isOpen ? 'w-10 h-10' : 'w-8 h-8'
            }`}
          />
          {isOpen && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dean Callan PM</h1>
              <p className="text-sm text-gray-600">Property Management</p>
            </div>
          )}
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
      <nav className={`flex-1 p-4 overflow-y-auto transition-all duration-300 ${
        isOpen ? 'space-y-6' : 'space-y-4'
      }`}>
        {navigationSections.map((section) => (
          <div key={section.title}>
            {isOpen && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
            )}
            <ul className={isOpen ? 'space-y-1' : 'space-y-3'}>
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
      {isOpen && (
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

  // Desktop sidebar with enhanced transitions
  return (
    <div className={`
      hidden lg:flex lg:flex-col h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300
      ${isOpen ? 'w-80' : 'w-16'}
    `}>
      <div className="flex flex-col h-full">
        {sidebarContent}
      </div>
    </div>
  );
};

export default Sidebar;
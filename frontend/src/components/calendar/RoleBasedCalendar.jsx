// components/calendar/RoleBasedCalendar.jsx - Main Entry Point
import React from 'react';

// Import both view components
import AdminCalendarView from './views/AdminCalendarView';
import TechnicianCalendarView from './views/TechnicianCalendarView';

// Hook for user role detection (follows your hook patterns)
import { useUserRole } from './hooks/useUserRole';

const RoleBasedCalendar = ({ 
  jobsRefreshTrigger = 0, 
  onJobCreated, 
  allProperties = [],
  onNavigate,           // App-level navigation (preserved from current system)
  onOpenModal,          // App-level modal management (preserved)
  navigationData,       // Navigation state/data (preserved)
  currentUser           // NEW - for role detection
}) => {
  const { userRole, permissions, features, uiConfig } = useUserRole(currentUser);

  // Route to appropriate view based on role
  switch (userRole) {
    case 'admin':
    case 'scheduler':
    case 'manager':
      return (
        <AdminCalendarView
          jobsRefreshTrigger={jobsRefreshTrigger}
          onJobCreated={onJobCreated}
          allProperties={allProperties}
          onNavigate={onNavigate}        // Preserve existing navigation
          onOpenModal={onOpenModal}      // Preserve existing modals
          navigationData={navigationData} // Preserve navigation data
          permissions={permissions}
          currentUser={currentUser}
        />
      );

    case 'technician':
    case 'user':
    case 'field_worker':
      return (
        <TechnicianCalendarView
          jobsRefreshTrigger={jobsRefreshTrigger}
          onNavigate={onNavigate}        // Preserve existing navigation
          onOpenModal={onOpenModal}      // Preserve existing modals
          navigationData={navigationData} // Preserve navigation data
          currentUser={currentUser}
          permissions={permissions}
          features={features}
          uiConfig={uiConfig}
        />
      );

    default:
      // Fallback to read-only technician view for guests
      return (
        <TechnicianCalendarView
          jobsRefreshTrigger={jobsRefreshTrigger}
          onNavigate={onNavigate}
          onOpenModal={onOpenModal}
          navigationData={navigationData}
          currentUser={currentUser || { name: 'Guest User', role: 'guest' }}
          permissions={{ readOnly: true, canViewOwnSchedule: false }}
          features={{ showPersonalView: false }}
          uiConfig={{ headerStyle: 'standard', calendarSize: 'standard' }}
        />
      );
  }
};

export default RoleBasedCalendar;
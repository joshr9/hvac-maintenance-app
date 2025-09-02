// src/components/calendar/hooks/useUserRole.js - Enhanced for Auth
import { useMemo } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';

export const useUserRole = (fallbackUser = null) => {
  let user = fallbackUser;
  
  try {
    const { user: authUser } = useAuthContext();
    user = authUser || fallbackUser;
  } catch (e) {
    // Auth context not available, use fallback
  }

  const userRole = useMemo(() => {
    if (!user) return 'guest';
    
    if (user.organizationRole) {
      const orgRole = user.organizationRole.toLowerCase();
      if (orgRole === 'admin' || orgRole === 'org:admin') return 'admin';
      if (orgRole === 'basic_member') return 'technician';
    }
    
    if (user.role) return user.role.toLowerCase();
    if (user.userType) return user.userType.toLowerCase();
    
    if (user.permissions?.includes('admin') || 
        user.title?.toLowerCase().includes('admin')) {
      return 'admin';
    }
    
    if (user.permissions?.includes('schedule') || 
        user.title?.toLowerCase().includes('manager')) {
      return 'manager';
    }
    
    if (user.permissions?.includes('technician') ||
        user.title?.toLowerCase().includes('technician')) {
      return 'technician';
    }
    
    return 'technician';
  }, [user]);

  const permissions = useMemo(() => {
    const rolePermissions = {
      admin: {
        canViewAllSchedules: true,
        canScheduleJobs: true,
        canCreateJobs: true,
        canEditJobs: true,
        canDeleteJobs: true,
        canAssignTechnicians: true,
        canViewUnscheduled: true,
        canDragDrop: true,
        canBulkOperations: true,
        canViewAnalytics: true,
        canManageTeam: true,
        canManageProperties: true,
        canViewSchedules: true,
        accessLevel: 'full'
      },
      manager: {
        canViewAllSchedules: true,
        canScheduleJobs: true,
        canCreateJobs: true,
        canEditJobs: true,
        canDeleteJobs: false,
        canAssignTechnicians: true,
        canViewUnscheduled: true,
        canDragDrop: true,
        canBulkOperations: true,
        canViewAnalytics: true,
        canManageTeam: true,
        canManageProperties: false,
        canViewSchedules: true,
        accessLevel: 'management'
      },
      technician: {
        canViewAllSchedules: false,
        canScheduleJobs: false,
        canCreateJobs: false,
        canEditJobs: true,
        canDeleteJobs: false,
        canAssignTechnicians: false,
        canViewUnscheduled: false,
        canDragDrop: false,
        canBulkOperations: false,
        canViewAnalytics: false,
        canManageTeam: false,
        canManageProperties: false,
        canUpdateJobStatus: true,
        canViewOwnSchedule: true,
        canViewSchedules: true,
        accessLevel: 'technician'
      },
      guest: {
        canViewAllSchedules: false,
        canScheduleJobs: false,
        canCreateJobs: false,
        canEditJobs: false,
        canDeleteJobs: false,
        canAssignTechnicians: false,
        canViewUnscheduled: false,
        canDragDrop: false,
        canBulkOperations: false,
        canViewAnalytics: false,
        canManageTeam: false,
        canManageProperties: false,
        canViewSchedules: false,
        accessLevel: 'none'
      }
    };

    return rolePermissions[userRole] || rolePermissions.guest;
  }, [userRole]);

  const features = {
    showUnscheduledSidebar: permissions.canViewUnscheduled,
    showTeamFilters: permissions.canViewAllSchedules,
    showCreateJobButton: permissions.canCreateJobs,
    showDragDrop: permissions.canDragDrop,
    showBulkActions: permissions.canBulkOperations,
    showAnalytics: permissions.canViewAnalytics,
    showAllTechnicians: permissions.canViewAllSchedules,
    showPersonalView: permissions.canViewOwnSchedule,
    enableJobEditing: permissions.canEditJobs,
    enableJobCreation: permissions.canCreateJobs,
    enableJobDeletion: permissions.canDeleteJobs
  };

  return {
    user,
    userRole,
    permissions,
    features,
    isAdmin: userRole === 'admin',
    isManager: ['admin', 'manager', 'scheduler'].includes(userRole),
    isTechnician: ['technician', 'user'].includes(userRole),
    hasManagementAccess: permissions.accessLevel === 'full' || permissions.accessLevel === 'management',
    hasSchedulingAccess: permissions.canScheduleJobs,
    roleDisplayName: userRole.charAt(0).toUpperCase() + userRole.slice(1),
    accessLevel: permissions.accessLevel,
    isAuthenticated: !!user
  };
};
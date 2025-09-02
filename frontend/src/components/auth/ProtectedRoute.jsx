// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useUserRole } from '../calendar/hooks/useUserRole';

const ProtectedRoute = ({ children, requiredRole = null, requiredPermissions = [] }) => {
  const { isLoaded, isSignedIn } = useUser();
  const { userRole, permissions } = useUserRole();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // RedirectToSignIn handles this
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every(permission => permissions[permission]);
    if (!hasPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
            <p className="text-gray-600">You don't have the required permissions.</p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
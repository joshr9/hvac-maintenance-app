// src/components/dev/AuthTester.jsx
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUserRole } from '../calendar/hooks/useUserRole';

const AuthTester = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const { user, isLoaded, isSignedIn } = useAuthContext();
  const { userRole, permissions } = useUserRole();

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">🧪 Auth Debug</h3>
      <div className="text-sm space-y-1">
        <div>Status: {isSignedIn ? '✅ Signed In' : '❌ Not Signed In'}</div>
        <div>Loaded: {isLoaded ? '✅' : '⏳'}</div>
        {user && (
          <>
            <div>Name: {user.name}</div>
            <div>Role: {userRole}</div>
            <div>Email: {user.email}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthTester;
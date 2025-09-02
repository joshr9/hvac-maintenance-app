// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const appUser = {
        id: user.id,
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: user.publicMetadata?.role || 'technician',
        department: user.publicMetadata?.department,
        title: user.publicMetadata?.title,
        permissions: user.publicMetadata?.permissions || [],
        organizationId: user.organizationMemberships?.[0]?.organization?.id,
        organizationRole: user.organizationMemberships?.[0]?.role
      };
      setAuthUser(appUser);
    } else {
      setAuthUser(null);
    }
  }, [user, isLoaded, isSignedIn]);

  const getAuthenticatedToken = async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user: authUser,
      isLoaded,
      isSignedIn,
      getAuthenticatedToken,
      clerkUser: user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
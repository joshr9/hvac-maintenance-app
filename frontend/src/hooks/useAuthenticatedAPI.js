// src/hooks/useAuthenticatedAPI.js
import { useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export const useAuthenticatedAPI = () => {
  const { getAuthenticatedToken } = useAuthContext();

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    try {
      const token = await getAuthenticatedToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return await fetch(url, {
        ...options,
        headers
      });
    } catch (error) {
      console.error('Authenticated API call failed:', error);
      throw error;
    }
  }, [getAuthenticatedToken]);

  const get = useCallback((url, options = {}) => {
    return authenticatedFetch(url, { ...options, method: 'GET' });
  }, [authenticatedFetch]);

  const post = useCallback((url, data, options = {}) => {
    return authenticatedFetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }, [authenticatedFetch]);

  const put = useCallback((url, data, options = {}) => {
    return authenticatedFetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }, [authenticatedFetch]);

  const del = useCallback((url, options = {}) => {
    return authenticatedFetch(url, { ...options, method: 'DELETE' });
  }, [authenticatedFetch]);

  return { authenticatedFetch, get, post, put, delete: del };
};
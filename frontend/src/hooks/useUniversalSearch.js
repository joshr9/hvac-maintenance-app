// hooks/useUniversalSearch.js
import { useState, useEffect, useMemo } from 'react';

export const useUniversalSearch = (currentView = 'dashboard') => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    properties: [],
    jobs: [],
    services: [],
    isLoading: false,
    hasSearched: false
  });
  
  // Debounce search to avoid too many API calls
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Context-based search priorities
  const getSearchPriority = (view) => {
    const priorities = {
      dashboard: ['properties', 'jobs', 'services'],
      jobs: ['jobs', 'properties', 'services'],
      properties: ['properties', 'jobs', 'services'],
      services: ['services', 'properties', 'jobs'],
      schedule: ['jobs', 'properties', 'services']
    };
    
    return priorities[view] || priorities.dashboard;
  };

  // Perform the actual search across all systems
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({
        properties: [],
        jobs: [],
        services: [],
        isLoading: false,
        hasSearched: false
      });
      return;
    }

    setSearchResults(prev => ({ ...prev, isLoading: true, hasSearched: true }));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // Search all systems in parallel
      const [propertiesRes, jobsRes, servicesRes] = await Promise.all([
        fetch(`${apiUrl}/api/properties?search=${encodeURIComponent(query)}`).catch(() => ({ json: () => [] })),
        fetch(`${apiUrl}/api/jobs?search=${encodeURIComponent(query)}`).catch(() => ({ json: () => ({ jobs: [] }) })),
        fetch(`${apiUrl}/api/services?search=${encodeURIComponent(query)}&active=true`).catch(() => ({ json: () => [] }))
      ]);

      const [properties, jobsData, services] = await Promise.all([
        propertiesRes.json(),
        jobsRes.json(), 
        servicesRes.json()
      ]);

      const jobs = jobsData.jobs || jobsData;

      setSearchResults({
        properties: Array.isArray(properties) ? properties : [],
        jobs: Array.isArray(jobs) ? jobs : [],
        services: Array.isArray(services) ? services : [],
        isLoading: false,
        hasSearched: true
      });

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        properties: [],
        jobs: [],
        services: [],
        isLoading: false,
        hasSearched: true
      });
    }
  };

  // Trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  // Get ordered results based on current view context
  const getOrderedResults = useMemo(() => {
    const priorities = getSearchPriority(currentView);
    const { properties, jobs, services } = searchResults;
    
    const resultSections = [];
    
    priorities.forEach(type => {
      switch (type) {
        case 'properties':
          if (properties.length > 0) {
            resultSections.push({
              type: 'properties',
              title: 'Properties',
              items: properties,
              count: properties.length,
              icon: '🏢'
            });
          }
          break;
        case 'jobs':
          if (jobs.length > 0) {
            resultSections.push({
              type: 'jobs', 
              title: 'Jobs',
              items: jobs,
              count: jobs.length,
              icon: '💼'
            });
          }
          break;
        case 'services':
          if (services.length > 0) {
            resultSections.push({
              type: 'services',
              title: 'Services',
              items: services,
              count: services.length,
              icon: '🔧'
            });
          }
          break;
      }
    });

    return resultSections;
  }, [searchResults, currentView]);

  // Get total results count
  const getTotalCount = () => {
    return searchResults.properties.length + 
           searchResults.jobs.length + 
           searchResults.services.length;
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    orderedResults: getOrderedResults,
    isLoading: searchResults.isLoading,
    hasSearched: searchResults.hasSearched,
    totalCount: getTotalCount(),
    clearSearch,
    refreshSearch: () => performSearch(debouncedQuery)
  };
};
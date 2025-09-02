// contexts/TimerContext.js - Global timer state to prevent multiple API calls
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getActiveTimer, startJobTimer, stopJobTimer } from '../hooks/timerAPI';

const TimerContext = createContext();

export const useGlobalTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useGlobalTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children, technicianName = 'Default User' }) => {
  const [activeJobId, setActiveJobId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ SINGLE API CALL for entire app - check for active timer on app load
  useEffect(() => {
    const checkActiveTimer = async () => {
      try {
        const response = await getActiveTimer(technicianName);
        if (response.activeTimer) {
          setActiveJobId(response.activeTimer.jobId);
          setStartTime(response.activeTimer.startTime);
          setElapsedSeconds(response.activeTimer.elapsedSeconds || 0);
        }
      } catch (error) {
        console.error('Error checking active timer:', error);
      }
    };

    checkActiveTimer();
  }, [technicianName]);

  // Update elapsed time every second (local only - no API calls)
  useEffect(() => {
    let interval = null;
    
    if (activeJobId && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - new Date(startTime)) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId, startTime]);

  // Start timer function
  const startTimer = useCallback(async (jobId, notes = '') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await startJobTimer(jobId, technicianName, notes);
      
      if (response.success) {
        setActiveJobId(parseInt(jobId));
        setStartTime(response.timer.startTime);
        setElapsedSeconds(0);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to start timer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [technicianName, isLoading]);

  // Stop timer function
  const stopTimer = useCallback(async (jobId, notes = '') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await stopJobTimer(jobId, technicianName, notes);
      
      if (response.success) {
        setActiveJobId(null);
        setStartTime(null);
        setElapsedSeconds(0);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to stop timer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [technicianName, isLoading]);

  // Format elapsed time
  const formatElapsed = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  const value = {
    activeJobId,
    startTime,
    elapsedSeconds,
    isLoading,
    formattedElapsed: formatElapsed(elapsedSeconds),
    startTimer,
    stopTimer,
    isJobActive: (jobId) => activeJobId === parseInt(jobId)
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
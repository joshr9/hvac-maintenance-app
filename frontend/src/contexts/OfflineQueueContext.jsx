// contexts/OfflineQueueContext.jsx - Integrated with existing TimerContext
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { startJobTimer, stopJobTimer } from '../hooks/timerAPI';

const OfflineQueueContext = createContext();

export const useOfflineQueue = () => {
  const context = useContext(OfflineQueueContext);
  if (!context) {
    throw new Error('useOfflineQueue must be used within OfflineQueueProvider');
  }
  return context;
};

export const OfflineQueueProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('timerQueue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to parse saved queue:', error);
        localStorage.removeItem('timerQueue');
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timerQueue', JSON.stringify(queue));
  }, [queue]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Small delay to ensure connection is stable
      setTimeout(syncQueue, 1000);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming online if queue has items
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      syncQueue();
    }
  }, [isOnline, queue.length]);

  // Add action to queue
  const queueAction = useCallback((action) => {
    const queuedAction = {
      id: Date.now() + Math.random(), // Ensure unique IDs
      type: action.type, // 'START' or 'STOP'
      jobId: action.jobId,
      timestamp: new Date().toISOString(),
      technicianName: action.technicianName,
      notes: action.notes || '',
      retryCount: 0
    };

    setQueue(prev => [...prev, queuedAction]);

    // If online, try to sync immediately
    if (isOnline && !isSyncing) {
      setTimeout(syncQueue, 500);
    }

    return queuedAction;
  }, [isOnline, isSyncing]);

  // Enhanced sync with retry logic
  const syncQueue = useCallback(async () => {
    if (isSyncing || queue.length === 0 || !isOnline) return;

    setIsSyncing(true);
    
    try {
      const queueCopy = [...queue];
      let syncedCount = 0;
      
      for (const action of queueCopy) {
        try {
          console.log(`Syncing ${action.type} for job ${action.jobId}`);
          
          if (action.type === 'START') {
            await startJobTimer(action.jobId, action.technicianName, action.notes);
          } else if (action.type === 'STOP') {
            await stopJobTimer(action.jobId, action.technicianName, action.notes);
          }
          
          // Remove successful action from queue
          setQueue(prev => prev.filter(item => item.id !== action.id));
          syncedCount++;
          
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          setQueue(prev => prev.map(item => 
            item.id === action.id 
              ? { ...item, retryCount: (item.retryCount || 0) + 1 }
              : item
          ));
          
          // Stop syncing on repeated failures to maintain order
          if ((action.retryCount || 0) >= 3) {
            console.error(`Action ${action.id} failed 3 times, stopping sync`);
            break;
          }
          
          // For first failures, continue trying other actions
          if ((action.retryCount || 0) === 0) {
            continue;
          } else {
            break;
          }
        }
      }
      
      if (syncedCount > 0) {
        console.log(`Successfully synced ${syncedCount} timer actions`);
      }
      
    } catch (error) {
      console.error('Queue sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [queue, isSyncing, isOnline]);

  // Clear queue (for testing/debugging)
  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem('timerQueue');
  }, []);

  // Remove failed actions manually
  const removeAction = useCallback((actionId) => {
    setQueue(prev => prev.filter(item => item.id !== actionId));
  }, []);

  const value = {
    isOnline,
    queue,
    queueAction,
    syncQueue,
    clearQueue,
    removeAction,
    isSyncing,
    queueCount: queue.length,
    pendingActions: queue.filter(action => (action.retryCount || 0) < 3),
    failedActions: queue.filter(action => (action.retryCount || 0) >= 3)
  };

  return (
    <OfflineQueueContext.Provider value={value}>
      {children}
    </OfflineQueueContext.Provider>
  );
};
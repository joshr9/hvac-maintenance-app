// components/jobs/JobTimer.jsx - Enhanced with Total Time Display
import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Loader2, AlertCircle, History } from 'lucide-react';
import { useGlobalTimer } from '../../contexts/TimerContext';
import { getJobTimers } from '../../hooks/timerAPI';

const JobTimer = ({ 
  jobId, 
  onTimerStart,
  onTimerStop,
  className = '',
  size = 'small'
}) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(true);
  
  const {
    isJobActive,
    formattedElapsed,
    startTimer,
    stopTimer,
    isLoading
  } = useGlobalTimer();

  const isActive = isJobActive(jobId);

  // Load total time for this job
  useEffect(() => {
    loadTotalTime();
  }, [jobId]);

  const loadTotalTime = async () => {
    try {
      setIsLoadingTotal(true);
      const response = await getJobTimers(jobId);
      if (response.success) {
        const entries = response.timers || [];
        const total = entries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0);
        setTotalMinutes(total);
      }
    } catch (error) {
      console.error('Failed to load total time:', error);
    } finally {
      setIsLoadingTotal(false);
    }
  };

  // Format total time
  const formatTotalTime = (minutes) => {
    if (minutes === 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  // Handle timer start
  const handleStart = async () => {
    try {
      setError(null);
      await startTimer(jobId, notes);
      setNotes('');
      onTimerStart?.(jobId);
    } catch (error) {
      setError('Failed to start timer');
      console.error('Timer start failed:', error);
    }
  };

  // Handle timer stop and reload total
  const handleStop = async () => {
    try {
      setError(null);
      const result = await stopTimer(jobId, notes);
      setNotes('');
      
      // Reload total time after stopping
      await loadTotalTime();
      
      onTimerStop?.(jobId, result);
    } catch (error) {
      setError('Failed to stop timer');
      console.error('Timer stop failed:', error);
    }
  };

  // Size variants
  const sizeClasses = {
    small: {
      button: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    default: {
      button: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.small;

  // Error display
  if (error) {
    return (
      <div className={`flex items-center gap-1 text-red-600 ${className}`}>
        <AlertCircle className={sizes.icon} />
        <span className={sizes.text}>Error</span>
        <button 
          onClick={() => setError(null)}
          className="text-red-500 hover:text-red-700 underline text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`timer-widget ${className}`}>
      <div className="flex flex-col gap-2">
        
        {/* ✅ NEW: Total Time Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <History className={`${sizes.icon} text-gray-500`} />
            <span className={`${sizes.text} text-gray-600`}>
              Total: {isLoadingTotal ? '...' : formatTotalTime(totalMinutes)}
            </span>
          </div>
          
          {/* Current Timer or Start Button */}
          <div className="flex items-center gap-1">
            {!isActive ? (
              // Start Timer Button
              <button
                onClick={handleStart}
                disabled={isLoading}
                className={`
                  flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded 
                  font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${sizes.button}
                `}
              >
                {isLoading ? (
                  <Loader2 className={`${sizes.icon} animate-spin`} />
                ) : (
                  <Play className={sizes.icon} />
                )}
                <span className={sizes.text}>Start</span>
              </button>
            ) : (
              // Active Timer Display + Stop Button
              <>
                {/* Live Timer Display */}
                <div className={`
                  flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded
                  border border-green-200 font-mono ${sizes.text}
                `}>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{formattedElapsed}</span>
                </div>
                
                {/* Stop Button */}
                <button
                  onClick={handleStop}
                  disabled={isLoading}
                  className={`
                    flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white rounded
                    font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    ${sizes.button}
                  `}
                >
                  {isLoading ? (
                    <Loader2 className={`${sizes.icon} animate-spin`} />
                  ) : (
                    <Square className={sizes.icon} />
                  )}
                  <span className={sizes.text}>Stop</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notes input when active */}
        {isActive && (
          <div className="mt-1">
            <input
              type="text"
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTimer;
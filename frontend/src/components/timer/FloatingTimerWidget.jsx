// components/timer/FloatingTimerWidget.jsx
import React, { useState } from 'react';
import { X, Minimize2, Maximize2, Square } from 'lucide-react';
import { useGlobalTimer } from '../../contexts/TimerContext';

const FloatingTimerWidget = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { activeJobId, formattedElapsed, stopTimer, isLoading } = useGlobalTimer();

  // Don't render if no active timer
  if (!activeJobId || !isVisible) return null;

  const handleStop = async () => {
    if (window.confirm('Stop timer for this job?')) {
      try {
        await stopTimer(activeJobId);
      } catch (error) {
        console.error('Failed to stop timer:', error);
      }
    }
  };

  const handleHide = () => {
    setIsVisible(false);
    // Auto-show again after 30 seconds in case user wants it back
    setTimeout(() => setIsVisible(true), 30000);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-pulse">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-green-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
          title="Expand active timer"
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border border-gray-200 max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Active Timer</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleHide}
            className="p-1 hover:bg-gray-100 rounded"
            title="Hide for 30 seconds"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Job #{activeJobId}</div>
        <div className="text-2xl font-mono font-bold text-gray-900">
          {formattedElapsed}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleStop}
          disabled={isLoading}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Square className="w-4 h-4" />
          Stop Timer
        </button>
      </div>

      {/* Quick note (optional) */}
      <div className="mt-2 text-xs text-gray-500">
        Visible on all pages • Auto-syncing
      </div>
    </div>
  );
};

export default FloatingTimerWidget;
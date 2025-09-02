// components/dev/DragDropDebugger.jsx - Production Debugging Tool
import React, { useState, useEffect } from 'react';
import { Bug, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

const DragDropDebugger = ({ teamMembers = [], timeSlots = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [maxLogs, setMaxLogs] = useState(50);

  // Intercept console.log calls
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Only capture drag & drop related logs
      if (message.includes('🎯') || message.includes('🔍') || message.includes('📍') || 
          message.includes('DROP') || message.includes('slot') || message.includes('drag')) {
        setLogs(prev => [{
          type,
          timestamp,
          message,
          id: Date.now() + Math.random()
        }, ...prev.slice(0, maxLogs - 1)]);
      }
    };

    console.log = (...args) => {
      addLog('log', args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args);
      originalWarn.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [maxLogs]);

  // Clear logs
  const clearLogs = () => setLogs([]);

  // Test slot generation
  const testSlotGeneration = () => {
    console.log('🧪 Testing slot generation...');
    
    teamMembers.forEach(tech => {
      console.log('👤 Testing technician:', {
        name: tech.name,
        id: tech.id,
        type: typeof tech.id
      });
      
      timeSlots.forEach(slot => {
        const slotId = `slot-${tech.id}-${slot.hour}`;
        console.log('🎯 Generated slot ID:', {
          slotId,
          techId: tech.id,
          hour: slot.hour,
          canParse: slotId.split('-').length === 3
        });
      });
    });
  };

  // Analyze current setup
  const analyzeSetup = () => {
    console.log('🔍 Analyzing drag & drop setup...');
    
    const analysis = {
      teamMembersCount: teamMembers.length,
      timeSlotsCount: timeSlots.length,
      totalSlots: teamMembers.length * timeSlots.length,
      teamMemberIds: teamMembers.map(t => ({ name: t.name, id: t.id, type: typeof t.id })),
      timeSlotHours: timeSlots.map(s => s.hour),
      potentialIssues: []
    };

    // Check for potential issues
    const duplicateIds = teamMembers
      .map(t => t.id)
      .filter((id, index, arr) => arr.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      analysis.potentialIssues.push(`Duplicate technician IDs: ${duplicateIds.join(', ')}`);
    }

    const nonNumericIds = teamMembers.filter(t => typeof t.id !== 'number');
    if (nonNumericIds.length > 0) {
      analysis.potentialIssues.push(`Non-numeric technician IDs: ${nonNumericIds.map(t => `${t.name}(${t.id})`).join(', ')}`);
    }

    const invalidHours = timeSlots.filter(s => s.hour < 0 || s.hour > 23);
    if (invalidHours.length > 0) {
      analysis.potentialIssues.push(`Invalid hours: ${invalidHours.map(s => s.hour).join(', ')}`);
    }

    console.log('📊 Analysis results:', analysis);
    return analysis;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors z-50"
        title="Show Drag & Drop Debugger"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full z-50">
      {/* Header */}
      <div className="bg-red-500 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          <span className="font-medium">Drag & Drop Debugger</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-red-200 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-red-200 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Quick Actions */}
          <div className="mb-4 space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testSlotGeneration}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Test Slot Generation
              </button>
              <button
                onClick={analyzeSetup}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                Analyze Setup
              </button>
              <button
                onClick={clearLogs}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Current Stats */}
          <div className="mb-4 text-xs text-gray-600">
            <div>Team Members: {teamMembers.length}</div>
            <div>Time Slots: {timeSlots.length}</div>
            <div>Total Slots: {teamMembers.length * timeSlots.length}</div>
            <div>Debug Logs: {logs.length}</div>
          </div>

          {/* Logs Display */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Recent Logs:</div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No logs yet. Try dragging a job to generate logs.</div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className={`text-xs p-2 rounded ${
                      log.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                      log.type === 'warn' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="font-mono text-xs text-gray-500 mb-1">{log.timestamp}</div>
                    <div className="whitespace-pre-wrap break-words">{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed View */}
      {!isExpanded && (
        <div className="p-3 text-center">
          <div className="text-sm text-gray-600">
            Monitoring drag & drop events...
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {logs.length} logs captured
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropDebugger;
// components/tasks/TaskManagement.jsx - Main Container Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, Search } from 'lucide-react';

import TaskList from './TaskList';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';
import TaskFilters from './TaskFilters';

const TaskManagement = ({ 
  allProperties = [], 
  globalJobsData = {},
  onNavigate,
  fromMessage = null 
}) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  
  // Core State
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState(!!fromMessage);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  });

  // API Helper
  const apiCall = async (endpoint, options = {}) => {
    if (!isSignedIn) throw new Error('Not authenticated');
    
    const token = await getToken();
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load Tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/tasks');
      setTasks(data.tasks || []);
      setFilteredTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Handle Task Creation
  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setFilteredTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
  };

  // Handle Task Update
  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setFilteredTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // Handle Task Deletion
  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setFilteredTasks(prev => prev.filter(task => task.id !== taskId));
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  // Filter Tasks
  useEffect(() => {
    let filtered = tasks;

    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.assignee !== 'all') {
      filtered = filtered.filter(task => 
        task.assignees.some(assignee => assignee.userId === filters.assignee)
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  // Load tasks on component mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadTasks();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access task management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600">Organize and track team tasks</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <TaskFilters 
          filters={filters}
          setFilters={setFilters}
          tasks={tasks}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-1 text-xs text-red-600 hover:text-red-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onTaskClick={(task) => {
          setSelectedTask(task);
          setShowTaskDetail(true);
        }}
        onTaskUpdate={handleTaskUpdated}
        apiCall={apiCall}
      />

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={handleTaskCreated}
          allProperties={allProperties}
          globalJobsData={globalJobsData}
          fromMessage={fromMessage}
          apiCall={apiCall}
        />
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          allProperties={allProperties}
          globalJobsData={globalJobsData}
          apiCall={apiCall}
        />
      )}
    </div>
  );
};

export default TaskManagement;
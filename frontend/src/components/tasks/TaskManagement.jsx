// TaskManagement.jsx - iOS-Optimized Mobile Design
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, Search, CheckCircle, Clock, AlertTriangle, Filter, ChevronRight, RefreshCw } from 'lucide-react';

import TaskList from './TaskList';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';

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

  // UI State
  const [showCreateModal, setShowCreateModal] = useState(!!fromMessage);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  // Mobile optimizations
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API Helper
  const apiCall = async (endpoint, options = {}) => {
    if (!isSignedIn) throw new Error('Not authenticated');

    const token = await getToken();
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl}/api${endpoint}`, {
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
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll handler
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHeaderCollapsed(true);
      } else {
        setHeaderCollapsed(false);
      }
      setLastScrollY(currentScrollY);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Pull to refresh
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleTouchStart = (e) => {
      if (scrollContainer.scrollTop === 0) {
        setPullStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (pullStartY === 0 || scrollContainer.scrollTop > 0) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY;
      if (distance > 0 && distance < 120) {
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80) {
        setIsRefreshing(true);
        await loadTasks();
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setPullStartY(0);
        }, 500);
      } else {
        setPullDistance(0);
        setPullStartY(0);
      }
    };

    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchmove', handleTouchMove);
    scrollContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullStartY, pullDistance]);

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

  // Task stats
  const taskStats = {
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    total: tasks.length
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access task management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-16 left-0 right-0 flex justify-center items-center z-50 transition-all duration-200"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)`, opacity: Math.min(pullDistance / 80, 1) }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            <RefreshCw className={`w-5 h-5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm transition-all duration-300">
        {/* Stats Row */}
        <div className={`px-4 py-3 overflow-hidden transition-all duration-300 ${headerCollapsed ? 'max-h-0 opacity-0 py-0' : 'max-h-32 opacity-100'}`}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-center">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex bg-gray-100 mx-4 rounded-xl p-1 mb-3 overflow-hidden transition-all duration-300 ${headerCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-20 opacity-100'}`}>
          {[
            { id: 'all', label: 'All', count: taskStats.total },
            { id: 'PENDING', label: 'Pending', count: taskStats.pending },
            { id: 'IN_PROGRESS', label: 'Active', count: taskStats.inProgress }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilters(prev => ({ ...prev, status: tab.id }))}
              className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors min-h-[48px] ${
                filters.status === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 active:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filters.search || filters.status !== 'all' ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first task'
              }
            </p>
            {!filters.search && filters.status === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDetail(true);
                }}
                className="bg-white rounded-2xl p-5 shadow-lg active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : task.status === 'IN_PROGRESS' ? (
                        <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      )}
                      <h3 className="text-lg font-bold text-gray-900">
                        {task.title}
                      </h3>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 ml-9 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 ml-9">
                      {task.priority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center z-20"
        style={{ boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)' }}
      >
        <Plus className="w-7 h-7" />
      </button>

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

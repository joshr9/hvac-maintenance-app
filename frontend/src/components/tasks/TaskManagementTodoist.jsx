// TaskManagementTodoist.jsx - Complete Todoist-style redesign
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Search, Inbox, Calendar as CalendarIcon, CalendarDays, User as UserIcon, Plus } from 'lucide-react';
import QuickAddTask from './QuickAddTaskTodoist';
import TaskItem from './TaskItem';
import TaskDetailSidePanel from './TaskDetailSidePanel';

const TaskManagementTodoist = ({ allProperties = [], globalJobsData = {} }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // State
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [activeView, setActiveView] = useState('inbox'); // inbox, today, upcoming, my-tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/tasks');
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Task handlers
  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  const handleCompleteTask = async (task, e) => {
    e.stopPropagation();
    try {
      setCompletingTaskId(task.id);
      const updatedTask = { ...task, status: 'COMPLETED', completedAt: new Date() };
      handleTaskUpdated(updatedTask);

      setToast({ message: '1 task completed', taskId: task.id, originalTask: task });

      await apiCall(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          progress: 100
        })
      });

      setTimeout(() => setToast(null), 5000);
    } catch (error) {
      console.error('Error completing task:', error);
      handleTaskUpdated(task);
      setToast({ message: 'Failed to complete task', error: true });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleUndoComplete = async () => {
    if (!toast || !toast.originalTask) return;
    try {
      const originalTask = toast.originalTask;
      handleTaskUpdated(originalTask);
      await apiCall(`/tasks/${originalTask.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: originalTask.status,
          completedAt: null,
          progress: originalTask.progress
        })
      });
      setToast(null);
    } catch (error) {
      console.error('Error undoing task completion:', error);
    }
  };

  // Helper function to format date groups
  const getDateLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      const options = { month: 'short', day: 'numeric', weekday: 'long' };
      return taskDate.toLocaleDateString('en-US', options);
    }
  };

  // Group tasks by date (only for Upcoming view)
  const groupTasksByDate = (tasksToGroup) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups = {
      overdue: [],
      today: [],
      tomorrow: [],
      upcoming: {}
    };

    tasksToGroup.forEach(task => {
      if (!task.dueDate) {
        // Tasks without dates don't get grouped - they only show in Inbox
        return;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (dueDate.getTime() < today.getTime()) {
        groups.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else {
        const dateKey = dueDate.toISOString().split('T')[0];
        if (!groups.upcoming[dateKey]) {
          groups.upcoming[dateKey] = [];
        }
        groups.upcoming[dateKey].push(task);
      }
    });

    // Sort upcoming dates
    const sortedUpcoming = Object.keys(groups.upcoming)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups.upcoming[key];
        return acc;
      }, {});

    groups.upcoming = sortedUpcoming;

    return groups;
  };

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    // View filters
    if (activeView === 'my-tasks' && user) {
      filtered = filtered.filter(task =>
        task.assignees?.some(a => a.userId === user.id) || task.createdBy === user.id
      );
    } else if (activeView === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    } else if (activeView === 'upcoming') {
      // Show all tasks with due dates (upcoming view is chronological)
      filtered = filtered.filter(task => task.dueDate);
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Hide completed by default
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'COMPLETED');
    }

    setFilteredTasks(filtered);
  }, [tasks, activeView, searchQuery, showCompleted, user]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadTasks();
    }
  }, [isLoaded, isSignedIn]);

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  if (!isLoaded || !isSignedIn) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200/60 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200/60">
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-dc-blue-500 rounded-xl hover:bg-dc-blue-600 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add task
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveView('inbox')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              activeView === 'inbox'
                ? 'bg-dc-blue-50 text-dc-blue-600 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span className="flex-1 text-left">Inbox</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeView === 'inbox' ? 'bg-dc-blue-100 text-dc-blue-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {tasks.filter(t => t.status !== 'COMPLETED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('today')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              activeView === 'today'
                ? 'bg-dc-blue-50 text-dc-blue-600 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="flex-1 text-left">Today</span>
          </button>

          <button
            onClick={() => setActiveView('upcoming')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              activeView === 'upcoming'
                ? 'bg-dc-blue-50 text-dc-blue-600 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="flex-1 text-left">Upcoming</span>
          </button>

          <button
            onClick={() => setActiveView('my-tasks')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              activeView === 'my-tasks'
                ? 'bg-dc-blue-50 text-dc-blue-600 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span className="flex-1 text-left">My Tasks</span>
          </button>
        </nav>

        {/* Search at bottom */}
        <div className="p-4 border-t border-gray-200/60">
          <button
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => {
                const searchInput = document.querySelector('input[type="text"][placeholder="Search"]');
                if (searchInput) searchInput.focus();
              }, 100);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200/60 px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            {activeView === 'inbox' && 'Inbox'}
            {activeView === 'today' && 'Today'}
            {activeView === 'upcoming' && 'Upcoming'}
            {activeView === 'my-tasks' && 'My Tasks'}
          </h1>

          {/* Search - hidden by default, shown when sidebar search is clicked */}
          {showSearch && (
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setShowSearch(false);
                }}
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-dc-blue-500 focus:border-dc-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl">
            {/* Quick Add */}
            <div className="mb-4">
              <QuickAddTask onTaskCreated={handleTaskCreated} apiCall={apiCall} />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">No tasks</p>
              </div>
            ) : (
              <>
                {/* Inbox and My Tasks: Simple list, no grouping */}
                {(activeView === 'inbox' || activeView === 'my-tasks') ? (
                  <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {filteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleCompleteTask}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetail(true);
                        }}
                        isCompleting={completingTaskId === task.id}
                      />
                    ))}
                  </div>
                ) : (
                  /* Today and Upcoming: Grouped by date */
                  (() => {
                    const grouped = groupTasksByDate(filteredTasks);
                    const hasOverdue = grouped.overdue.length > 0;
                    const hasToday = grouped.today.length > 0;
                    const hasTomorrow = grouped.tomorrow.length > 0;
                    const upcomingDates = Object.keys(grouped.upcoming);

                    return (
                      <div className="space-y-6">
                        {/* Overdue Section */}
                        {hasOverdue && (
                          <div>
                            <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3 px-2">
                              Overdue
                            </h3>
                            <div className="bg-white rounded-2xl border border-red-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                              {grouped.overdue.map((task) => (
                                <TaskItem
                                  key={task.id}
                                  task={task}
                                  onComplete={handleCompleteTask}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDetail(true);
                                  }}
                                  isCompleting={completingTaskId === task.id}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Today Section */}
                        {hasToday && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">
                              {getDateLabel(new Date())}
                            </h3>
                            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                              {grouped.today.map((task) => (
                                <TaskItem
                                  key={task.id}
                                  task={task}
                                  onComplete={handleCompleteTask}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDetail(true);
                                  }}
                                  isCompleting={completingTaskId === task.id}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tomorrow Section */}
                        {hasTomorrow && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">
                              Tomorrow
                            </h3>
                            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
                              {grouped.tomorrow.map((task) => (
                                <TaskItem
                                  key={task.id}
                                  task={task}
                                  onComplete={handleCompleteTask}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowTaskDetail(true);
                                  }}
                                  isCompleting={completingTaskId === task.id}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upcoming Dates */}
                        {upcomingDates.map((dateKey) => {
                          const dateTasks = grouped.upcoming[dateKey];
                          return (
                            <div key={dateKey}>
                              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2 px-1">
                                {getDateLabel(dateKey)}
                              </h3>
                              <div className="bg-white rounded-lg border border-gray-200">
                                {dateTasks.map((task) => (
                                  <TaskItem
                                    key={task.id}
                                    task={task}
                                    onComplete={handleCompleteTask}
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setShowTaskDetail(true);
                                    }}
                                    isCompleting={completingTaskId === task.id}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}

                {/* Show completed toggle */}
                {completedCount > 0 && (
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="mt-6 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showCompleted ? 'Hide' : 'Show'} {completedCount} completed
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Side Panel */}
      {showTaskDetail && selectedTask && (
        <TaskDetailSidePanel
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`${toast.error ? 'bg-red-600' : 'bg-gray-800'} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-4`}>
            <span className="text-sm font-medium">{toast.message}</span>
            {!toast.error && toast.originalTask && (
              <button onClick={handleUndoComplete} className="text-sm font-semibold text-blue-300 hover:text-blue-200">
                Undo
              </button>
            )}
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementTodoist;

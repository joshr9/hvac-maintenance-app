// components/tasks/TaskFilters.jsx - Task Filter Controls
import React from 'react';
import { Filter, X } from 'lucide-react';

const TaskFilters = ({ filters, setFilters, tasks }) => {
  // Get unique values for filter options
  const getUniqueAssignees = () => {
    const assignees = new Set();
    tasks.forEach(task => {
      if (task.assignees) {
        task.assignees.forEach(assignee => {
          assignees.add(assignee.userId);
        });
      }
    });
    return Array.from(assignees);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      assignee: 'all',
      search: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.assignee !== 'all';

  const uniqueAssignees = getUniqueAssignees();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignee
          </label>
          <select
            value={filters.assignee}
            onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {uniqueAssignees.map(assigneeId => (
              <option key={assigneeId} value={assigneeId}>
                User {assigneeId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Status: {filters.status}
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                className="hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Priority: {filters.priority}
              <button
                onClick={() => setFilters(prev => ({ ...prev, priority: 'all' }))}
                className="hover:text-green-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.assignee !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Assignee: {filters.assignee === 'unassigned' ? 'Unassigned' : `User ${filters.assignee}`}
              <button
                onClick={() => setFilters(prev => ({ ...prev, assignee: 'all' }))}
                className="hover:text-purple-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>
    </div>
  );
};

export default TaskFilters;
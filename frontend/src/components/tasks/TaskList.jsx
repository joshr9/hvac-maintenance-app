// components/tasks/TaskList.jsx - Task Display Component
import React from 'react';
import TaskCard from './TaskCard';
import { CheckSquare } from 'lucide-react';

const TaskList = ({ 
  tasks, 
  loading, 
  onTaskClick, 
  onTaskUpdate, 
  apiCall 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-600 mb-4">Create your first task to get started</p>
      </div>
    );
  }

  // Group tasks by status
  const groupedTasks = tasks.reduce((groups, task) => {
    const status = task.status || 'pending';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {});

  const statusOrder = ['pending', 'in-progress', 'completed'];
  const statusLabels = {
    'pending': 'To Do',
    'in-progress': 'In Progress', 
    'completed': 'Completed'
  };

  return (
    <div className="space-y-8">
      {statusOrder.map(status => {
        const statusTasks = groupedTasks[status] || [];
        if (statusTasks.length === 0) return null;

        return (
          <div key={status}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {statusLabels[status]}
              </h2>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {statusTasks.length}
              </span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statusTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onUpdate={onTaskUpdate}
                  apiCall={apiCall}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
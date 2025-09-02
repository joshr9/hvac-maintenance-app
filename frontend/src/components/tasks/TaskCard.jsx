// components/tasks/TaskCard.jsx - Individual Task Display
import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Building, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  CheckCircle,
  Circle,
  MoreHorizontal
} from 'lucide-react';

const TaskCard = ({ task, onClick, onUpdate, apiCall }) => {
  const [updating, setUpdating] = useState(false);

  // Priority colors
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  // Status colors
  const statusColors = {
    pending: 'text-gray-600',
    'in-progress': 'text-blue-600',
    completed: 'text-green-600'
  };

  // Quick status toggle
  const toggleStatus = async (e) => {
    e.stopPropagation();
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      setUpdating(true);
      const updatedTask = await apiCall(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      onUpdate(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Format due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-gray-600' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-gray-600' };
    }
  };

  const dueInfo = formatDueDate(task.dueDate);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
        isOverdue ? 'border-red-200' : 'border-gray-200 hover:border-blue-200'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={toggleStatus}
            disabled={updating}
            className={`flex-shrink-0 transition-colors ${
              task.status === 'completed' ? statusColors.completed : statusColors[task.status]
            }`}
          >
            {task.status === 'completed' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          
          <h3 className={`font-semibold text-gray-900 line-clamp-2 ${
            task.status === 'completed' ? 'line-through opacity-60' : ''
          }`}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            priorityColors[task.priority] || priorityColors.medium
          }`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress Bar */}
      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">
            Subtasks: {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} completed
          </div>
          <div className="space-y-1">
            {task.subtasks.slice(0, 3).map((subtask, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  subtask.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className={subtask.completed ? 'line-through opacity-60' : ''}>
                  {subtask.title}
                </span>
              </div>
            ))}
            {task.subtasks.length > 3 && (
              <div className="text-xs text-gray-500 ml-4">
                +{task.subtasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="space-y-2">
        {/* Due Date */}
        {dueInfo && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3" />
            <span className={dueInfo.color}>{dueInfo.text}</span>
            {isOverdue && <AlertCircle className="w-3 h-3 text-red-600" />}
          </div>
        )}

        {/* Estimated Time */}
        {task.estimatedTime && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedTime} minutes estimated</span>
          </div>
        )}

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <User className="w-3 h-3" />
            <span>
              {task.assignees.length === 1 
                ? 'Assigned to 1 person' 
                : `Assigned to ${task.assignees.length} people`
              }
            </span>
          </div>
        )}

        {/* Linked Job/Property */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {task.linkedToJob && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              <span>{task.linkedToJob.title}</span>
            </div>
          )}
          
          {task.linkedToProperty && (
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span>{task.linkedToProperty.name}</span>
            </div>
          )}
        </div>

        {/* Created from Message */}
        {task.createdFromMessage && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <MessageSquare className="w-3 h-3" />
            <span>Created from message</span>
          </div>
        )}

        {/* Comments Count */}
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MessageSquare className="w-3 h-3" />
            <span>{task.comments.length} comments</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
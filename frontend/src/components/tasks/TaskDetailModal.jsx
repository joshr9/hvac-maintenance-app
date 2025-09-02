// components/tasks/TaskDetailModal.jsx - Task View/Edit Interface
import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Building, 
  Briefcase, 
  Clock, 
  MessageSquare,
  CheckSquare,
  Square,
  AlertCircle,
  Save
} from 'lucide-react';

const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onTaskUpdated, 
  onTaskDeleted, 
  allProperties, 
  globalJobsData, 
  apiCall 
}) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [editData, setEditData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    progress: task?.progress || 0,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    estimatedTime: task?.estimatedTime || '',
    linkedToJobId: task?.linkedToJobId || '',
    linkedToPropertyId: task?.linkedToPropertyId || ''
  });

  if (!isOpen || !task) return null;

  // Handle save changes
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const updatedTask = await apiCall(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editData,
          dueDate: editData.dueDate || null,
          estimatedTime: editData.estimatedTime ? parseInt(editData.estimatedTime) : null,
          linkedToJobId: editData.linkedToJobId ? parseInt(editData.linkedToJobId) : null,
          linkedToPropertyId: editData.linkedToPropertyId ? parseInt(editData.linkedToPropertyId) : null
        })
      });

      onTaskUpdated(updatedTask);
      setEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      setLoading(true);
      await apiCall(`/tasks/${task.id}`, { method: 'DELETE' });
      onTaskDeleted(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Toggle subtask completion
  const toggleSubtask = async (subtaskId) => {
    try {
      // This would need to be implemented in your backend
      console.log('Toggle subtask:', subtaskId);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  // Update progress
  const updateProgress = async (newProgress) => {
    try {
      const updatedTask = await apiCall(`/tasks/${task.id}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ 
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'in-progress'
        })
      });
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="text-xl font-semibold text-gray-900 w-full border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900 truncate">{task.title}</h2>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Task"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error Display */}
          {error && (
            <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center gap-4">
              <div>
                {editing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[task.status] || statusColors.pending
                  }`}>
                    {task.status?.replace('-', ' ') || 'Pending'}
                  </span>
                )}
              </div>
              
              <div>
                {editing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    priorityColors[task.priority] || priorityColors.medium
                  }`}>
                    {task.priority} priority
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              {editing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Task description..."
                />
              ) : (
                <p className="text-gray-600">
                  {task.description || 'No description provided.'}
                </p>
              )}
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                <span className="text-sm text-gray-600">{task.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
              {!editing && (
                <div className="flex gap-2">
                  {[0, 25, 50, 75, 100].map(value => (
                    <button
                      key={value}
                      onClick={() => updateProgress(value)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </h4>
                {editing ? (
                  <input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>

              {/* Estimated Time */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Time
                </h4>
                {editing ? (
                  <input
                    type="number"
                    value={editData.estimatedTime}
                    onChange={(e) => setEditData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="Minutes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">
                    {task.estimatedTime ? `${task.estimatedTime} minutes` : 'Not estimated'}
                  </p>
                )}
              </div>
            </div>

            {/* Linked Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Linked Job */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Linked Job
                </h4>
                {editing ? (
                  <select
                    value={editData.linkedToJobId}
                    onChange={(e) => setEditData(prev => ({ ...prev, linkedToJobId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {(globalJobsData.jobs || []).map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-600">
                    {task.linkedToJob ? task.linkedToJob.title : 'None'}
                  </p>
                )}
              </div>

              {/* Linked Property */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Linked Property
                </h4>
                {editing ? (
                  <select
                    value={editData.linkedToPropertyId}
                    onChange={(e) => setEditData(prev => ({ ...prev, linkedToPropertyId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {allProperties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-600">
                    {task.linkedToProperty ? task.linkedToProperty.name : 'None'}
                  </p>
                )}
              </div>
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Subtasks</h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <button
                        onClick={() => toggleSubtask(subtask.id)}
                        className={`transition-colors ${
                          subtask.completed ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {subtask.completed ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`flex-1 ${
                        subtask.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created from Message */}
            {task.createdFromMessage && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Created from Message
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    {task.createdFromMessage.content}
                  </p>
                </div>
              </div>
            )}

            {/* Comments */}
            {task.comments && task.comments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Comments</h3>
                <div className="space-y-3">
                  {task.comments.slice(0, 3).map((comment, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <p className="text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {editing && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
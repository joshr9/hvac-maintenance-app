// TaskDetailSidePanel.jsx - Todoist-style task detail panel with direct editing
import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/clerk-react';
import {
  X,
  Trash2,
  Calendar,
  Flag,
  User as UserIcon,
  Building2,
  Briefcase,
  Tag,
  ChevronDown,
  Check
} from 'lucide-react';

const TaskDetailSidePanel = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  allProperties = [],
  globalJobsData = {},
  apiCall
}) => {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgMembers, setOrgMembers] = useState([]);

  // Local state for each field - updates immediately and saves on blur
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [assignedUsers, setAssignedUsers] = useState(task?.assignees?.map(a => a.userId) || []);
  const [linkedPropertyId, setLinkedPropertyId] = useState(task?.linkedToPropertyId || null);
  const [linkedJobId, setLinkedJobId] = useState(task?.linkedToJobId || null);
  const [labels, setLabels] = useState(task?.labels || []);

  // Dropdowns
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [showJobPicker, setShowJobPicker] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowDatePicker(false);
    setShowPriorityPicker(false);
    setShowUserPicker(false);
    setShowPropertyPicker(false);
    setShowJobPicker(false);
  };

  // Load organization members
  useEffect(() => {
    if (organization) {
      organization.getMemberships()
        .then(members => {
          setOrgMembers(members.data.map(m => ({
            id: m.publicUserData.userId,
            name: `${m.publicUserData.firstName || ''} ${m.publicUserData.lastName || ''}`.trim() || m.publicUserData.identifier,
            email: m.publicUserData.identifier
          })));
        })
        .catch(err => console.error('Error loading members:', err));
    }
  }, [organization]);

  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setPriority(task.priority || 'MEDIUM');
      setAssignedUsers(task.assignees?.map(a => a.userId) || []);
      setLinkedPropertyId(task.linkedToPropertyId || null);
      setLinkedJobId(task.linkedToJobId || null);
      setLabels(task.labels || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  // Update task field
  const updateField = async (field, value) => {
    try {
      setSaving(true);
      setError('');

      const updateData = {};

      // Handle special cases for data formatting
      if (field === 'dueDate') {
        updateData.dueDate = value ? new Date(value).toISOString() : null;
      } else if (field === 'linkedToPropertyId' || field === 'linkedToJobId') {
        updateData[field] = value ? parseInt(value) : null;
      } else {
        updateData[field] = value;
      }

      const updatedTask = await apiCall(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      onTaskUpdated(updatedTask);

      // Show success indicator briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setError(`Failed to update ${field}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Update assignees
  const updateAssignees = async (userIds) => {
    try {
      setSaving(true);
      setError('');

      // Delete existing assignees
      await apiCall(`/tasks/${task.id}/assignees`, {
        method: 'DELETE'
      });

      // Add new assignees
      for (const userId of userIds) {
        await apiCall(`/tasks/${task.id}/assignees`, {
          method: 'POST',
          body: JSON.stringify({ userId })
        });
      }

      // Reload task
      const updatedTask = await apiCall(`/tasks/${task.id}`);
      onTaskUpdated(updatedTask);

      // Show success indicator
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (error) {
      console.error('Error updating assignees:', error);
      setError('Failed to update assignees');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;

    try {
      setLoading(true);
      await apiCall(`/tasks/${task.id}`, { method: 'DELETE' });
      onTaskDeleted(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 'URGENT', label: 'Priority 1', color: 'text-red-600', flag: 'text-red-500' },
    { value: 'HIGH', label: 'Priority 2', color: 'text-orange-600', flag: 'text-orange-500' },
    { value: 'MEDIUM', label: 'Priority 3', color: 'text-blue-600', flag: 'text-blue-500' },
    { value: 'LOW', label: 'Priority 4', color: 'text-gray-600', flag: 'text-gray-400' }
  ];

  const quickDates = [
    { label: 'Today', value: new Date().toISOString().split('T')[0] },
    { label: 'Tomorrow', value: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })() },
    { label: 'This weekend', value: (() => {
      const d = new Date();
      const day = d.getDay();
      const daysUntilSaturday = day === 0 ? 6 : 6 - day;
      d.setDate(d.getDate() + daysUntilSaturday);
      return d.toISOString().split('T')[0];
    })() },
    { label: 'Next week', value: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })() }
  ];

  const currentPriority = priorities.find(p => p.value === priority) || priorities[2];
  const selectedProperty = allProperties.find(p => p.id === linkedPropertyId);
  const selectedJob = globalJobsData.jobs?.find(j => j.id === linkedJobId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end z-50" onClick={onClose}>
      <div
        className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            {/* Save indicator */}
            {saving && (
              <span className="text-xs text-gray-500">Saving...</span>
            )}
            {saveSuccess && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Title - Direct edit */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title !== task.title) {
                  updateField('title', title);
                }
              }}
              className="text-2xl font-semibold text-gray-900 w-full border-none outline-none focus:ring-0 px-0"
              placeholder="Task name"
            />
          </div>

          {/* Description - Direct edit */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== task.description) {
                  updateField('description', description);
                }
              }}
              rows={3}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description"
            />
          </div>

          <div className="space-y-3">
            {/* Due Date */}
            <div className="relative">
              <button
                onClick={() => {
                  if (showDatePicker) {
                    setShowDatePicker(false);
                  } else {
                    closeAllDropdowns();
                    setShowDatePicker(true);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="flex-1 text-gray-900">
                  {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) : 'Due date'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
              </button>

              {showDatePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 w-64">
                  <div className="space-y-2">
                    {quickDates.map(({ label, value }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setDueDate(value);
                          updateField('dueDate', value);
                          setShowDatePicker(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        {label}
                      </button>
                    ))}
                    <div className="border-t pt-2">
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => {
                          setDueDate(e.target.value);
                          updateField('dueDate', e.target.value);
                          setShowDatePicker(false);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    {dueDate && (
                      <button
                        onClick={() => {
                          setDueDate('');
                          updateField('dueDate', null);
                          setShowDatePicker(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Remove date
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <button
                onClick={() => {
                  if (showPriorityPicker) {
                    setShowPriorityPicker(false);
                  } else {
                    closeAllDropdowns();
                    setShowPriorityPicker(true);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Flag className={`w-4 h-4 ${currentPriority.flag}`} />
                <span className={`flex-1 ${currentPriority.color}`}>
                  {currentPriority.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPriorityPicker ? 'rotate-180' : ''}`} />
              </button>

              {showPriorityPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPriority(p.value);
                        updateField('priority', p.value);
                        setShowPriorityPicker(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-100 rounded"
                    >
                      <Flag className={`w-4 h-4 ${p.flag}`} />
                      <span className={p.color}>{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignees */}
            <div className="relative">
              <button
                onClick={() => {
                  if (showUserPicker) {
                    setShowUserPicker(false);
                  } else {
                    closeAllDropdowns();
                    setShowUserPicker(true);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span className="flex-1 text-gray-900">
                  {assignedUsers.length > 0
                    ? `${assignedUsers.length} assignee${assignedUsers.length > 1 ? 's' : ''}`
                    : 'Assign to'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserPicker ? 'rotate-180' : ''}`} />
              </button>

              {showUserPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64 max-h-64 overflow-y-auto">
                  {orgMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assignedUsers.includes(member.id)}
                        onChange={(e) => {
                          const newAssignees = e.target.checked
                            ? [...assignedUsers, member.id]
                            : assignedUsers.filter(id => id !== member.id);
                          setAssignedUsers(newAssignees);
                          updateAssignees(newAssignees);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1">{member.name}</span>
                    </label>
                  ))}
                  {orgMembers.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-500">No members found</p>
                  )}
                </div>
              )}
            </div>

            {/* Linked Property */}
            <div className="relative">
              <button
                onClick={() => {
                  if (showPropertyPicker) {
                    setShowPropertyPicker(false);
                  } else {
                    closeAllDropdowns();
                    setShowPropertyPicker(true);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Building2 className="w-4 h-4 text-gray-600" />
                <span className="flex-1 text-gray-900">
                  {selectedProperty ? selectedProperty.name : 'Link property'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPropertyPicker ? 'rotate-180' : ''}`} />
              </button>

              {showPropertyPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setLinkedPropertyId(null);
                      updateField('linkedToPropertyId', null);
                      setShowPropertyPicker(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-gray-500"
                  >
                    None
                  </button>
                  {allProperties.map((property) => (
                    <button
                      key={property.id}
                      onClick={() => {
                        setLinkedPropertyId(property.id);
                        updateField('linkedToPropertyId', property.id);
                        setShowPropertyPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {property.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Job */}
            <div className="relative">
              <button
                onClick={() => {
                  if (showJobPicker) {
                    setShowJobPicker(false);
                  } else {
                    closeAllDropdowns();
                    setShowJobPicker(true);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Briefcase className="w-4 h-4 text-gray-600" />
                <span className="flex-1 text-gray-900">
                  {selectedJob ? selectedJob.title : 'Link job'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showJobPicker ? 'rotate-180' : ''}`} />
              </button>

              {showJobPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-64 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setLinkedJobId(null);
                      updateField('linkedToJobId', null);
                      setShowJobPicker(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-gray-500"
                  >
                    None
                  </button>
                  {(globalJobsData.jobs || []).map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setLinkedJobId(job.id);
                        updateField('linkedToJobId', job.id);
                        setShowJobPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {job.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Labels */}
          {labels && labels.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Labels</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created {new Date(task.createdAt).toLocaleDateString()}</div>
              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <div>Updated {new Date(task.updatedAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailSidePanel;

// QuickAddTaskTodoist.jsx - Todoist-style inline task creation with dropdowns
import { useState, useRef, useEffect } from 'react';
import { Calendar, Flag, User, X } from 'lucide-react';
import { useUser, useOrganization } from '@clerk/clerk-react';

const QuickAddTaskTodoist = ({ onTaskCreated, apiCall }) => {
  const { user } = useUser();
  const { organization } = useOrganization();

  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Options
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedUsers, setAssignedUsers] = useState([]);

  // Dropdowns
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);

  // Get organization members (Clerk users)
  const [orgMembers, setOrgMembers] = useState([]);

  useEffect(() => {
    if (organization) {
      organization.getMemberships().then(members => {
        setOrgMembers(members.data.map(m => ({
          id: m.publicUserData.userId,
          name: m.publicUserData.firstName + ' ' + m.publicUserData.lastName,
          email: m.publicUserData.identifier
        })));
      }).catch(err => console.error('Error loading members:', err));
    }
  }, [organization]);

  const handleSubmit = async (e) => {
    console.log('🚀 QuickAddTaskTodoist handleSubmit called!', { title, loading });
    e.preventDefault();
    if (!title.trim()) {
      console.log('❌ No title, returning');
      return;
    }

    try {
      setLoading(true);
      console.log('📦 Task data:', { title, priority, dueDate, assignedUsers });
      const taskData = {
        title: title.trim(),
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
        assignedTo: assignedUsers.map(u => u.id),
        status: 'PENDING'
      };

      console.log('📞 Calling apiCall with:', taskData);
      const newTask = await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });

      console.log('✅ Task created:', newTask);
      onTaskCreated(newTask);

      // Reset
      setTitle('');
      setDueDate(null);
      setPriority('MEDIUM');
      setAssignedUsers([]);
      setShowOptions(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickDates = [
    { label: 'Today', value: new Date() },
    {
      label: 'Tomorrow',
      value: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
      })()
    },
    {
      label: 'This weekend',
      value: (() => {
        const d = new Date();
        const day = d.getDay();
        const daysUntilSaturday = (6 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + daysUntilSaturday);
        return d;
      })()
    },
    {
      label: 'Next week',
      value: (() => {
        const d = new Date();
        const daysUntilMonday = (8 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + daysUntilMonday);
        return d;
      })()
    }
  ];

  const priorities = [
    { value: 'URGENT', label: 'Priority 1', color: 'text-red-600', flag: 'text-red-500' },
    { value: 'HIGH', label: 'Priority 2', color: 'text-orange-600', flag: 'text-orange-500' },
    { value: 'MEDIUM', label: 'Priority 3', color: 'text-blue-600', flag: 'text-blue-500' },
    { value: 'LOW', label: 'Priority 4', color: 'text-gray-600', flag: 'text-gray-400' }
  ];

  const formatDate = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (dateToCheck.getTime() === today.getTime()) return 'Today';

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateToCheck.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border-b border-gray-200 pb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-400 hover:border-red-500 transition-colors"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setShowOptions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Add task"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0 py-1"
            disabled={loading}
          />
        </div>

        {showOptions && (
          <div className="flex items-center justify-between mt-2 ml-7">
            <div className="flex items-center gap-1">
              {/* Due Date */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowPriorityPicker(false);
                    setShowUserPicker(false);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors ${
                    dueDate ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {dueDate ? formatDate(dueDate) : 'Due date'}
                  {dueDate && <X className="w-3 h-3 ml-0.5" onClick={(e) => { e.stopPropagation(); setDueDate(null); }} />}
                </button>

                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-56 p-2">
                    {quickDates.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDueDate(item.value);
                          setShowDatePicker(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <span className="text-xs text-gray-500">
                          {item.value.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDueDate(null)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors mt-1 border-t border-gray-100"
                    >
                      No date
                    </button>
                  </div>
                )}
              </div>

              {/* Priority */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriorityPicker(!showPriorityPicker);
                    setShowDatePicker(false);
                    setShowUserPicker(false);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 rounded hover:bg-gray-100 transition-colors"
                >
                  <Flag className={`w-3.5 h-3.5 ${priorities.find(p => p.value === priority)?.flag || 'text-gray-400'}`} />
                  Priority
                </button>

                {showPriorityPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48 p-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setPriority(p.value);
                          setShowPriorityPicker(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                      >
                        <Flag className={`w-4 h-4 ${p.flag}`} />
                        <span className={priority === p.value ? 'font-medium' : ''}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign User */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserPicker(!showUserPicker);
                    setShowDatePicker(false);
                    setShowPriorityPicker(false);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors ${
                    assignedUsers.length > 0 ? 'text-purple-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {assignedUsers.length > 0 ? `${assignedUsers.length} assigned` : 'Assign'}
                </button>

                {showUserPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 p-2 max-h-64 overflow-y-auto">
                    {orgMembers.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-gray-500">No team members found</p>
                    ) : (
                      orgMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            if (assignedUsers.find(u => u.id === member.id)) {
                              setAssignedUsers(assignedUsers.filter(u => u.id !== member.id));
                            } else {
                              setAssignedUsers([...assignedUsers, member]);
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                          {assignedUsers.find(u => u.id === member.id) && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDueDate(null);
                  setPriority('MEDIUM');
                  setAssignedUsers([]);
                  setShowOptions(false);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || loading}
                className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Adding...' : 'Add task'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Click outside to close dropdowns */}
      {(showDatePicker || showPriorityPicker || showUserPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDatePicker(false);
            setShowPriorityPicker(false);
            setShowUserPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default QuickAddTaskTodoist;

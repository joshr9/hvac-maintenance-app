// QuickAddTask.jsx - Todoist-style inline task creation
import { useState } from 'react';
import { Plus, Calendar, Flag } from 'lucide-react';

const QuickAddTask = ({ onTaskCreated, apiCall }) => {
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 FORM SUBMITTED, title:', title);
    if (!title.trim()) {
      console.log('❌ Empty title, returning');
      return;
    }

    try {
      setLoading(true);
      console.log('📞 Calling apiCall...');
      const newTask = await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          priority: 'MEDIUM',
          status: 'PENDING'
        })
      });

      console.log('✅ Task created:', newTask);
      onTaskCreated(newTask);
      setTitle('');
      setShowOptions(false);
    } catch (error) {
      console.error('❌ Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-400 hover:border-red-500 transition-colors"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setShowOptions(true)}
            placeholder="Add task"
            className="flex-1 text-base text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0 py-2"
            disabled={loading}
          />
        </div>

        {showOptions && (
          <div className="flex items-center justify-between mt-3 ml-7">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <Calendar className="w-3 h-3" />
                Due date
              </button>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <Flag className="w-3 h-3" />
                Priority
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setShowOptions(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || loading}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding...' : 'Add task'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuickAddTask;

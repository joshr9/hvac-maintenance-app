// TaskItem.jsx - Single task item (Todoist style)
import { Calendar, Building, Briefcase, User, CheckCircle } from 'lucide-react';

const TaskItem = ({ task, onComplete, onClick, isCompleting }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'border-red-500 hover:bg-red-50';
      case 'MEDIUM':
        return 'border-yellow-500 hover:bg-yellow-50';
      default:
        return 'border-gray-400 hover:bg-gray-50';
    }
  };

  return (
    <div
      className="group flex items-start gap-3 py-2 px-3 rounded hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Circle checkbox */}
      <button
        onClick={(e) => onComplete(task, e)}
        disabled={isCompleting}
        className="flex-shrink-0 mt-0.5"
      >
        {task.status === 'COMPLETED' ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              isCompleting ? 'border-gray-300 animate-pulse' : getPriorityColor(task.priority)
            }`}
          />
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'
          }`}
        >
          {task.title}
        </p>

        {/* Metadata */}
        {(task.dueDate || task.assignees?.length > 0 || task.linkedToProperty || task.linkedToJob) && (
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            )}
            {task.assignees && task.assignees.length > 0 && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assignees.length}
              </span>
            )}
            {task.linkedToProperty && (
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                {task.linkedToProperty.name}
              </span>
            )}
            {task.linkedToJob && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {task.linkedToJob.jobNumber}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;

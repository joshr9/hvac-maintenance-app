// components/calendar/ScheduleTypeModal.jsx - Modern styled version
import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  Calendar, 
  ChevronRight, 
  MapPin, 
  Eye,
  Clock,
  Sparkles
} from 'lucide-react';
import ScheduleModal from './ScheduleModal';

const ScheduleTypeModal = ({ 
  isOpen, 
  onClose, 
  onScheduleComplete,
  allProperties = [],
  initialDate = null,
  initialTime = null,
  initialTeamMember = null,
  onTypeSelect = null,
  suggestedAssignment = null // New prop for smart suggestions
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const scheduleOptions = [
    {
      type: 'job',
      icon: Briefcase,
      title: 'New Job',
      description: 'Create a job and its first visit',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-50'
    },
    {
      type: 'request',
      icon: FileText,
      title: 'New Request',
      description: 'Create a request with on-site assessment',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-50'
    },
    {
      type: 'task',
      icon: CheckSquare,
      title: 'New Task',
      description: 'Create work that will not be invoiced',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-50'
    },
    {
      type: 'event',
      icon: Calendar,
      title: 'New Calendar Event',
      description: 'Create an event everyone can see',
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      hoverBg: 'hover:bg-yellow-50'
    }
  ];

  const viewOptions = [
    {
      type: 'day-view',
      icon: Eye,
      title: 'Show on Day View',
      description: 'Switch to day view for this date',
      color: 'from-gray-500 to-gray-600',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      hoverBg: 'hover:bg-gray-50'
    },
    {
      type: 'map-view',
      icon: MapPin,
      title: 'Show on Map View',
      description: 'View location on map',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-50'
    }
  ];

  const handleTypeSelect = (type) => {
    if (onTypeSelect) {
      onTypeSelect(type);
      return;
    }
    
    setSelectedType(type);
    setShowScheduleModal(true);
    onClose();
  };

  const handleScheduleComplete = () => {
    setShowScheduleModal(false);
    setSelectedType(null);
    onScheduleComplete();
  };

  const handleScheduleModalClose = () => {
    setShowScheduleModal(false);
    setSelectedType(null);
  };

  const formatDateTime = () => {
    if (!initialDate) return 'Select time slot';
    
    const date = new Date(initialDate);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const timeStr = initialTime ? 
      ` at ${new Date(`2000-01-01T${initialTime}`).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}` : '';
    
    return `${dateStr}${timeStr}`;
  };

  if (!isOpen && !showScheduleModal) return null;

  // Show schedule modal if a type is selected
  if (showScheduleModal && selectedType) {
    return (
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={handleScheduleModalClose}
        onScheduleComplete={handleScheduleComplete}
        allProperties={allProperties}
        initialDate={initialDate}
        initialTime={initialTime}
        initialTeamMember={initialTeamMember}
        scheduleType={selectedType}
        suggestedAssignment={suggestedAssignment}
      />
    );
  }

  // Show type selection modal
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">
                  {initialDate ? 'Schedule for' : 'What would you like to create?'}
                </h4>
                <p className="text-gray-600 mt-1">
                  {formatDateTime()}
                </p>
                {/* Smart suggestion indicator */}
                {suggestedAssignment && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Smart suggestion: {suggestedAssignment.technician}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Schedule Options */}
            <div className="mb-8">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Create New Work
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.type}
                      onClick={() => handleTypeSelect(option.type)}
                      className={`
                        group relative p-6 rounded-xl border-2 ${option.borderColor} ${option.hoverBg}
                        hover:shadow-lg hover:shadow-${option.color.split('-')[1]}-500/25 
                        transition-all duration-200 text-left
                        hover:scale-[1.02] hover:-translate-y-1
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${option.iconBg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${option.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-800">
                            {option.title}
                          </h6>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700">
                            {option.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      {/* Gradient border on hover */}
                      <div className={`
                        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity
                        bg-gradient-to-r ${option.color} p-0.5 -z-10
                      `}>
                        <div className="w-full h-full bg-white rounded-lg"></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View Options */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                View Options
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.type}
                      onClick={() => handleTypeSelect(option.type)}
                      className={`
                        group relative p-6 rounded-xl border-2 ${option.borderColor} ${option.hoverBg}
                        hover:shadow-lg transition-all duration-200 text-left
                        hover:scale-[1.02] hover:-translate-y-1
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${option.iconBg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${option.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-900 mb-1">
                            {option.title}
                          </h6>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Selected time will be pre-filled in the next step</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ScheduleTypeModal;
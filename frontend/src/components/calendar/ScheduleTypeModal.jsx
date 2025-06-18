// components/calendar/ScheduleTypeModal.jsx
import React, { useState } from 'react';
import { X, Briefcase, FileText, CheckSquare, Calendar, ChevronRight } from 'lucide-react';
import ScheduleModal from './ScheduleModal';

const ScheduleTypeModal = ({ 
  isOpen, 
  onClose, 
  onScheduleComplete,
  allProperties = [],
  initialDate = null,
  initialTime = null,
  initialTeamMember = null
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const scheduleOptions = [
    {
      type: 'job',
      icon: Briefcase,
      title: 'New Job',
      description: 'Create a job and its first visit',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      type: 'request',
      icon: FileText,
      title: 'New Request',
      description: 'Create a request with on-site assessment',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      type: 'task',
      icon: CheckSquare,
      title: 'New Task',
      description: 'Create work that will not be invoiced',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      type: 'event',
      icon: Calendar,
      title: 'New Event',
      description: 'Create an event everyone can see',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowScheduleModal(true);
    onClose(); // Close the type selection modal
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
      />
    );
  }

  // Show type selection modal
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Find a Time</h4>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {scheduleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => handleTypeSelect(option.type)}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200 text-left group hover:shadow-md
                    ${option.borderColor} ${option.bgColor} hover:scale-[1.02]
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-white ${option.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Info */}
          {(initialDate || initialTime || initialTeamMember) && (
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Pre-filled Information:</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  {initialDate && (
                    <div>• Date: {new Date(initialDate).toLocaleDateString()}</div>
                  )}
                  {initialTime && (
                    <div>• Time: {initialTime}</div>
                  )}
                  {initialTeamMember && (
                    <div>• Assigned to: {initialTeamMember}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ScheduleTypeModal;
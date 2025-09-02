// components/timer/EditTimeEntryModal.jsx
import React, { useState, useEffect } from 'react';
import { Save, Clock, AlertTriangle } from 'lucide-react';
import { updateTimeEntry } from '../../hooks/timerAPI';

// Common components
import { ModalHeader, ModalFooter, FormField, ErrorAlert } from '../common/FormComponents';

const EditTimeEntryModal = ({ entry, onSave, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });
  const [calculatedDuration, setCalculatedDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        startTime: formatDateTimeLocal(entry.startTime),
        endTime: entry.endTime ? formatDateTimeLocal(entry.endTime) : '',
        notes: entry.notes || ''
      });
    }
  }, [entry]);

  // Calculate duration whenever start/end times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMs = end - start;
      const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      setCalculatedDuration(diffMinutes);
    } else {
      setCalculatedDuration(0);
    }
  }, [formData.startTime, formData.endTime]);

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDuration = (minutes) => {
    if (minutes === 0) return '0 minutes';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes} minutes`;
  };

  const validateForm = () => {
    if (!formData.startTime) {
      setError('Start time is required');
      return false;
    }
    
    if (!formData.endTime) {
      setError('End time is required');
      return false;
    }
    
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    setError(null);
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const updatedEntry = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
        totalMinutes: calculatedDuration
      };
      
      await updateTimeEntry(entry.id, updatedEntry);
      onSave({ ...entry, ...updatedEntry });
      onClose();
    } catch (error) {
      setError('Failed to update time entry');
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <ModalHeader 
          title={`Edit Time Entry - Job #${entry.jobId}`}
          icon={Clock}
          onClose={onClose}
        />

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Display */}
          <ErrorAlert message={error} />

          {/* Start Time */}
          <FormField label="Start Time">
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>

          {/* End Time */}
          <FormField label="End Time">
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </FormField>

          {/* Duration Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Total Duration: {formatDuration(calculatedDuration)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="What work was completed?"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </FormField>
        </div>

        {/* Footer */}
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSave}
          submitText="Save Changes"
          submitIcon={Save}
          isSubmitting={isSaving || calculatedDuration === 0}
        />
      </div>
    </div>
  );
};

export default EditTimeEntryModal;
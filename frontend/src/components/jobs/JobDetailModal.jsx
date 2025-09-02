// components/jobs/JobDetailModal.jsx - Enhanced for Recurring Jobs
import React, { useState, useEffect } from 'react';
import { 
  X, Building, MapPin, Calendar, Clock, Users, Wrench, Package, 
  Briefcase, Repeat, AlertTriangle, Route, ArrowRight, ChevronRight,
  Edit, Copy, Trash2, Play, CheckCircle, XCircle
} from 'lucide-react';

const JobDetailModal = ({ job, onClose, onEdit, onDelete, onStatusUpdate }) => {
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job && job.isRecurring) {
      loadRecurringJobDetails();
    }
  }, [job]);

  const loadRecurringJobDetails = async () => {
    if (!job.recurringTemplateId) return;
    
    setLoading(true);
    try {
      // Load template details
      if (job.recurringTemplateId) {
        const templateResponse = await fetch(`/api/recurring-job-templates/${job.recurringTemplateId}`);
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          setTemplate(templateData);
        }
      }

      // Load related jobs from same template
      const relatedResponse = await fetch(`/api/jobs?recurringTemplateId=${job.recurringTemplateId}&propertyId=${job.propertyId}`);
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        setRelatedJobs(relatedData.jobs?.filter(j => j.id !== job.id) || []);
      }
    } catch (error) {
      console.error('Error loading recurring job details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DISPATCHED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'INVOICED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getWorkTypeIcon = (workType) => {
    if (workType?.toLowerCase().includes('hvac')) return Wrench;
    if (workType?.toLowerCase().includes('snow')) return Package;
    if (workType?.toLowerCase().includes('clean')) return Package;
    return Briefcase;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFrequencyDisplay = (frequency) => {
    switch (frequency) {
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      case 'BIWEEKLY': return 'Bi-weekly';
      case 'MONTHLY': return 'Monthly';
      case 'QUARTERLY': return 'Quarterly';
      default: return frequency;
    }
  };

  const getDayOfWeekDisplay = (dayOfWeek) => {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek] || '';
  };

  if (!job) return null;

  const WorkTypeIcon = getWorkTypeIcon(job.workType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <WorkTypeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">#{job.jobNumber}</span>
                {job.isRecurring && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <Repeat className="w-3 h-3" />
                    Recurring
                  </span>
                )}
                {job.rescheduleCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Rescheduled {job.rescheduleCount}x
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <button
              onClick={() => onEdit?.(job)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Edit Job"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
              {job.status}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(job.priority)}`}>
              {job.priority} Priority
            </div>
            <div className="text-sm text-gray-500">
              Created {formatDate(job.createdAt)}
            </div>
          </div>

          {/* Recurring Job Information */}
          {job.isRecurring && template && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Repeat className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Recurring Job Template</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-800">Template:</span>
                  <span className="ml-2 text-green-700">{template.name}</span>
                </div>
                <div>
                  <span className="font-medium text-green-800">Frequency:</span>
                  <span className="ml-2 text-green-700">
                    {getFrequencyDisplay(template.frequency)}
                    {template.dayOfWeek && ` (${getDayOfWeekDisplay(template.dayOfWeek)})`}
                    {template.dayOfMonth && ` (${template.dayOfMonth}${template.dayOfMonth === 1 ? 'st' : template.dayOfMonth === 2 ? 'nd' : template.dayOfMonth === 3 ? 'rd' : 'th'} of month)`}
                  </span>
                </div>
                {template.timeOfDay && (
                  <div>
                    <span className="font-medium text-green-800">Preferred Time:</span>
                    <span className="ml-2 text-green-700">{formatTime(template.timeOfDay)}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-green-800">Last Generated:</span>
                  <span className="ml-2 text-green-700">
                    {template.lastGenerated ? formatDate(template.lastGenerated) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rescheduling Information */}
          {job.rescheduleCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Rescheduling History</h3>
              </div>
              <div className="text-sm space-y-1">
                {job.originalScheduledDate && (
                  <div>
                    <span className="font-medium text-yellow-800">Original Date:</span>
                    <span className="ml-2 text-yellow-700">{formatDate(job.originalScheduledDate)}</span>
                  </div>
                )}
                {job.rescheduleReason && (
                  <div>
                    <span className="font-medium text-yellow-800">Reason:</span>
                    <span className="ml-2 text-yellow-700">{job.rescheduleReason}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-yellow-800">Times Rescheduled:</span>
                  <span className="ml-2 text-yellow-700">{job.rescheduleCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Location and Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{job.property?.name}</div>
                    <div className="text-gray-600">{job.property?.address}</div>
                  </div>
                </div>
                {job.zone && (
                  <div className="flex items-center gap-3">
                    <Route className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Zone: {job.zone.name}</div>
                      <div className="text-gray-600">{job.zone.description}</div>
                    </div>
                  </div>
                )}
                {job.suite && (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4" />
                    <div>
                      <div className="font-medium text-gray-900">Suite: {job.suite.name}</div>
                    </div>
                  </div>
                )}
                {job.hvacUnit && (
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">HVAC Unit: {job.hvacUnit.label || job.hvacUnit.serialNumber}</div>
                      <div className="text-gray-600">{job.hvacUnit.model}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduling
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Scheduled Date</div>
                    <div className="text-gray-600">{formatDate(job.scheduledDate)}</div>
                  </div>
                </div>
                {job.scheduledTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Scheduled Time</div>
                      <div className="text-gray-600">{formatTime(job.scheduledTime)}</div>
                    </div>
                  </div>
                )}
                {job.estimatedDuration && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Duration</div>
                      <div className="text-gray-600">{job.estimatedDuration} minutes</div>
                    </div>
                  </div>
                )}
                {job.assignedTechnician && (
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Assigned Technician</div>
                      <div className="text-gray-600">{job.assignedTechnician}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{job.description}</p>
            </div>
          )}

          {/* Notes */}
          {(job.customerNotes || job.internalNotes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {job.customerNotes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Notes</h4>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg text-sm">{job.customerNotes}</p>
                </div>
              )}
              {job.internalNotes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Internal Notes</h4>
                  <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg text-sm">{job.internalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Financial Information */}
          {(job.totalPrice || job.totalCost || job.estimatedCost) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {job.estimatedCost && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-900">Estimated Cost</div>
                    <div className="text-xl font-semibold text-gray-700">{formatCurrency(job.estimatedCost)}</div>
                  </div>
                )}
                {job.totalPrice && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-900">Total Price</div>
                    <div className="text-xl font-semibold text-green-700">{formatCurrency(job.totalPrice)}</div>
                  </div>
                )}
                {job.totalCost && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-900">Total Cost</div>
                    <div className="text-xl font-semibold text-blue-700">{formatCurrency(job.totalCost)}</div>
                  </div>
                )}
                {job.totalPrice && job.totalCost && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-medium text-purple-900">Profit Margin</div>
                    <div className="text-xl font-semibold text-purple-700">
                      {((job.totalPrice - job.totalCost) / job.totalPrice * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Recurring Jobs */}
          {job.isRecurring && relatedJobs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Related Recurring Jobs
              </h3>
              <div className="space-y-2">
                {relatedJobs.slice(0, 5).map((relatedJob) => (
                  <div key={relatedJob.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        relatedJob.status === 'COMPLETED' ? 'bg-green-500' :
                        relatedJob.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        relatedJob.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{relatedJob.title}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(relatedJob.scheduledDate)} • {relatedJob.status}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
                {relatedJobs.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">
                      And {relatedJobs.length - 5} more related jobs...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(job.createdAt)}
              </div>
              {job.startedAt && (
                <div>
                  <span className="font-medium">Started:</span> {formatDate(job.startedAt)}
                </div>
              )}
              {job.completedAt && (
                <div>
                  <span className="font-medium">Completed:</span> {formatDate(job.completedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {job.status === 'SCHEDULED' && (
              <button
                onClick={() => onStatusUpdate?.(job.id, 'IN_PROGRESS')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Start Job
              </button>
            )}
            {job.status === 'IN_PROGRESS' && (
              <button
                onClick={() => onStatusUpdate?.(job.id, 'COMPLETED')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Job
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(job)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete?.(job)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
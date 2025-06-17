// components/jobs/JobDetailModal.jsx
import React from 'react';
import { X, Building, MapPin, Calendar, Clock, Users, Wrench, Package, Briefcase } from 'lucide-react';

const JobDetailModal = ({ job, onClose }) => {
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

  const calculateProfitMargin = (totalPrice, totalCost) => {
    if (!totalPrice || !totalCost) return 0;
    const price = parseFloat(totalPrice);
    const cost = parseFloat(totalCost);
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const profitMargin = calculateProfitMargin(job.totalPrice, job.totalCost);
  const WorkIcon = getWorkTypeIcon(job.workType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">Job #{job.jobNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(job.status)}`}>
                {job.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(job.priority)}`}>
                {job.priority}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <WorkIcon className="w-4 h-4" />
                <span>{job.workType}</span>
              </div>
            </div>

            {/* Location and Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Property</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{job.property?.name || 'No property'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Suite/Unit</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{job.suite?.name || 'Property-wide'}</span>
                </div>
              </div>
              {job.scheduledDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              {job.scheduledTime && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Time</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{job.scheduledTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Technician */}
            {job.assignedTechnician && (
              <div>
                <label className="text-sm font-medium text-gray-600">Assigned Technician</label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{job.assignedTechnician}</span>
                </div>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Description</label>
                <p className="text-gray-900 text-sm">{job.description}</p>
              </div>
            )}

            {/* Line Items */}
            {job.lineItems && job.lineItems.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Services</label>
                <div className="space-y-2">
                  {job.lineItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.serviceName}</span>
                        <span className="text-gray-600 ml-2">
                          ({item.quantity}× ${parseFloat(item.unitPrice).toFixed(2)})
                        </span>
                      </div>
                      <span className="font-semibold">${parseFloat(item.totalPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${job.totalPrice ? parseFloat(job.totalPrice).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${job.totalCost ? parseFloat(job.totalCost).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Profit Margin:</span>
                  <span className={`text-sm font-semibold ${
                    profitMargin > 40 ? 'text-green-600' : 
                    profitMargin > 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span>{new Date(job.startedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {job.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span>{new Date(job.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Job
              </button>
              {job.status === 'COMPLETED' && (
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Generate Invoice
                </button>
              )}
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                View Photos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
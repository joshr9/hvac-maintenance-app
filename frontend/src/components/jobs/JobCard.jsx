// components/jobs/JobCard.jsx
import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Eye,
  MoreHorizontal,
  Users,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Wrench,
  Package,
  Briefcase
} from 'lucide-react';

const JobCard = ({ job, onView, onStatusUpdate }) => {
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-gray-500">{job.jobNumber}</span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(job.status)}`}>
              {job.status.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(job.priority)}`}>
              {job.priority}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.property?.name || 'No property'}</span>
            </div>
            {job.scheduledDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}
            {job.scheduledTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{job.scheduledTime}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <WorkIcon className="w-4 h-4" />
              <span>{job.workType}</span>
            </div>
            {job.assignedTechnician && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{job.assignedTechnician}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              {job.lineItems?.length || 0} line items
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              Updated {new Date(job.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onView(job)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500 mb-1">Revenue</div>
          <div className="text-lg font-semibold text-green-600">
            ${job.totalPrice ? parseFloat(job.totalPrice).toFixed(2) : '0.00'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Cost</div>
          <div className="text-lg font-semibold text-gray-900">
            ${job.totalCost ? parseFloat(job.totalCost).toFixed(2) : '0.00'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Profit</div>
          <div className={`text-lg font-semibold ${
            profitMargin > 40 ? 'text-green-600' : 
            profitMargin > 20 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-4">
        {job.status === 'SCHEDULED' && (
          <div className="flex gap-2">
            <button 
              onClick={() => onStatusUpdate(job.id, 'IN_PROGRESS')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Play className="w-4 h-4" />
              Start Job
            </button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Edit
            </button>
          </div>
        )}
        
        {job.status === 'IN_PROGRESS' && (
          <div className="flex gap-2">
            <button 
              onClick={() => onStatusUpdate(job.id, 'COMPLETED')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Job
            </button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              <Pause className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {job.status === 'COMPLETED' && (
          <button 
            onClick={() => onStatusUpdate(job.id, 'INVOICED')}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <FileText className="w-4 h-4" />
            Generate Invoice
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
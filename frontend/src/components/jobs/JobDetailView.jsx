import React, { useState } from 'react';
import ServicesTab from './ServicesTab';
import { 
  ArrowLeft, 
  Edit2, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  DollarSign,
  Save,
  X,
  Phone,
  Mail,
  Building,
  CheckCircle
} from 'lucide-react';

// Mock job data - in real app this would come from props or API
const mockJob = {
  id: 2,
  jobNumber: 'DC-2025-002',
  title: 'Emergency Repair - Unit 205',
  description: 'Heating system not working, urgent repair needed',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  workType: 'HVAC_REPAIR',
  assignedTechnician: 'Alex Johnson',
  scheduledDate: '2025-01-15',
  scheduledTime: '09:00',
  estimatedDuration: 120,
  totalPrice: 650.00,
  totalCost: 420.00,
  profitMargin: 35.4,
  property: {
    name: 'Riverside Apartments',
    address: '2200 Central Avenue, Boulder, CO 80301'
  },
  suite: {
    name: 'Unit 205'
  },
  customerNotes: 'Tenant reported no heat since yesterday evening. Priority repair needed.',
  internalNotes: 'Check furnace ignition system first. May need parts.',
  createdAt: '2025-01-14T10:30:00Z',
  updatedAt: '2025-01-15T08:15:00Z'
};

const JobDetailView = ({ job = mockJob, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(job.title);
  const [editedDescription, setEditedDescription] = useState(job.description);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'services', label: 'Services', count: 3 },
    { id: 'labor', label: 'Labor', count: 2 },
    { id: 'expenses', label: 'Expenses', count: 1 },
    { id: 'visits', label: 'Visits', count: 1 },
    { id: 'notes', label: 'Notes', count: null },
    { id: 'photos', label: 'Photos', count: 4 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const handleSaveTitle = async () => {
  try {
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editedTitle })
    });

    if (response.ok) {
      const updatedJob = await response.json();
      setIsEditingTitle(false);
      // Call onUpdate if provided to refresh the parent component
      if (onUpdate) {
        onUpdate(updatedJob);
      }
    } else {
      console.error('Failed to update job title');
      alert('Failed to update job title');
    }
  } catch (error) {
    console.error('Error updating job title:', error);
    alert('Error updating job title');
  }
};

  const handleSaveDescription = async () => {
  try {
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: editedDescription })
    });

    if (response.ok) {
      const updatedJob = await response.json();
      setIsEditingDescription(false);
      // Call onUpdate if provided to refresh the parent component
      if (onUpdate) {
        onUpdate(updatedJob);
      }
    } else {
      console.error('Failed to update job description');
      alert('Failed to update job description');
    }
  } catch (error) {
    console.error('Error updating job description:', error);
    alert('Error updating job description');
  }
};

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Job Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
    <div className="flex gap-2">
      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(job.status)}`}>
        {job.status.replace('_', ' ')}
      </span>
      <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(job.priority)}`}>
        {job.priority}
      </span>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="text-sm font-medium text-gray-600">Work Type</label>
      <p className="text-gray-900 mt-1">{job.workType.replace('_', ' ')}</p>
    </div>
    
    {/* ADD: Property Address */}
    <div>
      <label className="text-sm font-medium text-gray-600">Property Address</label>
      <div className="flex items-center gap-2 mt-1">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900">{job.property?.address || job.property?.name || 'No address'}</span>
      </div>
    </div>
    
    {job.assignedTechnician && (
      <div>
        <label className="text-sm font-medium text-gray-600">Assigned Technician</label>
        <div className="flex items-center gap-2 mt-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{job.assignedTechnician}</span>
        </div>
      </div>
    )}
    
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
</div>

        {/* Description Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <button
              onClick={() => setIsEditingDescription(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          {isEditingDescription ? (
            <div className="space-y-3">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditingDescription(false);
                    setEditedDescription(job.description);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{job.description}</p>
          )}
        </div>

        {/* Customer Notes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Notes</h3>
          <p className="text-gray-700">{job.customerNotes}</p>
        </div>

        {/* Internal Notes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>
          <p className="text-gray-700">{job.internalNotes}</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Financial Summary */}
       <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
  <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Revenue:</span>
      <span className="text-lg font-semibold text-green-600">
        ${job.totalPrice ? parseFloat(job.totalPrice).toFixed(2) : '0.00'}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600">Cost:</span>
      <span className="text-lg font-semibold text-gray-900">
        ${job.totalCost ? parseFloat(job.totalCost).toFixed(2) : '0.00'}
      </span>
    </div>
    <div className="border-t border-gray-200 pt-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Profit Margin:</span>
        <span className={`text-lg font-semibold ${
          (job.profitMargin && parseFloat(job.profitMargin) > 20) ? 'text-green-600' : 
          (job.profitMargin && parseFloat(job.profitMargin) > 10) ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {job.profitMargin ? parseFloat(job.profitMargin).toFixed(1) : '0.0'}%
        </span>
      </div>
    </div>
  </div>
</div>

        {/* Property Information
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
  <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h4>
  <div className="space-y-3">
    <div>
      <label className="text-sm font-medium text-gray-600">Property</label>
      <div className="flex items-center gap-2 mt-1">
        <Building className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900">{job.property?.name || 'No property'}</span>
      </div>
    </div>
    {job.property?.address && (
      <div>
        <label className="text-sm font-medium text-gray-600">Address</label>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{job.property.address}</span>
        </div>
      </div>
    )}
    <div>
      <label className="text-sm font-medium text-gray-600">Unit</label>
      <span className="text-gray-900 block mt-1">{job.suite?.name || 'Property-wide'}</span>
    </div>
  </div>
</div> */}

        {/* Timeline */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">
                {new Date(job.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Duration:</span>
              <span className="text-gray-900">{job.estimatedDuration} minutes</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Generate Invoice
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'services':
        return (
          <ServicesTab 
          jobId={job.id} 
          onJobUpdate={(updates) => {
          // Update the job state with new totals
          if (onUpdate) {
           onUpdate({
              ...job,
              ...updates
          });
        }
      }}
    />
  );
      case 'labor':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Labor Tab</h3>
            <p className="text-gray-600">Time tracking and labor management will be built in the next iteration</p>
          </div>
        );
      case 'expenses':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expenses Tab</h3>
            <p className="text-gray-600">Expense tracking will be built in the next iteration</p>
          </div>
        );
      case 'visits':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visits Tab</h3>
            <p className="text-gray-600">Visit scheduling will be built in the next iteration</p>
          </div>
        );
      case 'notes':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes Tab</h3>
            <p className="text-gray-600">Notes and file management will be built in the next iteration</p>
          </div>
        );
      case 'photos':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Photos Tab</h3>
            <p className="text-gray-600">Photo management will be built in the next iteration</p>
          </div>
        );
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveTitle}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingTitle(false);
                            setEditedTitle(job.title);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                        <button
                          onClick={() => setIsEditingTitle(true)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="font-mono">{job.jobNumber}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.property.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Edit Job
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Complete Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default JobDetailView;
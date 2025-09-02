import React, { useState, useEffect } from 'react';
import OverviewTab from './OverviewTab';
import NotesTab from './NotesTab';
import ServicesTab from './ServicesTab';
import { 
  ArrowLeft, 
  Edit2, 
  MapPin,
  Save,
  X,
  Calendar,
  User,
  FileText,
  DollarSign,
  Trash2
} from 'lucide-react';

// Import common components
import GlassCard from '../common/GlassCard';
import ActionButton from '../common/ActionButton';

const JobDetailView = ({ job, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(job.title);
  const [currentJob, setCurrentJob] = useState(job);
  
  // Editable notes state
  const [isEditingCustomerNotes, setIsEditingCustomerNotes] = useState(false);
  const [isEditingInternalNotes, setIsEditingInternalNotes] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedCustomerNotes, setEditedCustomerNotes] = useState(job.customerNotes || '');
  const [editedInternalNotes, setEditedInternalNotes] = useState(job.internalNotes || '');
  const [editedDescription, setEditedDescription] = useState(job.description || '');

  // Dynamic counts for tabs
  const [tabCounts, setTabCounts] = useState({
    services: 0,
    labor: 0,
    expenses: 0,
    visits: 0,
    notes: 0,
    photos: 0
  });

  // Load dynamic counts when component mounts or job changes
  useEffect(() => {
    loadTabCounts();
    // Update edited values when job changes
    setEditedTitle(job.title);
    setEditedDescription(job.description || '');
    setEditedCustomerNotes(job.customerNotes || '');
    setEditedInternalNotes(job.internalNotes || '');
  }, [job.id]);

const loadTabCounts = async () => {
  try {
    console.log('📊 Loading tab counts (API temporarily disabled)');
    
    // Calculate notes count from job data (this works without API)
    const notesCount = [job.customerNotes, job.internalNotes].filter(note => note && note.trim()).length;
    
    setTabCounts({
      services: 0, // TODO: Enable when backend route is working
      labor: 0,
      expenses: 0,
      visits: 0,
      notes: notesCount,
      photos: 0
    });
    
    console.log('✅ Tab counts set (no API calls)');
    
  } catch (error) {
    console.error('Error in loadTabCounts:', error);
    // Fallback to prevent crashes
    setTabCounts({
      services: 0,
      labor: 0,
      expenses: 0,
      visits: 0,
      notes: 0,
      photos: 0
    });
  }
};

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'services', label: 'Services', count: tabCounts.services },
    { id: 'labor', label: 'Labor', count: tabCounts.labor || null },
    { id: 'expenses', label: 'Expenses', count: tabCounts.expenses || null },
    { id: 'visits', label: 'Visits', count: tabCounts.visits || null },
    { id: 'notes', label: 'Notes', count: tabCounts.notes || null },
    { id: 'photos', label: 'Photos', count: tabCounts.photos || null }
  ];

  const handleSaveTitle = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setCurrentJob(updatedJob);
        setIsEditingTitle(false);
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
      const response = await fetch(`/api/jobs/${currentJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedDescription })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setCurrentJob(updatedJob);
        setIsEditingDescription(false);
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

  const handleSaveCustomerNotes = async () => {
    try {
      const response = await fetch(`/api/jobs/${currentJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerNotes: editedCustomerNotes })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setCurrentJob(updatedJob);
        setIsEditingCustomerNotes(false);
        if (onUpdate) {
          onUpdate(updatedJob);
        }
      }
    } catch (error) {
      console.error('Error updating customer notes:', error);
      alert('Error updating customer notes');
    }
  };

  const handleSaveInternalNotes = async () => {
    try {
      const response = await fetch(`/api/jobs/${currentJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: editedInternalNotes })
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setCurrentJob(updatedJob);
        setIsEditingInternalNotes(false);
        if (onUpdate) {
          onUpdate(updatedJob);
        }
      }
    } catch (error) {
      console.error('Error updating internal notes:', error);
      alert('Error updating internal notes');
    }
  };

  const handleJobUpdate = (updatedJob) => {
    setCurrentJob(updatedJob);
    if (onUpdate) {
      onUpdate(updatedJob);
    }
    // Reload counts when job is updated
    loadTabCounts();
  };

  const formatCurrency = (amount) => {
    return amount ? `$${parseFloat(amount).toFixed(2)}` : '$0.00';
  };

  const calculateProfitMargin = () => {
    const revenue = parseFloat(currentJob.totalPrice || 0);
    const cost = parseFloat(currentJob.totalCost || 0);
    if (revenue === 0) return '0.0%';
    const margin = ((revenue - cost) / revenue) * 100;
    return `${margin.toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
      case 'DISPATCHED': return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700';
      case 'INVOICED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <GlassCard className="max-w-4xl mx-auto">
            {/* Header with Job Info and Badges */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span className="font-mono">{currentJob.jobNumber}</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                        onBlur={handleSaveTitle}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingTitle(false);
                          setEditedTitle(currentJob.title);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">{currentJob.title}</h1>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentJob.status)}`}>
                    {currentJob.status?.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(currentJob.priority)}`}>
                    {currentJob.priority} Priority
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                    Created {new Date(currentJob.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Location and Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{currentJob.property?.name || 'Property Name'}</div>
                      <div className="text-gray-600">{currentJob.property?.address || 'No address provided'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduling
                </h3>
                <div className="space-y-3">
                  {currentJob.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Scheduled Date</div>
                        <div className="text-gray-900">
                          {new Date(currentJob.scheduledDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          {currentJob.scheduledTime && ` at ${currentJob.scheduledTime}`}
                        </div>
                      </div>
                    </div>
                  )}
                  {currentJob.assignedTechnician && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-700">Assigned Technician</div>
                        <div className="text-gray-900">{currentJob.assignedTechnician}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <button
                  onClick={() => setIsEditingDescription(!isEditingDescription)}
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
                    placeholder="Enter job description"
                  />
                  <div className="flex gap-2">
                    <ActionButton
                      onClick={handleSaveDescription}
                      variant="primary"
                      size="sm"
                      icon={Save}
                    >
                      Save
                    </ActionButton>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setEditedDescription(currentJob.description || '');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    {currentJob.description || 'No description provided'}
                  </p>
                </div>
              )}
            </div>

            {/* Customer Notes and Internal Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Customer Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Customer Notes</h4>
                  <button
                    onClick={() => setIsEditingCustomerNotes(!isEditingCustomerNotes)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {isEditingCustomerNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedCustomerNotes}
                      onChange={(e) => setEditedCustomerNotes(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Notes visible to customer"
                    />
                    <div className="flex gap-2">
                      <ActionButton
                        onClick={handleSaveCustomerNotes}
                        variant="primary"
                        size="sm"
                        icon={Save}
                      >
                        Save
                      </ActionButton>
                      <button
                        onClick={() => {
                          setIsEditingCustomerNotes(false);
                          setEditedCustomerNotes(currentJob.customerNotes || '');
                        }}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-lg p-4 min-h-[100px]">
                    <p className="text-gray-700 text-sm">
                      {currentJob.customerNotes || 'No customer notes'}
                    </p>
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Internal Notes</h4>
                  <button
                    onClick={() => setIsEditingInternalNotes(!isEditingInternalNotes)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {isEditingInternalNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedInternalNotes}
                      onChange={(e) => setEditedInternalNotes(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Internal notes for team"
                    />
                    <div className="flex gap-2">
                      <ActionButton
                        onClick={handleSaveInternalNotes}
                        variant="primary"
                        size="sm"
                        icon={Save}
                      >
                        Save
                      </ActionButton>
                      <button
                        onClick={() => {
                          setIsEditingInternalNotes(false);
                          setEditedInternalNotes(currentJob.internalNotes || '');
                        }}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-4 min-h-[100px]">
                    <p className="text-gray-700 text-sm">
                      {currentJob.internalNotes || 'No internal notes'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Estimated Cost</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(currentJob.estimatedCost)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Price</div>
                  <div className="text-xl font-bold text-green-700">
                    {formatCurrency(currentJob.totalPrice)}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Cost</div>
                  <div className="text-xl font-bold text-blue-700">
                    {formatCurrency(currentJob.totalCost)}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Profit Margin</div>
                  <div className="text-xl font-bold text-purple-700">
                    {calculateProfitMargin()}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Created: {new Date(currentJob.createdAt).toLocaleDateString()} • 
                Started: {currentJob.startedAt ? new Date(currentJob.startedAt).toLocaleDateString() : 'Not started'} • 
                Completed: {currentJob.completedAt ? new Date(currentJob.completedAt).toLocaleDateString() : 'Not completed'}
              </div>
              <div className="flex gap-3">
                <ActionButton
                  variant="secondary"
                  icon={Edit2}
                >
                  Edit
                </ActionButton>
                <ActionButton
                  variant="danger"
                  icon={Trash2}
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          </GlassCard>
        );
      
      case 'services':
        return (
          <ServicesTab 
            jobId={currentJob.id} 
            onJobUpdate={handleJobUpdate}
          />
        );
      
      case 'notes':
        return <NotesTab job={currentJob} onUpdate={handleJobUpdate} />;
      
      case 'labor':
        return <PlaceholderTab title="Labor Tab" description="Time tracking and labor management will be built in the next iteration" />;
      
      case 'expenses':
        return <PlaceholderTab title="Expenses Tab" description="Expense tracking will be built in the next iteration" />;
      
      case 'visits':
        return <PlaceholderTab title="Visits Tab" description="Visit scheduling will be built in the next iteration" />;
      
      case 'photos':
        return <PlaceholderTab title="Photos Tab" description="Photo management will be built in the next iteration" />;
      
      default:
        return <PlaceholderTab title="Coming Soon" description="This tab will be implemented in a future update" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
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
                  <h1 className="text-xl font-semibold text-gray-900">{currentJob.title}</h1>
                  <p className="text-sm text-gray-500 font-mono">{currentJob.jobNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ActionButton
                variant="secondary"
                icon={Edit2}
              >
                Edit Job
              </ActionButton>
              <ActionButton
                variant="primary"
              >
                Complete Job
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
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

// Placeholder component for unimplemented tabs
const PlaceholderTab = ({ title, description }) => (
  <GlassCard className="max-w-2xl mx-auto">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </GlassCard>
);

export default JobDetailView;
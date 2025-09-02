// components/properties/PropertyDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building, 
  MapPin, 
  Users, 
  Zap, 
  Calendar,
  Settings,
  Edit3,
  Trash2,
  Plus,
  Home,
  Activity,
  Loader
} from 'lucide-react';

const PropertyDetailModal = ({ isOpen, onClose, property, onEdit, onDelete, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [propertyJobs, setPropertyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showAddSuite, setShowAddSuite] = useState(false);

  // Load jobs for this property when modal opens
  useEffect(() => {
    if (isOpen && property) {
      loadPropertyJobs();
    }
  }, [isOpen, property]);

  const loadPropertyJobs = async () => {
    if (!property?.id) return;
    
    try {
      setLoadingJobs(true);
      const response = await fetch(`/api/jobs?propertyId=${property.id}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and direct array responses
        const jobs = Array.isArray(data) ? data : data.jobs || [];
        setPropertyJobs(jobs);
      }
    } catch (error) {
      console.error('Error loading property jobs:', error);
      setPropertyJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  if (!isOpen || !property) return null;

  // Calculate property metrics
  const suiteCount = property.suites?.length || 0;
  const unitCount = property.suites?.reduce((sum, suite) => sum + (suite.hvacUnits?.length || 0), 0) || 0;
  const jobCount = propertyJobs.length;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAction = (action) => {
    onClose();
    action(property);
  };

  const handleNavigateToJobs = () => {
    onClose();
    onNavigate('jobs', { propertyFilter: property.id });
  };

  const handleScheduleMaintenance = () => {
    onClose();
    onNavigate('maintenance', { selectedProperty: property });
  };

  const handleEditProperty = () => {
    onClose();
    onEdit(property);
  };

  const handleAddSuite = () => {
    setShowAddSuite(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {property.name || `Property ${property.id}`}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 p-6 bg-white border-b border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{suiteCount}</span>
            </div>
            <p className="text-sm text-gray-600">{suiteCount === 1 ? 'Suite' : 'Suites'}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{unitCount}</span>
            </div>
            <p className="text-sm text-gray-600">HVAC {unitCount === 1 ? 'Unit' : 'Units'}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{jobCount}</span>
            </div>
            <p className="text-sm text-gray-600">{jobCount === 1 ? 'Job' : 'Jobs'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('suites')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'suites'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Suites & Units
            </button>
            <button
              onClick={() => {
                setActiveTab('activity');
                if (propertyJobs.length === 0) {
                  loadPropertyJobs();
                }
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent Activity
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-gray-900">{property.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nickname</label>
                    <p className="text-gray-900">{property.name || 'No nickname set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                    <p className="text-gray-900">{formatDate(property.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                    <p className="text-gray-900">{formatDate(property.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleNavigateToJobs}
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-blue-900">View Jobs</p>
                      <p className="text-sm text-blue-700">See all jobs for this property</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleScheduleMaintenance}
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-green-900">Schedule Maintenance</p>
                      <p className="text-sm text-green-700">Create maintenance task</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Suites & HVAC Units</h3>
                <button 
                  onClick={handleAddSuite}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Suite
                </button>
              </div>
              
              {suiteCount === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No suites yet</h4>
                  <p className="text-gray-600 mb-4">Add suites to organize HVAC units and jobs</p>
                  <button 
                    onClick={handleAddSuite}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Suite
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {property.suites?.map((suite) => (
                    <div key={suite.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {suite.name || `Suite ${suite.id}`}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {suite.hvacUnits?.length || 0} HVAC {(suite.hvacUnits?.length || 0) === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                      
                      {suite.hvacUnits?.length > 0 ? (
                        <div className="space-y-2">
                          {suite.hvacUnits.map((unit) => (
                            <div key={unit.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <Zap className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-700">
                                {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No HVAC units</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
                {jobCount > 0 && (
                  <button
                    onClick={handleNavigateToJobs}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Jobs →
                  </button>
                )}
              </div>
              
              {loadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading jobs...</span>
                </div>
              ) : propertyJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h4>
                  <p className="text-gray-600 mb-4">Job history and maintenance records will appear here</p>
                  <button
                    onClick={handleScheduleMaintenance}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {propertyJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          job.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{job.workType}</span>
                        {job.scheduledDate && (
                          <span>{formatDate(job.scheduledDate)}</span>
                        )}
                        {job.assignedTechnician && (
                          <span>• {job.assignedTechnician}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {propertyJobs.length > 5 && (
                    <button
                      onClick={handleNavigateToJobs}
                      className="w-full py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                    >
                      View {propertyJobs.length - 5} More Jobs →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleEditProperty}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Property
            </button>
            <button
              onClick={() => handleAction(onDelete)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Property
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add Suite Modal Placeholder */}
      {showAddSuite && (
        <AddSuiteModal
          isOpen={showAddSuite}
          onClose={() => setShowAddSuite(false)}
          property={property}
          onSuiteAdded={(newSuite) => {
            // Handle suite added - you'll need to refresh the property data
            console.log('Suite added:', newSuite);
            setShowAddSuite(false);
            // TODO: Refresh property data or update local state
          }}
        />
      )}
    </div>
  );
};

// Quick Add Suite Modal Component
const AddSuiteModal = ({ isOpen, onClose, property, onSuiteAdded }) => {
  const [suiteData, setSuiteData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suiteData.name.trim()) {
      setError('Suite name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/properties/${property.id}/suites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suiteData.name.trim(),
          description: suiteData.description.trim()
        })
      });

      if (response.ok) {
        const newSuite = await response.json();
        onSuiteAdded(newSuite);
        setSuiteData({ name: '', description: '' });
      } else {
        throw new Error('Failed to add suite');
      }
    } catch (error) {
      setError('Failed to add suite. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Add Suite</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suite Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Suite 101, RTU #1, etc."
              value={suiteData.name}
              onChange={(e) => setSuiteData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional details about this suite..."
              rows="3"
              value={suiteData.description}
              onChange={(e) => setSuiteData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Suite'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
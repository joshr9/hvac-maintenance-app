import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Calendar, MapPin, DollarSign, Briefcase, Trash2, Users } from 'lucide-react';

const CreateJobModal = ({ isOpen, onClose, allProperties = [], onJobCreated }) => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Add Services, 3: Review
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    propertyId: '',
    suiteId: '',
    hvacUnitId: '',
    scheduledDate: '',
    scheduledTime: '',
    assignedTechnician: '',
    priority: 'MEDIUM',
    workType: 'HVAC_INSPECTION',
    estimatedDuration: '',
    customerNotes: '',
    internalNotes: ''
  });

  // Load services
  useEffect(() => {
    if (isOpen) {
      fetch('/api/services?active=true')
        .then(res => res.json())
        .then(data => setServices(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error loading services:', err));
    }
  }, [isOpen]);

  const selectedProperty = jobData.propertyId ? 
    allProperties.find(p => p.id === parseInt(jobData.propertyId)) : null;
  
  const selectedPropertySuites = selectedProperty?.suites || [];
  
  const selectedSuiteData = jobData.suiteId ? 
    selectedPropertySuites.find(s => s.id === parseInt(jobData.suiteId)) : null;
  
  const selectedSuiteHVAC = selectedSuiteData?.hvacUnits || [];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addServiceToJob = (service) => {
    const existingIndex = selectedServices.findIndex(s => s.serviceId === service.id);
    
    if (existingIndex >= 0) {
      // Update quantity if already exists
      const updated = [...selectedServices];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSelectedServices(updated);
    } else {
      // Add new service
      const lineItem = {
        serviceId: service.id,
        serviceName: service.name,
        description: service.description,
        quantity: 1,
        unitPrice: parseFloat(service.unitPrice || 0),
        unitCost: parseFloat(service.unitCost || 0),
        totalPrice: parseFloat(service.unitPrice || 0),
        totalCost: parseFloat(service.unitCost || 0),
        category: service.category
      };
      setSelectedServices([...selectedServices, lineItem]);
    }
  };

  const updateServiceQuantity = (index, quantity) => {
    const updated = [...selectedServices];
    updated[index].quantity = Math.max(0, quantity);
    updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
    updated[index].totalCost = updated[index].quantity * updated[index].unitCost;
    setSelectedServices(updated);
  };

  const removeService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalPrice = selectedServices.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalCost = selectedServices.reduce((sum, item) => sum + item.totalCost, 0);
    const profitMargin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice * 100) : 0;
    
    return { totalPrice, totalCost, profitMargin };
  };

  const handleSubmit = async () => {
    if (!jobData.title || !jobData.propertyId || selectedServices.length === 0) {
      alert('Please fill in job title, property, and add at least one service');
      return;
    }

    const { totalPrice, totalCost } = calculateTotals();
    
    const jobPayload = {
      ...jobData,
      propertyId: parseInt(jobData.propertyId),
      suiteId: jobData.suiteId ? parseInt(jobData.suiteId) : null,
      hvacUnitId: jobData.hvacUnitId ? parseInt(jobData.hvacUnitId) : null,
      estimatedCost: totalCost,
      estimatedPrice: totalPrice,
      estimatedDuration: jobData.estimatedDuration ? parseInt(jobData.estimatedDuration) : null,
      lineItems: selectedServices
    };

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobPayload)
      });

      if (response.ok) {
        const newJob = await response.json();
        onJobCreated?.(newJob);
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error creating job: ${error.error}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setStep(1);
    setJobData({
      title: '',
      description: '',
      propertyId: '',
      suiteId: '',
      hvacUnitId: '',
      scheduledDate: '',
      scheduledTime: '',
      assignedTechnician: '',
      priority: 'MEDIUM',
      workType: 'HVAC_INSPECTION',
      estimatedDuration: '',
      customerNotes: '',
      internalNotes: ''
    });
    setSelectedServices([]);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  const { totalPrice, totalCost, profitMargin } = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
              <Briefcase className="w-5 h-5" style={{color: '#2a3a91'}} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Create New Job</h3>
              <p className="text-sm text-gray-600">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
              <span className="text-sm font-medium">Job Details</span>
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} rounded`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
              <span className="text-sm font-medium">Add Services</span>
            </div>
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} rounded`}></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Job Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.title}
                    onChange={e => setJobData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="HVAC Maintenance - Monthly Service"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.workType}
                    onChange={e => setJobData(prev => ({ ...prev, workType: e.target.value }))}
                  >
                    <option value="HVAC_INSPECTION">HVAC Inspection</option>
                    <option value="HVAC_FILTER_CHANGE">HVAC Filter Change</option>
                    <option value="HVAC_FULL_SERVICE">HVAC Full Service</option>
                    <option value="HVAC_REPAIR">HVAC Repair</option>
                    <option value="CLEANING">Cleaning Service</option>
                    <option value="LANDSCAPING">Landscaping</option>
                    <option value="SNOW_REMOVAL">Snow Removal</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  rows="3"
                  value={jobData.description}
                  onChange={e => setJobData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of work to be performed..."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property *</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.propertyId}
                    onChange={e => setJobData(prev => ({ ...prev, propertyId: e.target.value, suiteId: '', hvacUnitId: '' }))}
                  >
                    <option value="">Select property...</option>
                    {allProperties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Suite/Unit</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.suiteId}
                    onChange={e => setJobData(prev => ({ ...prev, suiteId: e.target.value, hvacUnitId: '' }))}
                    disabled={!selectedProperty}
                  >
                    <option value="">Property-wide</option>
                    {selectedPropertySuites.map(suite => (
                      <option key={suite.id} value={suite.id}>{suite.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">HVAC Unit</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.hvacUnitId}
                    onChange={e => setJobData(prev => ({ ...prev, hvacUnitId: e.target.value }))}
                    disabled={!selectedSuiteData}
                  >
                    <option value="">All units</option>
                    {selectedSuiteHVAC.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.scheduledDate}
                    onChange={e => setJobData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.scheduledTime}
                    onChange={e => setJobData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.estimatedDuration}
                    onChange={e => setJobData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={jobData.priority}
                    onChange={e => setJobData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Technician</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  value={jobData.assignedTechnician}
                  onChange={e => setJobData(prev => ({ ...prev, assignedTechnician: e.target.value }))}
                  placeholder="Mike Rodriguez"
                />
              </div>
            </div>
          )}

          {/* Step 2: Add Services */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Service Catalog */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Services</h4>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Services Grid */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredServices.map(service => (
                    <div
                      key={service.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addServiceToJob(service)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{service.name}</h5>
                          <p className="text-sm text-gray-600">{service.category}</p>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${parseFloat(service.unitPrice || 0).toFixed(2)}
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Services */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Services ({selectedServices.length})
                </h4>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedServices.map((item, index) => (
                    <div key={index} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.serviceName}</h5>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                        <button
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                            value={item.quantity}
                            onChange={e => updateServiceQuantity(index, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-sm text-gray-600">× ${item.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                {selectedServices.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-700 mb-3">Job Totals</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-semibold text-green-600">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>
                        <span className="font-semibold">${totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Profit Margin:</span>
                        <span className={`font-semibold ${profitMargin > 20 ? 'text-green-600' : profitMargin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Review Job Details</h4>
              
              {/* Job Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                    <p className="text-gray-900">{jobData.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Property</label>
                    <p className="text-gray-900">{selectedProperty?.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Scheduled</label>
                    <p className="text-gray-900">
                      {jobData.scheduledDate 
                        ? `${new Date(jobData.scheduledDate).toLocaleDateString()} at ${jobData.scheduledTime || 'TBD'}`
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Technician</label>
                    <p className="text-gray-900">{jobData.assignedTechnician || 'Not assigned'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Work Type</label>
                    <p className="text-gray-900">{jobData.workType.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Priority</label>
                    <p className="text-gray-900">{jobData.priority}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="text-gray-900">{jobData.estimatedDuration ? `${jobData.estimatedDuration} minutes` : 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Services Summary */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Services ({selectedServices.length})</h5>
                <div className="space-y-2">
                  {selectedServices.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.serviceName}</span>
                        <span className="text-gray-600 ml-2">({item.quantity}× ${item.unitPrice.toFixed(2)})</span>
                      </div>
                      <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${profitMargin > 20 ? 'text-green-600' : profitMargin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {profitMargin.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Profit Margin</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!jobData.title || !jobData.propertyId)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={selectedServices.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Job
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal;
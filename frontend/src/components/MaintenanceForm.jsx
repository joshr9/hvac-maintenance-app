import React, { useState, useEffect } from 'react';
import { Search, Building, Home, ArrowLeft, Plus, CheckCircle, Wrench, Calendar, FileText, MapPin } from 'lucide-react';
import EditableHVACTable from './EditableHVACTable';

const MAINTENANCE_TYPES = [
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'FILTER_CHANGE', label: 'Filter Change' },
  { value: 'FULL_SERVICE', label: 'Full Service' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'OTHER', label: 'Other' },
];

const MaintenanceForm = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');
  // Add HVAC modal state
  const [showAddHVAC, setShowAddHVAC] = useState(false);
  const [newUnit, setNewUnit] = useState({
    name: "",
    serialNumber: "",
    model: "",
    installDate: "",
    filterSize: "",
    notes: "",
  });
  const [addHVACStatus, setAddHVACStatus] = useState("");

  // Fetch properties from backend
  useEffect(() => {
    fetch("/api/properties")
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Failed to fetch properties", err));
  }, []);
  
  // Remove duplicates by address
  const uniqueProperties = Array.from(
    new Map(properties.map(p => [p.address, p])).values()
  );

  // Filter properties based on search
// Filter properties based on search
const filteredProperties = uniqueProperties.filter(property =>
  (property.name && property.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
  (property.address && property.address.toLowerCase().includes(searchQuery.toLowerCase()))
);

const handlePropertySelect = (property) => {
  setSelectedProperty(property);
  setSearchQuery('');
  setSelectedSuite(null);
};

const handleSuiteSelect = (suite) => {
  setSelectedSuite(suite);
  setSelectedUnit('');
};
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedSuite) {
      setFormError('No suite selected.');
      return;
    }
    if (!selectedUnit) {
      setFormError('Please select an HVAC unit.');
      return;
    }
    if (!maintenanceType || !maintenanceNote || !serviceDate) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const payload = {
      hvacUnitId: Number(selectedUnit),
      technicianId: 1, // TODO: Replace with logged-in user if you add auth
      notes: maintenanceNote,
      maintenanceType,
      status: 'COMPLETED',
      createdAt: serviceDate,
    };
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSubmitStatus('Maintenance record saved successfully!');
        setMaintenanceNote('');
        setMaintenanceType('');
        setSelectedUnit('');
      } else {
        const err = await response.json();
        setSubmitStatus(err?.error || 'Error saving maintenance record.');
      }
    } catch (err) {
      setSubmitStatus('Network error saving maintenance record.');
      console.error(err);
    }
    setTimeout(() => setSubmitStatus(''), 3000);
  };

  const handleAddHVAC = async (e) => {
    e.preventDefault();
    setAddHVACStatus("Saving...");
    try {
      const res = await fetch("/api/hvac-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUnit,
          suiteId: selectedSuite.id,
        }),
      });
      if (res.ok) {
        setAddHVACStatus("Added!");
        setShowAddHVAC(false);
        setNewUnit({ name: "", serialNumber: "", model: "", installDate: "", filterSize: "", notes: "" });
        const added = await res.json();
        setSelectedSuite(suite => ({
          ...suite,
          hvacUnits: suite.hvacUnits ? [...suite.hvacUnits, added] : [added],
        }));
      } else {
        const errMsg = (await res.json())?.message || "Failed to add unit.";
        setAddHVACStatus(errMsg);
      }
    } catch {
      setAddHVACStatus("Network error.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <img 
              src="/DeanCallan.png" 
              alt="Dean Callan Logo" 
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HVAC Maintenance Tracker</h1>
              <p className="text-gray-600">Manage property maintenance records</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Property Search Step */}
        {!selectedProperty ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <Building className="w-12 h-12 mx-auto mb-4" style={{color: '#2a3a91'}} />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Property</h2>
                <p className="text-gray-600">Search for a property to begin maintenance tracking</p>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-lg"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by property name or address..."
                />
              </div>
              {searchQuery && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map(property => (
                      <div 
                        key={property.id}
                        className="p-4 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handlePropertySelect(property)}
                      >
                        <div className="flex items-start gap-3">
                          <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900">{property.name}</div>
                            <div className="text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {property.address}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No properties found matching your search
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : !selectedSuite ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedProperty.name}</h2>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {selectedProperty.address}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change Property
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Select Suite or Unit
                </h3>
                {selectedProperty.suites && selectedProperty.suites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProperty.suites.map(suite => (
                      <div 
                        key={suite.id} 
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all group"
                        onClick={() => handleSuiteSelect(suite)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg transition-colors" style={{backgroundColor: '#f3f4f6'}}>
                            <Home className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {suite.name || suite.unitNumber || `Suite ${suite.id}`}
                            </div>
                            {suite.unitNumber && (
                              <div className="text-sm text-gray-600">Unit: {suite.unitNumber}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No suites or units found for this property</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header and Breadcrumb */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* ... Header (unchanged from above) ... */}
            </div>
            {/* Maintenance Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                  <Plus className="w-5 h-5" style={{color: '#2a3a91'}} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add Maintenance Record</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Maintenance Type
                      </label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{'--tw-ring-color': '#2a3a91'}}
                        value={maintenanceType}
                        onChange={(e) => setMaintenanceType(e.target.value)}
                        required
                      >
                        <option value="">Select maintenance type...</option>
                        {MAINTENANCE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                          style={{'--tw-ring-color': '#2a3a91'}}
                          value={serviceDate}
                          onChange={e => setServiceDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {/* HVAC Unit Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      HVAC Unit
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#2a3a91'}}
                      value={selectedUnit}
                      onChange={e => setSelectedUnit(e.target.value)}
                      required
                    >
                      <option value="">Select HVAC unit...</option>
                      {selectedSuite.hvacUnits && selectedSuite.hvacUnits.length > 0 ? (
                        selectedSuite.hvacUnits.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name || unit.serialNumber || unit.filterSize || `Unit ${unit.id}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No HVAC units found. Please add one.</option>
                      )}
                    </select>
                  </div>
                  {/* Add HVAC Button */}
                  {selectedSuite && (
                    <div className="my-4">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={() => setShowAddHVAC(true)}
                        type="button"
                      >
                        + Add HVAC Unit
                      </button>
                    </div>
                  )}
                  {/* Editable HVAC Units Table */}
                  {selectedSuite.hvacUnits && selectedSuite.hvacUnits.length > 0 && (
                    <EditableHVACTable hvacUnits={selectedSuite.hvacUnits} />
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maintenance Notes
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#2a3a91'}}
                      rows="5"
                      value={maintenanceNote}
                      onChange={e => setMaintenanceNote(e.target.value)}
                      placeholder="Describe the work performed, parts used, issues found, and any recommendations..."
                      required
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-500">
                      All fields are required to save the maintenance record
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
                      style={{backgroundColor: '#2a3a91'}}
                    >
                      <FileText className="w-5 h-5" />
                      Save Maintenance Record
                    </button>
                  </div>
                  {formError && (
                    <div className="flex items-center gap-3 p-4 border rounded-lg" style={{backgroundColor: '#fef2f2', borderColor: '#ef4444'}}>
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: '#ef4444'}} />
                      <div className="font-medium" style={{color: '#b91c1c'}}>{formError}</div>
                    </div>
                  )}
                  {submitStatus && (
                    <div className="flex items-center gap-3 p-4 border rounded-lg" style={{backgroundColor: '#f0f9ff', borderColor: '#22c55e'}}>
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: '#22c55e'}} />
                      <div className="font-medium" style={{color: '#15803d'}}>{submitStatus}</div>
                    </div>
                  )}
                </div>
              </form>
            </div>
            {/* Maintenance History Placeholder */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Maintenance History</h3>
              </div>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No maintenance history available</p>
                <p className="text-sm text-gray-400">Previous maintenance records will appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add HVAC Modal */}
      {showAddHVAC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowAddHVAC(false)}
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-5">Add HVAC Unit</h3>
            <form onSubmit={handleAddHVAC} className="space-y-4">
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Label/Name"
                value={newUnit.name}
                onChange={e => setNewUnit(n => ({ ...n, name: e.target.value }))}
                required
              />
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Serial Number"
                value={newUnit.serialNumber}
                onChange={e => setNewUnit(n => ({ ...n, serialNumber: e.target.value }))}
                required
              />
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Model"
                value={newUnit.model}
                onChange={e => setNewUnit(n => ({ ...n, model: e.target.value }))}
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Install Date"
                value={newUnit.installDate}
                onChange={e => setNewUnit(n => ({ ...n, installDate: e.target.value }))}
              />
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Filter Size"
                value={newUnit.filterSize}
                onChange={e => setNewUnit(n => ({ ...n, filterSize: e.target.value }))}
              />
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Notes"
                value={newUnit.notes}
                onChange={e => setNewUnit(n => ({ ...n, notes: e.target.value }))}
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add Unit</button>
                <button type="button" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowAddHVAC(false)}>Cancel</button>
              </div>
              {addHVACStatus && <div className="pt-2 text-sm text-blue-600">{addHVACStatus}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceForm;
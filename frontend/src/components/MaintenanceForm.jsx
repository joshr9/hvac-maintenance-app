import React, { useState, useEffect } from 'react';
import { Search, Building, Home, ArrowLeft, Plus, CheckCircle, Wrench, Calendar, FileText, MapPin, Trash } from 'lucide-react';
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
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
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

  // Photo upload state
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  // Fetch properties from backend
  useEffect(() => {
    fetch("/api/properties")
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Failed to fetch properties", err));
  }, []);

  // Fetch maintenance logs for selected suite (always include photos, update after log/photo changes)
  useEffect(() => {
    if (!selectedSuite) {
      setMaintenanceLogs([]);
      return;
    }
    fetch(`/api/maintenance?suiteId=${selectedSuite.id}`)
      .then(res => res.json())
      .then(data => {
        // Make sure logs always have a photos array
        const logsWithPhotos = Array.isArray(data)
          ? data.map(log => ({
              ...log,
              photos: Array.isArray(log.photos) ? log.photos : [],
            }))
          : [];
        setMaintenanceLogs(logsWithPhotos);
      })
      .catch(() => setMaintenanceLogs([]));
  }, [selectedSuite]);
  
  // Remove duplicates by address
  const uniqueProperties = Array.from(
    new Map(properties.map(p => [p.address, p])).values()
  );

  // Filter properties based on search
  const filteredProperties = uniqueProperties.filter(property =>
    (property.name && property.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (property.address && property.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setSearchQuery('');
    setSelectedSuite(null);
    setPhotoFiles([]);
    setUploadStatus("");
  };

  const handleSuiteSelect = (suite) => {
    setSelectedSuite(suite);
    setSelectedUnit('');
    setPhotoFiles([]);
    setUploadStatus("");
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
      technicianId: 1,
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
        const newLog = await response.json();
        setSubmitStatus('Maintenance record saved successfully!');
        setMaintenanceNote('');
        setMaintenanceType('');
        setSelectedUnit('');
        setMaintenanceLogs(logs => [newLog, ...logs]);
        // Upload photos if any, then refresh logs
        if (photoFiles.length > 0) {
          await handlePhotoUpload(newLog.id);
        }
        // Refresh maintenance logs so new log & photos appear
        fetch(`/api/maintenance?suiteId=${selectedSuite.id}`)
          .then(res => res.json())
          .then(data => setMaintenanceLogs(Array.isArray(data) ? data : []))
          .catch(() => setMaintenanceLogs([]));
        setPhotoFiles([]);
        setUploadStatus("");
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

  // Handler for uploading photos (now takes logId param)
  const handlePhotoUpload = async (logId) => {
    if (!photoFiles.length || !logId) return;
    setUploadStatus("Uploading...");
    for (let i = 0; i < photoFiles.length; i++) {
      const formData = new FormData();
      formData.append('photo', photoFiles[i]);
      await fetch(`/api/maintenance/${logId}/photos`, {
        method: "POST",
        body: formData,
      });
    }
    setUploadStatus("Photos uploaded!");
    setPhotoFiles([]);
    setTimeout(() => setUploadStatus(""), 2000);

    // ✨ Fetch updated logs so new photos show up!
    if (selectedSuite) {
      fetch(`/api/maintenance?suiteId=${selectedSuite.id}`)
        .then(res => res.json())
        .then(data => setMaintenanceLogs(Array.isArray(data) ? data : []))
        .catch(() => setMaintenanceLogs([]));
    }
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

  const handleHVACUnitUpdate = (updatedUnit) => {
    setSelectedSuite(suite => ({
      ...suite,
      hvacUnits: suite.hvacUnits.map(unit =>
        unit.id === updatedUnit.id ? { ...unit, ...updatedUnit } : unit
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
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
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
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
                        className="p-4 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-white transition-colors"
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

        /* Suite Selection Step */
        ) : !selectedSuite ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg">
              {/* Property Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                      <Building className="w-6 h-6" style={{color: '#2a3a91'}} />
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

              {/* Suites Grid */}
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
                        style={{'--hover-border-color': '#2a3a91'}}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2a3a91'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                        onClick={() => handleSuiteSelect(suite)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg transition-colors">
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

        /* Maintenance Form Step */
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumb Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                    <Home className="w-6 h-6" style={{color: '#2a3a91'}} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedProperty.name}</h2>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {selectedProperty.address}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#e8eafc', color: '#2a3a91'}}>
                      <Home className="w-4 h-4" />
                      {selectedSuite.name || selectedSuite.unitNumber || `Suite ${selectedSuite.id}`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedSuite(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Suites
                  </button>
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Change Property
                  </button>
                </div>
              </div>
            </div>

            {/* Maintenance Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                  <Plus className="w-5 h-5" style={{color: '#2a3a91'}} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add Maintenance Record</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maintenance Type
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{'--tw-ring-color': '#2a3a91'}}
                      onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
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
                        onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
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
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
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
                      className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
                      style={{backgroundColor: '#2a3a91'}}
                      onClick={() => setShowAddHVAC(true)}
                      type="button"
                    >
                      <Plus className="w-4 h-4" />
                      Add HVAC Unit
                    </button>
                  </div>
                )}

                {/* Editable HVAC Units Table */}
                {selectedSuite.hvacUnits && selectedSuite.hvacUnits.length > 0 && (
                  <EditableHVACTable 
                    hvacUnits={selectedSuite.hvacUnits} 
                    onUnitUpdate={handleHVACUnitUpdate}
                  />
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maintenance Notes
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    rows="5"
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Describe the work performed, parts used, issues found, and any recommendations..."
                    required
                  ></textarea>
                </div>
                
                {/* Photo Upload Section - ALWAYS show before Save button */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attach Photos (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => setPhotoFiles(Array.from(e.target.files))}
                    className="mb-2"
                  />
                  {/* Show thumbnails of selected files */}
                  {photoFiles.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {photoFiles.map((file, idx) => (
                        <div key={idx} className="w-16 h-16 relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Selected"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadStatus && <div className="text-sm text-blue-600 mt-1">{uploadStatus}</div>}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    All fields are required to save the maintenance record
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
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
            </div>

            {/* Maintenance History Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                  <FileText className="w-5 h-5" style={{color: '#2a3a91'}} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Maintenance History</h3>
              </div>
              {selectedUnit
                ? (
                  maintenanceLogs.filter(log => String(log.hvacUnitId) === String(selectedUnit)).length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No maintenance history available</p>
                      <p className="text-sm text-gray-400">Previous maintenance records will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y border rounded-lg overflow-hidden">
                      {maintenanceLogs
                        .filter(log => String(log.hvacUnitId) === String(selectedUnit))
                        .map(log => (
                          <div key={log.id} className="flex items-start gap-4 p-4 bg-white hover:bg-blue-50 transition">
                            <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                              <Wrench className="w-5 h-5" style={{color: '#2a3a91'}} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-900">{log.maintenanceType}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600">
                                  {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <div className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                                {log.notes}
                              </div>
                              {log.photos && log.photos.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {log.photos
                                    .filter(photo => photo.url || photo.fileName)
                                    .map(photo => (
                                      <img
                                        key={photo.id}
                                        src={
                                          photo.url
                                            ? `http://localhost:3000${photo.url}`
                                            : `http://localhost:3000/uploads/${photo.fileName}`
                                        }
                                        alt="Maintenance"
                                        className="w-20 h-20 object-cover rounded shadow"
                                        onError={e => {
                                          e.target.onerror = null;
                                          e.target.style.opacity = 0.3;
                                          e.target.src =
                                            "data:image/svg+xml;utf8,<svg width='80' height='80' xmlns='http://www.w3.org/2000/svg'><rect width='80' height='80' fill='%23eee'/><text x='40' y='45' font-size='16' text-anchor='middle' fill='%23666'>No Img</text></svg>";
                                        }}
                                      />
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )
                )
                : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Please select an HVAC unit to view its maintenance history.</p>
                  </div>
                )
              }
            </div>
          </div>
        )}
      </div>

      {/* Add HVAC Modal */}
      {showAddHVAC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
              onClick={() => setShowAddHVAC(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
                <Plus className="w-5 h-5" style={{color: '#2a3a91'}} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Add HVAC Unit</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Label/Name</label>
                <input
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                  placeholder="Enter unit name or label"
                  value={newUnit.name}
                  onChange={e => setNewUnit(n => ({ ...n, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
                <input
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                  placeholder="Enter serial number"
                  value={newUnit.serialNumber}
                  onChange={e => setNewUnit(n => ({ ...n, serialNumber: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                <input
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                  placeholder="Enter model number"
                  value={newUnit.model}
                  onChange={e => setNewUnit(n => ({ ...n, model: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Install Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                  value={newUnit.installDate}
                  onChange={e => setNewUnit(n => ({ ...n, installDate: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Size</label>
                <input
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                  placeholder="e.g., 16x20x1"
                  value={newUnit.filterSize}
                  onChange={e => setNewUnit(n => ({ ...n, filterSize: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': '#2a3a91'}}
                  onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                  rows="3"
                  placeholder="Additional notes about this unit"
                  value={newUnit.notes}
                  onChange={e => setNewUnit(n => ({ ...n, notes: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={handleAddHVAC}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors"
                  style={{backgroundColor: '#2a3a91'}}
                >
                  <Plus className="w-4 h-4" />
                  Add Unit
                </button>
                <button 
                  type="button" 
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors" 
                  onClick={() => setShowAddHVAC(false)}
                >
                  Cancel
                </button>
              </div>
              
              {addHVACStatus && (
                <div className="pt-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{backgroundColor: '#f0f9ff', color: '#2a3a91'}}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{addHVACStatus}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceForm;
import React, { useState, useEffect } from 'react';
import MaintenanceHistory from './MaintenanceHistory';
import ManageHVACUnitsSection from './ManageHVACUnitsSection';
import { Search, Building, Home, ArrowLeft, Plus, CheckCircle, Wrench, Calendar, FileText, MapPin, Trash } from 'lucide-react';
import EditableHVACTable from './EditableHVACTable';
import PropertySearchStep from './PropertySearchStep';
import SuiteSelectionStep from './SuiteSelectionStep';
import MaintenanceRecordForm from './MaintenanceRecordForm';
import AddHVACModal from './AddHVACModal';
import MaintenanceModeToggle from './MaintenanceModeToggle';
import MaintenanceChecklist from './MaintenanceChecklist';

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
  const [mode, setMode] = useState('quick');

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

  // Fetch maintenance logs for selected suite
  useEffect(() => {
    if (!selectedSuite) {
      setMaintenanceLogs([]);
      return;
    }
    fetch(`/api/maintenance?suiteId=${selectedSuite.id}`)
      .then(res => res.json())
      .then(data => {
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
        if (photoFiles.length > 0) {
          await handlePhotoUpload(newLog.id);
        }
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

    if (selectedSuite) {
      fetch(`/api/maintenance?suiteId=${selectedSuite.id}`)
        .then(res => res.json())
        .then(data => setMaintenanceLogs(Array.isArray(data) ? data : []))
        .catch(() => setMaintenanceLogs([]));
    }
  };

  const downloadReport = async () => {
    if (!selectedSuite) return;
    try {
      const res = await fetch(`/api/maintenance/report?suiteId=${selectedSuite.id}`);
      if (!res.ok) {
        alert('Failed to download report');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maintenance-history-${selectedSuite.name || selectedSuite.unitNumber || selectedSuite.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch  {
      alert('Error downloading report');
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
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6"> {/* Smaller padding on mobile */}
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/DeanCallan.png" 
              alt="Dean Callan Logo" 
              className="w-20 h-20 object-contain"
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">HVAC Maintenance Tracker</h1>
              <p className="text-gray-600">Manage property maintenance records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Property Search Step */}
        {!selectedProperty ? (
          <PropertySearchStep
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredProperties={filteredProperties}
            handlePropertySelect={handlePropertySelect}
          />

        /* Suite Selection Step */
        ) : !selectedSuite ? (
          <SuiteSelectionStep
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            handleSuiteSelect={handleSuiteSelect}
          />

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

            <>
              <MaintenanceModeToggle mode={mode} setMode={setMode} />

              {mode === 'quick' ? (
                <>
                  <MaintenanceRecordForm
                    selectedSuite={selectedSuite}
                    selectedUnit={selectedUnit}
                    setSelectedUnit={setSelectedUnit}
                    maintenanceType={maintenanceType}
                    setMaintenanceType={setMaintenanceType}
                    serviceDate={serviceDate}
                    setServiceDate={setServiceDate}
                    maintenanceNote={maintenanceNote}
                    setMaintenanceNote={setMaintenanceNote}
                    photoFiles={photoFiles}
                    setPhotoFiles={setPhotoFiles}
                    uploadStatus={uploadStatus}
                    formError={formError}
                    submitStatus={submitStatus}
                    handleSubmit={handleSubmit}
                    setShowAddHVAC={setShowAddHVAC}
                  />

                  {/* HVAC Units Management */}
                  {selectedSuite.hvacUnits && selectedSuite.hvacUnits.length > 0 && (
                    <ManageHVACUnitsSection
                      hvacUnits={selectedSuite.hvacUnits}
                      onUnitUpdate={handleHVACUnitUpdate}
                    />
                  )}

                  {/* Download Report Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={downloadReport}
                      className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg shadow hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#2a3a91' }}
                    >
                      <FileText className="w-5 h-5" />
                      Download Report
                    </button>
                  </div>

                  {/* Maintenance History Section */}
                  <MaintenanceHistory
                    maintenanceLogs={maintenanceLogs}
                    selectedUnit={selectedUnit}
                  />
                </>
             ) : (
              <MaintenanceChecklist 
                selectedSuite={selectedSuite}
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                setShowAddHVAC={setShowAddHVAC}
                submitStatus={submitStatus}
                setSubmitStatus={setSubmitStatus}
                onChecklistComplete={(savedLog) => {
                  // Add the new log to the maintenance history
                  setMaintenanceLogs(logs => [savedLog, ...logs]);
                  
                  // Refresh the full maintenance logs from backend to ensure consistency
                  if (selectedSuite) {
                    fetch(`/api/maintenance?suiteId=${selectedSuite.id}`)
                      .then(res => res.json())
                      .then(data => {
                        const logsWithPhotos = Array.isArray(data)
                          ? data.map(log => ({
                              ...log,
                              photos: Array.isArray(log.photos) ? log.photos : [],
                            }))
                          : [];
                        setMaintenanceLogs(logsWithPhotos);
                      })
                      .catch(() => setMaintenanceLogs([]));
                  }
                }}
              />
            )}
            </>
          </div>
        )}
      </div>

      <AddHVACModal
        showAddHVAC={showAddHVAC}
        setShowAddHVAC={setShowAddHVAC}
        newUnit={newUnit}
        setNewUnit={setNewUnit}
        handleAddHVAC={handleAddHVAC}
        addHVACStatus={addHVACStatus}
      />
    </div>
  );
};

export default MaintenanceForm;
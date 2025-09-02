// MaintenanceForm.jsx - Updated to accept pre-selected property/suite/unit from HVAC dashboard

import React, { useState, useEffect } from 'react';
import MaintenanceHeader from './MaintenanceHeader';
import MaintenanceSteps from './MaintenanceSteps';
import PropertyBreadcrumb from './PropertyBreadcrumb';
import MaintenanceActions from './MaintenanceActions';
import PropertySearchStep from '../properties/PropertySearchStep';
import SuiteSelectionStep from '../properties/SuiteSelectionStep';
import MaintenanceRecordForm from './MaintenanceRecordForm';
import MaintenanceChecklist from './MaintenanceChecklist';
import MaintenanceHistory from './MaintenanceHistory';
import ManageHVACUnitsSection from '../hvac/ManageHVACUnitsSection';
import AddHVACModal from '../hvac/AddHVACModal';
import MaintenanceModeToggle from './MaintenanceModeToggle';
import Card from '../common/Card';
import { ArrowLeft, Wrench, Building, MapPin } from 'lucide-react';

// ✅ UPDATED: Accept navigationData prop to pre-populate selections
const MaintenanceForm = ({ onNavigate, navigationData }) => {
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

  // ✅ NEW: Check if we have pre-selected data from HVAC dashboard
  const hasPreselectedData = navigationData?.selectedProperty && navigationData?.selectedSuite;
  const preselectedUnit = navigationData?.selectedUnit;

  // Fetch properties from backend
  useEffect(() => {
    fetch("/api/properties")
      .then(res => res.json())
      .then(data => {
        setProperties(data);
        
        // ✅ NEW: If we have pre-selected data, set it after properties are loaded
        if (hasPreselectedData && navigationData.selectedProperty) {
          setSelectedProperty(navigationData.selectedProperty);
          setSelectedSuite(navigationData.selectedSuite);
          if (preselectedUnit) {
            setSelectedUnit(preselectedUnit.toString());
          }
        }
      })
      .catch(err => console.error("Failed to fetch properties", err));
  }, [hasPreselectedData, navigationData]);

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

  // Filter properties based on search
  const filteredProperties = properties.filter(property =>
    property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setSelectedSuite(null);
    setSelectedUnit('');
  };

  const handleSuiteSelect = (suite) => {
    setSelectedSuite(suite);
    setSelectedUnit('');
  };

  // Save maintenance record
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit) {
      setFormError('Please select an HVAC unit.');
      return;
    }
    if (!maintenanceNote.trim()) {
      setFormError('Please enter maintenance notes.');
      return;
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hvacUnitId: Number(selectedUnit),
          notes: maintenanceNote,
          maintenanceType: maintenanceType || 'MAINTENANCE',
          createdAt: serviceDate,
        }),
      });

      if (response.ok) {
        const newLog = await response.json();
        setSubmitStatus("Maintenance record saved successfully!");
        setMaintenanceNote("");
        setMaintenanceType("");
        
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

  const handleChecklistComplete = (savedLog) => {
    setMaintenanceLogs(logs => [savedLog, ...logs]);
    
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
  };

  // ✅ NEW: Handle going back to HVAC dashboard
  const handleBackToHVAC = () => {
    if (onNavigate) {
      onNavigate('hvac');
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      <MaintenanceHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ✅ NEW: Show context breadcrumb when coming from HVAC dashboard */}
        {hasPreselectedData && (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToHVAC}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to HVAC Dashboard
                  </button>
                  
                  <div className="h-6 w-px bg-gray-300"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {selectedProperty?.name || selectedProperty?.address}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {selectedSuite?.name || `Suite ${selectedSuite?.id}`}
                      </span>
                    </div>
                    
                    {preselectedUnit && (
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {selectedSuite?.hvacUnits?.find(u => u.id == preselectedUnit)?.label || 
                           selectedSuite?.hvacUnits?.find(u => u.id == preselectedUnit)?.serialNumber || 
                           `Unit ${preselectedUnit}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Maintenance for selected HVAC unit
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: Only show steps if not coming from HVAC dashboard */}
        {!hasPreselectedData && (
          <MaintenanceSteps 
            selectedProperty={selectedProperty}
            selectedSuite={selectedSuite}
          />
        )}

        {/* ✅ UPDATED: Skip property/suite selection if pre-selected from HVAC dashboard */}
        {!selectedProperty && !hasPreselectedData ? (
          <PropertySearchStep
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredProperties={filteredProperties}
            handlePropertySelect={handlePropertySelect}
            properties={properties}
            setProperties={setProperties}
          />
        ) : (!selectedSuite && !hasPreselectedData) ? (
          <Card variant="glass" padding="md" className="max-w-4xl mx-auto">
            <SuiteSelectionStep
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
              handleSuiteSelect={handleSuiteSelect}
            />
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* ✅ UPDATED: Only show breadcrumb if not coming from HVAC dashboard */}
            {!hasPreselectedData && (
              <PropertyBreadcrumb 
                selectedProperty={selectedProperty}
                selectedSuite={selectedSuite}
                onBackToSuites={() => setSelectedSuite(null)}
                onChangeProperty={() => setSelectedProperty(null)}
              />
            )}

            <Card variant="glass" padding="sm">
              <MaintenanceModeToggle mode={mode} setMode={setMode} />
            </Card>

            {mode === 'quick' ? (
              <Card variant="glass" padding="md">
                <MaintenanceRecordForm 
                  selectedSuite={selectedSuite}
                  selectedUnit={selectedUnit}
                  setSelectedUnit={setSelectedUnit}
                  maintenanceNote={maintenanceNote}
                  setMaintenanceNote={setMaintenanceNote}
                  maintenanceType={maintenanceType}
                  setMaintenanceType={setMaintenanceType}
                  serviceDate={serviceDate}
                  setServiceDate={setServiceDate}
                  handleMaintenanceSubmit={handleMaintenanceSubmit}
                  submitStatus={submitStatus}
                  formError={formError}
                  setShowAddHVAC={setShowAddHVAC}
                  photoFiles={photoFiles}
                  setPhotoFiles={setPhotoFiles}
                  uploadStatus={uploadStatus}
                />
              </Card>
            ) : (
              <Card variant="glass" padding="md">
                <MaintenanceChecklist 
                  selectedSuite={selectedSuite}
                  selectedUnit={selectedUnit}
                  setSelectedUnit={setSelectedUnit}
                  onChecklistComplete={handleChecklistComplete}
                  setShowAddHVAC={setShowAddHVAC}
                  submitStatus={submitStatus}
                  setSubmitStatus={setSubmitStatus}
                />
              </Card>
            )}

            <Card variant="glass" padding="md">
              <MaintenanceHistory 
                maintenanceLogs={maintenanceLogs}
                selectedUnit={selectedUnit}
                onDownloadReport={downloadReport}
              />
            </Card>

            <Card variant="glass" padding="md">
              <ManageHVACUnitsSection 
                selectedSuite={selectedSuite}
                onUnitUpdate={handleHVACUnitUpdate}
              />
            </Card>
          </div>
        )}
      </div>

      <AddHVACModal 
        isOpen={showAddHVAC}
        onClose={() => setShowAddHVAC(false)}
        onSubmit={handleAddHVAC}
        newUnit={newUnit}
        setNewUnit={setNewUnit}
        addHVACStatus={addHVACStatus}
      />
    </div>
  );
};

export default MaintenanceForm;
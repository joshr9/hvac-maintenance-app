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
import { ArrowLeft } from 'lucide-react';

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

  const handleChecklistComplete = (savedLog) => {
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
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      <MaintenanceHeader />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <MaintenanceSteps 
          selectedProperty={selectedProperty}
          selectedSuite={selectedSuite}
        />

        {!selectedProperty ? (
          <PropertySearchStep
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredProperties={filteredProperties}
            handlePropertySelect={handlePropertySelect}
            properties={properties}
            setProperties={setProperties}
          />
        ) : !selectedSuite ? (
          <Card variant="glass" padding="md" className="max-w-4xl mx-auto">
            <SuiteSelectionStep
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
              handleSuiteSelect={handleSuiteSelect}
            />
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <PropertyBreadcrumb 
              selectedProperty={selectedProperty}
              selectedSuite={selectedSuite}
              onBackToSuites={() => setSelectedSuite(null)}
              onChangeProperty={() => setSelectedProperty(null)}
            />

            <Card variant="glass" padding="sm">
              <MaintenanceModeToggle mode={mode} setMode={setMode} />
            </Card>

            {mode === 'quick' ? (
              <>
                <Card variant="glass" padding="md">
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
                </Card>

                {selectedSuite.hvacUnits && selectedSuite.hvacUnits.length > 0 && (
                  <Card variant="glass" padding="md">
                    <ManageHVACUnitsSection
                      hvacUnits={selectedSuite.hvacUnits}
                      onUnitUpdate={handleHVACUnitUpdate}
                    />
                  </Card>
                )}

                <MaintenanceActions onDownloadReport={downloadReport} />

                <Card variant="glass" padding="md">
                  <MaintenanceHistory
                    maintenanceLogs={maintenanceLogs}
                    selectedUnit={selectedUnit}
                  />
                </Card>
              </>
            ) : (
              <Card variant="glass" padding="md">
                <MaintenanceChecklist 
                  selectedSuite={selectedSuite}
                  selectedUnit={selectedUnit}
                  setSelectedUnit={setSelectedUnit}
                  setShowAddHVAC={setShowAddHVAC}
                  submitStatus={submitStatus}
                  setSubmitStatus={setSubmitStatus}
                  onChecklistComplete={handleChecklistComplete}
                />
              </Card>
            )}
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

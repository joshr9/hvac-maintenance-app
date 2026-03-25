// MaintenanceForm.jsx — orchestrates the full maintenance logging flow
// When navigated from HVAC page: native full-screen quick log
// When navigated manually: 3-step wizard (property → suite → form)

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import MaintenanceSteps from './MaintenanceSteps';
import PropertySearchStep from '../properties/PropertySearchStep';
import SuiteSelectionStep from '../properties/SuiteSelectionStep';
import MaintenanceRecordForm from './MaintenanceRecordForm';
import MaintenanceChecklist from './MaintenanceChecklist';
import MaintenanceHistory from './MaintenanceHistory';
import ManageHVACUnitsSection from '../hvac/ManageHVACUnitsSection';
import AddHVACModal from '../hvac/AddHVACModal';
import MaintenanceModeToggle from './MaintenanceModeToggle';
import Card from '../common/Card';
import PropertyBreadcrumb from './PropertyBreadcrumb';
import JobberAttachSheet from '../jobber/JobberAttachSheet';

const MaintenanceForm = ({ onNavigate, navigationData }) => {
  const { user: clerkUser } = useUser();

  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('');

  const [submitStatus, setSubmitStatus] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formError, setFormError] = useState('');

  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddHVAC, setShowAddHVAC] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', serialNumber: '', model: '', installDate: '', filterSize: '', notes: '' });
  const [addHVACStatus, setAddHVACStatus] = useState('');
  const [mode, setMode] = useState('quick');

  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  // Jobber attach sheet
  const [jobberLog, setJobberLog] = useState(null); // { id, maintenanceType, notes, techName, serviceDate }

  // Pre-selection from HVAC dashboard
  const skipWizard = navigationData?.skipPropertySelection === true;
  const hasPreselectedData = skipWizard && !!navigationData?.selectedProperty && !!navigationData?.selectedSuite;
  const preselectedUnit = navigationData?.selectedUnit;
  const openPhotoSection = navigationData?.openPhotoSection === true;

  // Apply pre-selected data from HVAC page navigation
  useEffect(() => {
    if (hasPreselectedData) {
      setSelectedProperty(navigationData.selectedProperty);
      setSelectedSuite(navigationData.selectedSuite);
      if (navigationData.selectedUnit) {
        setSelectedUnit(navigationData.selectedUnit.toString());
      }
    }
  }, [hasPreselectedData, navigationData]);

  // Load all properties for wizard mode
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/properties`)
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error('Failed to fetch properties', err));
  }, []);

  // Load maintenance logs when suite is selected
  useEffect(() => {
    if (!selectedSuite) {
      setMaintenanceLogs([]);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/maintenance-logs/suite/${selectedSuite.id}`)
      .then(res => res.json())
      .then(data => setMaintenanceLogs(
        Array.isArray(data)
          ? data.map(log => ({ ...log, photos: Array.isArray(log.photos) ? log.photos : [] }))
          : []
      ))
      .catch(() => setMaintenanceLogs([]));
  }, [selectedSuite]);

  const filteredProperties = properties.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const refreshLogs = () => {
    if (!selectedSuite) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/maintenance-logs/suite/${selectedSuite.id}`)
      .then(res => res.json())
      .then(data => setMaintenanceLogs(
        Array.isArray(data)
          ? data.map(log => ({ ...log, photos: Array.isArray(log.photos) ? log.photos : [] }))
          : []
      ))
      .catch(() => {});
  };

  // Resolve Clerk user → DB technician id (create if new)
  const getTechnicianId = async () => {
    if (!clerkUser) throw new Error('User not logged in');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl}/api/team-members`);
    const technicians = await response.json();
    const existing = technicians.find(t => t.email === clerkUser.primaryEmailAddress?.emailAddress);
    if (existing) return existing.id;
    const created = await fetch(`${apiUrl}/api/team-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        role: 'TECHNICIAN',
      }),
    }).then(r => r.json());
    return created.id;
  };

  const handlePhotoUpload = async (logId) => {
    if (!photoFiles.length || !logId) return;
    setUploadStatus('Uploading photos...');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append('photo', file);
      await fetch(`${apiUrl}/api/maintenance-logs/${logId}/photos`, {
        method: 'POST',
        body: formData,
      });
    }
    setUploadStatus('Photos uploaded');
    setPhotoFiles([]);
    setTimeout(() => setUploadStatus(''), 2000);
    refreshLogs();
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitError('');

    if (!selectedUnit) {
      setFormError('Please select an HVAC unit.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const technicianId = await getTechnicianId();

      const response = await fetch(`${apiUrl}/api/maintenance-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hvacUnitId: Number(selectedUnit),
          technicianId,
          notes: maintenanceNote || '',
          maintenanceType: maintenanceType || 'MAINTENANCE',
          status: 'COMPLETED',
          createdAt: serviceDate,
        }),
      });

      if (response.ok) {
        const newLog = await response.json();
        setSubmitStatus('Logged successfully');
        setMaintenanceNote('');
        setMaintenanceType('');

        if (photoFiles.length > 0) {
          await handlePhotoUpload(newLog.id);
        }

        refreshLogs();

        // Show Jobber attach sheet
        setJobberLog({
          id: newLog.id,
          maintenanceType: maintenanceType,
          notes: maintenanceNote,
          techName: clerkUser?.fullName || clerkUser?.firstName || '',
          serviceDate,
        });

        setTimeout(() => setSubmitStatus(''), 4000);
      } else {
        const err = await response.json();
        setSubmitError(err?.error || 'Error saving record. Please try again.');
      }
    } catch (err) {
      setSubmitError('Network error. Check your connection.');
      console.error(err);
    }
  };

  const handleChecklistComplete = (savedLog) => {
    refreshLogs();
    setJobberLog({
      id: savedLog.id,
      maintenanceType: 'PREVENTIVE_MAINTENANCE',
      notes: savedLog.notes || '',
      techName: clerkUser?.fullName || clerkUser?.firstName || '',
      serviceDate: savedLog.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
  };

  const handleAddHVAC = async (e) => {
    e.preventDefault();
    setAddHVACStatus('Saving...');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/hvac-units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUnit, suiteId: selectedSuite.id }),
      });
      if (res.ok) {
        const added = await res.json();
        setAddHVACStatus('Added!');
        setShowAddHVAC(false);
        setNewUnit({ name: '', serialNumber: '', model: '', installDate: '', filterSize: '', notes: '' });
        setSelectedSuite(suite => ({
          ...suite,
          hvacUnits: suite.hvacUnits ? [...suite.hvacUnits, added] : [added],
        }));
      } else {
        const errMsg = (await res.json())?.message || 'Failed to add unit.';
        setAddHVACStatus(errMsg);
      }
    } catch {
      setAddHVACStatus('Network error.');
    }
  };

  const handleHVACUnitUpdate = (updatedUnit) => {
    setSelectedSuite(suite => ({
      ...suite,
      hvacUnits: suite.hvacUnits.map(u => u.id === updatedUnit.id ? { ...u, ...updatedUnit } : u),
    }));
  };

  const downloadReport = async () => {
    if (!selectedSuite) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/maintenance-logs/report?suiteId=${selectedSuite.id}`);
    if (!res.ok) { alert('Failed to download report'); return; }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-${selectedSuite.name || selectedSuite.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBackToHVAC = () => onNavigate?.('hvac');

  // Derived unit data for display
  const unitData = selectedSuite?.hvacUnits?.find(u => String(u.id) === String(selectedUnit)) || null;
  const unitLabel = unitData?.label || unitData?.serialNumber || (preselectedUnit ? `Unit ${preselectedUnit}` : '');
  const propertyName = selectedProperty?.name || selectedProperty?.address || '';
  const suiteName = selectedSuite?.name || (selectedSuite ? `Suite ${selectedSuite.id}` : '');

  // ─────────────────────────────────────────────────────────────
  // PRESELECTED FLOW — native screen layout
  // ─────────────────────────────────────────────────────────────
  if (hasPreselectedData && selectedSuite) {
    return (
      <div className="min-h-screen bg-[#F2F2F7]">

        {/* Sticky header: back + unit identity */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <button
              onClick={handleBackToHVAC}
              className="flex items-center gap-1.5 text-[15px] font-medium text-blue-500 active:opacity-70 transition-opacity flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              HVAC
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-bold text-gray-900 truncate leading-tight">
                {unitLabel}
              </h1>
              <p className="text-[13px] text-gray-400 truncate">
                {propertyName}{suiteName ? ` · ${suiteName}` : ''}
              </p>
            </div>

            {/* History toggle */}
            {maintenanceLogs.length > 0 && (
              <button
                onClick={() => setShowHistory(h => !h)}
                className="flex items-center gap-1 text-[13px] text-gray-500 flex-shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{maintenanceLogs.length}</span>
              </button>
            )}
          </div>

          {/* Mode toggle */}
          <div className="px-4 pb-3">
            <MaintenanceModeToggle mode={mode} setMode={setMode} />
          </div>
        </div>

        {/* Form area */}
        <div className="px-4 pt-5 pb-10 max-w-2xl mx-auto">
          {mode === 'quick' ? (
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
              submitError={submitError}
              handleSubmit={handleMaintenanceSubmit}
              setShowAddHVAC={setShowAddHVAC}
              openPhotoSection={openPhotoSection}
              unitData={unitData}
            />
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
        </div>

        {/* History — collapsible, shown on demand */}
        {maintenanceLogs.length > 0 && (
          <div className="px-4 pb-10 max-w-2xl mx-auto">
            <button
              onClick={() => setShowHistory(h => !h)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-[14px] font-semibold text-gray-700"
            >
              <span>
                {maintenanceLogs.length} previous log{maintenanceLogs.length !== 1 ? 's' : ''}
              </span>
              {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showHistory && (
              <div className="mt-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <MaintenanceHistory
                  maintenanceLogs={maintenanceLogs}
                  selectedUnit={selectedUnit}
                  onDownloadReport={downloadReport}
                />
              </div>
            )}
          </div>
        )}

        <AddHVACModal
          showAddHVAC={showAddHVAC}
          setShowAddHVAC={setShowAddHVAC}
          handleAddHVAC={handleAddHVAC}
          newUnit={newUnit}
          setNewUnit={setNewUnit}
          addHVACStatus={addHVACStatus}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // WIZARD FLOW — property → suite → form
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {!selectedProperty ? (
          <>
            <MaintenanceSteps selectedProperty={null} selectedSuite={null} />
            <PropertySearchStep
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredProperties={filteredProperties}
              handlePropertySelect={handlePropertySelect}
              properties={properties}
              setProperties={setProperties}
            />
          </>
        ) : !selectedSuite ? (
          <>
            <MaintenanceSteps selectedProperty={selectedProperty} selectedSuite={null} />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <SuiteSelectionStep
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
                handleSuiteSelect={handleSuiteSelect}
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <PropertyBreadcrumb
              selectedProperty={selectedProperty}
              selectedSuite={selectedSuite}
              onBackToSuites={() => setSelectedSuite(null)}
              onChangeProperty={() => setSelectedProperty(null)}
            />

            <MaintenanceModeToggle mode={mode} setMode={setMode} />

            {mode === 'quick' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
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
                  submitError={submitError}
                  handleSubmit={handleMaintenanceSubmit}
                  setShowAddHVAC={setShowAddHVAC}
                  openPhotoSection={openPhotoSection}
                  unitData={unitData}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <MaintenanceChecklist
                  selectedSuite={selectedSuite}
                  selectedUnit={selectedUnit}
                  setSelectedUnit={setSelectedUnit}
                  onChecklistComplete={handleChecklistComplete}
                  setShowAddHVAC={setShowAddHVAC}
                  submitStatus={submitStatus}
                  setSubmitStatus={setSubmitStatus}
                />
              </div>
            )}

            {/* History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MaintenanceHistory
                maintenanceLogs={maintenanceLogs}
                selectedUnit={selectedUnit}
                onDownloadReport={downloadReport}
              />
            </div>

            {/* HVAC unit management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <ManageHVACUnitsSection
                hvacUnits={selectedSuite?.hvacUnits || []}
                onUnitUpdate={handleHVACUnitUpdate}
              />
            </div>
          </div>
        )}
      </div>

      <AddHVACModal
        showAddHVAC={showAddHVAC}
        setShowAddHVAC={setShowAddHVAC}
        handleAddHVAC={handleAddHVAC}
        newUnit={newUnit}
        setNewUnit={setNewUnit}
        addHVACStatus={addHVACStatus}
      />

      {jobberLog && (
        <JobberAttachSheet
          logId={jobberLog.id}
          maintenanceType={jobberLog.maintenanceType}
          notes={jobberLog.notes}
          techName={jobberLog.techName}
          serviceDate={jobberLog.serviceDate}
          onClose={() => setJobberLog(null)}
        />
      )}
    </div>
  );
};

export default MaintenanceForm;

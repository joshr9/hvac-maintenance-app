// MaintenanceChecklist.jsx - Mobile-Optimized (Preserving ALL Your Structure & Logic)
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { FileText, CheckCircle, AlertTriangle, Camera, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

// ✅ MOBILE INPUT COMPONENT - Moved outside to prevent re-creation
const MobileInput = ({ label, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="space-y-2">
    <label className="block text-base font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[56px]"
      style={{'--tw-ring-color': '#2a3a91'}}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// ✅ MOBILE TEXTAREA COMPONENT - Moved outside to prevent re-creation
const MobileTextarea = ({ label, value, onChange, placeholder, required = false }) => (
  <div className="space-y-2">
    <label className="block text-base font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[120px] resize-y"
      style={{'--tw-ring-color': '#2a3a91'}}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={4}
    />
  </div>
);

const MaintenanceChecklist = ({
  selectedSuite,
  selectedUnit,
  setSelectedUnit,
  onChecklistComplete,
  setShowAddHVAC,
  submitStatus,
  setSubmitStatus
}) => {
  const { user: clerkUser } = useUser();
  const [checklistData, setChecklistData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    serviceTechnician: '',
    specialNotes: '',
    
    fans: {
      checkReplaceFilters: false,
      lubricateBearings: false,
      checkFanWheelShaft: false,
      inspectCondensatePan: false,
      checkBeltsAndPulleys: false,
      beltSize: '',
      checkEconomizerOperation: false,
      outdoorFanAmps: { amp1: '', amp2: '', amp3: '' },
      outdoorNamePlateAmps: { amp1: '', amp2: '', amp3: '' },
      indoorFanAmps: { amp1: '', amp2: '', amp3: '' },
      indoorNamePlateAmps: { amp1: '', amp2: '', amp3: '' }
    },
    
    coolingSeason: {
      checkDischargePressure: false,
      dischargePress: '',
      suctionPress: '',
      pressureNotes: '',
      checkSuctionLineTemp: false,
      inspectMotorContacts: false,
      visualCheckRefrigerantLeaks: false,
      checkCondenserHailDamage: false,
      checkCrankCaseHeater: false,
      compressorVolts: { volt1: '', volt2: '' },
      compressorNamePlateVolts: { volt1: '', volt2: '' },
      compressorAmps: { amp1: '', amp2: '' },
      compressorNamePlateAmps: { amp1: '', amp2: '' }
    },
    
    heatingSeason: {
      checkHighLimitCutOut: false,
      checkFanLimitControl: false,
      checkBurnerCorrosion: false,
      checkCombustionBlower: false,
      checkPilotAssembly: false,
      checkGasLeaks: false,
      checkFlueBlockage: false
    },
    
    filterList: selectedSuite?.hvacUnits?.find(u => u.id == selectedUnit)?.filterSize || '',
    problemsFound: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [sectionPhotos, setSectionPhotos] = useState({
    fans: [],
    coolingSeason: [],
    heatingSeason: [],
    general: []
  });
  const [photoUploadStatus, setPhotoUploadStatus] = useState('');

  // ✅ NEW: Collapsible sections state (all expanded by default)
  const [expandedSections, setExpandedSections] = useState({
    unitSelection: true,
    serviceInfo: true,
    fans: true,
    cooling: true,
    heating: true,
    filterList: true,
    problems: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (section, field, value) => {
    setChecklistData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleInputChange = (section, field, value) => {
    setChecklistData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleTopLevelChange = (field, value) => {
    setChecklistData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionPhotoAdd = (section, files) => {
    const newPhotos = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setSectionPhotos(prev => ({
      ...prev,
      [section]: [...prev[section], ...newPhotos]
    }));
  };

  const handlePhotoRemove = (section, photoId) => {
    setSectionPhotos(prev => ({
      ...prev,
      [section]: prev[section].filter(photo => photo.id !== photoId)
    }));
  };

  const uploadSectionPhotos = async (logId) => {
    setPhotoUploadStatus("Uploading photos...");
    
    try {
      const allPhotos = [
        ...sectionPhotos.fans, 
        ...sectionPhotos.coolingSeason, 
        ...sectionPhotos.heatingSeason, 
        ...sectionPhotos.general
      ];
      
      for (let photo of allPhotos) {
        const formData = new FormData();
        formData.append('photo', photo.file);
        
        await fetch(`/api/maintenance/${logId}/photos`, {
          method: "POST",
          body: formData,
        });
      }
      
      setPhotoUploadStatus(`${allPhotos.length} photos uploaded successfully!`);
      setTimeout(() => setPhotoUploadStatus(""), 2000);
    } catch (error) {
      console.error('Error uploading photos:', error);
      setPhotoUploadStatus("Error uploading photos");
    }
  };

  const calculateCompletionPercentage = () => {
    const allChecks = [
      ...Object.values(checklistData.fans).filter(v => typeof v === 'boolean'),
      ...Object.values(checklistData.coolingSeason).filter(v => typeof v === 'boolean'),
      ...Object.values(checklistData.heatingSeason).filter(v => typeof v === 'boolean')
    ];

    const completedChecks = allChecks.filter(Boolean).length;
    return Math.round((completedChecks / allChecks.length) * 100);
  };

  // Get or create technician in database from Clerk user
  const getTechnicianId = async () => {
    if (!clerkUser) {
      throw new Error('User not logged in');
    }

    const apiUrl = import.meta.env.VITE_API_URL || '';

    // Try to find existing user by email
    const response = await fetch(`${apiUrl}/api/team-members`);
    const technicians = await response.json();

    const existingTech = technicians.find(t =>
      t.email === clerkUser.primaryEmailAddress?.emailAddress
    );

    if (existingTech) {
      return existingTech.id;
    }

    // If not found, create new technician
    const createResponse = await fetch(`${apiUrl}/api/team-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        role: 'TECHNICIAN'
      })
    });

    const newTech = await createResponse.json();
    return newTech.id;
  };

  const handleSubmit = async () => {
    setFormError('');
    
    if (!selectedSuite) {
      setFormError('No suite selected.');
      return;
    }
    if (!selectedUnit) {
      setFormError('Please select an HVAC unit.');
      return;
    }
    if (!checklistData.serviceTechnician) {
      setFormError('Please enter technician name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // Get technician ID from logged-in Clerk user
      const technicianId = await getTechnicianId();

      const maintenanceLogPayload = {
        hvacUnitId: Number(selectedUnit),
        technicianId: technicianId,
        notes: checklistData.problemsFound || 'Full inspection checklist completed',
        maintenanceType: 'FULL_INSPECTION_CHECKLIST',
        status: 'COMPLETED',
        createdAt: checklistData.serviceDate,
        checklistData: {
          fans: checklistData.fans,
          coolingSeason: checklistData.coolingSeason,
          heatingSeason: checklistData.heatingSeason,
          filterList: checklistData.filterList,
          completionPercentage: calculateCompletionPercentage()
        },
        serviceTechnician: checklistData.serviceTechnician,
        specialNotes: checklistData.specialNotes
      };

      const logResponse = await fetch(`${apiUrl}/api/maintenance-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceLogPayload),
      });

      if (!logResponse.ok) {
        throw new Error('Failed to create maintenance log');
      }

      const savedLog = await logResponse.json();
      
      const totalPhotos = sectionPhotos.fans.length + sectionPhotos.coolingSeason.length + 
                         sectionPhotos.heatingSeason.length + sectionPhotos.general.length;
      
      if (totalPhotos > 0) {
        await uploadSectionPhotos(savedLog.id);
      }
      
      setSubmitStatus('Full inspection checklist saved successfully!');
      
      if (onChecklistComplete) {
        onChecklistComplete(savedLog);
      }
      
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      console.error('Error saving checklist:', error);
      setFormError('Failed to save checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ COLLAPSIBLE SECTION HEADER
  const CollapsibleSection = ({ title, sectionKey, children, color = "blue" }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full bg-${color}-600`}></div>
            {title}
          </h3>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="p-6 pt-0 border-t-2 border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  // ✅ MOBILE CHECKBOX COMPONENT - 44px Touch Target
  const MobileCheckbox = ({ section, field, label, checked }) => (
    <label className="flex items-start gap-4 p-4 hover:bg-blue-50 rounded-xl transition-colors active:bg-blue-100 cursor-pointer">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          className="w-7 h-7 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
          style={{accentColor: '#2a3a91'}}
          checked={checked}
          onChange={(e) => handleCheckboxChange(section, field, e.target.checked)}
        />
        {checked && (
          <Check className="absolute inset-0 w-5 h-5 m-1 text-white pointer-events-none" />
        )}
      </div>
      <span className="text-base font-medium text-gray-700 leading-relaxed select-none flex-1">
        {label}
      </span>
    </label>
  );

  // ✅ MOBILE PHOTO SECTION
  const MobilePhotoSection = ({ sectionKey, sectionTitle, photos }) => {
    const fileInputRef = React.useRef(null);
    
    const handleFileChange = (e) => {
      if (e.target.files.length > 0) {
        handleSectionPhotoAdd(sectionKey, e.target.files);
        e.target.value = '';
      }
    };

    return (
      <div className="mt-6 p-5 bg-blue-50 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-semibold text-gray-700 flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-600" />
            {sectionTitle} Photos
          </h5>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-3 text-base font-medium rounded-xl text-white hover:opacity-90 transition-colors active:scale-95 min-h-[48px]"
            style={{backgroundColor: '#2a3a91'}}
          >
            <Camera className="w-5 h-5" />
            Add Photo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-white shadow-sm">
                <img
                  src={photo.url}
                  alt="Maintenance"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(sectionKey, photo.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ✅ MOBILE HEADER - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">HVAC Maintenance Checklist</h2>
            <p className="text-gray-600 mt-1">Complete inspection and maintenance tasks</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 mt-4">
          <div 
            className="bg-green-500 rounded-full h-3 transition-all duration-500"
            style={{ width: `${calculateCompletionPercentage()}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 text-center mt-2">
          {calculateCompletionPercentage()}% Complete
        </p>
      </div>

      <div className="space-y-8 p-4 pb-32">
        {/* ✅ ERROR DISPLAY */}
        {formError && (
          <div className="p-5 bg-red-50 border-l-4 border-red-400 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <p className="text-red-700 font-medium text-base">{formError}</p>
            </div>
          </div>
        )}

        {/* ✅ SUCCESS STATUS */}
        {submitStatus && (
          <div className="p-5 bg-green-50 border-l-4 border-green-400 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <p className="text-green-700 font-medium text-base">{submitStatus}</p>
            </div>
          </div>
        )}

        {/* ✅ HVAC UNIT SELECTION */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-5">HVAC Unit Selection</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-700">
                Select HVAC Unit <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 min-h-[56px]"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                required
              >
                <option value="">Select HVAC Unit...</option>
                {selectedSuite?.hvacUnits?.length > 0 ? (
                  selectedSuite.hvacUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.label || unit.serialNumber || unit.filterSize || `Unit ${unit.id}`}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No HVAC units found. Please add one.</option>
                )}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAddHVAC(true)}
              className="w-full py-4 px-6 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[56px]"
            >
              Add New HVAC Unit
            </button>
          </div>
        </div>

        {/* ✅ SERVICE INFORMATION */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Service Information</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <MobileInput
                label="Service Date"
                type="date"
                value={checklistData.serviceDate}
                onChange={(val) => handleTopLevelChange('serviceDate', val)}
                required
              />
              
              <MobileInput
                label="Service Technician"
                value={checklistData.serviceTechnician}
                onChange={(val) => handleTopLevelChange('serviceTechnician', val)}
                placeholder="Enter technician name"
                required
              />
            </div>
            
            <MobileInput
              label="Special Notes"
              value={checklistData.specialNotes}
              onChange={(val) => handleTopLevelChange('specialNotes', val)}
              placeholder="Any special observations or instructions"
            />
          </div>
        </div>

        {/* ✅ FANS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
            FANS
          </h3>
          
          <div className="space-y-2">
            <MobileCheckbox
              section="fans"
              field="checkReplaceFilters"
              label="CHECK/REPLACE AIR FILTERS"
              checked={checklistData.fans.checkReplaceFilters}
            />
            <MobileCheckbox
              section="fans"
              field="lubricateBearings"
              label="LUBRICATE BEARINGS"
              checked={checklistData.fans.lubricateBearings}
            />
            <MobileCheckbox
              section="fans"
              field="checkFanWheelShaft"
              label="CHECK FAN WHEEL SHAFT"
              checked={checklistData.fans.checkFanWheelShaft}
            />
            <MobileCheckbox
              section="fans"
              field="inspectCondensatePan"
              label="INSPECT CONDENSATE PAN AND DRAIN LINE"
              checked={checklistData.fans.inspectCondensatePan}
            />
            <MobileCheckbox
              section="fans"
              field="checkEconomizerOperation"
              label="CHECK ECONOMIZER OPERATION"
              checked={checklistData.fans.checkEconomizerOperation}
            />
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <MobileInput
              label="Belt Size (if applicable)"
              value={checklistData.fans.beltSize}
              onChange={(val) => handleInputChange('fans', 'beltSize', val)}
              placeholder="e.g., A-42 or 4L420"
            />
          </div>

          <MobilePhotoSection
            sectionKey="fans"
            sectionTitle="Fans"
            photos={sectionPhotos.fans}
          />
        </div>

        {/* ✅ COOLING SEASON SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
            COOLING SEASON
          </h3>
          
          <div className="space-y-2">
            <MobileCheckbox
              section="coolingSeason"
              field="checkDischargePressure"
              label="CHECK DISCHARGE PRESSURE"
              checked={checklistData.coolingSeason.checkDischargePressure}
            />
            <MobileCheckbox
              section="coolingSeason"
              field="checkSuctionLineTemp"
              label="CHECK SUCTION LINE TEMPERATURE"
              checked={checklistData.coolingSeason.checkSuctionLineTemp}
            />
            <MobileCheckbox
              section="coolingSeason"
              field="inspectMotorContacts"
              label="INSPECT MOTOR CONTACTS"
              checked={checklistData.coolingSeason.inspectMotorContacts}
            />
            <MobileCheckbox
              section="coolingSeason"
              field="visualCheckRefrigerantLeaks"
              label="VISUAL CHECK FOR REFRIGERANT LEAKS"
              checked={checklistData.coolingSeason.visualCheckRefrigerantLeaks}
            />
            <MobileCheckbox
              section="coolingSeason"
              field="checkCondenserHailDamage"
              label="CHECK CONDENSER FOR HAIL DAMAGE"
              checked={checklistData.coolingSeason.checkCondenserHailDamage}
            />
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MobileInput
                label="Discharge Pressure"
                value={checklistData.coolingSeason.dischargePress}
                onChange={(val) => handleInputChange('coolingSeason', 'dischargePress', val)}
                placeholder="PSI"
              />
              <MobileInput
                label="Suction Pressure"
                value={checklistData.coolingSeason.suctionPress}
                onChange={(val) => handleInputChange('coolingSeason', 'suctionPress', val)}
                placeholder="PSI"
              />
            </div>
          </div>

          <MobilePhotoSection
            sectionKey="coolingSeason"
            sectionTitle="Cooling Season"
            photos={sectionPhotos.coolingSeason}
          />
        </div>

        {/* ✅ HEATING SEASON SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            HEATING SEASON
          </h3>
          
          <div className="space-y-2">
            <MobileCheckbox
              section="heatingSeason"
              field="checkHighLimitCutOut"
              label="CHECK HIGH LIMIT CUT OUT"
              checked={checklistData.heatingSeason.checkHighLimitCutOut}
            />
            <MobileCheckbox
              section="heatingSeason"
              field="checkFanLimitControl"
              label="CHECK FAN LIMIT CONTROL"
              checked={checklistData.heatingSeason.checkFanLimitControl}
            />
            <MobileCheckbox
              section="heatingSeason"
              field="checkBurnerCorrosion"
              label="CHECK BURNER FOR CORROSION"
              checked={checklistData.heatingSeason.checkBurnerCorrosion}
            />
            <MobileCheckbox
              section="heatingSeason"
              field="checkCombustionBlower"
              label="CHECK COMBUSTION BLOWER"
              checked={checklistData.heatingSeason.checkCombustionBlower}
            />
            <MobileCheckbox
              section="heatingSeason"
              field="checkPilotAssembly"
              label="CHECK PILOT ASSEMBLY AND SAFETY"
              checked={checklistData.heatingSeason.checkPilotAssembly}
            />
            <MobileCheckbox
              section="heatingSeason"
              field="checkGasLeaks"
              label="CHECK FOR GAS LEAKS"
              checked={checklistData.heatingSeason.checkGasLeaks}
            />
            <MobileCheckbox
              section="heatingSeason"
              field="checkFlueBlockage"
              label="CHECK FLUE FOR BLOCKAGE"
              checked={checklistData.heatingSeason.checkFlueBlockage}
            />
          </div>

          <MobilePhotoSection
            sectionKey="heatingSeason"
            sectionTitle="Heating Season"
            photos={sectionPhotos.heatingSeason}
          />
        </div>

        {/* ✅ FILTER AND PROBLEMS */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h3>
          
          <div className="space-y-6">
            <MobileInput
              label="Filter List"
              value={checklistData.filterList}
              onChange={(val) => handleTopLevelChange('filterList', val)}
              placeholder="e.g., (2) 16x25x2"
            />
            
            <MobileTextarea
              label="Problems Found / Additional Notes"
              value={checklistData.problemsFound}
              onChange={(val) => handleTopLevelChange('problemsFound', val)}
              placeholder="Describe any issues discovered, parts needed, or recommendations..."
            />
          </div>
        </div>
      </div>

      {/* ✅ SUBMIT BUTTON - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-5 px-6 font-bold text-lg rounded-2xl transition-all min-h-[64px] flex items-center justify-center gap-3 shadow-xl ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 active:scale-98'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Saving Checklist...
            </>
          ) : (
            <>
              <CheckCircle className="w-6 h-6" />
              Save Complete Checklist ({calculateCompletionPercentage()}% Complete)
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .active\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default MaintenanceChecklist;
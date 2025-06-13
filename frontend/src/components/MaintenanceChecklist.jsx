import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const MaintenanceChecklist = ({ 
  selectedSuite,
  selectedUnit,
  setSelectedUnit,
  onChecklistComplete,
  setShowAddHVAC,
  // Add these props to match your existing pattern
  submitStatus,
  setSubmitStatus
}) => {
  const [checklistData, setChecklistData] = useState({
    // Header info - pre-populate with current data
    serviceDate: new Date().toISOString().split('T')[0],
    serviceTechnician: '', // You could pass current user here
    specialNotes: '',
    
    // Fans section
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
    
    // Cooling season
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
    
    // Heating season
    heatingSeason: {
      checkHighLimitCutOut: false,
      checkFanLimitControl: false,
      checkBurnerCorrosion: false,
      checkCombustionBlower: false,
      checkPilotAssembly: false,
      checkGasLeaks: false,
      checkFlueBlockage: false
    },
    
    // Filter and problems - pre-populate with HVAC unit data
    filterList: selectedSuite?.hvacUnits?.find(u => u.id == selectedUnit)?.filterSize || '',
    problemsFound: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const allChecks = [
      ...Object.values(checklistData.fans).filter(v => typeof v === 'boolean'),
      ...Object.values(checklistData.coolingSeason).filter(v => typeof v === 'boolean'),
      ...Object.values(checklistData.heatingSeason).filter(v => typeof v === 'boolean')
    ];
    
    const completedChecks = allChecks.filter(Boolean).length;
    return Math.round((completedChecks / allChecks.length) * 100);
  };

  const handleSubmit = async () => {
    setFormError('');
    
    // Validation
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
      // Create maintenance log with embedded checklist data
      const maintenanceLogPayload = {
        hvacUnitId: Number(selectedUnit),
        technicianId: 1, // You might want to get this from your auth system
        notes: checklistData.problemsFound || 'Full inspection checklist completed',
        maintenanceType: 'FULL_INSPECTION_CHECKLIST',
        status: 'COMPLETED', 
        createdAt: checklistData.serviceDate,
        // Add checklist-specific fields
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

      const logResponse = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceLogPayload),
      });

      if (!logResponse.ok) {
        throw new Error('Failed to create maintenance log');
      }

      const savedLog = await logResponse.json();
      
      setSubmitStatus('Full inspection checklist saved successfully!');
      
      // Call parent callback if provided
      if (onChecklistComplete) {
        onChecklistComplete(savedLog);
      }

      // Reset form
      setChecklistData({
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
        filterList: '',
        problemsFound: ''
      });

    } catch (error) {
      console.error('Error saving checklist:', error);
      setFormError('Failed to save checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }

    // Clear status after 3 seconds
    setTimeout(() => setSubmitStatus(''), 3000);
  };

  const currentUnit = selectedSuite?.hvacUnits?.find(u => u.id == selectedUnit);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Mobile-optimized Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200 p-4 sm:relative sm:border-0 sm:bg-transparent sm:p-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
              <FileText className="w-5 h-5" style={{color: '#2a3a91'}} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Full Inspection</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentUnit?.label || currentUnit?.serialNumber || 'HVAC Unit'}
              </p>
            </div>
          </div>
          
          {selectedUnit && (
            <div className="text-right">
              <div className="text-lg font-bold" style={{color: '#2a3a91'}}>
                {calculateCompletionPercentage()}%
              </div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        {selectedUnit && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="h-2 rounded-full transition-all duration-300" 
              style={{
                backgroundColor: '#2a3a91',
                width: `${calculateCompletionPercentage()}%`
              }}
            ></div>
          </div>
        )}
      </div>

      {/* HVAC Unit Selection - matching your existing pattern */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          HVAC Unit
        </label>
        <div className="flex gap-3">
          <select
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
            style={{'--tw-ring-color': '#2a3a91'}}
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
            required
          >
            <option value="">Select HVAC unit...</option>
            {selectedSuite?.hvacUnits && selectedSuite.hvacUnits.length > 0 ? (
              selectedSuite.hvacUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.label || unit.serialNumber || unit.filterSize || `Unit ${unit.id}`}
                </option>
              ))
            ) : (
              <option value="" disabled>No HVAC units found. Please add one.</option>
            )}
          </select>
          <button
            className="px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors whitespace-nowrap"
            style={{backgroundColor: '#2a3a91'}}
            onClick={() => setShowAddHVAC(true)}
            type="button"
          >
            Add Unit
          </button>
        </div>
      </div>

      {/* Only show the rest of the form if a unit is selected */}
      {selectedUnit && (
        <>
          {/* Service Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={checklistData.serviceDate}
                onChange={e => handleTopLevelChange('serviceDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Technician *</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={checklistData.serviceTechnician}
                onChange={e => handleTopLevelChange('serviceTechnician', e.target.value)}
                placeholder="Technician name"
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Special Notes</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={checklistData.specialNotes}
                onChange={e => handleTopLevelChange('specialNotes', e.target.value)}
                placeholder="Any special notes or observations"
              />
            </div>
          </div>

          {/* FANS Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#2a3a91'}}></div>
              FANS
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'checkReplaceFilters', label: 'CHECK/REPLACE AIR FILTERS' },
                { key: 'lubricateBearings', label: 'LUBRICATE BEARINGS' },
                { key: 'checkFanWheelShaft', label: 'CHECK FAN WHEEL SHAFT' },
                { key: 'inspectCondensatePan', label: 'INSPECT CONDENSATE PAN AND DRAIN LINE' },
                { key: 'checkEconomizerOperation', label: 'CHECK ECONOMIZER OPERATION' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-gray-300"
                    style={{'accentColor': '#2a3a91'}}
                    checked={checklistData.fans[item.key]}
                    onChange={e => handleCheckboxChange('fans', item.key, e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
              
              {/* Mobile-optimized belt size input */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-6 h-6 sm:w-5 sm:h-5 rounded border-2 border-gray-300"
                    style={{'accentColor': '#2a3a91'}}
                    checked={checklistData.fans.checkBeltsAndPulleys}
                    onChange={e => handleCheckboxChange('fans', 'checkBeltsAndPulleys', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">CHECK BELTS AND PULLEYS</span>
                </label>
                <div className="flex items-center gap-2 ml-8 sm:ml-0">
                  <span className="text-sm text-gray-600">Belt Size:</span>
                  <input
                    type="text"
                    className="w-24 p-2 border border-gray-200 rounded text-sm"
                    value={checklistData.fans.beltSize}
                    onChange={e => handleInputChange('fans', 'beltSize', e.target.value)}
                    placeholder="AX38"
                  />
                </div>
              </div>

              {/* Mobile-optimized amps readings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">OUTDOOR FAN AMPS</h4>
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                    {['amp1', 'amp2', 'amp3'].map((amp, idx) => (
                      <div key={amp} className="flex items-center gap-2 sm:flex-col sm:flex-1">
                        <label className="text-sm text-gray-600 w-12 sm:w-auto">#{idx + 1}</label>
                        <input
                          type="text"
                          className="flex-1 sm:w-full p-2 border border-gray-200 rounded text-sm"
                          value={checklistData.fans.outdoorFanAmps[amp]}
                          onChange={e => handleInputChange('fans', 'outdoorFanAmps', {
                            ...checklistData.fans.outdoorFanAmps,
                            [amp]: e.target.value
                          })}
                          placeholder="0.0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">NAME PLATE AMPS</h4>
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                    {['amp1', 'amp2', 'amp3'].map((amp, idx) => (
                      <div key={amp} className="flex items-center gap-2 sm:flex-col sm:flex-1">
                        <label className="text-sm text-gray-600 w-12 sm:w-auto">#{idx + 1}</label>
                        <input
                          type="text"
                          className="flex-1 sm:w-full p-2 border border-gray-200 rounded text-sm"
                          value={checklistData.fans.outdoorNamePlateAmps[amp]}
                          onChange={e => handleInputChange('fans', 'outdoorNamePlateAmps', {
                            ...checklistData.fans.outdoorNamePlateAmps,
                            [amp]: e.target.value
                          })}
                          placeholder="0.0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COOLING SEASON Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#2a3a91'}}></div>
              COOLING SEASON
            </h3>
            
            <div className="space-y-3">
              {/* Pressure readings */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-gray-300"
                    style={{'accentColor': '#2a3a91'}}
                    checked={checklistData.coolingSeason.checkDischargePressure}
                    onChange={e => handleCheckboxChange('coolingSeason', 'checkDischargePressure', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">CHECK DISCHARGE PRESS. & SUCTION PRESS</span>
                </label>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-xs text-gray-600">Discharge Pressure</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded"
                      value={checklistData.coolingSeason.dischargePress}
                      onChange={e => handleInputChange('coolingSeason', 'dischargePress', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Suction Pressure</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded"
                      value={checklistData.coolingSeason.suctionPress}
                      onChange={e => handleInputChange('coolingSeason', 'suctionPress', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Pressure Notes</label>
                  <textarea
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                    rows="2"
                    value={checklistData.coolingSeason.pressureNotes}
                    onChange={e => handleInputChange('coolingSeason', 'pressureNotes', e.target.value)}
                    placeholder="Additional pressure observations..."
                  />
                </div>
              </div>

              {/* Other cooling season checks */}
              {[
                { key: 'checkSuctionLineTemp', label: 'CHECK SUCTION LINE TEMP' },
                { key: 'inspectMotorContacts', label: 'INSPECT MOTOR STARTER CONTACTS' },
                { key: 'visualCheckRefrigerantLeaks', label: 'VISUAL CHECK FOR REFRIGERANT LEAKS' },
                { key: 'checkCondenserHailDamage', label: 'CHECK CONDENSER FOR HAIL DAMAGE AND DEBRIS' },
                { key: 'checkCrankCaseHeater', label: 'CHECK CRANK CASE HEATER' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-gray-300"
                    style={{'accentColor': '#2a3a91'}}
                    checked={checklistData.coolingSeason[item.key]}
                    onChange={e => handleCheckboxChange('coolingSeason', item.key, e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* HEATING SEASON Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#2a3a91'}}></div>
              HEATING SEASON
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'checkHighLimitCutOut', label: 'CHECK HIGH LIMIT CUT OUT' },
                { key: 'checkFanLimitControl', label: 'CHECK FAN LIMIT CONTROL' },
                { key: 'checkBurnerCorrosion', label: 'CHECK BURNER FOR CORROSION AND DIRT' },
                { key: 'checkCombustionBlower', label: 'CHECK COMBUSTION BLOWER' },
                { key: 'checkPilotAssembly', label: 'CHECK PILOT ASSEMBLY AND SAFETY' },
                { key: 'checkGasLeaks', label: 'CHECK FOR GAS LEAKS' },
                { key: 'checkFlueBlockage', label: 'CHECK FLUE FOR BLOCKAGE' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-gray-300"
                    style={{'accentColor': '#2a3a91'}}
                    checked={checklistData.heatingSeason[item.key]}
                    onChange={e => handleCheckboxChange('heatingSeason', item.key, e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter List and Problems */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter List</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                value={checklistData.filterList}
                onChange={e => handleTopLevelChange('filterList', e.target.value)}
                placeholder="e.g., (2) 16x25x2"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Problems Found</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              rows="4"
              value={checklistData.problemsFound}
              onChange={e => handleTopLevelChange('problemsFound', e.target.value)}
              placeholder="Describe any problems found during inspection..."
            />
          </div>

          {/* Error Messages */}
          {formError && (
            <div className="flex items-center gap-3 p-4 border rounded-lg mb-4" style={{backgroundColor: '#fef2f2', borderColor: '#ef4444'}}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{color: '#ef4444'}} />
              <div className="font-medium" style={{color: '#b91c1c'}}>{formError}</div>
            </div>
          )}

          {/* Success Messages */}
          {submitStatus && (
            <div className="flex items-center gap-3 p-4 border rounded-lg mb-4" style={{backgroundColor: '#f0f9ff', borderColor: '#22c55e'}}>
              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: '#22c55e'}} />
              <div className="font-medium" style={{color: '#15803d'}}>{submitStatus}</div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              style={{backgroundColor: '#2a3a91'}}
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? 'Saving Checklist...' : 'Complete Full Inspection'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MaintenanceChecklist;
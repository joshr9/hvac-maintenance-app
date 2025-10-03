/**
 * Props:
 * - maintenanceLogs: array (maintenance log entries)
 * - selectedUnit: string|number (ID of selected HVAC unit)
 */

import React, { useState } from 'react';
import { FileText, Wrench, ChevronDown, ChevronUp, X, Camera } from 'lucide-react';

const MaintenanceHistory = ({ maintenanceLogs, selectedUnit }) => {
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const toggleExpanded = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const renderChecklistSummary = (log) => {
    if (!log.checklistData) return null;

    const data = log.checklistData;
    const isExpanded = expandedLogs.has(log.id);

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{color: '#2a3a91'}} />
            <span className="text-sm font-medium" style={{color: '#2a3a91'}}>
              Full Inspection Checklist
            </span>
            {log.serviceTechnician && (
              <span className="text-xs text-gray-600">
                by {log.serviceTechnician}
              </span>
            )}
            {data.completionPercentage && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                {data.completionPercentage}% Complete
              </span>
            )}
          </div>
          <button
            onClick={() => toggleExpanded(log.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {log.specialNotes && (
          <div className="mt-2 text-sm text-gray-600">
            <strong>Special Notes:</strong> {log.specialNotes}
          </div>
        )}

        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            {/* Fans Section Summary */}
            {data.fans && (
              <div>
                <h5 className="font-semibold text-gray-700">Fans:</h5>
                <div className="ml-2 space-y-1">
                  {data.fans.checkReplaceFilters && <div>✓ Air filters checked/replaced</div>}
                  {data.fans.lubricateBearings && <div>✓ Bearings lubricated</div>}
                  {data.fans.checkFanWheelShaft && <div>✓ Fan wheel shaft checked</div>}
                  {data.fans.inspectCondensatePan && <div>✓ Condensate pan inspected</div>}
                  {data.fans.checkBeltsAndPulleys && (
                    <div>✓ Belts and pulleys checked {data.fans.beltSize && `(Size: ${data.fans.beltSize})`}</div>
                  )}
                  {data.fans.checkEconomizerOperation && <div>✓ Economizer operation checked</div>}
                </div>
              </div>
            )}

            {/* Cooling Season Summary */}
            {data.coolingSeason && (
              <div>
                <h5 className="font-semibold text-gray-700">Cooling Season:</h5>
                <div className="ml-2 space-y-1">
                  {data.coolingSeason.checkDischargePressure && (
                    <div>
                      ✓ Pressure checked
                      {(data.coolingSeason.dischargePress || data.coolingSeason.suctionPress) && (
                        <span className="ml-1">
                          (Discharge: {data.coolingSeason.dischargePress || 'N/A'}, 
                          Suction: {data.coolingSeason.suctionPress || 'N/A'})
                        </span>
                      )}
                    </div>
                  )}
                  {data.coolingSeason.checkSuctionLineTemp && <div>✓ Suction line temperature checked</div>}
                  {data.coolingSeason.inspectMotorContacts && <div>✓ Motor starter contacts inspected</div>}
                  {data.coolingSeason.visualCheckRefrigerantLeaks && <div>✓ Refrigerant leaks checked</div>}
                  {data.coolingSeason.checkCondenserHailDamage && <div>✓ Condenser inspected for damage</div>}
                  {data.coolingSeason.checkCrankCaseHeater && <div>✓ Crank case heater checked</div>}
                </div>
              </div>
            )}

            {/* Heating Season Summary */}
            {data.heatingSeason && (
              <div>
                <h5 className="font-semibold text-gray-700">Heating Season:</h5>
                <div className="ml-2 space-y-1">
                  {data.heatingSeason.checkHighLimitCutOut && <div>✓ High limit cut out checked</div>}
                  {data.heatingSeason.checkFanLimitControl && <div>✓ Fan limit control checked</div>}
                  {data.heatingSeason.checkBurnerCorrosion && <div>✓ Burner corrosion checked</div>}
                  {data.heatingSeason.checkCombustionBlower && <div>✓ Combustion blower checked</div>}
                  {data.heatingSeason.checkPilotAssembly && <div>✓ Pilot assembly checked</div>}
                  {data.heatingSeason.checkGasLeaks && <div>✓ Gas leaks checked</div>}
                  {data.heatingSeason.checkFlueBlockage && <div>✓ Flue blockage checked</div>}
                </div>
              </div>
            )}

            {data.filterList && (
              <div>
                <strong>Filters:</strong> {data.filterList}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
            <FileText className="w-5 h-5" style={{color: '#2a3a91'}} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Maintenance History</h3>
        </div>
      
      {selectedUnit ? (
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
                      <span className="font-semibold text-gray-900">
                        {log.maintenanceType === 'FULL_INSPECTION_CHECKLIST' ? 'Full Inspection Checklist' : log.maintenanceType}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    
                    {log.notes && (
                      <div className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                        {log.notes}
                      </div>
                    )}

                    {/* Render checklist summary if this is a checklist entry */}
                    {renderChecklistSummary(log)}
                    
                    {log.photos && log.photos.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">
                            {log.photos.length} Photo{log.photos.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {log.photos
                            .filter(photo => photo.url || photo.fileName)
                            .map(photo => {
                              const photoUrl = photo.url
                                ? `${apiUrl}${photo.url}`
                                : `${apiUrl}/uploads/${photo.fileName}`;

                              return (
                                <button
                                  key={photo.id}
                                  onClick={() => setEnlargedPhoto(photoUrl)}
                                  className="relative group cursor-pointer hover:opacity-90 transition-opacity"
                                >
                                  <img
                                    src={photoUrl}
                                    alt="Maintenance"
                                    className="w-24 h-24 object-cover rounded-lg shadow-md border-2 border-gray-200"
                                    onError={e => {
                                      e.target.onerror = null;
                                      e.target.style.opacity = 0.3;
                                      e.target.src =
                                        "data:image/svg+xml;utf8,<svg width='96' height='96' xmlns='http://www.w3.org/2000/svg'><rect width='96' height='96' fill='%23eee'/><text x='48' y='52' font-size='14' text-anchor='middle' fill='%23666'>No Image</text></svg>";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                                      Click to enlarge
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Please select an HVAC unit to view its maintenance history.</p>
        </div>
      )}
      </div>

      {/* Photo Enlargement Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <img
              src={enlargedPhoto}
              alt="Enlarged maintenance photo"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceHistory;
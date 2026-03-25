import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Wrench, ChevronDown, ChevronUp, X, Camera, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

const MAINTENANCE_TYPES = [
  { value: 'FILTER_CHANGE',           label: 'Filter Change' },
  { value: 'PREVENTIVE_MAINTENANCE',  label: 'Preventative PM' },
  { value: 'COIL_CLEANING',           label: 'Coil Cleaning' },
  { value: 'INSPECTION',              label: 'Inspection' },
  { value: 'REPAIR',                  label: 'Repair' },
  { value: 'FULL_SERVICE',            label: 'Full Service' },
  { value: 'REFRIGERANT',             label: 'Refrigerant' },
  { value: 'OTHER',                   label: 'Other' },
];

const TYPE_LABEL = Object.fromEntries(MAINTENANCE_TYPES.map(t => [t.value, t.label]));

// ── Dropdown menu anchored to ••• button (portal so it's never clipped) ───────
const LogMenu = ({ log, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!e.target.closest('[data-log-menu]')) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  };

  return (
    <div className="flex-shrink-0">
      <button
        ref={btnRef}
        onClick={toggle}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
      {open && createPortal(
        <div
          data-log-menu
          className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-w-[130px]"
          style={{ top: pos.top, right: pos.right }}
        >
          <button
            onClick={() => { setOpen(false); onEdit(log); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-400" />
            Edit
          </button>
          <div className="h-px bg-gray-100 mx-3" />
          <button
            onClick={() => { setOpen(false); onDelete(log.id); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

// ── Edit modal ────────────────────────────────────────────────────────────────
const EditModal = ({ log, onSave, onClose }) => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const [data, setData] = useState({
    maintenanceType: log.maintenanceType || '',
    notes:           log.notes || '',
    serviceDate:     log.createdAt?.split('T')[0] || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/maintenance-logs/${log.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          maintenanceType: data.maintenanceType,
          notes:           data.notes,
          createdAt:       data.serviceDate,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onSave();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-900">Edit Log</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
            <select
              value={data.maintenanceType}
              onChange={e => setData(d => ({ ...d, maintenanceType: e.target.value }))}
              className="w-full px-3 py-2.5 text-[14px] bg-[#F2F2F7] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {MAINTENANCE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
            <input
              type="date"
              value={data.serviceDate}
              onChange={e => setData(d => ({ ...d, serviceDate: e.target.value }))}
              className="w-full px-3 py-2.5 text-[14px] bg-[#F2F2F7] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea
              value={data.notes}
              onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2.5 text-[14px] bg-[#F2F2F7] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              placeholder="Add notes…"
            />
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[15px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#101d40' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Delete confirmation ───────────────────────────────────────────────────────
const DeleteConfirm = ({ logId, onConfirm, onCancel }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm(logId);
    setDeleting(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-5 space-y-4">
        <h2 className="text-[17px] font-semibold text-gray-900">Delete log?</h2>
        <p className="text-[14px] text-gray-500">This can't be undone.</p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-[15px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl text-[15px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const MaintenanceHistory = ({ maintenanceLogs, selectedUnit, onRefresh }) => {
  const [expandedLogs, setExpandedLogs]   = useState(new Set());
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  const [editLog, setEditLog]             = useState(null);
  const [deleteId, setDeleteId]           = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const toggleExpanded = (logId) => {
    const next = new Set(expandedLogs);
    next.has(logId) ? next.delete(logId) : next.add(logId);
    setExpandedLogs(next);
  };

  const handleDelete = async (id) => {
    await fetch(`${apiUrl}/api/maintenance-logs/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    onRefresh?.();
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
            <span className="text-sm font-medium" style={{color: '#2a3a91'}}>Full Inspection Checklist</span>
            {log.serviceTechnician && <span className="text-xs text-gray-600">by {log.serviceTechnician}</span>}
            {data.completionPercentage && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{data.completionPercentage}% Complete</span>
            )}
          </div>
          <button onClick={() => toggleExpanded(log.id)} className="text-gray-400 hover:text-gray-600">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {log.specialNotes && <div className="mt-2 text-sm text-gray-600"><strong>Special Notes:</strong> {log.specialNotes}</div>}
        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            {data.fans && (
              <div>
                <h5 className="font-semibold text-gray-700">Fans:</h5>
                <div className="ml-2 space-y-1">
                  {data.fans.checkReplaceFilters && <div>✓ Air filters checked/replaced</div>}
                  {data.fans.lubricateBearings && <div>✓ Bearings lubricated</div>}
                  {data.fans.checkFanWheelShaft && <div>✓ Fan wheel shaft checked</div>}
                  {data.fans.inspectCondensatePan && <div>✓ Condensate pan inspected</div>}
                  {data.fans.checkBeltsAndPulleys && <div>✓ Belts and pulleys checked {data.fans.beltSize && `(Size: ${data.fans.beltSize})`}</div>}
                  {data.fans.checkEconomizerOperation && <div>✓ Economizer operation checked</div>}
                </div>
              </div>
            )}
            {data.coolingSeason && (
              <div>
                <h5 className="font-semibold text-gray-700">Cooling Season:</h5>
                <div className="ml-2 space-y-1">
                  {data.coolingSeason.checkDischargePressure && (
                    <div>✓ Pressure checked{(data.coolingSeason.dischargePress || data.coolingSeason.suctionPress) && ` (Discharge: ${data.coolingSeason.dischargePress || 'N/A'}, Suction: ${data.coolingSeason.suctionPress || 'N/A'})`}</div>
                  )}
                  {data.coolingSeason.checkSuctionLineTemp && <div>✓ Suction line temperature checked</div>}
                  {data.coolingSeason.inspectMotorContacts && <div>✓ Motor starter contacts inspected</div>}
                  {data.coolingSeason.visualCheckRefrigerantLeaks && <div>✓ Refrigerant leaks checked</div>}
                  {data.coolingSeason.checkCondenserHailDamage && <div>✓ Condenser inspected for damage</div>}
                  {data.coolingSeason.checkCrankCaseHeater && <div>✓ Crank case heater checked</div>}
                </div>
              </div>
            )}
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
            {data.filterList && <div><strong>Filters:</strong> {data.filterList}</div>}
          </div>
        )}
      </div>
    );
  };

  const filteredLogs = selectedUnit
    ? maintenanceLogs.filter(log => String(log.hvacUnitId) === String(selectedUnit))
    : [];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
            <FileText className="w-5 h-5" style={{color: '#2a3a91'}} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Maintenance History</h3>
        </div>

        {!selectedUnit ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Please select an HVAC unit to view its maintenance history.</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No maintenance history available</p>
            <p className="text-sm text-gray-400">Previous maintenance records will appear here</p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-white hover:bg-blue-50 transition">
                <div className="p-2 rounded-lg flex-shrink-0" style={{backgroundColor: '#e8eafc'}}>
                  <Wrench className="w-5 h-5" style={{color: '#2a3a91'}} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {TYPE_LABEL[log.maintenanceType] || log.maintenanceType}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''}
                      </span>
                      {log.technician?.name && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500 text-xs">Tech: {log.technician.name}</span>
                        </>
                      )}
                    </div>
                    <LogMenu log={log} onEdit={setEditLog} onDelete={setDeleteId} />
                  </div>

                  {log.notes && (
                    <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">{log.notes}</p>
                  )}

                  {renderChecklistSummary(log)}

                  {log.photos?.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {log.photos.length} Photo{log.photos.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {log.photos.filter(p => p.url || p.fileName).map(photo => {
                          const photoUrl = photo.url?.startsWith('http')
                            ? photo.url
                            : photo.url
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
                                  e.target.src = "data:image/svg+xml;utf8,<svg width='96' height='96' xmlns='http://www.w3.org/2000/svg'><rect width='96' height='96' fill='%23eee'/><text x='48' y='52' font-size='14' text-anchor='middle' fill='%23666'>No Image</text></svg>";
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 text-xs bg-black bg-opacity-50 px-2 py-1 rounded">View</span>
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
        )}
      </div>

      {/* Photo lightbox */}
      {enlargedPhoto && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={() => setEnlargedPhoto(null)}>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button onClick={() => setEnlargedPhoto(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10">
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <img src={enlargedPhoto} alt="Enlarged" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}

      {editLog && (
        <EditModal
          log={editLog}
          onSave={() => { setEditLog(null); onRefresh?.(); }}
          onClose={() => setEditLog(null)}
        />
      )}

      {deleteId && (
        <DeleteConfirm
          logId={deleteId}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
};

export default MaintenanceHistory;

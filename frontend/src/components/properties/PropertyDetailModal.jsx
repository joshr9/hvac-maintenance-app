// PropertyDetailModal.jsx — mobile-first redesign, matches app design system
import React, { useState, useEffect } from 'react';
import {
  X, MapPin, Users, Zap, Edit3, Trash2, Plus, ChevronRight, Loader,
} from 'lucide-react';

// ─── Main Modal ──────────────────────────────────────────────────────────────

const PropertyDetailModal = ({ isOpen, onClose, property, onEdit, onDelete, onNavigate }) => {
  const [showAddSuite, setShowAddSuite]         = useState(false);
  const [showEditSuite, setShowEditSuite]       = useState(false);
  const [selectedSuite, setSelectedSuite]       = useState(null);
  const [showAddHvacUnit, setShowAddHvacUnit]   = useState(false);
  const [suiteForHvac, setSuiteForHvac]         = useState(null);
  const [localProperty, setLocalProperty]       = useState(property);
  const [expandedSuites, setExpandedSuites]     = useState({});

  useEffect(() => { if (property) setLocalProperty(property); }, [property]);

  const refreshProperty = async () => {
    if (!localProperty?.id) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${localProperty.id}`);
      if (res.ok) setLocalProperty(await res.json());
    } catch (e) { console.error(e); }
  };

  if (!isOpen || !localProperty) return null;

  const suiteCount = localProperty.suites?.length || 0;
  const unitCount  = localProperty.suites?.reduce((s, suite) => s + (suite.hvacUnits?.length || 0), 0) || 0;

  const toggleSuite = (id) =>
    setExpandedSuites(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDeleteSuite = async (suite) => {
    if (!window.confirm(`Delete "${suite.name}"? This cannot be undone.`)) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${localProperty.id}/suites/${suite.id}`, { method: 'DELETE' });
      if (res.ok) await refreshProperty();
    } catch (e) { console.error(e); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#F2F2F7] rounded-t-3xl"
        style={{ maxHeight: '92vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header card */}
        <div className="flex-shrink-0 mx-4 mb-3 bg-white rounded-2xl px-4 py-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-gray-900 leading-tight truncate">
                {localProperty.name || localProperty.address}
              </h2>
              {localProperty.name && localProperty.address && (
                <p className="text-[13px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {localProperty.address}
                </p>
              )}
              <div className="flex gap-2 mt-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  <Users className="w-3 h-3" />{suiteCount} suites
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  <Zap className="w-3 h-3" />{unitCount} units
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 -mr-0.5 text-gray-400 active:opacity-60 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">

          {/* Suites & Units */}
          <div>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em]">
                Suites & HVAC Units
              </p>
              <button
                onClick={() => setShowAddSuite(true)}
                className="flex items-center gap-1 text-[12px] font-semibold active:opacity-60"
                style={{ color: '#101d40' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Suite
              </button>
            </div>

            {suiteCount === 0 ? (
              <div className="bg-white rounded-2xl px-4 py-6 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">No suites yet</p>
                <button
                  onClick={() => setShowAddSuite(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform"
                  style={{ backgroundColor: '#101d40' }}
                >
                  <Plus className="w-4 h-4" /> Add Suite
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {localProperty.suites.map(suite => {
                  const isExpanded = !!expandedSuites[suite.id];
                  const hvacCount  = suite.hvacUnits?.length || 0;
                  return (
                    <div key={suite.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
                        onClick={() => toggleSuite(suite.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-gray-900 truncate">
                            {suite.name || `Suite ${suite.id}`}
                          </p>
                          <p className="text-[12px] text-gray-400 mt-0.5">
                            {hvacCount} HVAC {hvacCount === 1 ? 'unit' : 'units'}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          {suite.hvacUnits?.length > 0 && (
                            <div className="px-4 py-2 space-y-0.5">
                              {suite.hvacUnits.map(unit => (
                                <div key={unit.id} className="flex items-center gap-3 py-2">
                                  <Zap className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                  <span className="text-[14px] text-gray-700 flex-1 truncate">
                                    {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                                  </span>
                                  {unit.model && (
                                    <span className="text-[12px] text-gray-400 truncate max-w-[100px]">{unit.model}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                            <button
                              onClick={() => { setSuiteForHvac(suite); setShowAddHvacUnit(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold active:bg-gray-50 transition-colors"
                              style={{ color: '#101d40' }}
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Unit
                            </button>
                            <button
                              onClick={() => { setSelectedSuite(suite); setShowEditSuite(true); }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-500 active:bg-gray-50 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSuite(suite)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 active:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Property-level actions */}
          <div className="space-y-2">
            <button
              onClick={() => { onClose(); onEdit(localProperty); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl text-[15px] font-semibold text-gray-700 active:scale-[0.98] transition-transform"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
            >
              <Edit3 className="w-4 h-4" /> Edit Property
            </button>
            <button
              onClick={() => { onClose(); onDelete(localProperty); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl text-[15px] font-semibold text-red-500 active:scale-[0.98] transition-transform"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
            >
              <Trash2 className="w-4 h-4" /> Delete Property
            </button>
          </div>
        </div>
      </div>

      {/* Sub-sheets */}
      {showAddSuite && (
        <AddSuiteModal
          isOpen={showAddSuite}
          onClose={() => setShowAddSuite(false)}
          property={localProperty}
          onSuiteAdded={async () => { setShowAddSuite(false); await refreshProperty(); }}
        />
      )}
      {showEditSuite && selectedSuite && (
        <EditSuiteModal
          isOpen={showEditSuite}
          onClose={() => { setShowEditSuite(false); setSelectedSuite(null); }}
          property={localProperty}
          suite={selectedSuite}
          onSuiteUpdated={async () => { setShowEditSuite(false); setSelectedSuite(null); await refreshProperty(); }}
        />
      )}
      {showAddHvacUnit && suiteForHvac && (
        <AddHvacUnitModal
          isOpen={showAddHvacUnit}
          onClose={() => { setShowAddHvacUnit(false); setSuiteForHvac(null); }}
          suite={suiteForHvac}
          onHvacUnitAdded={async () => { setShowAddHvacUnit(false); setSuiteForHvac(null); await refreshProperty(); }}
        />
      )}
    </>
  );
};

// ─── Shared sub-sheet shell ───────────────────────────────────────────────────

const SubSheet = ({ title, onClose, children }) => (
  <>
    <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
    <div
      className="fixed inset-x-0 bottom-0 z-[60] bg-[#F2F2F7] rounded-t-3xl flex flex-col"
      style={{ maxHeight: '80vh' }}
    >
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-9 h-1 rounded-full bg-gray-300" />
      </div>
      <div className="flex items-center justify-between px-5 pb-4">
        <h3 className="text-[17px] font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 active:opacity-60">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {children}
      </div>
    </div>
  </>
);

// ─── Add Suite ────────────────────────────────────────────────────────────────

const AddSuiteModal = ({ isOpen, onClose, property, onSuiteAdded }) => {
  const [name, setName]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Suite name is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${property.id}/suites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) { onSuiteAdded(await res.json()); setName(''); }
      else throw new Error('Failed to add suite');
    } catch { setError('Failed to add suite. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <SubSheet title="Add Suite" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">Suite Name</p>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Suite 101, Unit A"
            disabled={submitting}
            className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        {error && (
          <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[14px] text-red-600">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ backgroundColor: '#101d40' }}
        >
          {submitting ? 'Adding...' : 'Add Suite'}
        </button>
      </form>
    </SubSheet>
  );
};

// ─── Edit Suite ───────────────────────────────────────────────────────────────

const EditSuiteModal = ({ isOpen, onClose, property, suite, onSuiteUpdated }) => {
  const [name, setName]           = useState(suite?.name || '');
  const [localSuite, setLocalSuite] = useState(suite);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [showAddHvac, setShowAddHvac] = useState(false);

  useEffect(() => {
    if (suite) { setLocalSuite(suite); setName(suite.name || ''); }
  }, [suite]);

  if (!isOpen || !localSuite) return null;

  const refreshSuite = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${property.id}`);
      if (res.ok) {
        const p = await res.json();
        const updated = p.suites?.find(s => s.id === localSuite.id);
        if (updated) setLocalSuite(updated);
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Suite name is required'); return; }
    setSubmitting(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${property.id}/suites/${localSuite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
    } catch { setError('Failed to update suite.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Delete "${unit.label || unit.serialNumber}"?`)) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/hvac-units/${unit.id}`, { method: 'DELETE' });
      if (res.ok) await refreshSuite();
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <SubSheet title="Edit Suite" onClose={() => { onSuiteUpdated(); onClose(); }}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">Suite Name</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 rounded-2xl text-[14px] font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-40"
            style={{ backgroundColor: '#101d40' }}
          >
            {submitting ? 'Saving...' : 'Save Name'}
          </button>

          {error && (
            <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[14px] text-red-600">{error}</p>
            </div>
          )}

          {/* HVAC Units */}
          <div>
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em]">HVAC Units</p>
              <button
                type="button"
                onClick={() => setShowAddHvac(true)}
                className="flex items-center gap-1 text-[12px] font-semibold active:opacity-60"
                style={{ color: '#101d40' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Unit
              </button>
            </div>

            {localSuite.hvacUnits?.length > 0 ? (
              <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                {localSuite.hvacUnits.map(unit => (
                  <div key={unit.id} className="flex items-center gap-3 px-4 py-3">
                    <Zap className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate">
                        {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                      </p>
                      {unit.model && <p className="text-[12px] text-gray-400">{unit.model}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(unit)}
                      className="p-1.5 text-red-400 active:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-gray-400 px-0.5">No HVAC units yet.</p>
            )}
          </div>
        </form>
      </SubSheet>

      {showAddHvac && (
        <AddHvacUnitModal
          isOpen={showAddHvac}
          onClose={() => setShowAddHvac(false)}
          suite={localSuite}
          onHvacUnitAdded={async () => { setShowAddHvac(false); await refreshSuite(); }}
        />
      )}
    </>
  );
};

// ─── Add HVAC Unit ────────────────────────────────────────────────────────────

const AddHvacUnitModal = ({ isOpen, onClose, suite, onHvacUnitAdded }) => {
  const [data, setData] = useState({ label: '', serialNumber: '', model: '', installDate: '', filterSize: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  if (!isOpen || !suite) return null;

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.serialNumber.trim() || !data.model.trim() || !data.installDate) {
      setError('Serial number, model, and install date are required');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/hvac-units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: data.label.trim() || null,
          serialNumber: data.serialNumber.trim(),
          model: data.model.trim(),
          installDate: data.installDate,
          filterSize: data.filterSize.trim() || null,
          notes: data.notes.trim() || null,
          suiteId: suite.id,
        }),
      });
      if (res.ok) { onHvacUnitAdded(); }
      else { const d = await res.json(); throw new Error(d.error || 'Failed'); }
    } catch (e) { setError(e.message || 'Failed to add unit.'); }
    finally { setSubmitting(false); }
  };

  const Field = ({ label, required, ...props }) => (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">
        {label}{required && ' *'}
      </p>
      <input
        {...props}
        disabled={submitting}
        className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );

  return (
    <SubSheet title={`Add Unit — ${suite.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Label" placeholder="e.g., RTU #1, Main AC" value={data.label} onChange={e => set('label', e.target.value)} />
        <Field label="Serial Number" required placeholder="e.g., ABC123456" value={data.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
        <Field label="Model" required placeholder="e.g., Carrier 58MVC080" value={data.model} onChange={e => set('model', e.target.value)} />

        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">Install Date *</p>
          <input
            type="date"
            required
            value={data.installDate}
            onChange={e => set('installDate', e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <Field label="Filter Size" placeholder="e.g., 20×25×1" value={data.filterSize} onChange={e => set('filterSize', e.target.value)} />

        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2">Notes</p>
          <textarea
            value={data.notes}
            onChange={e => set('notes', e.target.value)}
            rows={2}
            placeholder="Optional notes..."
            disabled={submitting}
            className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-300 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[14px] text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ backgroundColor: '#101d40' }}
        >
          {submitting ? 'Adding...' : 'Add HVAC Unit'}
        </button>
      </form>
    </SubSheet>
  );
};

export default PropertyDetailModal;

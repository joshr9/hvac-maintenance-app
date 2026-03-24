import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Wrench, Search, Building, Zap, Clock, ChevronDown, ChevronUp,
  Filter, Camera, ClipboardList, AlertCircle, Plus, X, Check,
  ChevronRight, ArrowLeft
} from 'lucide-react';

const MAINTENANCE_TYPE_LABELS = {
  FILTER_CHANGE: 'Filter Change',
  COIL_CLEANING: 'Coil Clean',
  INSPECTION: 'Inspection',
  REPAIR: 'Repair',
  FULL_SERVICE: 'Full Service',
  REFRIGERANT: 'Refrigerant',
  FULL_INSPECTION_CHECKLIST: 'Full Checklist',
  OTHER: 'Other',
};

const HVACPage = ({ onNavigate, properties = [], onDataRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localProperties, setLocalProperties] = useState([]);
  const [historyState, setHistoryState] = useState({});
  const [historyData, setHistoryData] = useState({});
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [showAddUnit, setShowAddUnit] = useState(false);

  // Sync localProperties when prop changes
  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  const groupedProperties = useMemo(() => {
    return localProperties
      .map(property => {
        const units = [];
        (property.suites || []).forEach(suite => {
          (suite.hvacUnits || []).forEach(unit => {
            units.push({
              ...unit,
              suiteId: suite.id,
              suiteName: suite.name || `Suite ${suite.id}`,
              suiteData: suite,
              propertyData: property,
              propertyName: property.name || property.address,
            });
          });
        });
        return { property, units };
      })
      .filter(g => g.units.length > 0);
  }, [localProperties]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedProperties;
    const q = searchQuery.toLowerCase();
    return groupedProperties
      .map(g => ({
        ...g,
        units: g.units.filter(u =>
          g.property.name?.toLowerCase().includes(q) ||
          g.property.address?.toLowerCase().includes(q) ||
          u.suiteName?.toLowerCase().includes(q) ||
          (u.label || u.serialNumber || '').toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.units.length > 0);
  }, [groupedProperties, searchQuery]);

  const fetchHistory = useCallback(async (unitId) => {
    setHistoryState(prev => ({ ...prev, [unitId]: 'loading' }));
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/maintenance-logs/unit/${unitId}`);
      if (!res.ok) throw new Error();
      const logs = await res.json();
      setHistoryData(prev => ({ ...prev, [unitId]: logs }));
      setHistoryState(prev => ({ ...prev, [unitId]: 'loaded' }));
    } catch {
      setHistoryState(prev => ({ ...prev, [unitId]: 'error' }));
    }
  }, []);

  const toggleHistory = useCallback((unitId) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
        if (!historyState[unitId]) fetchHistory(unitId);
      }
      return next;
    });
  }, [historyState, fetchHistory]);

  const handleLogWork = (unit) => {
    if (!onNavigate) return;
    onNavigate('maintenance', {
      skipPropertySelection: true,
      selectedProperty: unit.propertyData,
      selectedSuite: {
        id: unit.suiteId,
        name: unit.suiteName,
        propertyId: unit.propertyData.id,
        hvacUnits: unit.suiteData?.hvacUnits || [unit],
      },
      selectedUnit: unit.id,
      unitData: unit,
      propertyName: unit.propertyName,
      suiteName: unit.suiteName,
    });
  };

  const handleUnitAdded = (newUnit, suiteId, propertyId) => {
    setLocalProperties(prev =>
      prev.map(p => {
        if (p.id !== propertyId) return p;
        return {
          ...p,
          suites: (p.suites || []).map(s => {
            if (s.id !== suiteId) return s;
            return { ...s, hvacUnits: [...(s.hvacUnits || []), newUnit] };
          }),
        };
      })
    );
    setShowAddUnit(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#F2F2F7' }}>
      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties, suites, units…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Property groups */}
      <div className="py-4 space-y-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No units found</p>
            {searchQuery
              ? <p className="text-sm text-gray-400 mt-1">Try a different search</p>
              : <p className="text-sm text-gray-400 mt-1">Tap + to add a unit</p>
            }
          </div>
        ) : (
          filteredGroups.map(({ property, units }) => (
            <div key={property.id}>
              {/* Sticky property header */}
              <div className="sticky top-0 z-10 bg-[#F2F2F7] px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide truncate">
                    {property.name || property.address}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{units.length} units</span>
              </div>

              {/* Units */}
              <div className="px-4 space-y-2">
                {units.map(unit => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    onLogWork={handleLogWork}
                    isExpanded={expandedUnits.has(unit.id)}
                    onToggleHistory={() => toggleHistory(unit.id)}
                    historyStatus={historyState[unit.id]}
                    history={historyData[unit.id] || []}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        {/* Bottom padding for FAB */}
        <div className="h-20" />
      </div>

      {/* Add Unit FAB */}
      <button
        onClick={() => setShowAddUnit(true)}
        className="fixed bottom-6 right-5 w-14 h-14 bg-[#101d40] text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform z-20"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Unit Sheet */}
      {showAddUnit && (
        <AddUnitSheet
          properties={localProperties}
          onClose={() => setShowAddUnit(false)}
          onUnitAdded={handleUnitAdded}
        />
      )}
    </div>
  );
};

/* ─── Add Unit Bottom Sheet ─── */

const AddUnitSheet = ({ properties, onClose, onUnitAdded }) => {
  const [step, setStep] = useState(1); // 1=property, 2=suite, 3=unit
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [propertySearch, setPropertySearch] = useState('');
  const [newSuiteName, setNewSuiteName] = useState('');
  const [showNewSuite, setShowNewSuite] = useState(false);
  const [unitForm, setUnitForm] = useState({ label: '', filterSize: '', serialNumber: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filteredProperties = useMemo(() => {
    if (!propertySearch.trim()) return properties;
    const q = propertySearch.toLowerCase();
    return properties.filter(p =>
      p.name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
    );
  }, [properties, propertySearch]);

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setStep(2);
  };

  const handleCreateProperty = async () => {
    if (!propertySearch.trim()) return;
    setSaving(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: propertySearch.trim(), address: propertySearch.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create property');
      const property = await res.json();
      setSelectedProperty(property);
      setStep(2);
    } catch {
      setError('Failed to create property');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSuite = (suite) => {
    setSelectedSuite(suite);
    setStep(3);
  };

  const handleCreateSuiteAndContinue = async () => {
    if (!newSuiteName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${selectedProperty.id}/suites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSuiteName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create suite');
      const suite = await res.json();
      setSelectedSuite(suite);
      setStep(3);
    } catch (e) {
      setError('Failed to create suite');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUnit = async () => {
    if (!unitForm.label.trim()) {
      setError('Unit label is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/hvac-units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: unitForm.label.trim(),
          filterSize: unitForm.filterSize.trim() || undefined,
          serialNumber: unitForm.serialNumber.trim() || undefined,
          suiteId: selectedSuite.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to create unit');
      const unit = await res.json();
      onUnitAdded(unit, selectedSuite.id, selectedProperty.id);
    } catch (e) {
      setError('Failed to save unit');
      setSaving(false);
    }
  };

  const stepTitle = step === 1 ? 'Select Property' : step === 2 ? 'Select Suite' : 'Unit Details';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-30" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-40 max-h-[85vh] flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>

        {/* Handle + header */}
        <div className="px-4 pt-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} className="p-1 -ml-1 text-gray-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Step {step} of 3</p>
                <h2 className="text-base font-semibold text-gray-900">{stepTitle}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-3">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#101d40]' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Property */}
          {step === 1 && (
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search properties…"
                  value={propertySearch}
                  onChange={e => setPropertySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                {filteredProperties.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProperty(p)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name || p.address}</p>
                      {p.name && p.address && <p className="text-xs text-gray-400 mt-0.5">{p.address}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}

                {/* Create new property if search text doesn't match anything exactly */}
                {propertySearch.trim() && (
                  <button
                    onClick={handleCreateProperty}
                    disabled={saving}
                    className="w-full flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4 flex-shrink-0" />
                    <span>Create <span className="font-medium text-gray-700">"{propertySearch}"</span> as new property</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Suite */}
          {step === 2 && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-500 px-1">
                {selectedProperty?.name || selectedProperty?.address}
              </p>
              <div className="space-y-1.5">
                {(selectedProperty?.suites || []).map(suite => (
                  <button
                    key={suite.id}
                    onClick={() => handleSelectSuite(suite)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{suite.name || `Suite ${suite.id}`}</p>
                      <p className="text-xs text-gray-400">{suite.hvacUnits?.length || 0} existing units</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* New suite option */}
              {!showNewSuite ? (
                <button
                  onClick={() => setShowNewSuite(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Create new suite
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Suite name or number…"
                    value={newSuiteName}
                    onChange={e => setNewSuiteName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateSuiteAndContinue()}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCreateSuiteAndContinue}
                    disabled={saving || !newSuiteName.trim()}
                    className="px-4 py-2.5 bg-[#101d40] text-white text-sm font-medium rounded-xl disabled:opacity-40"
                  >
                    {saving ? '…' : 'Create'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Unit details */}
          {step === 3 && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-gray-500 px-1">
                {selectedProperty?.name || selectedProperty?.address} · {selectedSuite?.name || `Suite ${selectedSuite?.id}`}
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Unit Label <span className="text-red-500">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. A-101, Rooftop Unit 1, Suite 204 AC"
                  value={unitForm.label}
                  onChange={e => setUnitForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Filter Size</label>
                <input
                  type="text"
                  placeholder="e.g. 16x25x4, 20x20x1"
                  value={unitForm.filterSize}
                  onChange={e => setUnitForm(f => ({ ...f, filterSize: e.target.value }))}
                  className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Serial Number</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={unitForm.serialNumber}
                  onChange={e => setUnitForm(f => ({ ...f, serialNumber: e.target.value }))}
                  className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3 submit */}
        {step === 3 && (
          <div className="px-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleSaveUnit}
              disabled={saving || !unitForm.label.trim()}
              className="w-full py-3.5 bg-[#101d40] text-white text-sm font-semibold rounded-2xl disabled:opacity-40 active:scale-[0.97] transition-transform"
            >
              {saving ? 'Saving…' : 'Add Unit'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ─── Unit Card ─── */

const UnitCard = ({ unit, onLogWork, isExpanded, onToggleHistory, historyStatus, history }) => {
  const lastLog = history[0];

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">
            {unit.label || unit.serialNumber || `Unit ${unit.id}`}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{unit.suiteName}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {unit.filterSize && (
            <Chip icon={<Filter className="w-3 h-3" />} label={unit.filterSize} />
          )}
          {lastLog ? (
            <Chip icon={<Clock className="w-3 h-3" />} label={`Last: ${formatRelative(lastLog.createdAt)}`} />
          ) : (
            <Chip icon={<Clock className="w-3 h-3" />} label="Never serviced" muted />
          )}
          {unit.serialNumber && unit.label && (
            <Chip label={`S/N ${unit.serialNumber}`} />
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onLogWork(unit)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#101d40] text-white text-sm font-semibold rounded-xl active:scale-[0.97] transition-transform"
          >
            <Wrench className="w-4 h-4" />
            Log Work
          </button>

          <button
            onClick={onToggleHistory}
            className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              isExpanded
                ? 'bg-gray-100 text-gray-700 border-gray-200'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {isExpanded
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <span className="text-xs">{historyStatus === 'loaded' ? history.length : 'History'}</span>
            }
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <HistoryPanel status={historyStatus} logs={history} />
        </div>
      )}
    </div>
  );
};

/* ─── History Panel ─── */

const HistoryPanel = ({ status, logs }) => {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
        Loading…
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-red-500">
        <AlertCircle className="w-4 h-4" />Failed to load
      </div>
    );
  }
  if (logs.length === 0) {
    return <p className="py-3 text-sm text-gray-400">No maintenance logged yet.</p>;
  }
  return (
    <div className="space-y-2">
      {logs.map(log => <LogRow key={log.id} log={log} />)}
    </div>
  );
};

const MAINTENANCE_LABELS = {
  FILTER_CHANGE: 'Filter Change', COIL_CLEANING: 'Coil Clean', INSPECTION: 'Inspection',
  REPAIR: 'Repair', FULL_SERVICE: 'Full Service', REFRIGERANT: 'Refrigerant',
  FULL_INSPECTION_CHECKLIST: 'Full Checklist', OTHER: 'Other',
};

const LogRow = ({ log }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <button className="w-full flex items-center justify-between px-3 py-2.5 text-left" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-medium text-gray-500 flex-shrink-0">{formatDate(log.createdAt)}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-800 truncate">{MAINTENANCE_LABELS[log.maintenanceType] || log.maintenanceType}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {log.photos?.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <Camera className="w-3 h-3" />{log.photos.length}
            </span>
          )}
          {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-gray-50 pt-2 space-y-2">
          {log.technician?.name && <p className="text-xs text-gray-500">Tech: {log.technician.name}</p>}
          {log.notes && <p className="text-sm text-gray-700">{log.notes}</p>}
          {log.photos?.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {log.photos.map(p => (
                <img key={p.id} src={`${import.meta.env.VITE_API_URL || ''}${p.url}`} alt="" className="w-full h-20 object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Chip = ({ icon, label, muted }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${muted ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
    {icon}{label}
  </span>
);

const formatRelative = (dateStr) => {
  if (!dateStr) return 'Never';
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}yr ago`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default HVACPage;

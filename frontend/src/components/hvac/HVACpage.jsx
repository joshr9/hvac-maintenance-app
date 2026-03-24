import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import AddPropertyScreen from '../properties/AddPropertyScreen';
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
  const [expandedProperties, setExpandedProperties] = useState(new Set());
  const [historyState, setHistoryState] = useState({});
  const [historyData, setHistoryData] = useState({});
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const [showAddUnit, setShowAddUnit] = useState(false);

  // Sync localProperties when prop changes
  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  const groupedProperties = useMemo(() => {
    return localProperties.map(property => {
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
    });
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
        _propertyMatch:
          g.property.name?.toLowerCase().includes(q) ||
          g.property.address?.toLowerCase().includes(q),
      }))
      .filter(g => g._propertyMatch || g.units.length > 0);
  }, [groupedProperties, searchQuery]);

  const toggleProperty = useCallback((propertyId) => {
    setExpandedProperties(prev => {
      const next = new Set(prev);
      next.has(propertyId) ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });
  }, []);

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
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Property accordion list */}
      <div className="px-4 py-4 space-y-2.5">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No properties found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try a different search' : 'Tap + to add a unit'}
            </p>
          </div>
        ) : (
          filteredGroups.map(({ property, units }) => {
            const isOpen = expandedProperties.has(property.id);
            return (
              <div key={property.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>

                {/* Property row — tap to expand */}
                <button
                  className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-gray-50 transition-colors"
                  onClick={() => toggleProperty(property.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#101d40' }}>
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-gray-900 leading-tight truncate">
                        {property.name || property.address}
                      </p>
                      {property.name && property.address && (
                        <p className="text-[12px] text-gray-400 truncate">{property.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-[12px] text-gray-400">
                      {units.length} {units.length === 1 ? 'unit' : 'units'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded units */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {units.length === 0 ? (
                      <div className="px-4 py-5 text-center">
                        <p className="text-sm text-gray-400">No units yet</p>
                        <button
                          onClick={() => setShowAddUnit(true)}
                          className="mt-2 text-sm font-semibold active:opacity-60"
                          style={{ color: '#101d40' }}
                        >
                          + Add Unit
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
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
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div className="h-28" />
      </div>

      {/* Add Unit FAB — raised above iOS tab bar on mobile */}
      <button
        onClick={() => setShowAddUnit(true)}
        className="fixed bottom-24 lg:bottom-6 right-5 w-14 h-14 bg-[#101d40] text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform z-20"
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

/* ─── Add Unit — Full Screen Flow ─── */

const AddUnitSheet = ({ properties, onClose, onUnitAdded }) => {
  const [step, setStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [showAddProperty, setShowAddProperty] = useState(false);
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
    setPropertyAddress('');
    setError('');
    setStep(2);
  };

  const handleCreateProperty = async () => {
    if (!propertySearch.trim() || !propertyAddress.trim()) return;
    setSaving(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: propertySearch.trim(), address: propertyAddress.trim() }),
      });
      if (!res.ok) throw new Error();
      const property = await res.json();
      setSelectedProperty(property);
      setStep(2);
    } catch { setError('Failed to create property'); }
    finally { setSaving(false); }
  };

  const handleSelectSuite = (suite) => {
    setSelectedSuite(suite);
    setError('');
    setStep(3);
  };

  const handleCreateSuiteAndContinue = async () => {
    if (!newSuiteName.trim()) return;
    setSaving(true); setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties/${selectedProperty.id}/suites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSuiteName.trim() }),
      });
      if (!res.ok) throw new Error();
      const suite = await res.json();
      setSelectedSuite(suite);
      setStep(3);
    } catch { setError('Failed to create suite'); }
    finally { setSaving(false); }
  };

  const handleSaveUnit = async () => {
    if (!unitForm.label.trim()) { setError('Unit name is required'); return; }
    setSaving(true); setError('');
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
      if (!res.ok) throw new Error();
      const unit = await res.json();
      onUnitAdded(unit, selectedSuite.id, selectedProperty.id);
    } catch { setError('Failed to save unit'); setSaving(false); }
  };

  const handleBack = () => { setError(''); setStep(s => s - 1); };

  // Titles / subtitles per step
  const nav = [
    { title: 'Add HVAC Unit',                                 sub: 'Which property?' },
    { title: selectedProperty?.name || selectedProperty?.address || 'Select Suite', sub: 'Which suite?' },
    { title: selectedSuite?.name || 'Unit Details',           sub: `${selectedProperty?.name || ''} · ${selectedSuite?.name || ''}` },
  ];
  const { title, sub } = nav[step - 1];

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: '#F2F2F7', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Navigation bar — iOS style */}
      <div className="flex items-center px-4 pt-3 pb-2 bg-[#F2F2F7]">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[17px] font-normal active:opacity-50 transition-opacity flex-shrink-0"
            style={{ color: '#101d40' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[15px]">{nav[step - 2].title}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}
        <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900 truncate px-2">{title}</h1>
        <button
          onClick={onClose}
          className="text-[15px] font-normal active:opacity-50 transition-opacity flex-shrink-0 w-16 text-right"
          style={{ color: '#101d40' }}
        >
          Cancel
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-[13px] text-gray-400 text-center pb-3">{sub}</p>

      {/* Progress bar */}
      <div className="flex gap-1 px-4 mb-4">
        {[1,2,3].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'opacity-100' : 'opacity-20'}`}
            style={{ backgroundColor: s <= step ? '#101d40' : '#ccc' }} />
        ))}
      </div>

      {error && (
        <div className="mx-4 mb-3 px-4 py-3 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-[14px] text-red-600">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2">

        {/* ── Step 1: Property ── */}
        {step === 1 && (
          <>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search existing properties…"
                value={propertySearch}
                onChange={e => { setPropertySearch(e.target.value); setPropertyAddress(''); }}
                className="w-full pl-10 pr-4 py-3 text-[15px] bg-white rounded-2xl border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Existing matches */}
            {filteredProperties.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectProperty(p)}
                className="w-full flex items-center justify-between px-4 py-4 bg-white rounded-2xl shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-900 truncate">{p.name || p.address}</p>
                  {p.name && p.address && <p className="text-[13px] text-gray-400 truncate">{p.address}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-3" />
              </button>
            ))}

            {/* Add new property — opens full-screen */}
            <button
              onClick={() => setShowAddProperty(true)}
              className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-sm active:scale-[0.98] transition-transform text-left mt-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#101d40' }}>
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-medium text-gray-700">Add New Property</span>
            </button>
          </>
        )}

        {/* ── Step 2: Suite ── */}
        {step === 2 && (
          <>
            {(selectedProperty?.suites || []).map(suite => (
              <button
                key={suite.id}
                onClick={() => handleSelectSuite(suite)}
                className="w-full flex items-center justify-between px-4 py-4 bg-white rounded-2xl shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">{suite.name || `Suite ${suite.id}`}</p>
                  <p className="text-[13px] text-gray-400">{suite.hvacUnits?.length || 0} units</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}

            {/* New suite */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {!showNewSuite ? (
                <button
                  onClick={() => setShowNewSuite(true)}
                  className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#101d40' }}>
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[15px] font-medium text-gray-700">New Suite</span>
                </button>
              ) : (
                <div className="px-4 py-4 space-y-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em]">New Suite Name</p>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Suite 101, RTU #1"
                    value={newSuiteName}
                    onChange={e => setNewSuiteName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateSuiteAndContinue()}
                    className="w-full px-4 py-3 text-[15px] bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <button
                    onClick={handleCreateSuiteAndContinue}
                    disabled={saving || !newSuiteName.trim()}
                    className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
                    style={{ backgroundColor: '#101d40' }}
                  >
                    {saving ? 'Creating…' : 'Create Suite'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Unit Details ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {[
              { key: 'label',        placeholder: 'Unit name (e.g. RTU-1, Suite 204 AC)', label: 'Name *', autoFocus: true },
              { key: 'filterSize',   placeholder: 'e.g. 16×25×4',                          label: 'Filter Size' },
              { key: 'serialNumber', placeholder: 'Optional',                               label: 'Serial Number' },
            ].map(({ key, placeholder, label, autoFocus }) => (
              <div key={key} className="px-4 py-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-1.5">{label}</p>
                <input
                  autoFocus={autoFocus}
                  type="text"
                  placeholder={placeholder}
                  value={unitForm[key]}
                  onChange={e => setUnitForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full text-[15px] text-gray-900 bg-transparent border-0 focus:outline-none placeholder-gray-300"
                />
              </div>
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>

      {/* Step 3 submit — pinned to bottom */}
      {step === 3 && (
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={handleSaveUnit}
            disabled={saving || !unitForm.label.trim()}
            className="w-full py-4 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-transform shadow-lg"
            style={{ backgroundColor: '#101d40' }}
          >
            {saving ? 'Saving…' : 'Add Unit'}
          </button>
        </div>
      )}

      {/* Add Property full-screen — z above this screen */}
      {showAddProperty && (
        <AddPropertyScreen
          initialName={propertySearch}
          onClose={() => setShowAddProperty(false)}
          onPropertyAdded={(property) => {
            setShowAddProperty(false);
            setSelectedProperty(property);
            setError('');
            setStep(2);
          }}
        />
      )}
    </div>
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
  PREVENTIVE_MAINTENANCE: 'PM', FILTER_CHANGE: 'Filter Change', COIL_CLEANING: 'Coil Clean',
  INSPECTION: 'Inspection', REPAIR: 'Repair', FULL_SERVICE: 'Full Service',
  REFRIGERANT: 'Refrigerant', FULL_INSPECTION_CHECKLIST: 'Full Checklist', OTHER: 'Other',
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

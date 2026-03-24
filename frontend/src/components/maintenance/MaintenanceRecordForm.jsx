// MaintenanceRecordForm.jsx — iPhone-first quick log, 2026 redesign
// Single screen, no scrolling needed, 3 taps to submit

import { useState, useRef, useEffect } from 'react';
import {
  Wind, Droplets, ClipboardCheck, Wrench, Zap, Snowflake, MoreHorizontal,
  Camera, ImageIcon, X, ChevronDown,
} from 'lucide-react';

const WORK_TYPES = [
  { value: 'FILTER_CHANGE',  label: 'Filter Change', Icon: Wind },
  { value: 'COIL_CLEANING',  label: 'Coil Clean',    Icon: Droplets },
  { value: 'INSPECTION',     label: 'Inspection',    Icon: ClipboardCheck },
  { value: 'REPAIR',         label: 'Repair',        Icon: Wrench },
  { value: 'FULL_SERVICE',   label: 'Full Service',  Icon: Zap },
  { value: 'REFRIGERANT',    label: 'Refrigerant',   Icon: Snowflake },
  { value: 'OTHER',          label: 'Other',         Icon: MoreHorizontal },
];

const formatDateLabel = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  if (d.getTime() === today.getTime()) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MaintenanceRecordForm = ({
  selectedSuite,
  selectedUnit,
  setSelectedUnit,
  maintenanceType,
  setMaintenanceType,
  serviceDate,
  setServiceDate,
  maintenanceNote,
  setMaintenanceNote,
  photoFiles,
  setPhotoFiles,
  uploadStatus,
  formError,
  submitStatus,
  submitError,
  handleSubmit,
  setShowAddHVAC,
  openPhotoSection,
  unitData,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const dateInputRef = useRef(null);
  const photoSectionRef = useRef(null);

  useEffect(() => {
    if (openPhotoSection && photoSectionRef.current) {
      setTimeout(() => {
        photoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [openPhotoSection]);

  if (!selectedSuite) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center space-y-3">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    setSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setSubmitting(false);
    }
  };

  const addPhotoFromCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.multiple = true;
    input.onchange = (e) => setPhotoFiles(prev => [...prev, ...Array.from(e.target.files)]);
    input.click();
  };

  const addPhotoFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => setPhotoFiles(prev => [...prev, ...Array.from(e.target.files)]);
    input.click();
  };

  const hasError = formError || submitError;
  const isSuccess = !!submitStatus && !submitting;
  const canSubmit = !!maintenanceType && !submitting;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">

      {/* ── Work Type chips ── */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
          What did you do?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {WORK_TYPES.map(({ value, label, Icon }) => {
            const selected = maintenanceType === value;
            const isOther = value === 'OTHER';
            return (
              <button
                key={value}
                type="button"
                onClick={() => setMaintenanceType(value)}
                style={selected ? { backgroundColor: '#101d40' } : {}}
                className={[
                  'flex items-center gap-3 px-4 rounded-2xl text-left transition-all duration-100 active:scale-[0.96]',
                  isOther ? 'col-span-2 py-3.5 justify-center' : 'py-4',
                  selected
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-100 shadow-sm',
                ].join(' ')}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 ${selected ? 'text-white' : 'text-gray-400'}`}
                />
                <span className="text-[15px] font-semibold leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Unit selector (only when not pre-selected) ── */}
      {!unitData && selectedSuite?.hvacUnits?.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
            HVAC Unit
          </p>
          <div className="flex gap-2.5">
            <select
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              required
              className="flex-1 px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none"
            >
              <option value="">Select unit...</option>
              {selectedSuite.hvacUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.label || unit.serialNumber || `Unit ${unit.id}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddHVAC(true)}
              className="px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] font-semibold text-gray-700 shadow-sm active:scale-[0.97] transition-transform whitespace-nowrap"
            >
              + Add
            </button>
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
          Notes{' '}
          <span className="normal-case font-normal tracking-normal text-gray-300">— optional</span>
        </p>
        <textarea
          value={maintenanceNote}
          onChange={e => setMaintenanceNote(e.target.value)}
          placeholder="Parts replaced, issues found, next steps..."
          rows={3}
          className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-300 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 leading-relaxed"
        />
      </div>

      {/* ── Photos ── */}
      <div ref={photoSectionRef}>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
          Photos{' '}
          <span className="normal-case font-normal tracking-normal text-gray-300">— optional</span>
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={addPhotoFromCamera}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] font-semibold text-gray-700 shadow-sm active:scale-[0.97] transition-transform"
          >
            <Camera className="w-4 h-4 text-gray-400" />
            Camera
          </button>
          <button
            type="button"
            onClick={addPhotoFromGallery}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] font-semibold text-gray-700 shadow-sm active:scale-[0.97] transition-transform"
          >
            <ImageIcon className="w-4 h-4 text-gray-400" />
            Gallery
          </button>
        </div>

        {photoFiles?.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {photoFiles.map((file, i) => (
              <div key={i} className="relative aspect-square">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setPhotoFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadStatus && (
          <p className="text-xs text-gray-400 mt-2 ml-0.5">{uploadStatus}</p>
        )}
      </div>

      {/* ── Error ── */}
      {hasError && (
        <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[14px] text-red-600">{hasError}</p>
        </div>
      )}

      {/* ── Success ── */}
      {isSuccess && !hasError && (
        <div className="px-4 py-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1.5 4L3.5 6L8.5 1.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-green-700">{submitStatus}</p>
        </div>
      )}

      {/* ── Date pill + Submit ── */}
      <div
        className="flex items-center gap-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        {/* Date picker — label wraps input so entire pill is tappable */}
        <label className="relative flex-shrink-0 flex items-center gap-1.5 px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] font-semibold text-gray-700 shadow-sm whitespace-nowrap cursor-pointer select-none">
          {formatDateLabel(serviceDate)}
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
          <input
            ref={dateInputRef}
            type="date"
            value={serviceDate}
            onChange={e => setServiceDate(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            'flex-1 py-3.5 rounded-2xl text-[15px] font-bold tracking-wide transition-all duration-150 active:scale-[0.98]',
            canSubmit
              ? 'text-white shadow-lg'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          ].join(' ')}
          style={canSubmit ? { backgroundColor: '#101d40' } : {}}
        >
          {submitting ? 'Saving...' : 'Log Work'}
        </button>
      </div>

    </form>
  );
};

export default MaintenanceRecordForm;

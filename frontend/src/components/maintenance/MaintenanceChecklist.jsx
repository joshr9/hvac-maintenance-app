// MaintenanceChecklist.jsx — Preventative Maintenance Checklist, 2026 redesign
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Camera, ImageIcon, X, Check, CheckCircle } from 'lucide-react';

const MaintenanceChecklist = ({
  selectedSuite,
  selectedUnit,
  setSelectedUnit,
  onChecklistComplete,
  setShowAddHVAC,
  submitStatus,
  setSubmitStatus,
}) => {
  const { user: clerkUser } = useUser();
  const today = new Date().toISOString().split('T')[0];

  const [serviceDate, setServiceDate] = useState(today);
  const [serviceTechnician, setServiceTechnician] = useState(
    clerkUser?.fullName || clerkUser?.firstName || ''
  );

  // Cooling Season
  const [deltaT, setDeltaT] = useState('');
  const [blowerBeltCooling, setBlowerBeltCooling] = useState('');   // 'Good' | 'Bad' | ''
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [visualElecCooling, setVisualElecCooling] = useState(false);
  const [visualCompressorsCoils, setVisualCompressorsCoils] = useState(false);

  // Heating Season
  const [cleanFlameRod, setCleanFlameRod] = useState(false);
  const [visualHeatingCompartment, setVisualHeatingCompartment] = useState(false);
  const [blowerMotorAmps, setBlowerMotorAmps] = useState('');
  const [draftMotorAmps, setDraftMotorAmps] = useState('');
  const [visualElecHeating, setVisualElecHeating] = useState(false);
  const [blowerBeltHeating, setBlowerBeltHeating] = useState('');   // 'Good' | 'Bad' | ''

  // Bottom
  const [problemsFound, setProblemsFound] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoUploadStatus, setPhotoUploadStatus] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Photo helpers ──────────────────────────────────────────────────────────
  const addPhotoFromCamera = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.capture = 'environment'; input.multiple = true;
    input.onchange = (e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
    input.click();
  };

  const addPhotoFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
    input.onchange = (e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)]);
    input.click();
  };

  // ── Technician resolution ──────────────────────────────────────────────────
  const getTechnicianId = async () => {
    if (!clerkUser) throw new Error('User not logged in');
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/team-members`);
    const technicians = await res.json();
    const existing = technicians.find(
      t => t.email === clerkUser.primaryEmailAddress?.emailAddress
    );
    if (existing) return existing.id;
    const createRes = await fetch(`${apiUrl}/api/team-members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        role: 'TECHNICIAN',
      }),
    });
    return (await createRes.json()).id;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setFormError('');
    if (!selectedSuite) { setFormError('No suite selected.'); return; }
    if (!selectedUnit)  { setFormError('Please select an HVAC unit.'); return; }

    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const technicianId = await getTechnicianId();

      const payload = {
        hvacUnitId: Number(selectedUnit),
        technicianId,
        notes: problemsFound || 'Preventative maintenance checklist completed',
        maintenanceType: 'PREVENTIVE_MAINTENANCE',
        status: 'COMPLETED',
        createdAt: serviceDate,
        serviceTechnician,
        checklistData: {
          coolingSeason: {
            deltaT,
            blowerBelt: blowerBeltCooling,
            filtersChanged,
            visualElectricalCompartment: visualElecCooling,
            visualCompressorsCoils,
          },
          heatingSeason: {
            cleanFlameRod,
            visualHeatingCompartment,
            blowerMotorAmps,
            draftMotorAmps,
            visualElectricalCompartment: visualElecHeating,
            blowerBelt: blowerBeltHeating,
          },
        },
      };

      const logRes = await fetch(`${apiUrl}/api/maintenance-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!logRes.ok) throw new Error('Failed to create maintenance log');
      const savedLog = await logRes.json();

      if (photos.length > 0) {
        setPhotoUploadStatus('Uploading photos…');
        for (const file of photos) {
          const fd = new FormData();
          fd.append('photo', file);
          await fetch(`${apiUrl}/api/maintenance-logs/${savedLog.id}/photos`, {
            method: 'POST', body: fd,
          });
        }
        setPhotoUploadStatus(`${photos.length} photo${photos.length !== 1 ? 's' : ''} uploaded`);
        setTimeout(() => setPhotoUploadStatus(''), 2000);
      }

      setSubmitStatus('PM checklist saved!');
      if (onChecklistComplete) onChecklistComplete(savedLog);
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setFormError('Failed to save checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const CheckRow = ({ label, checked, onChange, both }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98] ${
        checked ? 'bg-[#101d40]' : 'bg-white border border-gray-100'
      }`}
      style={checked ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'bg-white border-white' : 'border-gray-300'
      }`}>
        {checked && <Check className="w-3 h-3 text-[#101d40]" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] font-medium leading-snug select-none flex-1 ${
        checked ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </span>
      {both && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
          checked ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          both
        </span>
      )}
    </button>
  );

  const GoodBadToggle = ({ label, value, onChange, both }) => (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <p className="text-[13px] font-medium text-gray-700">{label}</p>
        {both && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">both</span>
        )}
      </div>
      <div className="flex gap-2 px-4 pb-3.5">
        {['Good', 'Bad'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.97] ${
              value === opt
                ? opt === 'Good' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const InputRow = ({ label, value, onChange, placeholder, suffix, both }) => (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1.5">
        <label className="text-[13px] font-medium text-gray-700">{label}</label>
        {both && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">both</span>
        )}
      </div>
      <div className="flex items-center px-4 pb-3.5 gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ''}
          className="flex-1 text-[15px] text-gray-900 bg-gray-50 rounded-xl px-3 py-2.5 border-0 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder-gray-300"
        />
        {suffix && <span className="text-[13px] text-gray-400 flex-shrink-0">{suffix}</span>}
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-32 space-y-6">

        {/* Error */}
        {formError && (
          <div className="px-4 py-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[14px] text-red-600">{formError}</p>
          </div>
        )}

        {/* Success */}
        {submitStatus && (
          <div className="px-4 py-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-[14px] font-medium text-green-700">{submitStatus}</p>
          </div>
        )}

        {/* Unit selector — only when not pre-selected */}
        {!selectedUnit && selectedSuite?.hvacUnits?.length > 0 && (
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
                <option value="">Select unit…</option>
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

        {/* Service Info */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
            Service Info
          </p>
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="flex divide-x divide-gray-100">
              <div className="flex-1 px-4 py-3.5">
                <label className="block text-[11px] text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={e => setServiceDate(e.target.value)}
                  className="w-full text-[15px] text-gray-900 bg-transparent border-0 focus:outline-none"
                />
              </div>
              <div className="flex-1 px-4 py-3.5">
                <label className="block text-[11px] text-gray-400 mb-1">Technician</label>
                <input
                  type="text"
                  value={serviceTechnician}
                  onChange={e => setServiceTechnician(e.target.value)}
                  placeholder="Name"
                  className="w-full text-[15px] text-gray-900 bg-transparent border-0 focus:outline-none placeholder-gray-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Cooling Season ─────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
            Cooling Season
          </p>
          <div className="space-y-2">
            <InputRow
              label="Delta-T"
              value={deltaT}
              onChange={setDeltaT}
              placeholder="0"
              suffix="°F"
            />
            <GoodBadToggle
              label="Blower Belt"
              value={blowerBeltCooling}
              onChange={setBlowerBeltCooling}
              both
            />
            <CheckRow
              label="Filters Changed"
              checked={filtersChanged}
              onChange={setFiltersChanged}
            />
            <CheckRow
              label="Visual inspection of electrical compartment"
              checked={visualElecCooling}
              onChange={setVisualElecCooling}
              both
            />
            <CheckRow
              label="Visual inspection of compressors & coils"
              checked={visualCompressorsCoils}
              onChange={setVisualCompressorsCoils}
            />
          </div>
        </div>

        {/* ── Heating Season ─────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
            Heating Season
          </p>
          <div className="space-y-2">
            <CheckRow
              label="Clean Flame Rod"
              checked={cleanFlameRod}
              onChange={setCleanFlameRod}
            />
            <CheckRow
              label="Visual inspection of heating compartment, clean if needed"
              checked={visualHeatingCompartment}
              onChange={setVisualHeatingCompartment}
            />
            <InputRow
              label="Check blower motor amperage (D.D. only)"
              value={blowerMotorAmps}
              onChange={setBlowerMotorAmps}
              placeholder="0.0"
              suffix="A"
              both
            />
            <InputRow
              label="Check draft motor amperage"
              value={draftMotorAmps}
              onChange={setDraftMotorAmps}
              placeholder="0.0"
              suffix="A"
            />
            <CheckRow
              label="Visual inspection of electrical compartment"
              checked={visualElecHeating}
              onChange={setVisualElecHeating}
              both
            />
            <GoodBadToggle
              label="Blower Belt"
              value={blowerBeltHeating}
              onChange={setBlowerBeltHeating}
              both
            />
          </div>
        </div>

        {/* ── Problems Found / Notes ────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-3 px-0.5">
            Problems Found / Notes{' '}
            <span className="normal-case font-normal tracking-normal text-gray-300">— optional</span>
          </p>
          <textarea
            value={problemsFound}
            onChange={e => setProblemsFound(e.target.value)}
            placeholder="Issues found, parts needed, recommendations…"
            rows={3}
            className="w-full px-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-300 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 leading-relaxed"
          />
        </div>

        {/* ── Photos ───────────────────────────────────────────── */}
        <div>
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
              <Camera className="w-4 h-4 text-gray-400" /> Camera
            </button>
            <button
              type="button"
              onClick={addPhotoFromGallery}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-100 rounded-2xl text-[15px] font-semibold text-gray-700 shadow-sm active:scale-[0.97] transition-transform"
            >
              <ImageIcon className="w-4 h-4 text-gray-400" /> Gallery
            </button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              {photos.map((file, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photoUploadStatus && (
            <p className="text-xs text-gray-400 mt-2 ml-0.5">{photoUploadStatus}</p>
          )}
        </div>

      </div>

      {/* ── Fixed submit button ───────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 py-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedUnit}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98] ${
            isSubmitting || !selectedUnit
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'text-white'
          }`}
          style={isSubmitting || !selectedUnit ? {} : { backgroundColor: '#101d40' }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            'Save PM Checklist'
          )}
        </button>
      </div>
    </>
  );
};

export default MaintenanceChecklist;

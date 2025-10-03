// MaintenanceRecordForm.jsx - Mobile-Optimized Quick Maintenance Form

import React, { useRef } from 'react';
import { Plus, Calendar, FileText, Camera, Upload, X } from 'lucide-react';

const MAINTENANCE_TYPES = [
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'FILTER_CHANGE', label: 'Filter Change' },
  { value: 'FULL_SERVICE', label: 'Full Service' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'OTHER', label: 'Other' },
];

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
  openPhotoSection
}) => {
  const fileInputRef = useRef(null);
  const photoSectionRef = useRef(null);

  // Scroll to photo section if openPhotoSection is true
  React.useEffect(() => {
    if (openPhotoSection && photoSectionRef.current) {
      setTimeout(() => {
        photoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [openPhotoSection]);

  // ✅ FIXED: Add null check for selectedSuite
  if (!selectedSuite) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading suite data...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(prev => [...prev, ...files]);
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 sm:p-3 rounded-lg bg-blue-50">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Quick Maintenance</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Maintenance Type & Service Date - Mobile: Stacked, Desktop: Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Maintenance Type
            </label>
            <select
              className="w-full p-4 sm:p-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[48px]"
              value={maintenanceType}
              onChange={e => setMaintenanceType(e.target.value)}
              required
            >
              <option value="">Select type...</option>
              {MAINTENANCE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Service Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="date"
                className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[48px]"
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* HVAC Unit Selection - Mobile Optimized */}
        <div>
          <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            HVAC Unit
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="flex-1 p-4 sm:p-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all min-h-[48px]"
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              required
            >
              <option value="">Select HVAC unit...</option>
              {selectedSuite?.hvacUnits && selectedSuite.hvacUnits.length > 0 ? (
                selectedSuite.hvacUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label || unit.name || unit.serialNumber || unit.filterSize || `Unit ${unit.id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>No HVAC units found</option>
              )}
            </select>
            <button
              className="px-6 py-4 sm:py-3 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap min-h-[48px] shadow-lg"
              onClick={() => setShowAddHVAC(true)}
              type="button"
            >
              Add Unit
            </button>
          </div>
        </div>

        {/* Maintenance Notes - Mobile Optimized */}
        <div>
          <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Maintenance Notes
          </label>
          <textarea
            className="w-full p-4 sm:p-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all resize-none"
            rows="6"
            value={maintenanceNote}
            onChange={e => setMaintenanceNote(e.target.value)}
            placeholder="Describe the work performed, parts used, issues found, and any recommendations..."
            required
          />
        </div>

        {/* Photo Upload Section - Mobile Optimized with Camera Support */}
        <div ref={photoSectionRef}>
          <label className="block text-base sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Attach Photos {openPhotoSection && <span className="text-blue-600">(Tap to capture)</span>}
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <button
              type="button"
              onClick={handleCameraCapture}
              className="w-full flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="p-4 bg-blue-100 rounded-full">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-base sm:text-sm font-medium text-gray-700">
                  Tap to take photo or upload
                </p>
                <p className="text-sm sm:text-xs text-gray-500">
                  PNG, JPG up to 10MB each
                </p>
              </div>
            </button>
          </div>

          {/* Photo Preview - Mobile Optimized Grid */}
          {photoFiles && photoFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-base sm:text-sm font-semibold text-gray-700 mb-3">
                Selected Photos ({photoFiles.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {photoFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 sm:h-28 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadStatus && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm sm:text-base font-medium text-blue-700">
                {uploadStatus}
              </p>
            </div>
          )}
        </div>

        {/* Error Messages - Mobile Optimized */}
        {formError && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm sm:text-base text-red-600 font-medium">{formError}</p>
          </div>
        )}

        {/* Submit Error Messages - Mobile Optimized */}
        {submitError && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm sm:text-base text-red-600 font-medium">{submitError}</p>
          </div>
        )}

        {/* Success Messages - Mobile Optimized */}
        {submitStatus && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-sm sm:text-base text-green-600 font-medium">{submitStatus}</p>
          </div>
        )}

        {/* Submit Button - Mobile: Full Width, Large Touch Target */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-3 px-6 py-5 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg sm:text-base font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-98 transition-all shadow-xl min-h-[56px]"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            Save Maintenance Record
          </button>
        </div>
      </form>

      <style jsx>{`
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default MaintenanceRecordForm;

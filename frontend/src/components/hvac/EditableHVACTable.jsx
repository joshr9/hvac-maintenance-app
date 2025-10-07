import React, { useState, useEffect } from "react";
import { Trash, Wrench, Edit2, Calendar, Tag, FileText, X } from 'lucide-react';

function EditableHVACTable({ hvacUnits = [], onUnitUpdate }) {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRows, setEditRows] = useState([]);

  useEffect(() => {
    setEditRows(
      (hvacUnits || []).map((unit) => ({
        ...unit,
        label: unit.label || "",
        serialNumber: unit.serialNumber || "",
        model: unit.model || "",
        installDate: unit.installDate ? unit.installDate.slice(0, 10) : "",
        filterSize: unit.filterSize || "",
        notes: unit.notes || "",
        _status: "",
        _error: "",
      }))
    );
  }, [hvacUnits]);

  const handleChange = (idx, field, value) => {
    setEditRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleOpenEdit = (unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUnit(null), 300); // Wait for animation
  };

  const handleSaveFromModal = async () => {
    if (!selectedUnit) return;

    setSelectedUnit({ ...selectedUnit, _status: "saving", _error: "" });

    const payload = {
      label: selectedUnit.label,
      serialNumber: selectedUnit.serialNumber,
      model: selectedUnit.model,
      installDate: selectedUnit.installDate,
      filterSize: selectedUnit.filterSize,
      notes: selectedUnit.notes,
    };

    try {
      const res = await fetch(`/api/hvac-units/${selectedUnit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedUnit = await res.json();
        setEditRows((rows) =>
          rows.map((row) =>
            row.id === updatedUnit.id ? { ...updatedUnit, _status: "", _error: "" } : row
          )
        );
        if (onUnitUpdate) onUnitUpdate(updatedUnit);
        handleCloseModal();
      } else {
        const errMsg = (await res.json())?.message || "Error saving";
        setSelectedUnit({ ...selectedUnit, _status: "error", _error: errMsg });
      }
    } catch {
      setSelectedUnit({ ...selectedUnit, _status: "error", _error: "Network error" });
    }
  };

  const handleSave = async (idx) => {
    setEditRows((rows) =>
      rows.map((row, i) =>
        i === idx ? { ...row, _status: "saving", _error: "" } : row
      )
    );
    const unit = editRows[idx];
    const payload = {
      label: unit.label,
      serialNumber: unit.serialNumber,
      model: unit.model,
      installDate: unit.installDate,
      filterSize: unit.filterSize,
      notes: unit.notes,
    };
    try {
      const res = await fetch(`/api/hvac-units/${unit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedUnit = await res.json();
        setEditRows((rows) =>
          rows.map((row, i) =>
            i === idx ? { ...row, _status: "saved", _error: "" } : row
          )
        );
        if (onUnitUpdate) onUnitUpdate(updatedUnit);
        setTimeout(() => {
          setEditRows((rows) =>
            rows.map((row, i) =>
              i === idx ? { ...row, _status: "" } : row
            )
          );
        }, 1200);
      } else {
        const errMsg = (await res.json())?.message || "Error saving";
        setEditRows((rows) =>
          rows.map((row, i) =>
            i === idx ? { ...row, _status: "error", _error: errMsg } : row
          )
        );
      }
    } catch {
      setEditRows((rows) =>
        rows.map((row, i) =>
          i === idx ? { ...row, _status: "error", _error: "Network error" } : row
        )
      );
    }
  };

  const handleDelete = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this HVAC unit?')) return;
    try {
      const res = await fetch(`/api/hvac-units/${unitId}`, { method: "DELETE" });
      if (res.ok) {
        setEditRows(rows => rows.filter(row => row.id !== unitId));
      } else {
        alert("Error deleting unit.");
      }
    } catch {
      alert("Network error deleting unit.");
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="p-1 rounded" style={{backgroundColor: '#e8eafc'}}>
          <Wrench className="w-4 h-4" style={{color: '#2a3a91'}} />
        </div>
        <span className="text-sm font-semibold text-gray-700">Edit HVAC Units for this Suite</span>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {editRows.map((unit) => (
          <div key={unit.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {unit.label || 'Unnamed Unit'}
                    </h4>
                    <p className="text-sm text-gray-500">SN: {unit.serialNumber || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenEdit(unit)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 text-sm">
                {unit.model && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span>Model: {unit.model}</span>
                  </div>
                )}
                {unit.installDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Installed: {new Date(unit.installDate).toLocaleDateString()}</span>
                  </div>
                )}
                {unit.filterSize && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Filter: {unit.filterSize}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2" style={{WebkitOverflowScrolling: 'touch'}}>
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm rounded-xl">
            <table className="min-w-full border border-gray-200 bg-white text-xs sm:text-sm">
          <thead>
            <tr style={{backgroundColor: '#f8fafc'}}>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Label/Name</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Serial #</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Model</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Install Date</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Filter Size</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Notes</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {editRows.map((row, idx) => (
              <tr
                key={row.id}
                className={
                  (idx % 2 === 0 ? "bg-white" : "bg-gray-50") +
                  " hover:bg-blue-50 transition-colors"
                }
              >
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    value={row.label || ""}
                    onChange={(e) => handleChange(idx, "label", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    value={row.serialNumber}
                    onChange={(e) =>
                      handleChange(idx, "serialNumber", e.target.value)
                    }
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    value={row.model}
                    onChange={(e) => handleChange(idx, "model", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    value={row.installDate}
                    onChange={(e) =>
                      handleChange(idx, "installDate", e.target.value)
                    }
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    value={row.filterSize}
                    onChange={(e) =>
                      handleChange(idx, "filterSize", e.target.value)
                    }
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': '#2a3a91'}}
                    onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#2a3a91')}
                    value={row.notes}
                    onChange={(e) => handleChange(idx, "notes", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <div className="flex gap-2 items-center justify-center">
                    <button
                      className="px-3 py-1 rounded text-white text-xs font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition"
                      style={{backgroundColor: '#2a3a91', '--tw-ring-color': '#2a3a91'}}
                      disabled={row._status === "saving"}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSave(idx);
                      }}
                    >
                      {row._status === "saving"
                        ? "Saving..."
                        : row._status === "saved"
                        ? "Saved!"
                        : "Save"}
                    </button>
                    <button
                      className="p-1 rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(row.id);
                      }}
                      type="button"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  {row._status === "error" && (
                    <div className="text-xs text-red-600 mt-1">{row._error}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>

      {/* iOS-Style Modal Sheet */}
      {isModalOpen && selectedUnit && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={handleCloseModal}
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          />

          {/* Modal Sheet */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Swipe Handle */}
              <div className="pt-3 pb-2 flex justify-center">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Edit HVAC Unit</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-5">
                  {/* Label/Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label/Name
                    </label>
                    <input
                      type="text"
                      value={selectedUnit.label || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, label: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="e.g., YORK, Main Unit"
                    />
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={selectedUnit.serialNumber || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, serialNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="e.g., N1L"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={selectedUnit.model || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, model: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="e.g., ZE0"
                    />
                  </div>

                  {/* Install Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Install Date
                    </label>
                    <input
                      type="date"
                      value={selectedUnit.installDate || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, installDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  {/* Filter Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter Size
                    </label>
                    <input
                      type="text"
                      value={selectedUnit.filterSize || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, filterSize: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="e.g., 16x20x1"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={selectedUnit.notes || ''}
                      onChange={(e) => setSelectedUnit({ ...selectedUnit, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                      placeholder="Additional notes..."
                    />
                  </div>

                  {/* Error Message */}
                  {selectedUnit._error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{selectedUnit._error}</p>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      handleCloseModal();
                      handleDelete(selectedUnit.id);
                    }}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 active:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Unit
                  </button>
                </div>
              </div>

              {/* Footer with Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 active:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFromModal}
                    disabled={selectedUnit._status === 'saving'}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {selectedUnit._status === 'saving' ? 'Saving...' : 'Done'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default EditableHVACTable;
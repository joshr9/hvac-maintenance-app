import React, { useState, useEffect } from "react";
import { Trash, Wrench } from 'lucide-react';

function EditableHVACTable({ hvacUnits = [], onUnitUpdate }) {
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

      {/* Mobile scroll hint */}
      <div className="mb-2 text-xs text-gray-500 sm:hidden">
        ← Scroll to see all columns →
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2" style={{WebkitOverflowScrolling: 'touch'}}>
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
    </div>
  );
}

export default EditableHVACTable;
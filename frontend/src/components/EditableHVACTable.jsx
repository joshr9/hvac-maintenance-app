import React, { useState, useEffect } from 'react';

// Editable HVAC Units Table Component
function EditableHVACTable({ hvacUnits = [] }) {
  const [editRows, setEditRows] = useState([]);

  // Keep editRows in sync with prop changes
  useEffect(() => {
    setEditRows(
      (hvacUnits || []).map(unit => ({
        ...unit,
        name: unit.name || "",
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
    setEditRows(rows =>
      rows.map((row, i) => i === idx ? { ...row, [field]: value } : row)
    );
  };

  const handleSave = async (idx) => {
    setEditRows(rows =>
      rows.map((row, i) => i === idx ? { ...row, _status: "saving", _error: "" } : row)
    );
    const unit = editRows[idx];
    const payload = {
      name: unit.name,
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
        setEditRows(rows =>
          rows.map((row, i) =>
            i === idx ? { ...row, _status: "saved", _error: "" } : row
          )
        );
        setTimeout(() => {
          setEditRows(rows =>
            rows.map((row, i) =>
              i === idx ? { ...row, _status: "" } : row
            )
          );
        }, 1500);
      } else {
        const errMsg = (await res.json())?.message || "Error saving";
        setEditRows(rows =>
          rows.map((row, i) =>
            i === idx ? { ...row, _status: "error", _error: errMsg } : row
          )
        );
      }
    } catch (e) {
      console.error(e);
      setEditRows(rows =>
        rows.map((row, i) =>
          i === idx ? { ...row, _status: "error", _error: "Network error" } : row
        )
      );
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-2 text-sm font-semibold text-gray-700">Edit HVAC Units for this Suite</div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg bg-white text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border-b font-semibold">Label/Name</th>
              <th className="p-2 border-b font-semibold">Serial #</th>
              <th className="p-2 border-b font-semibold">Model</th>
              <th className="p-2 border-b font-semibold">Install Date</th>
              <th className="p-2 border-b font-semibold">Filter Size</th>
              <th className="p-2 border-b font-semibold">Notes</th>
              <th className="p-2 border-b font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {editRows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    value={row.name}
                    onChange={e => handleChange(idx, "name", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    value={row.serialNumber}
                    onChange={e => handleChange(idx, "serialNumber", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    value={row.model}
                    onChange={e => handleChange(idx, "model", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    value={row.installDate}
                    onChange={e => handleChange(idx, "installDate", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    value={row.filterSize}
                    onChange={e => handleChange(idx, "filterSize", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1"
                    value={row.notes}
                    onChange={e => handleChange(idx, "notes", e.target.value)}
                  />
                </td>
                <td className="p-2 border-b text-center">
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    disabled={row._status === "saving"}
                    onClick={e => {
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
  );
}

export default EditableHVACTable;
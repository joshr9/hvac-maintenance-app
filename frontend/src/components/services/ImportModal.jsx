import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    if (csvFile && onImport) {
      onImport(csvFile);
      onClose();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && onImport) {
      onImport(file);
      onClose();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Import Services</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/80 scale-105' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`} />
          
          <p className="text-gray-600 mb-4">
            {isDragging 
              ? 'Drop your CSV file here!' 
              : 'Drag and drop your CSV file here, or click to select'
            }
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csvUpload"
          />
          
          <label
            htmlFor="csvUpload"
            className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 cursor-pointer transition-all shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)',
              boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'
            }}
          >
            <Upload className="w-4 h-4" />
            Select CSV File
          </label>
        </div>

        <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected CSV format:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Name:</strong> Service name (required)</li>
            <li>• <strong>Description:</strong> Service description</li>
            <li>• <strong>Category:</strong> Service category</li>
            <li>• <strong>Unit Price:</strong> Price per unit</li>
            <li>• <strong>Unit Cost:</strong> Cost per unit</li>
            <li>• <strong>Duration Minutes:</strong> Expected duration</li>
            <li>• <strong>Taxable:</strong> true/false</li>
            <li>• <strong>Active:</strong> true/false</li>
          </ul>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <label
            htmlFor="csvUpload"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            Browse Files
          </label>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
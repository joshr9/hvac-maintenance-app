// components/common/FormComponents.jsx
import React, { useState } from 'react';
import { AlertCircle, ChevronDown, X } from 'lucide-react';

// Generic Dropdown Component
export const Dropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 text-sm"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Form Field Component
export const FormField = ({ 
  label, 
  required = false, 
  error, 
  helpText, 
  children,
  className = ""
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

// Text Input Component
export const TextInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  disabled = false,
  className = "",
  ...props 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    />
  );
};

// Textarea Component
export const Textarea = ({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  disabled = false,
  className = "",
  ...props 
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    />
  );
};

// Grid Layout Component
export const FormGrid = ({ columns = 1, gap = 6, children, className = "" }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-3',
    4: 'grid-cols-1 lg:grid-cols-4'
  };

  const gridGap = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Form Section Component
export const FormSection = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  variant = 'default',
  className = "" 
}) => {
  const variants = {
    default: 'space-y-6',
    highlight: 'bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className="w-5 h-5 text-blue-600" />}
              <h3 className="font-medium text-blue-900">{title}</h3>
            </div>
          )}
          {description && (
            <p className="text-blue-800 text-sm">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Radio Group Component
export const RadioGroup = ({ 
  name, 
  value, 
  onChange, 
  options, 
  label,
  className = "" 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm flex items-center gap-1">
              {option.icon && <option.icon className="w-4 h-4" />}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Error Alert Component
export const ErrorAlert = ({ message, className = "" }) => {
  if (!message) return null;
  
  return (
    <div className={`p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 ${className}`}>
      <AlertCircle className="w-4 h-4 text-red-500" />
      <span className="text-red-700 text-sm">{message}</span>
    </div>
  );
};

// Modal Header Component
export const ModalHeader = ({ title, icon: Icon, onClose }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-blue-100">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// Modal Footer Component
export const ModalFooter = ({ 
  onCancel, 
  onSubmit, 
  submitText = "Submit", 
  submitIcon: SubmitIcon,
  isSubmitting = false,
  cancelText = "Cancel"
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {SubmitIcon && <SubmitIcon className="w-4 h-4" />}
        {isSubmitting ? 'Submitting...' : submitText}
      </button>
    </div>
  );
};
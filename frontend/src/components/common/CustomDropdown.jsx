import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const CustomDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select option...", 
  searchPlaceholder = "Search options...",
  className = "",
  showSearch = false,
  disabled = false,
  groupBy = null // For grouped options like work categories
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Filter and group options
  const getFilteredOptions = () => {
    let filtered = options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (groupBy) {
      // Group options by the specified field
      const grouped = filtered.reduce((groups, option) => {
        const group = option[groupBy] || 'Other';
        if (!groups[group]) groups[group] = [];
        groups[group].push(option);
        return groups;
      }, {});
      return grouped;
    }

    return filtered;
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const filteredOptions = getFilteredOptions();
  const isGrouped = groupBy && typeof filteredOptions === 'object' && !Array.isArray(filteredOptions);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-left
          ${disabled 
            ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
            : 'text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer'
          }
          shadow-sm transition-colors
        `}
      >
        <span className="truncate">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[200px]">
          {/* Search Input */}
          {showSearch && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {isGrouped ? (
              // Grouped Options
              Object.entries(filteredOptions).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    {groupName}
                  </div>
                  {groupOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {option.label}
                      </span>
                      {value === option.value && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              // Regular Options
              Array.isArray(filteredOptions) && filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {option.label}
                    </span>
                    {value === option.value && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </div>
              )
            )}
          </div>

          {/* Footer with count (optional) */}
          {(Array.isArray(filteredOptions) ? filteredOptions.length : Object.values(filteredOptions).flat().length) > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {Array.isArray(filteredOptions) 
                  ? `${filteredOptions.length} option${filteredOptions.length !== 1 ? 's' : ''}`
                  : `${Object.values(filteredOptions).flat().length} option${Object.values(filteredOptions).flat().length !== 1 ? 's' : ''}`
                } available
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
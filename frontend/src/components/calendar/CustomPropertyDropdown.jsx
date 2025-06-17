import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Search, Check } from 'lucide-react';

const CustomPropertyDropdown = ({ filterProperty, setFilterProperty, allProperties }) => {
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

  const selectedProperty = filterProperty === 'all' 
    ? { id: 'all', name: 'All Properties' }
    : allProperties.find(p => p.id === parseInt(filterProperty));

  const filteredProperties = [
    { id: 'all', name: 'All Properties' },
    ...allProperties.filter(property => 
      property.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ];

  const handleSelect = (propertyId) => {
    setFilterProperty(propertyId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm min-w-[200px] transition-colors"
        >
          <span className="truncate">{selectedProperty?.name || 'Select Property'}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-6 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Property List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => handleSelect(property.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {property.name}
                  </span>
                  {(filterProperty === property.id || (filterProperty === 'all' && property.id === 'all')) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No properties found
              </div>
            )}
          </div>

          {/* Property Count */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {filteredProperties.length - 1} properties available
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPropertyDropdown;
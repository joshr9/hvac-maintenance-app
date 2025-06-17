// components/common/UniversalSearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useUniversalSearch } from '../../hooks/useUniversalSearch';
import UniversalSearchDropdown from './UniversalSearchDropdown';

const UniversalSearchBar = ({ 
  currentView = 'dashboard', 
  onNavigate, 
  className = '',
  placeholder = "Search properties, jobs, services..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    hasSearched,
    totalCount,
    clearSearch
  } = useUniversalSearch(currentView);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-open dropdown when there are results
  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [hasSearched, searchQuery]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Get context-specific placeholder
  const getContextPlaceholder = () => {
    const placeholders = {
      dashboard: "Search properties, jobs, services...",
      jobs: "Search jobs, properties, services...",
      properties: "Search properties, jobs, services...", 
      services: "Search services, properties, jobs...",
      schedule: "Search scheduled work, properties..."
    };
    
    return placeholders[currentView] || placeholder;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder={getContextPlaceholder()}
          className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.trim() && hasSearched) {
              setIsOpen(true);
            }
          }}
        />
        
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <UniversalSearchDropdown
          searchResults={searchResults}
          isLoading={isLoading}
          hasSearched={hasSearched}
          totalCount={totalCount}
          searchQuery={searchQuery}
          onNavigate={onNavigate}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default UniversalSearchBar;
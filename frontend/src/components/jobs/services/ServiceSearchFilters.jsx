// components/jobs/services/ServiceSearchFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

const ServiceSearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  showAdvanced = false,
  onToggleAdvanced,
  resultCount = 0,
  totalCount = 0
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'price_asc', label: 'Price Low-High' },
    { value: 'price_desc', label: 'Price High-Low' },
    { value: 'category', label: 'Category' },
    { value: 'recent', label: 'Recently Added' }
  ];

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    if (onPriceRangeChange) {
      onPriceRangeChange({ min: 0, max: 1000 });
    }
    onSortChange('name');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || 
    (priceRange && (priceRange.min > 0 || priceRange.max < 1000));

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services by name, description, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-sm bg-white"
            style={{'--tw-ring-color': '#2a3a91'}}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
            showFilters || hasActiveFilters
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {onToggleAdvanced && (
          <button
            onClick={onToggleAdvanced}
            className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
              showAdvanced
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Filter Services</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-sm appearance-none bg-white"
                  style={{'--tw-ring-color': '#2a3a91'}}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Price Range Filter */}
            {priceRange && onPriceRangeChange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => onPriceRangeChange({
                      ...priceRange,
                      min: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-2 py-2 border border-gray-200 rounded text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => onPriceRangeChange({
                      ...priceRange,
                      max: parseFloat(e.target.value) || 1000
                    })}
                    className="w-full px-2 py-2 border border-gray-200 rounded text-sm"
                  />
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent text-sm appearance-none bg-white"
                  style={{'--tw-ring-color': '#2a3a91'}}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm text-gray-600">
            <span>
              Showing {resultCount} of {totalCount} services
            </span>
            {hasActiveFilters && (
              <span className="text-blue-600 font-medium">
                Filters active
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Category Pills */}
      {!showFilters && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            All
          </button>
          {categories.slice(0, 5).map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
          {categories.length > 5 && (
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
            >
              +{categories.length - 5} more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceSearchFilters;
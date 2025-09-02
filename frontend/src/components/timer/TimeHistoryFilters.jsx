// components/timer/TimeHistoryFilters.jsx
import React from 'react';
import { Calendar, Search, Filter, Download } from 'lucide-react';

// Common components  
import { FormField, FormGrid } from '../common/FormComponents';

const TimeHistoryFilters = ({ 
  filters, 
  onFiltersChange, 
  totalEntries = 0,
  totalHours = 0,
  onExport,
  className = '' 
}) => {
  const handleDateRangeChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleQuickFilter = (range) => {
    const today = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        endDate = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        startDate = new Date(lastWeekStart.setHours(0, 0, 0, 0));
        endDate = new Date(lastWeekEnd.setHours(23, 59, 59, 999));
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        return;
    }

    onFiltersChange({
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      jobId: '',
      searchTerm: ''
    });
  };

  const formatHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Quick Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Entries:</span>
            <span className="ml-1 font-medium">{totalEntries}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Time:</span>
            <span className="ml-1 font-medium text-blue-600">
              {formatHours(totalHours)}
            </span>
          </div>
        </div>
        
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-gray-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <FormGrid columns={4} gap={4} className="mb-4">
        {/* Search */}
        <FormField label="Search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by job #, notes..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </FormField>

        {/* Job ID */}
        <FormField label="Job ID">
          <input
            type="text"
            placeholder="Job ID"
            value={filters.jobId || ''}
            onChange={(e) => onFiltersChange({ ...filters, jobId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
          />
        </FormField>

        {/* Start Date */}
        <FormField label="Start Date">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </FormField>

        {/* End Date */}
        <FormField label="End Date">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </FormField>
      </FormGrid>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-500 self-center">Quick filters:</span>
        {[
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
          { key: 'thisWeek', label: 'This Week' },
          { key: 'lastWeek', label: 'Last Week' },
          { key: 'thisMonth', label: 'This Month' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleQuickFilter(key)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          >
            {label}
          </button>
        ))}
        
        <button
          onClick={clearFilters}
          className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors ml-2"
        >
          Clear All
        </button>
      </div>

      {/* Active Filters Indicator */}
      {(filters.searchTerm || filters.jobId || filters.startDate || filters.endDate) && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
          <Filter className="w-4 h-4" />
          <span>Filters active</span>
        </div>
      )}
    </div>
  );
};

export default TimeHistoryFilters;
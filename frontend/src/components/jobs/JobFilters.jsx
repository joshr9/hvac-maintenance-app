// JobFilters.jsx - Fixed with proper late jobs filtering support
import React, { useMemo } from 'react';
import { Search, Filter, Users, Building, AlertTriangle } from 'lucide-react';

const JobFilters = ({
  statusFilter,
  priorityFilter,
  technicianFilter,
  propertyFilter,
  searchTerm,
  onStatusChange,
  onPriorityChange,
  onTechnicianChange,
  onPropertyChange,
  onSearchChange,
  jobs = [],
  properties = []
}) => {
  // ✅ ENHANCED: Status options with late jobs support
  const statusOptions = useMemo(() => {
    const baseOptions = [
      { value: 'all', label: 'All Statuses', count: jobs.length },
      { value: 'SCHEDULED', label: 'Scheduled', count: jobs.filter(j => j.status === 'SCHEDULED').length },
      { value: 'DISPATCHED', label: 'Dispatched', count: jobs.filter(j => j.status === 'DISPATCHED').length },
      { value: 'IN_PROGRESS', label: 'In Progress', count: jobs.filter(j => j.status === 'IN_PROGRESS').length },
      { value: 'COMPLETED', label: 'Completed', count: jobs.filter(j => j.status === 'COMPLETED').length },
      { value: 'CANCELLED', label: 'Cancelled', count: jobs.filter(j => j.status === 'CANCELLED').length }
    ];

    // ✅ ADDED: Calculate late jobs count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lateJobsCount = jobs.filter(job => {
      const scheduledDate = new Date(job.scheduledDate);
      const isOverdue = scheduledDate < today;
      const isActiveStatus = ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS'].includes(job.status);
      return isOverdue && isActiveStatus;
    }).length;

    // Add late jobs option if there are any
    if (lateJobsCount > 0) {
      baseOptions.splice(1, 0, {
        value: 'late',
        label: 'Late Jobs',
        count: lateJobsCount,
        isSpecial: true
      });
    }

    return baseOptions;
  }, [jobs]);

  const priorityOptions = useMemo(() => [
    { value: 'all', label: 'All Priorities', count: jobs.length },
    { value: 'URGENT', label: 'Urgent', count: jobs.filter(j => j.priority === 'URGENT').length },
    { value: 'HIGH', label: 'High', count: jobs.filter(j => j.priority === 'HIGH').length },
    { value: 'MEDIUM', label: 'Medium', count: jobs.filter(j => j.priority === 'MEDIUM').length },
    { value: 'LOW', label: 'Low', count: jobs.filter(j => j.priority === 'LOW').length }
  ], [jobs]);

  const technicianOptions = useMemo(() => {
    const technicians = [...new Set(jobs.map(j => j.assignedTechnician).filter(Boolean))];
    return [
      { value: 'all', label: 'All Technicians', count: jobs.length },
      ...technicians.map(tech => ({
        value: tech,
        label: tech,
        count: jobs.filter(j => j.assignedTechnician === tech).length
      }))
    ];
  }, [jobs]);

  const propertyOptions = useMemo(() => [
    { value: 'all', label: 'All Properties', count: jobs.length },
    ...properties.map(property => ({
      value: property.id.toString(),
      label: property.name || property.address,
      count: jobs.filter(j => j.property?.id === property.id).length
    }))
  ], [jobs, properties]);

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || 
                          technicianFilter !== 'all' || propertyFilter !== 'all' || 
                          searchTerm !== '';

  const clearAllFilters = () => {
    onStatusChange('all');
    onPriorityChange('all');
    onTechnicianChange('all');
    onPropertyChange('all');
    onSearchChange('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search jobs by title, number, property, or technician..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ✅ ENHANCED: Status Filter with late jobs support */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              statusFilter === 'late' ? 'border-red-300 bg-red-50 text-red-800' : ''
            }`}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
                {option.isSpecial ? ' ⚠️' : ''}
              </option>
            ))}
          </select>
          {statusFilter === 'late' && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span>Showing overdue jobs only</span>
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>

        {/* Technician Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Technician
          </label>
          <select
            value={technicianFilter}
            onChange={(e) => onTechnicianChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {technicianOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>

        {/* Property Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Property
          </label>
          <select
            value={propertyFilter}
            onChange={(e) => onPropertyChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {propertyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Active Filters:</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {statusFilter !== 'all' && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                statusFilter === 'late' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                Status: {statusOptions.find(o => o.value === statusFilter)?.label}
                {statusFilter === 'late' && <AlertTriangle className="w-3 h-3" />}
              </span>
            )}
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Priority: {priorityOptions.find(o => o.value === priorityFilter)?.label}
              </span>
            )}
            {technicianFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Technician: {technicianFilter}
              </span>
            )}
            {propertyFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                Property: {propertyOptions.find(o => o.value === propertyFilter)?.label}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
// components/jobs/JobFilters.jsx - Complete File
import React from 'react';
import { Search, Filter } from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';

const JobFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  propertyFilter,
  setPropertyFilter,
  properties = [],
  filteredJobsCount,
  totalJobsCount
}) => {
  // Status options for dropdown
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'INVOICED', label: 'Invoiced' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  // Property options for dropdown
  const propertyOptions = [
    { value: 'all', label: 'All Properties' },
    ...properties.map(property => ({
      value: property.id.toString(),
      label: property.name
    }))
  ];

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, properties, job numbers, or work types..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter - Updated to use CustomDropdown */}
          <div className="lg:w-48">
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="All Statuses"
              className="w-full"
            />
          </div>

          {/* Property Filter - Updated to use CustomDropdown */}
          <div className="lg:w-48">
            <CustomDropdown
              value={propertyFilter}
              onChange={setPropertyFilter}
              options={propertyOptions}
              placeholder="All Properties"
              showSearch={properties.length > 10}
              searchPlaceholder="Search properties..."
              className="w-full"
            />
          </div>

          <button className="lg:w-auto px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredJobsCount} of {totalJobsCount} jobs
        </p>
      </div>
    </>
  );
};

export default JobFilters;
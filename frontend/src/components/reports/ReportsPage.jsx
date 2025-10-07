import React, { useState, useEffect } from 'react';
import {
  Download, Filter, Calendar, Building, FileText, Search,
  CheckCircle, AlertCircle, Loader, X
} from 'lucide-react';

const ReportsPage = () => {
  const [properties, setProperties] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    propertyId: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });

  // Load properties on mount
  useEffect(() => {
    loadProperties();
    loadMaintenanceLogs();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, maintenanceLogs]);

  const loadProperties = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/properties`);
      if (response.ok) {
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadMaintenanceLogs = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/maintenance-logs`);
      if (response.ok) {
        const data = await response.json();
        setMaintenanceLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading maintenance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...maintenanceLogs];

    // Filter by property
    if (filters.propertyId) {
      filtered = filtered.filter(log => {
        const propertyId = log.hvacUnit?.suite?.propertyId;
        return propertyId && propertyId.toString() === filters.propertyId;
      });
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(log => new Date(log.createdAt) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include entire end date
      filtered = filtered.filter(log => new Date(log.createdAt) <= endDate);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const property = log.hvacUnit?.suite?.property?.name || '';
        const suite = log.hvacUnit?.suite?.name || '';
        const unit = log.hvacUnit?.label || log.hvacUnit?.serialNumber || '';
        const notes = log.notes || '';

        return (
          property.toLowerCase().includes(query) ||
          suite.toLowerCase().includes(query) ||
          unit.toLowerCase().includes(query) ||
          notes.toLowerCase().includes(query)
        );
      });
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilters({
      propertyId: '',
      startDate: '',
      endDate: '',
      searchQuery: ''
    });
  };

  const exportToCSV = () => {
    setExporting(true);

    try {
      // Define CSV headers
      const headers = [
        'Property',
        'Suite',
        'HVAC Unit',
        'Service Date',
        'Technician',
        'Maintenance Type',
        'Status',
        'Notes',
        // Checklist fields
        'Filters Replaced',
        'Bearings Lubricated',
        'Condensate Pan Inspected',
        'Belt Size',
        'Discharge Pressure',
        'Suction Pressure',
        'Gas Leaks Checked',
        'Flue Checked',
        'Problems Found',
        'Photo Count'
      ];

      // Convert logs to CSV rows
      const rows = filteredLogs.map(log => {
        const checklistData = log.checklistData || {};
        const fans = checklistData.fans || {};
        const coolingSeason = checklistData.coolingSeason || {};
        const heatingSeason = checklistData.heatingSeason || {};

        return [
          log.hvacUnit?.suite?.property?.name || '',
          log.hvacUnit?.suite?.name || '',
          log.hvacUnit?.label || log.hvacUnit?.serialNumber || `Unit ${log.hvacUnitId}`,
          new Date(log.createdAt).toLocaleDateString(),
          log.technician?.name || log.serviceTechnician || '',
          log.maintenanceType || '',
          log.status || '',
          (log.notes || '').replace(/"/g, '""'), // Escape quotes
          fans.checkReplaceFilters ? 'Yes' : 'No',
          fans.lubricateBearings ? 'Yes' : 'No',
          fans.inspectCondensatePan ? 'Yes' : 'No',
          fans.beltSize || '',
          coolingSeason.dischargePress || '',
          coolingSeason.suctionPress || '',
          heatingSeason.checkGasLeaks ? 'Yes' : 'No',
          heatingSeason.checkFlueBlockage ? 'Yes' : 'No',
          checklistData.filterList || log.problemsFound || '',
          (log.photos?.length || 0).toString()
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `hvac-maintenance-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setExporting(false), 500);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service History & Reports</h1>
          <p className="text-gray-600">Export maintenance logs and inspection data to CSV</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Filter className="w-6 h-6 text-blue-600" />
              Filter Data
            </h2>
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Property Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Property
              </label>
              <select
                value={filters.propertyId}
                onChange={(e) => setFilters({ ...filters, propertyId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Properties</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name || property.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Search notes, units..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Export Summary Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {filteredLogs.length} Record{filteredLogs.length !== 1 ? 's' : ''} Ready to Export
              </h3>
              <p className="text-blue-100">
                {filters.startDate && filters.endDate
                  ? `From ${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`
                  : 'All time data'}
              </p>
            </div>
            <button
              onClick={exportToCSV}
              disabled={exporting || filteredLogs.length === 0}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all ${
                exporting || filteredLogs.length === 0
                  ? 'bg-white/20 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
              }`}
            >
              {exporting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export to CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              Preview ({filteredLogs.length} records)
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading maintenance logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No records found with current filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.hvacUnit?.suite?.property?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.hvacUnit?.label || log.hvacUnit?.serialNumber || `Unit ${log.hvacUnitId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.technician?.name || log.serviceTechnician || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.maintenanceType || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLogs.length > 50 && (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                  Showing first 50 of {filteredLogs.length} records. Export to see all.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

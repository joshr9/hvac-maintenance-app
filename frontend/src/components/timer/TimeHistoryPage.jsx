// components/timer/TimeHistoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, FileText, AlertCircle, Download } from 'lucide-react';

// Common components
import PageWrapper from '../common/PageWrapper';
import PageHeader from '../common/PageHeader';
import { ErrorAlert } from '../common/FormComponents';
import Pagination from '../common/Pagination';

// Timer components
import TimeHistoryFilters from './TimeHistoryFilters';
import TimeEntryCard from './TimeEntryCard';
import EditTimeEntryModal from './EditTimeEntryModal';

const TimeHistoryPage = ({ onNavigate, technicianName = 'Default User' }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    jobId: '',
    searchTerm: ''
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch time entries
  useEffect(() => {
    fetchTimeEntries();
  }, [technicianName]);

  // Apply filters whenever entries or filters change
  useEffect(() => {
    applyFilters();
  }, [timeEntries, filters]);

  const fetchTimeEntries = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/time-entries/technician/${encodeURIComponent(technicianName)}`);
      if (!response.ok) throw new Error('Failed to fetch time entries');
      
      const data = await response.json();
      setTimeEntries(data.entries || []);
    } catch (error) {
      setError('Failed to load time entries');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...timeEntries];

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(entry => 
        new Date(entry.startTime) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => 
        new Date(entry.startTime) <= endDate
      );
    }

    // Filter by job ID
    if (filters.jobId) {
      filtered = filtered.filter(entry => 
        entry.jobId.toString().includes(filters.jobId)
      );
    }

    // Filter by search term (job ID, notes, property address)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.jobId.toString().includes(searchTerm) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchTerm)) ||
        (entry.propertyAddress && entry.propertyAddress.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by start time (newest first)
    filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    setFilteredEntries(filtered);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveEntry = (updatedEntry) => {
    setTimeEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  const handleExport = () => {
    // Simple CSV export
    const csvHeaders = ['Job ID', 'Start Time', 'End Time', 'Duration (minutes)', 'Notes', 'Property Address'];
    const csvRows = filteredEntries.map(entry => [
      entry.jobId,
      entry.startTime,
      entry.endTime || '',
      entry.totalMinutes || 0,
      entry.notes || '',
      entry.propertyAddress || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-entries-${technicianName}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTotalStats = () => {
    return {
      totalEntries: filteredEntries.length,
      totalMinutes: filteredEntries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0)
    };
  };

  const groupEntriesByDate = (entries) => {
    const groups = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
  };

  const { totalEntries, totalMinutes } = getTotalStats();
  
  // Get paginated entries
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  // Page header actions
  const headerActions = [
    {
      label: 'Export',
      icon: Download,
      onClick: handleExport,
      variant: 'secondary'
    }
  ];

  const groupedEntries = groupEntriesByDate(paginatedEntries);

  return (
    <PageWrapper>
      <PageHeader
        title="Time Entry History"
        subtitle={`View and manage time entries for ${technicianName}`}
        icon={Clock}
        actions={headerActions}
      />

      {/* Error Display */}
      <ErrorAlert message={error} className="mb-6" />

      {/* Filters */}
      <TimeHistoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalEntries={totalEntries}
        totalHours={totalMinutes}
        onExport={handleExport}
        className="mb-6"
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading time entries...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Results */}
          {groupedEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No time entries found
              </h3>
              <p className="text-gray-500">
                {timeEntries.length === 0 
                  ? "You haven't logged any time entries yet." 
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedEntries.map(([date, entries]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-gray-50 border-b border-gray-200 py-3 mb-4 rounded-lg px-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {entries.length} entries • {
                        Math.floor(entries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0) / 60)
                      }h {
                        entries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0) % 60
                      }m total
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {entries.map(entry => (
                      <TimeEntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={handleEditEntry}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEntries.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setItemsPerPage}
                showPageSizes={true}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <EditTimeEntryModal
        entry={selectedEntry}
        isOpen={isEditModalOpen}
        onSave={handleSaveEntry}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
      />
    </PageWrapper>
  );
};

export default TimeHistoryPage;
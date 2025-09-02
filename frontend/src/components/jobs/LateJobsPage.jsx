// components/jobs/LateJobsPage.jsx - DEDICATED LATE JOBS PAGE
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, User, Calendar, ArrowLeft } from 'lucide-react';

const LateJobsPage = ({ onBack }) => {
  const [lateJobs, setLateJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLateJobs();
  }, [filter]);

  const fetchLateJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/late?severity=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setLateJobs(data);
      }
    } catch (error) {
      console.error('Error fetching late jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Overdue Jobs
            </h1>
            <p className="text-gray-600">Jobs that are past their scheduled date</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Overdue</option>
            <option value="moderate">Recently Overdue (1-2 days)</option>
            <option value="critical">Critically Late (2+ days)</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      {lateJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">
                {lateJobs.filter(job => job.urgencyLevel === 'critical').length} Critical
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">2+ days overdue</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">
                {lateJobs.filter(job => job.urgencyLevel === 'high').length} High Priority
              </span>
            </div>
            <p className="text-sm text-orange-600 mt-1">Recent overdue</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                {lateJobs.length} Total Overdue
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Need attention</p>
          </div>
        </div>
      )}

      {/* Late Jobs List */}
      {lateJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Late Jobs!</h3>
          <p className="text-gray-600">All jobs are on schedule. Great work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lateJobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-lg border-2 p-6 ${
                job.urgencyLevel === 'critical' 
                  ? 'border-red-300 bg-red-50' 
                  : job.urgencyLevel === 'high'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(job.urgencyLevel)}`}>
                      {job.daysLate} day{job.daysLate !== 1 ? 's' : ''} late
                    </span>
                    <span className="text-sm text-gray-500">#{job.jobNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      job.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      job.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.priority}
                    </span>
                  </div>

                  {/* Job Details */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{job.property?.name}</span>
                      {job.suite && <span>• {job.suite.name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {formatDate(job.scheduledDate)}</span>
                      {job.scheduledTime && <span>at {job.scheduledTime}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{job.assignedTechnician || 'Unassigned'}</span>
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-700 mt-3 bg-white/50 rounded p-2">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      // Navigate to job details or start job
                      window.location.href = `/jobs/${job.id}`;
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    View Job
                  </button>
                  <button
                    onClick={() => {
                      // Quick action to mark as in progress
                      // You'd implement this API call
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Start Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LateJobsPage;
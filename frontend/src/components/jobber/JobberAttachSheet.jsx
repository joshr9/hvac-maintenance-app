// JobberAttachSheet.jsx — optional bottom sheet to attach a saved log to a Jobber job
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, CheckCircle, ChevronRight, Loader } from 'lucide-react';

const JobberAttachSheet = ({ logId, maintenanceType, notes, techName, serviceDate, onClose }) => {
  const [jobs, setJobs]         = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [attaching, setAttaching] = useState(false);
  const [attached, setAttached]  = useState(false);
  const [error, setError]        = useState('');
  const [connected, setConnected] = useState(true);
  const debounce = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Check connection + load jobs
  useEffect(() => {
    fetch(`${apiUrl}/api/jobber/status`)
      .then(r => r.json())
      .then(s => {
        if (!s.connected) { setConnected(false); setLoading(false); return; }
        return fetch(`${apiUrl}/api/jobber/jobs`);
      })
      .then(r => r?.json())
      .then(data => { if (data) setJobs(data); })
      .catch(() => setError('Failed to load Jobber jobs.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? jobs.filter(j =>
        j.title?.toLowerCase().includes(query.toLowerCase()) ||
        j.client?.name?.toLowerCase().includes(query.toLowerCase()) ||
        j.property?.address?.street?.toLowerCase().includes(query.toLowerCase()) ||
        j.jobNumber?.toLowerCase().includes(query.toLowerCase())
      )
    : jobs;

  const handleAttach = async (job) => {
    setAttaching(true);
    setError('');
    try {
      const content = [
        `🔧 Maintenance Log #${logId}`,
        `Type: ${maintenanceType?.replace(/_/g, ' ')}`,
        serviceDate ? `Date: ${serviceDate}` : '',
        techName ? `Technician: ${techName}` : '',
        notes ? `Notes: ${notes}` : '',
        `Logged via HVAC Maintenance App`,
      ].filter(Boolean).join('\n');

      const res = await fetch(`${apiUrl}/api/jobber/note`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jobId: job.id, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to attach note');
      setAttached(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setAttaching(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative bg-[#F2F2F7] rounded-t-3xl flex flex-col"
        style={{
          maxHeight: '80vh',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900">Sync to Jobber</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Optional — attach this log to an open job</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Success */}
        {attached && (
          <div className="mx-4 mb-4 px-4 py-3 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-[14px] font-medium text-green-700">Note added to Jobber job!</p>
          </div>
        )}

        {/* Not connected */}
        {!connected && (
          <div className="mx-4 mb-4 px-4 py-4 bg-white rounded-2xl border border-gray-100 text-center">
            <p className="text-[14px] text-gray-500 mb-3">Jobber is not connected.</p>
            <button
              onClick={() => { window.location.href = `${apiUrl}/api/jobber/auth`; }}
              className="px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white"
              style={{ backgroundColor: '#101d40' }}
            >
              Connect Jobber
            </button>
          </div>
        )}

        {/* Job list */}
        {connected && !attached && (
          <>
            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, client, address…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-[14px] bg-white rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder-gray-400"
                />
              </div>
            </div>

            {error && (
              <p className="px-4 pb-2 text-[13px] text-red-500">{error}</p>
            )}

            <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                  <span className="text-[14px] text-gray-400">Loading jobs…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[14px] text-gray-400">
                    {query ? 'No jobs match your search' : 'No open Jobber jobs found'}
                  </p>
                </div>
              ) : (
                filtered.map(job => (
                  <button
                    key={job.id}
                    onClick={() => handleAttach(job)}
                    disabled={attaching}
                    className="w-full bg-white rounded-2xl px-4 py-3.5 text-left border border-gray-100 active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center gap-3"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate">
                        {job.title || `Job #${job.jobNumber}`}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                        {job.client?.name}
                        {job.property?.address?.street
                          ? ` · ${job.property.address.street}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-medium text-gray-400">
                        #{job.jobNumber}
                      </span>
                      {attaching ? (
                        <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Skip */}
            <div className="px-4 pt-3">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-[15px] font-medium text-gray-500 bg-gray-100 active:scale-[0.98] transition-transform"
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default JobberAttachSheet;

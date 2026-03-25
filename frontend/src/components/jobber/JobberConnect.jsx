// JobberConnect.jsx — shows Jobber connection status + connect/disconnect button
import { useState, useEffect } from 'react';
import { CheckCircle, Link, Unlink, Loader } from 'lucide-react';

const JobberConnect = () => {
  const [status, setStatus]   = useState(null); // null = loading
  const [working, setWorking] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetch(`${apiUrl}/api/jobber/status`)
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  const handleConnect = () => {
    window.location.href = `${apiUrl}/api/jobber/auth`;
  };

  const handleDisconnect = async () => {
    setWorking(true);
    try {
      await fetch(`${apiUrl}/api/jobber/disconnect`, { method: 'DELETE' });
      setStatus({ connected: false });
    } finally {
      setWorking(false);
    }
  };

  if (!status) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <Loader className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-[14px] text-gray-400">Checking Jobber…</span>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Jobber logo placeholder */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-[13px]"
          style={{ backgroundColor: '#F4A01C' }}
        >
          J
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900">Jobber</p>
          {status.connected ? (
            <p className="text-[12px] text-green-600 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> Connected
            </p>
          ) : (
            <p className="text-[12px] text-gray-400 mt-0.5">Not connected</p>
          )}
        </div>

        {status.connected ? (
          <button
            onClick={handleDisconnect}
            disabled={working}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-red-500 bg-red-50 active:scale-[0.97] transition-transform disabled:opacity-40"
          >
            <Unlink className="w-3.5 h-3.5" />
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={working}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-white active:scale-[0.97] transition-transform disabled:opacity-40"
            style={{ backgroundColor: '#101d40' }}
          >
            <Link className="w-3.5 h-3.5" />
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default JobberConnect;

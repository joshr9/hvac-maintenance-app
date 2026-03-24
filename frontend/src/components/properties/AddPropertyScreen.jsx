// AddPropertyScreen.jsx — full-screen add property with address type-ahead
import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, MapPin, Search, X } from 'lucide-react';

const AddPropertyScreen = ({ onClose, onPropertyAdded, initialName = '' }) => {
  const [name, setName]           = useState(initialName);
  const [query, setQuery]         = useState('');
  const [street, setStreet]       = useState('');
  const [city, setCity]           = useState('');
  const [state, setState]         = useState('');
  const [zip, setZip]             = useState('');
  const [suggestions, setSugg]    = useState([]);
  const [showSugg, setShowSugg]   = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const debounce = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 3) { setSugg([]); setShowSugg(false); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=us&addressdetails=1&limit=6`,
        { headers: { 'Accept-Language': 'en-US' } }
      );
      const data = await res.json();
      setSugg(data);
      setShowSugg(true);
    } catch { setSugg([]); }
    finally { setSearching(false); }
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    setStreet(val); // keep street in sync while typing
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(val), 420);
  };

  const handlePick = (item) => {
    const a = item.address || {};
    const num  = a.house_number || '';
    const road = a.road || a.pedestrian || a.footway || '';
    const s    = [num, road].filter(Boolean).join(' ');
    setStreet(s);
    setQuery(s);
    setCity(a.city || a.town || a.village || a.hamlet || a.county || '');
    setState(a.state || '');
    setZip(a.postcode || '');
    setSugg([]);
    setShowSugg(false);
  };

  const handleSave = async () => {
    if (!street.trim()) { setError('Street address is required'); return; }
    if (!city.trim())   { setError('City is required'); return; }
    if (!state.trim())  { setError('State is required'); return; }
    setSaving(true); setError('');
    const fullAddress = [street.trim(), city.trim(), state.trim(), zip.trim()]
      .filter(Boolean).join(', ');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || fullAddress,
          address: fullAddress,
        }),
      });
      if (!res.ok) throw new Error();
      onPropertyAdded(await res.json());
    } catch { setError('Failed to save property. Please try again.'); }
    finally { setSaving(false); }
  };

  const canSave = street.trim() && city.trim() && state.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#F2F2F7]"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Nav bar */}
      <div className="flex items-center px-4 pt-3 pb-3">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[15px] active:opacity-50 transition-opacity flex-shrink-0"
          style={{ color: '#101d40' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900">Add Property</h1>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="text-[15px] font-semibold active:opacity-50 transition-opacity disabled:opacity-30 flex-shrink-0"
          style={{ color: '#101d40' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-2 space-y-5 pb-10">

        {/* Nickname */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 px-1">
            Property Nickname <span className="normal-case font-normal tracking-normal text-gray-300">— optional</span>
          </p>
          <div className="bg-white rounded-2xl shadow-sm">
            <input
              type="text"
              placeholder="e.g. Riverside Apts, Main St Building"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-4 text-[15px] bg-transparent border-0 focus:outline-none placeholder-gray-300"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-2 px-1">
            Address
          </p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* Street — type-ahead */}
            <div className="relative border-b border-gray-100">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${searching ? 'text-blue-400' : 'text-gray-300'}`} />
              <input
                type="text"
                autoFocus
                placeholder="Street address"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                className="w-full pl-10 pr-10 py-4 text-[15px] bg-transparent border-0 focus:outline-none placeholder-gray-300"
              />
              {query.length > 0 && (
                <button
                  onMouseDown={e => { e.preventDefault(); setQuery(''); setStreet(''); setSugg([]); setShowSugg(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 active:opacity-60"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div className="border-b border-gray-100 bg-gray-50/50">
                {suggestions.map((s, i) => {
                  const a = s.address || {};
                  const num  = a.house_number || '';
                  const road = a.road || a.pedestrian || '';
                  const line1 = [num, road].filter(Boolean).join(' ') || s.display_name.split(',')[0];
                  const line2 = [a.city || a.town || a.village || '', a.state || '', a.postcode || '']
                    .filter(Boolean).join(', ');
                  return (
                    <button
                      key={i}
                      onMouseDown={e => { e.preventDefault(); handlePick(s); }}
                      onTouchStart={() => handlePick(s)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left active:bg-gray-100 border-b border-gray-100 last:border-0"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-gray-900 truncate">{line1}</p>
                        {line2 && <p className="text-[12px] text-gray-400 truncate">{line2}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* City */}
            <div className="border-b border-gray-100">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-4 py-4 text-[15px] bg-transparent border-0 focus:outline-none placeholder-gray-300"
              />
            </div>

            {/* State + ZIP */}
            <div className="flex divide-x divide-gray-100">
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={e => setState(e.target.value)}
                className="flex-1 px-4 py-4 text-[15px] bg-transparent border-0 focus:outline-none placeholder-gray-300"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="ZIP"
                value={zip}
                onChange={e => setZip(e.target.value)}
                className="w-28 px-4 py-4 text-[15px] bg-transparent border-0 focus:outline-none placeholder-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-[14px] text-red-600">{error}</p>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full py-4 rounded-2xl text-[15px] font-bold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#101d40', boxShadow: '0 4px 16px rgba(16,29,64,0.25)' }}
        >
          {saving ? 'Saving…' : 'Add Property'}
        </button>
      </div>
    </div>
  );
};

export default AddPropertyScreen;

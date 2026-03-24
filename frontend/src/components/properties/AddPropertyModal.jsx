import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';

const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) { setAddress(''); setName(''); setError(''); }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!address.trim()) { setError('Address is required'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), name: name.trim() || address.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to add property');
      }
      const property = await res.json();
      onPropertyAdded?.(property);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Property"
      footer={
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !address.trim()}
          className="w-full py-3.5 text-white text-sm font-semibold rounded-2xl disabled:opacity-40 active:scale-[0.97] transition-transform"
          style={{ backgroundColor: '#101d40' }}
        >
          {isSubmitting ? 'Adding…' : 'Add Property'}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Full property address"
              value={address}
              onChange={e => { setAddress(e.target.value); setError(''); }}
              className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#101d40]/20 focus:border-[#101d40]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Nickname</label>
          <input
            type="text"
            placeholder="e.g. Village Square, Downtown Office"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#101d40]/20 focus:border-[#101d40]"
          />
          <p className="text-xs text-gray-400 mt-1">Optional friendly name</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
        )}
      </form>
    </BottomSheet>
  );
};

export default AddPropertyModal;

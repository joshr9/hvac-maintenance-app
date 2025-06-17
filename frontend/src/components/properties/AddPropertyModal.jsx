import React, { useState } from 'react';
import { X, Building, Plus, MapPin } from 'lucide-react';

const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const [propertyData, setPropertyData] = useState({
    address: '',
    name: '' // This is the nickname field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPropertyData({
        address: '',
        name: ''
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!propertyData.address.trim()) {
      setError('Address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: propertyData.address.trim(),
          name: propertyData.name.trim() || propertyData.address.trim() // Use address as name if no nickname provided
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add property');
      }

      const newProperty = await response.json();
      
      // Notify parent component
      if (onPropertyAdded) {
        onPropertyAdded(newProperty);
      }

      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error adding property:', error);
      setError(error.message || 'Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
              <Building className="w-5 h-5" style={{color: '#2a3a91'}} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Add New Property</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#2a3a91'}}
                placeholder="Enter the full property address"
                value={propertyData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Nickname Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nickname (Optional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#2a3a91'}}
              placeholder="e.g., Village Square, Downtown Office, etc."
              value={propertyData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional friendly name to make the property easier to find
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !propertyData.address.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: '#2a3a91'}}
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Adding Property...' : 'Add Property'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Helper Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Next steps:</strong> After adding the property, you can select it and add suites/units, then set up HVAC systems for each unit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;
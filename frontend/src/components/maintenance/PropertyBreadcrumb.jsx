import React from 'react';
import { Home, MapPin, ArrowLeft } from 'lucide-react';
import Card from '../common/Card';

const PropertyBreadcrumb = ({ 
  selectedProperty, 
  selectedSuite, 
  onBackToSuites, 
  onChangeProperty 
}) => {
  return (
    <Card variant="glass" padding="md">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
            <Home className="w-6 h-6" style={{color: '#2a3a91'}} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedProperty.name}</h2>
            <p className="text-gray-600 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {selectedProperty.address}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#e8eafc', color: '#2a3a91'}}>
              <Home className="w-4 h-4" />
              {selectedSuite.name || selectedSuite.unitNumber || `Suite ${selectedSuite.id}`}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onBackToSuites}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suites
          </button>
          <button 
            onClick={onChangeProperty}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Change Property
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyBreadcrumb;

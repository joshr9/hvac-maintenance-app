/**
 * Props:
 * - hvacUnits: array (list of HVAC unit objects)
 * - onUnitUpdate: function (called when an HVAC unit is edited)
 */

import React from 'react';
import { Wrench } from 'lucide-react';
import EditableHVACTable from './EditableHVACTable';

const ManageHVACUnitsSection = ({ hvacUnits, onUnitUpdate }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg" style={{backgroundColor: '#e8eafc'}}>
        <Wrench className="w-5 h-5" style={{color: '#2a3a91'}} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Manage HVAC Units</h3>
    </div>
    <EditableHVACTable 
      hvacUnits={hvacUnits} 
      onUnitUpdate={onUnitUpdate}
    />
  </div>
);

export default ManageHVACUnitsSection;
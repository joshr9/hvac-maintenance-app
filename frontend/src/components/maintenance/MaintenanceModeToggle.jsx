// MaintenanceModeToggle.jsx — iOS-style segment control

import { Wrench, ClipboardList } from 'lucide-react';

const MaintenanceModeToggle = ({ mode, setMode }) => (
  <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
    <button
      type="button"
      onClick={() => setMode('quick')}
      className={[
        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-200',
        mode === 'quick'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
      ].join(' ')}
    >
      <Wrench className="w-4 h-4" />
      Quick Log
    </button>
    <button
      type="button"
      onClick={() => setMode('checklist')}
      className={[
        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-200',
        mode === 'checklist'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
      ].join(' ')}
    >
      <ClipboardList className="w-4 h-4" />
      Preventative PM
    </button>
  </div>
);

export default MaintenanceModeToggle;

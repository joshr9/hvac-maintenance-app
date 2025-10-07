import React, { useState, useEffect } from 'react';
import {
  Wrench, Building, Zap, Plus, ArrowRight
} from 'lucide-react';

const Homepage = ({ onNavigate, onOpenModal }) => {
  const [hvacStats, setHvacStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real HVAC data from API
  useEffect(() => {
    const loadHVACDashboard = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';

        // Fetch HVAC stats
        const statsResponse = await fetch(`${apiUrl}/api/hvac-units/stats`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setHvacStats(stats);
        }

        // Fetch properties
        const propsResponse = await fetch(`${apiUrl}/api/properties`);
        if (propsResponse.ok) {
          const props = await propsResponse.json();
          setProperties(Array.isArray(props) ? props : []);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHVACDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)'}}>
      {/* Simple Header */}
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Quick Stats - Clean & Minimal */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {hvacStats?.totalUnits || 0}
            </div>
            <div className="text-sm text-gray-600">Total Units</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {properties.length || 0}
            </div>
            <div className="text-sm text-gray-600">Properties</div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Simple Cards */}
      <div className="px-6 space-y-3">
        <button
          onClick={() => onNavigate('hvac')}
          className="w-full bg-blue-600 text-white rounded-2xl p-6 shadow-lg active:bg-blue-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wrench className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">HVAC Systems</div>
              <div className="text-sm text-blue-100">View all units</div>
            </div>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('maintenance')}
          className="w-full bg-green-600 text-white rounded-2xl p-6 shadow-lg active:bg-green-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Plus className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">Quick Entry</div>
              <div className="text-sm text-green-100">Log maintenance</div>
            </div>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('properties')}
          className="w-full bg-purple-600 text-white rounded-2xl p-6 shadow-lg active:bg-purple-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">Properties</div>
              <div className="text-sm text-purple-100">{properties.length} locations</div>
            </div>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="w-full bg-orange-600 text-white rounded-2xl p-6 shadow-lg active:bg-orange-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">Reports</div>
              <div className="text-sm text-orange-100">Export data</div>
            </div>
          </div>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Homepage;

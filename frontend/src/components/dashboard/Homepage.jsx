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
    <div className="min-h-screen bg-gray-50">
      {/* Header - subtle brand color on desktop */}
      <div className="bg-white border-b border-gray-200 p-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Dean Callan Property Management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Stats Cards - 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl lg:text-4xl font-bold text-dc-blue-500 mb-1">
              {hvacStats?.totalUnits || 0}
            </div>
            <div className="text-sm text-gray-600">HVAC Units</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl lg:text-4xl font-bold text-dc-blue-500 mb-1">
              {properties.length || 0}
            </div>
            <div className="text-sm text-gray-600">Properties</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-1">
              {hvacStats?.activeUnits || 0}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>

          <div className="bg-white rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="text-3xl lg:text-4xl font-bold text-gray-600 mb-1">
              {hvacStats?.pendingMaintenance || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Quick Actions - vertical mobile, 2x2 grid desktop */}
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
            <button
              onClick={() => onNavigate('hvac')}
              className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm border-2 border-gray-200 hover:border-dc-blue-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-dc-blue-50 rounded-xl flex items-center justify-center group-hover:bg-dc-blue-100 transition-colors">
                  <Wrench className="w-6 h-6 lg:w-7 lg:h-7 text-dc-blue-500" />
                </div>
                <div className="text-left">
                  <div className="text-lg lg:text-xl font-bold">HVAC Systems</div>
                  <div className="text-sm text-gray-600">View all units</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-dc-blue-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onNavigate('maintenance')}
              className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm border-2 border-gray-200 hover:border-green-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Plus className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="text-lg lg:text-xl font-bold">Quick Entry</div>
                  <div className="text-sm text-gray-600">Log maintenance</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onNavigate('properties')}
              className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm border-2 border-gray-200 hover:border-dc-blue-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-dc-blue-50 rounded-xl flex items-center justify-center group-hover:bg-dc-blue-100 transition-colors">
                  <Building className="w-6 h-6 lg:w-7 lg:h-7 text-dc-blue-500" />
                </div>
                <div className="text-left">
                  <div className="text-lg lg:text-xl font-bold">Properties</div>
                  <div className="text-sm text-gray-600">{properties.length} locations</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-dc-blue-500 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm border-2 border-gray-200 hover:border-orange-500 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="text-lg lg:text-xl font-bold">Reports</div>
                  <div className="text-sm text-gray-600">Export data</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

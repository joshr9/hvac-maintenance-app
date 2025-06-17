import React from 'react';
import { Tag, CheckCircle, DollarSign, BarChart3 } from 'lucide-react';
import StatsCard from '../common/StatsCard';

const ServiceStats = ({ stats = {}, categories = [] }) => {
  // Helper function to safely convert values to numbers
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (value && typeof value.toNumber === 'function') return value.toNumber();
    if (value && typeof value.toString === 'function') return parseFloat(value.toString()) || 0;
    return parseFloat(value) || 0;
  };

  const formatCurrency = (value) => {
    const num = toNumber(value);
    return num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Services"
        value={stats.totalServices || 0}
        icon={Tag}
        color="blue"
      />
      
      <StatsCard
        title="Active Services"
        value={stats.activeServices || 0}
        icon={CheckCircle}
        color="green"
      />
      
      <StatsCard
        title="Avg Price"
        value={formatCurrency(stats.pricing?.average)}
        prefix="$"
        icon={DollarSign}
        color="orange"
      />
      
      <StatsCard
        title="Categories"
        value={categories.length || 0}
        icon={BarChart3}
        color="purple"
      />
    </div>
  );
};

export default ServiceStats;
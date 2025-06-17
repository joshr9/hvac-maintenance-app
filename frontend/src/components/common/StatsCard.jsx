import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from './GlassCard';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  prefix = '', 
  suffix = '',
  size = 'md' // sm, md, lg
}) => {
  // Color gradients for different themes
  const colorGradients = {
    blue: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)',
    green: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    orange: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    red: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    gray: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
  };

  // Size variants
  const sizeClasses = {
    sm: {
      title: 'text-xs',
      value: 'text-lg',
      icon: 'w-4 h-4',
      iconContainer: 'p-2'
    },
    md: {
      title: 'text-sm',
      value: 'text-2xl',
      icon: 'w-5 h-5',
      iconContainer: 'p-3'
    },
    lg: {
      title: 'text-base',
      value: 'text-3xl',
      icon: 'w-6 h-6',
      iconContainer: 'p-4'
    }
  };

  const classes = sizeClasses[size];

  return (
    <GlassCard hover={true}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${classes.title} font-medium text-gray-600 mb-1`}>
            {title}
          </p>
          <p className={`${classes.value} font-bold text-gray-900`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          
          {change !== undefined && change !== null && (
            <div className={`flex items-center gap-1 mt-2 ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : change < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div 
            className={`${classes.iconContainer} rounded-xl`}
            style={{ background: colorGradients[color] }}
          >
            <Icon className={`${classes.icon} text-white`} />
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default StatsCard;
import React from 'react';

const GlassCard = ({ 
  children, 
  className = '', 
  padding = 'md', // xs, sm, md, lg, xl
  hover = true,
  onClick,
  ...props 
}) => {
  // Padding options
  const paddingClasses = {
    xs: 'p-2',
    sm: 'p-4', 
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const baseClasses = 'bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg';
  const hoverClasses = hover ? 'hover:shadow-xl transition-all duration-300' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`
        ${baseClasses}
        ${hoverClasses}
        ${clickableClasses}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
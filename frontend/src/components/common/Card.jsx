import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'lg', // xs, sm, md, lg, xl
  variant = 'default', // default, glass, solid
  ...props 
}) => {
  // Padding options
  const paddingClasses = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-white shadow-lg border border-gray-200',
    glass: 'bg-white/80 backdrop-blur-sm shadow-xl border border-white/20',
    solid: 'bg-white shadow-xl border border-gray-100'
  };

  return (
    <div 
      className={`
        rounded-2xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
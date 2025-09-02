// components/common/ActionButton.jsx
import React from 'react';

const ActionButton = ({ 
  children,
  onClick,
  icon: Icon,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = ""
}) => {
  const baseClasses = "inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-300 shadow-lg";
  
  const variantClasses = {
    primary: {
      className: "text-white hover:opacity-90",
      style: {
        background: 'linear-gradient(135deg, #2a3a91 0%, #3b4ae6 100%)',
        boxShadow: '0 4px 14px rgba(42, 58, 145, 0.25)'
      }
    },
    secondary: {
      className: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
      style: {}
    },
    danger: {
      className: "text-white hover:opacity-90",
      style: {
        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)'
      }
    }
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "cursor-pointer";

  const variant_ = variantClasses[variant];
  
  const classes = `
    ${baseClasses}
    ${variant_.className}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${className}
  `.trim();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      style={variant_.style}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

export default ActionButton;
// components/jobs/services/ServiceStatusBadges.jsx
import React from 'react';
import { 
  Tag, 
  Clock, 
  Package, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react';

const ServiceStatusBadge = ({ 
  type, 
  value, 
  label, 
  variant = 'default', // 'default' | 'success' | 'warning' | 'error' | 'info'
  size = 'sm', // 'xs' | 'sm' | 'md'
  icon: CustomIcon,
  showIcon = true
}) => {
  const getVariantClasses = (variant) => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    
    switch (type) {
      case 'category': return Tag;
      case 'duration': return Clock;
      case 'quantity': return Package;
      case 'bookable': return Calendar;
      case 'price': return DollarSign;
      case 'status': 
        if (variant === 'success') return CheckCircle;
        if (variant === 'error') return XCircle;
        if (variant === 'warning') return AlertTriangle;
        return MinusCircle;
      default: return Tag;
    }
  };

  const Icon = getIcon();

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${getVariantClasses(variant)}
      ${getSizeClasses(size)}
    `}>
      {showIcon && <Icon className={`${size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />}
      {label || value}
    </span>
  );
};

const ServiceStatusBadges = ({ 
  service, 
  showCategory = true,
  showDuration = true,
  showBookable = true,
  showQuantityLimits = true,
  showPricing = false,
  showTaxable = false,
  showActive = true,
  layout = 'wrap' // 'wrap' | 'stack' | 'inline'
}) => {
  const badges = [];

  // Category badge
  if (showCategory && service.category) {
    badges.push({
      key: 'category',
      component: (
        <ServiceStatusBadge
          type="category"
          value={service.category}
          variant="default"
        />
      )
    });
  }

  // Duration badge
  if (showDuration && service.durationMinutes && parseInt(service.durationMinutes) > 0) {
    badges.push({
      key: 'duration',
      component: (
        <ServiceStatusBadge
          type="duration"
          value={`${service.durationMinutes}min`}
          variant="info"
        />
      )
    });
  }

  // Bookable badge
  if (showBookable && service.bookable) {
    badges.push({
      key: 'bookable',
      component: (
        <ServiceStatusBadge
          type="bookable"
          value="Bookable"
          variant="success"
        />
      )
    });
  }

  // Quantity limits badge
  if (showQuantityLimits && service.minimumQuantity && parseFloat(service.minimumQuantity) > 1) {
    badges.push({
      key: 'minQty',
      component: (
        <ServiceStatusBadge
          type="quantity"
          value={`Min: ${service.minimumQuantity}`}
          variant="warning"
        />
      )
    });
  }

  if (showQuantityLimits && service.maximumQuantity && parseFloat(service.maximumQuantity) < 999) {
    badges.push({
      key: 'maxQty',
      component: (
        <ServiceStatusBadge
          type="quantity"
          value={`Max: ${service.maximumQuantity}`}
          variant="warning"
        />
      )
    });
  }

  // Pricing badge
  if (showPricing && service.unitPrice && parseFloat(service.unitPrice) > 0) {
    badges.push({
      key: 'price',
      component: (
        <ServiceStatusBadge
          type="price"
          value={`$${parseFloat(service.unitPrice).toFixed(2)}`}
          variant="success"
        />
      )
    });
  }

  // Taxable badge
  if (showTaxable && service.taxable === false) {
    badges.push({
      key: 'taxFree',
      component: (
        <ServiceStatusBadge
          type="status"
          value="Tax Free"
          variant="info"
        />
      )
    });
  }

  // Active status badge
  if (showActive && service.active === false) {
    badges.push({
      key: 'inactive',
      component: (
        <ServiceStatusBadge
          type="status"
          value="Inactive"
          variant="error"
        />
      )
    });
  }

  // Quantity enabled badge
  if (service.quantityEnabled === false) {
    badges.push({
      key: 'fixedQty',
      component: (
        <ServiceStatusBadge
          type="quantity"
          value="Fixed Qty"
          variant="info"
        />
      )
    });
  }

  if (badges.length === 0) {
    return null;
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'stack':
        return 'flex flex-col gap-1';
      case 'inline':
        return 'flex items-center gap-1';
      default:
        return 'flex flex-wrap items-center gap-1';
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {badges.map(badge => (
        <React.Fragment key={badge.key}>
          {badge.component}
        </React.Fragment>
      ))}
    </div>
  );
};

// Individual badge components for specific use cases
export const CategoryBadge = ({ category, ...props }) => (
  <ServiceStatusBadge type="category" value={category} {...props} />
);

export const DurationBadge = ({ minutes, ...props }) => (
  <ServiceStatusBadge type="duration" value={`${minutes}min`} variant="info" {...props} />
);

export const BookableBadge = ({ ...props }) => (
  <ServiceStatusBadge type="bookable" value="Bookable" variant="success" {...props} />
);

export const PriceBadge = ({ price, currency = '$', ...props }) => (
  <ServiceStatusBadge type="price" value={`${currency}${parseFloat(price).toFixed(2)}`} variant="success" {...props} />
);

export default ServiceStatusBadges;
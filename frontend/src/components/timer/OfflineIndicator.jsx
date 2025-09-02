// components/timer/OfflineIndicator.jsx
import React from 'react';
import { Wifi, WifiOff, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineQueue } from '../../contexts/OfflineQueueContext';

const OfflineIndicator = ({ className = '' }) => {
  const { isOnline, queueCount, isSyncing } = useOfflineQueue();

  // Don't show if online with no queue
  if (isOnline && queueCount === 0) return null;

  const getStatusInfo = () => {
    if (!isOnline && queueCount > 0) {
      return {
        icon: WifiOff,
        text: `${queueCount} actions queued`,
        bgColor: 'bg-orange-100 border-orange-200',
        textColor: 'text-orange-700',
        iconColor: 'text-orange-500'
      };
    }
    
    if (isOnline && queueCount > 0 && isSyncing) {
      return {
        icon: Clock,
        text: `Syncing ${queueCount} actions...`,
        bgColor: 'bg-blue-100 border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-500'
      };
    }
    
    if (isOnline && queueCount > 0) {
      return {
        icon: AlertCircle,
        text: `${queueCount} actions pending`,
        bgColor: 'bg-yellow-100 border-yellow-200',
        textColor: 'text-yellow-700',
        iconColor: 'text-yellow-500'
      };
    }

    return {
      icon: CheckCircle,
      text: 'All synced',
      bgColor: 'bg-green-100 border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-500'
    };
  };

  const { icon: Icon, text, bgColor, textColor, iconColor } = getStatusInfo();

  return (
    <div className={`
      inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium
      ${bgColor} ${textColor} ${className}
    `}>
      <Icon className={`w-3 h-3 ${iconColor} ${isSyncing ? 'animate-pulse' : ''}`} />
      <span>{text}</span>
      
      {!isOnline && (
        <div className="ml-1">
          <WifiOff className="w-3 h-3 text-red-500" />
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
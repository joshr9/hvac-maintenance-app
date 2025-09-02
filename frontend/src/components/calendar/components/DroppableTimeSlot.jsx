// src/components/calendar/components/DroppableTimeSlot.jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export const DroppableTimeSlot = ({ 
  id, 
  children, 
  className = '', 
  disabled = false,
  onSlotClick 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
    data: { 
      type: 'timeSlot',
      accepts: ['unscheduled-job']
    }
  });

  const handleClick = (e) => {
    // Only trigger slot click if clicking on empty space
    if (e.target === e.currentTarget && onSlotClick) {
      onSlotClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        ${isOver ? 'drag-over bg-blue-100 border-blue-300' : ''}
        ${disabled ? 'drop-disabled opacity-50' : ''}
        drop-zone
      `}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
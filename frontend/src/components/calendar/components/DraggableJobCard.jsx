// src/components/calendar/components/DraggableJobCard.jsx
// ✅ WORKING: @dnd-kit draggable wrapper for job cards
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export const DraggableJobCard = ({ id, job, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: { 
      job, 
      type: 'unscheduled-job',
      source: 'sidebar'
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'dragging opacity-70' : ''}`}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

export default DraggableJobCard
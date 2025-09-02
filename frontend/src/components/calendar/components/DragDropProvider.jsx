// components/calendar/components/DragDropProvider.jsx - MINIMAL FIX VERSION
import React, { createContext, useContext, useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Create drag & drop context
const DragDropContext = createContext(null);

// Custom hook to use drag & drop context
export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

// Draggable Job Hook using react-dnd
export const useDraggableJob = (id, job) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'job',
    item: { id, job, type: 'job' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [id, job]);

  return {
    dragHandleProps: {
      ref: drag,
    },
    setNodeRef: drag,
    style: {},
    isDragging
  };
};

// Global drop handler reference
let globalDropHandler = null;

// FIXED: Only the slot parsing - everything else stays the same
export const useDroppableSlot = (slotId, data) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'job',
    drop: (draggedItem) => {
      console.log('🎯 DROP EVENT:', { slotId, draggedItem });
      
      // FIXED: More robust slot ID parsing to handle technician names with hyphens
      if (slotId.startsWith('slot-')) {
        const slotParts = slotId.split('-');
        console.log('🔍 Raw slot parts:', slotParts, 'from slotId:', slotId);
        
        let techId, hourStr;
        
        if (slotParts.length >= 3) {
          // Always treat the last part as hour, everything else as techId
          hourStr = slotParts[slotParts.length - 1];
          techId = slotParts.slice(1, -1).join('-');
        } else {
          console.error('❌ Invalid slot ID format:', slotId);
          return;
        }
        
        const hour = parseInt(hourStr);
        
        console.log('📍 Parsed data:', { 
          techId, 
          hour, 
          techIdType: typeof techId,
          hourType: typeof hour,
          isValidHour: !isNaN(hour) && hour >= 0 && hour <= 23
        });
        
        // Validate parsed data
        if (!techId || isNaN(hour) || hour < 0 || hour > 23) {
          console.error('❌ Invalid parsed data:', { techId, hour, slotId });
          return;
        }
        
        // FIXED: Convert techId to number if it's a numeric string (for early hours)
        let finalTechId = techId;
        if (/^\d+$/.test(techId)) {
          finalTechId = parseInt(techId);
          console.log('🔢 Converted techId from string to number:', techId, '→', finalTechId);
        }
        
        console.log('🚀 Calling globalDropHandler with:', {
          job: draggedItem.job?.id,
          techId: finalTechId,
          hour,
          techIdType: typeof finalTechId
        });
        
        // Use the global drop handler
        if (globalDropHandler && draggedItem.job) {
          globalDropHandler(draggedItem.job, finalTechId, hour);
        } else {
          console.error('❌ Missing handler or job:', {
            hasHandler: !!globalDropHandler,
            hasJob: !!draggedItem.job
          });
        }
      }
      
      return { slotId, ...data };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [slotId, data]);

  return {
    setNodeRef: drop,
    isOver: isOver && canDrop,
  };
};

// UNCHANGED: Keep original job drop handler
const DragDropProvider = ({ children, onDragJob }) => {
  const [feedback, setFeedback] = useState('');

  // Enhanced job drop handler
  const handleJobDrop = useCallback(async (job, techId, hour) => {
    setFeedback('🔄 Scheduling job...');
    
    try {
      await onDragJob(job, techId, hour);
      setFeedback('✅ Job scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling job:', error.message);
      setFeedback('❌ Error scheduling job. Please try again.');
    }
    
    setTimeout(() => setFeedback(''), 3000);
  }, [onDragJob]);

  // Set the global drop handler
  React.useEffect(() => {
    globalDropHandler = handleJobDrop;
    return () => {
      globalDropHandler = null;
    };
  }, [handleJobDrop]);

  // Context value
  const contextValue = {
    feedback,
    setFeedback,
    useDraggableJob,
    useDroppableSlot,
    handleJobDrop
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext.Provider value={contextValue}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {children}
        </div>
      </DragDropContext.Provider>
    </DndProvider>
  );
};

export default DragDropProvider;
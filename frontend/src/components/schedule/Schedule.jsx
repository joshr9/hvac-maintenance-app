import React from 'react';
import PropertyScheduler from '../calendar/PropertyScheduler';

const Schedule = ({ onNavigate, onOpenModal }) => {
  return (
    <PropertyScheduler onNavigate={onNavigate} onOpenModal={onOpenModal} />
  );
};

export default Schedule;
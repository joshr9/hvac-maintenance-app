// CalendarModals.jsx - Centralized Modal Management
import React from 'react';
import DayOverviewModal from '../DayOverviewModal';
import ScheduleTypeModal from '../ScheduleTypeModal';
import ScheduleModal from '../ScheduleModal';
import QuickJobModal from '../QuickJobModal';

const CalendarModals = ({
  // Modal states
  dayOverviewModal,
  scheduleTypeModal,
  scheduleModal,
  quickJobModal,
  
  // Props
  allProperties,
  
  // Handlers
  onCloseDayOverview,
  onCloseScheduleType,
  onCloseSchedule,
  onCloseQuickJob,
  onScheduleTypeSelect,
  onScheduleComplete,
  onJobEdit,
  onJobViewDetails,
  onJobUpdate
}) => {
  return (
    <>
      {/* Day Overview Modal - Shows all jobs for a specific day */}
      <DayOverviewModal
        isOpen={dayOverviewModal.isOpen}
        onClose={onCloseDayOverview}
        jobs={dayOverviewModal.jobs}
        date={dayOverviewModal.date}
      />

      {/* Schedule Type Modal - Choose between different job types */}
      <ScheduleTypeModal
        isOpen={scheduleTypeModal.isOpen}
        onClose={onCloseScheduleType}
        onTypeSelect={onScheduleTypeSelect}
        allProperties={allProperties}
        initialDate={scheduleTypeModal.selectedDate}
        initialTime={scheduleTypeModal.selectedTime}
      />

      {/* Schedule Modal - Create new job/appointment */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={onCloseSchedule}
        onScheduleComplete={onScheduleComplete}
        scheduleType={scheduleModal.type}
        allProperties={allProperties}
        initialDate={scheduleModal.initialDate}
        initialTime={scheduleModal.initialTime}
        job={scheduleModal.job}           
        editMode={scheduleModal.editMode} 
      />

      {/* Quick Job Modal - View/edit existing job */}
      <QuickJobModal
        isOpen={quickJobModal.isOpen}
        onClose={onCloseQuickJob}
        job={quickJobModal.selectedJob}
        onEdit={onJobEdit}
        onViewDetails={onJobViewDetails}
        onUpdate={onJobUpdate}
      />
    </>
  );
};

export default CalendarModals;
// components/jobs/hooks/useJobFormOptions.js
import { useMemo } from 'react';

export const useJobFormOptions = () => {
  const workTypeOptions = useMemo(() => [
    { value: 'HVAC_MAINTENANCE', label: 'HVAC Maintenance' },
    { value: 'HVAC_REPAIR', label: 'HVAC Repair' },
    { value: 'HVAC_INSTALLATION', label: 'HVAC Installation' },
    { value: 'SNOW_REMOVAL', label: 'Snow Removal' },
    { value: 'SNOW_CHECKS', label: 'Snow Equipment Checks' },
    { value: 'INSPECTION', label: 'Property Inspection' },
    { value: 'CLEANING', label: 'Cleaning Services' },
    { value: 'LANDSCAPING', label: 'Landscaping' },
    { value: 'ELECTRICAL', label: 'Electrical Work' },
    { value: 'PLUMBING', label: 'Plumbing Work' },
    { value: 'OTHER', label: 'Other' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'LOW', label: 'Low Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'HIGH', label: 'High Priority' },
    { value: 'URGENT', label: 'Urgent' }
  ], []);

  const frequencyOptions = useMemo(() => [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' }
  ], []);

  const dayOfWeekOptions = useMemo(() => [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
  ], []);

  const technicianOptions = useMemo(() => [
    { value: 'Mario Escobar', label: 'Mario Escobar (HVAC)' },
    { value: 'Mike Johnson', label: 'Mike Johnson' },
    { value: 'Sarah Wilson', label: 'Sarah Wilson' },
    { value: 'Alex Howard', label: 'Alex Howard' }
  ], []);

  return {
    workTypeOptions,
    priorityOptions,
    frequencyOptions,
    dayOfWeekOptions,
    technicianOptions
  };
};
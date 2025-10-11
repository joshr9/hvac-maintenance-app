// components/jobs/hooks/useJobFormOptions.js
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export const useJobFormOptions = () => {
  const { getToken } = useAuth();
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Fetch real users from Clerk API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${apiUrl}/api/clerk/users`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (response.ok) {
          const users = await response.json();
          // Filter for technicians and format for dropdown
          const technicians = users
            .filter(user =>
              user.publicMetadata?.role === 'technician' ||
              user.publicMetadata?.role === 'admin'
            )
            .map(user => ({
              value: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress,
              label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress
            }));

          setTechnicianOptions(technicians);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to empty array
        setTechnicianOptions([]);
      }
    };

    fetchUsers();
  }, [getToken, apiUrl]);

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

  return {
    workTypeOptions,
    priorityOptions,
    frequencyOptions,
    dayOfWeekOptions,
    technicianOptions
  };
};
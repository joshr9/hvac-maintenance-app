// calendarHelpers.js - Helper functions and API utilities for calendar

// Helper functions
export const getTechnicianInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

export const getStatusColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'URGENT': return 'bg-red-500';
    case 'HIGH': return 'bg-orange-500';
    case 'MEDIUM': return 'bg-blue-500';
    case 'LOW': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

// API Functions
export const fetchJobs = async () => {
  try {
    const response = await fetch('/api/jobs');
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    const data = await response.json();
    // Handle different response formats
    return Array.isArray(data) ? data : (data.jobs ? data.jobs : []);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

export const fetchTeamMembers = async () => {
  try {
    const response = await fetch('/api/team-members');
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const updateJob = async (jobId, updateData) => {
  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update job');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

// Transform job data for calendar events
export const transformJobToCalendarEvent = (job, dayJobs = []) => {
  if (!job.scheduledDate) return null;
  
  let startDate = new Date(job.scheduledDate);
  if (job.scheduledTime) {
    const [hours, minutes] = job.scheduledTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }

  const duration = job.estimatedDuration || 120;
  const endDate = new Date(startDate.getTime() + (duration * 60 * 1000));

  return {
    id: job.id,
    title: job.title,
    start: startDate,
    end: endDate,
    job: job,
    dayJobs: dayJobs,
    resource: job.assignedTechnician?.toLowerCase().replace(' ', '') || 'unassigned'
  };
};
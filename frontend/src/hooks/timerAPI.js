// hooks/timerAPI.js - Full API functions for timer operations
const API_BASE = '/api/jobs';

/**
 * Get active timer for a technician
 */
export const getActiveTimer = async (technicianName) => {
  try {
    const response = await fetch(`${API_BASE}/technician/${encodeURIComponent(technicianName)}/active-timer`);
    if (!response.ok) throw new Error('Failed to fetch active timer');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active timer:', error);
    throw error;
  }
};

/**
 * Start timer for a job
 */
export const startJobTimer = async (jobId, technicianName, notes = '') => {
  try {
    const response = await fetch(`${API_BASE}/${jobId}/timer/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        technicianName,
        notes
      })
    });
    
    if (!response.ok) throw new Error('Failed to start timer');
    return await response.json();
  } catch (error) {
    console.error('Error starting timer:', error);
    throw error;
  }
};

/**
 * Stop timer for a job
 */
export const stopJobTimer = async (jobId, technicianName, notes = '') => {
  try {
    const response = await fetch(`${API_BASE}/${jobId}/timer/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        technicianName,
        notes
      })
    });
    
    if (!response.ok) throw new Error('Failed to stop timer');
    return await response.json();
  } catch (error) {
    console.error('Error stopping timer:', error);
    throw error;
  }
};

/**
 * Get all timer entries for a job
 */
export const getJobTimers = async (jobId) => {
  try {
    const response = await fetch(`/api/jobs/${jobId}/timers`);
    if (!response.ok) throw new Error('Failed to fetch job timers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching job timers:', error);
    throw error;
  }
};

/**
 * Update a time entry
 */
export const updateTimeEntry = async (timerId, data) => {
  try {
    const response = await fetch(`${API_BASE}/timers/${timerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to update time entry');
    return await response.json();
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
};
// components/jobs/CreateJobModal.jsx - Updated with Real-time Updates
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Repeat } from 'lucide-react';
import { 
  ErrorAlert, 
  ModalHeader, 
  ModalFooter, 
  FormSection 
} from '../common/FormComponents';
import {
  JobTypeSelector,
  BasicJobInfo,
  LocationSelector,
  AssignmentScheduling,
  RecurrencePattern,
  JobDescription,
  ZonePropertySelector
} from './JobFormComponents';
import { useJobFormOptions } from './hooks/useJobFormOptions';

const CreateJobModal = ({ 
  isOpen, 
  onClose, 
  allProperties = [], 
  onJobCreated,
  onDataRefresh  // ✅ NEW: Add refresh callback
}) => {
  const [jobType, setJobType] = useState('one-time');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [zones, setZones] = useState([]);
  
  // Custom hook for form options
  const {
    workTypeOptions,
    priorityOptions,
    frequencyOptions,
    dayOfWeekOptions,
    technicianOptions
  } = useJobFormOptions();

  // One-time job data
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    workType: '',
    priority: 'MEDIUM',
    propertyId: '',
    suiteId: '',
    hvacUnitId: '',
    zoneId: '',
    assignedTechnician: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 120,
    customerNotes: '',
    internalNotes: ''
  });

  // Recurring job template data
  const [recurringData, setRecurringData] = useState({
    name: '',
    description: '',
    workType: '',
    frequency: 'WEEKLY',
    dayOfWeek: 1,
    dayOfMonth: 1,
    timeOfDay: '09:00',
    estimatedDuration: 120,
    priority: 'MEDIUM',
    assignedTechnician: '',
    zoneId: '',
    propertyId: '',
    isActive: true
  });

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadZones();
      resetForm();
    }
  }, [isOpen]);

  const loadZones = async () => {
    try {
      const response = await fetch('/api/zones');
      if (response.ok) {
        const data = await response.json();
        setZones(data || []);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const resetForm = () => {
    setJobType('one-time');
    setError('');
    setJobData({
      title: '',
      description: '',
      workType: '',
      priority: 'MEDIUM',
      propertyId: '',
      suiteId: '',
      hvacUnitId: '',
      zoneId: '',
      assignedTechnician: '',
      scheduledDate: '',
      scheduledTime: '',
      estimatedDuration: 120,
      customerNotes: '',
      internalNotes: ''
    });
    setRecurringData({
      name: '',
      description: '',
      workType: '',
      frequency: 'WEEKLY',
      dayOfWeek: 1,
      dayOfMonth: 1,
      timeOfDay: '09:00',
      estimatedDuration: 120,
      priority: 'MEDIUM',
      assignedTechnician: '',
      zoneId: '',
      propertyId: '',
      isActive: true
    });
  };

  // Derived options
  const propertyOptions = allProperties.map(property => ({
    value: property.id.toString(),
    label: property.name
  }));

  const zoneOptions = zones.map(zone => ({
    value: zone.id.toString(),
    label: zone.name
  }));

  const selectedProperty = allProperties.find(p => p.id.toString() === jobData.propertyId);
  const suiteOptions = selectedProperty?.suites?.map(suite => ({
    value: suite.id.toString(),
    label: suite.name || `Suite ${suite.id}`
  })) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (jobType === 'one-time') {
        await handleCreateOneTimeJob();
      } else {
        await handleCreateRecurringTemplate();
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError(error.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOneTimeJob = async () => {
    if (!jobData.title || !jobData.propertyId || !jobData.workType) {
      throw new Error('Please fill in all required fields');
    }

    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...jobData,
        propertyId: parseInt(jobData.propertyId),
        suiteId: jobData.suiteId ? parseInt(jobData.suiteId) : null,
        hvacUnitId: jobData.hvacUnitId ? parseInt(jobData.hvacUnitId) : null,
        zoneId: jobData.zoneId ? parseInt(jobData.zoneId) : null,
        isRecurring: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create job');
    }

    const newJob = await response.json();
    
    // ✅ REAL-TIME UPDATE: Immediately notify parent components
    if (onJobCreated) {
      onJobCreated(newJob);
    }
    if (onDataRefresh) {
      onDataRefresh();
    }
    
    onClose();
  };

  const handleCreateRecurringTemplate = async () => {
    if (!recurringData.name || !recurringData.workType) {
      throw new Error('Please fill in all required fields');
    }

    if (!recurringData.zoneId && !recurringData.propertyId) {
      throw new Error('Please select either a zone or specific property');
    }

    const response = await fetch('/api/recurring-job-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...recurringData,
        zoneId: recurringData.zoneId ? parseInt(recurringData.zoneId) : null,
        propertyId: recurringData.propertyId ? parseInt(recurringData.propertyId) : null
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create recurring job template');
    }

    const template = await response.json();
    
    if (window.confirm('Template created! Generate jobs for this week?')) {
      await generateJobsFromTemplate(template.id);
    }
    
    onClose();
  };

  const generateJobsFromTemplate = async (templateId) => {
    try {
      const response = await fetch('/api/recurring-job-templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Generated ${result.jobs?.length || 0} jobs from template`);
        
        // ✅ REAL-TIME UPDATE: Immediately update parent with new jobs
        if (result.jobs && result.jobs.length > 0) {
          result.jobs.forEach(job => {
            if (onJobCreated) {
              onJobCreated(job);
            }
          });
          
          if (onDataRefresh) {
            onDataRefresh();
          }
        }
      }
    } catch (error) {
      console.error('Error generating jobs:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        <ModalHeader 
          title="Create Job" 
          icon={Calendar} 
          onClose={onClose} 
        />

        <JobTypeSelector 
          value={jobType} 
          onChange={setJobType} 
        />

        <form onSubmit={handleSubmit}>
          <ErrorAlert message={error} className="mx-6 mt-4" />

          <div className="p-6 space-y-8">
            {jobType === 'one-time' ? (
              <OneTimeJobForm 
                jobData={jobData}
                setJobData={setJobData}
                workTypeOptions={workTypeOptions}
                priorityOptions={priorityOptions}
                propertyOptions={propertyOptions}
                zoneOptions={zoneOptions}
                suiteOptions={suiteOptions}
                technicianOptions={technicianOptions}
              />
            ) : (
              <RecurringJobForm
                recurringData={recurringData}
                setRecurringData={setRecurringData}
                workTypeOptions={workTypeOptions}
                priorityOptions={priorityOptions}
                frequencyOptions={frequencyOptions}
                dayOfWeekOptions={dayOfWeekOptions}
                propertyOptions={propertyOptions}
                zoneOptions={zoneOptions}
                technicianOptions={technicianOptions}
              />
            )}
          </div>

          <ModalFooter
            onCancel={onClose}
            submitText={jobType === 'one-time' ? 'Create Job' : 'Create Template'}
            submitIcon={Save}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
};

// One-time Job Form
const OneTimeJobForm = ({ 
  jobData, 
  setJobData, 
  workTypeOptions, 
  priorityOptions, 
  propertyOptions, 
  zoneOptions, 
  suiteOptions,
  technicianOptions 
}) => {
  return (
    <>
      <BasicJobInfo
        jobData={jobData}
        setJobData={setJobData}
        workTypeOptions={workTypeOptions}
      />

      <LocationSelector
        jobData={jobData}
        setJobData={setJobData}
        zoneOptions={zoneOptions}
        propertyOptions={propertyOptions}
        suiteOptions={suiteOptions}
      />

      <AssignmentScheduling
        jobData={jobData}
        setJobData={setJobData}
        priorityOptions={priorityOptions}
        technicianOptions={technicianOptions}
        showDateFields={true}
      />

      <JobDescription
        jobData={jobData}
        setJobData={setJobData}
      />
    </>
  );
};

// Recurring Job Form
const RecurringJobForm = ({ 
  recurringData, 
  setRecurringData, 
  workTypeOptions, 
  priorityOptions, 
  frequencyOptions,
  dayOfWeekOptions,
  propertyOptions, 
  zoneOptions, 
  technicianOptions 
}) => {
  return (
    <>
      <FormSection
        title="Recurring Job Template"
        description="Create a template that will automatically generate jobs based on your schedule."
        icon={Repeat}
        variant="highlight"
      >
        <BasicJobInfo
          jobData={recurringData}
          setJobData={setRecurringData}
          workTypeOptions={workTypeOptions}
          isRecurring={true}
          nameField="name"
        />
      </FormSection>

      <RecurrencePattern
        recurringData={recurringData}
        setRecurringData={setRecurringData}
        frequencyOptions={frequencyOptions}
        dayOfWeekOptions={dayOfWeekOptions}
      />

      <ZonePropertySelector
        recurringData={recurringData}
        setRecurringData={setRecurringData}
        zoneOptions={zoneOptions}
        propertyOptions={propertyOptions}
      />

      <AssignmentScheduling
        jobData={recurringData}
        setJobData={setRecurringData}
        priorityOptions={priorityOptions}
        technicianOptions={technicianOptions}
        showDateFields={false}
      />

      <JobDescription
        jobData={recurringData}
        setJobData={setRecurringData}
        isRecurring={true}
      />
    </>
  );
};

export default CreateJobModal;
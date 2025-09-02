// components/jobs/JobFormComponents.jsx
import React from 'react';
import { Repeat, Building2, Clock, User, MapPin } from 'lucide-react';
import { 
  FormField, 
  FormGrid, 
  FormSection, 
  Dropdown, 
  TextInput, 
  Textarea, 
  RadioGroup 
} from '../common/FormComponents';

// Job Type Selector Component
export const JobTypeSelector = ({ value, onChange }) => {
  const options = [
    { value: 'one-time', label: 'One-time Job' },
    { value: 'recurring', label: 'Recurring Template', icon: Repeat }
  ];

  return (
    <div className="p-6 border-b border-gray-200">
      <RadioGroup
        name="jobType"
        value={value}
        onChange={onChange}
        options={options}
        label="Job Type:"
      />
    </div>
  );
};

// Basic Job Information Component
export const BasicJobInfo = ({ 
  jobData, 
  setJobData, 
  workTypeOptions, 
  isRecurring = false,
  nameField = 'title'
}) => {
  const fieldLabel = isRecurring ? 'Template Name' : 'Job Title';
  const fieldPlaceholder = isRecurring 
    ? 'e.g., Boulder Weekly HVAC Maintenance'
    : 'Enter job title';

  return (
    <FormGrid columns={2}>
      <FormField label={fieldLabel} required>
        <TextInput
          value={jobData[nameField]}
          onChange={(e) => setJobData({...jobData, [nameField]: e.target.value})}
          placeholder={fieldPlaceholder}
        />
      </FormField>
      <FormField label="Work Type" required>
        <Dropdown
          value={jobData.workType}
          onChange={(value) => setJobData({...jobData, workType: value})}
          options={workTypeOptions}
          placeholder="Select work type"
        />
      </FormField>
    </FormGrid>
  );
};

// Location Selection Component
export const LocationSelector = ({ 
  jobData, 
  setJobData, 
  zoneOptions, 
  propertyOptions, 
  suiteOptions = [],
  showSuites = true
}) => {
  const handlePropertyChange = (value) => {
    setJobData({
      ...jobData, 
      propertyId: value,
      suiteId: '',
      hvacUnitId: ''
    });
  };

  return (
    <FormGrid columns={showSuites ? 3 : 2}>
      <FormField 
        label="Zone" 
        helpText={showSuites ? "Optional grouping" : "Apply to all properties in zone"}
      >
        <Dropdown
          value={jobData.zoneId}
          onChange={(value) => setJobData({...jobData, zoneId: value})}
          options={zoneOptions}
          placeholder="Select zone"
        />
      </FormField>
      <FormField 
        label="Property" 
        required={showSuites}
        helpText={!showSuites ? "Or select specific property" : undefined}
      >
        <Dropdown
          value={jobData.propertyId}
          onChange={handlePropertyChange}
          options={propertyOptions}
          placeholder="Select property"
        />
      </FormField>
      {showSuites && (
        <FormField label="Suite" helpText="Optional specific suite">
          <Dropdown
            value={jobData.suiteId}
            onChange={(value) => setJobData({...jobData, suiteId: value})}
            options={suiteOptions}
            placeholder="Select suite"
            disabled={!jobData.propertyId}
          />
        </FormField>
      )}
    </FormGrid>
  );
};

// Assignment & Scheduling Component
export const AssignmentScheduling = ({ 
  jobData, 
  setJobData, 
  priorityOptions, 
  technicianOptions,
  showDateFields = true
}) => {
  const columns = showDateFields ? 4 : 3;

  return (
    <FormGrid columns={columns}>
      <FormField label="Priority">
        <Dropdown
          value={jobData.priority}
          onChange={(value) => setJobData({...jobData, priority: value})}
          options={priorityOptions}
          placeholder="Select priority"
        />
      </FormField>
      <FormField label="Assigned Technician">
        <Dropdown
          value={jobData.assignedTechnician}
          onChange={(value) => setJobData({...jobData, assignedTechnician: value})}
          options={technicianOptions}
          placeholder="Select technician"
        />
      </FormField>
      {showDateFields && (
        <>
          <FormField label="Scheduled Date">
            <TextInput
              type="date"
              value={jobData.scheduledDate}
              onChange={(e) => setJobData({...jobData, scheduledDate: e.target.value})}
            />
          </FormField>
          <FormField label="Scheduled Time">
            <TextInput
              type="time"
              value={jobData.scheduledTime}
              onChange={(e) => setJobData({...jobData, scheduledTime: e.target.value})}
            />
          </FormField>
        </>
      )}
      {!showDateFields && (
        <FormField label="Estimated Duration (minutes)">
          <TextInput
            type="number"
            min="15"
            max="480"
            step="15"
            value={jobData.estimatedDuration}
            onChange={(e) => setJobData({...jobData, estimatedDuration: parseInt(e.target.value)})}
          />
        </FormField>
      )}
    </FormGrid>
  );
};

// Recurrence Pattern Component
export const RecurrencePattern = ({ 
  recurringData, 
  setRecurringData, 
  frequencyOptions,
  dayOfWeekOptions 
}) => {
  const showDayOfWeek = ['WEEKLY', 'BIWEEKLY'].includes(recurringData.frequency);
  const showDayOfMonth = recurringData.frequency === 'MONTHLY';

  return (
    <FormGrid columns={3}>
      <FormField label="Frequency" required>
        <Dropdown
          value={recurringData.frequency}
          onChange={(value) => setRecurringData({...recurringData, frequency: value})}
          options={frequencyOptions}
          placeholder="Select frequency"
        />
      </FormField>
      {showDayOfWeek && (
        <FormField label="Day of Week">
          <Dropdown
            value={recurringData.dayOfWeek}
            onChange={(value) => setRecurringData({...recurringData, dayOfWeek: parseInt(value)})}
            options={dayOfWeekOptions}
            placeholder="Select day"
          />
        </FormField>
      )}
      {showDayOfMonth && (
        <FormField label="Day of Month">
          <TextInput
            type="number"
            min="1"
            max="31"
            value={recurringData.dayOfMonth}
            onChange={(e) => setRecurringData({...recurringData, dayOfMonth: parseInt(e.target.value)})}
          />
        </FormField>
      )}
      <FormField label="Preferred Time">
        <TextInput
          type="time"
          value={recurringData.timeOfDay}
          onChange={(e) => setRecurringData({...recurringData, timeOfDay: e.target.value})}
        />
      </FormField>
    </FormGrid>
  );
};

// Job Description Component
export const JobDescription = ({ 
  jobData, 
  setJobData, 
  isRecurring = false,
  descriptionField = 'description'
}) => {
  const label = isRecurring ? 'Template Description' : 'Description';
  const placeholder = isRecurring 
    ? 'Describe what this recurring job template does'
    : 'Enter job description';

  return (
    <FormField label={label}>
      <Textarea
        value={jobData[descriptionField]}
        onChange={(e) => setJobData({...jobData, [descriptionField]: e.target.value})}
        placeholder={placeholder}
        rows={3}
      />
    </FormField>
  );
};

// Zone vs Property Selector (for recurring jobs)
export const ZonePropertySelector = ({ 
  recurringData, 
  setRecurringData, 
  zoneOptions, 
  propertyOptions 
}) => {
  const handleZoneChange = (value) => {
    setRecurringData({
      ...recurringData, 
      zoneId: value,
      propertyId: value ? '' : recurringData.propertyId
    });
  };

  const handlePropertyChange = (value) => {
    setRecurringData({
      ...recurringData, 
      propertyId: value,
      zoneId: value ? '' : recurringData.zoneId
    });
  };

  return (
    <FormGrid columns={2}>
      <FormField 
        label="Zone (Recommended)" 
        required={!recurringData.propertyId}
        helpText="Apply to all properties in this zone"
      >
        <Dropdown
          value={recurringData.zoneId}
          onChange={handleZoneChange}
          options={zoneOptions}
          placeholder="Select zone for all properties"
        />
      </FormField>
      <FormField 
        label="Specific Property" 
        required={!recurringData.zoneId}
        helpText="Apply only to this property"
      >
        <Dropdown
          value={recurringData.propertyId}
          onChange={handlePropertyChange}
          options={propertyOptions}
          placeholder="Or select specific property"
        />
      </FormField>
    </FormGrid>
  );
};
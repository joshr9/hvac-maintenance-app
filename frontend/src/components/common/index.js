// components/common/index.js
export * from './FormComponents';

// components/jobs/index.js
export { default as CreateJobModal } from './CreateJobModal';
export * from './JobFormComponents';
export * from './hooks/useJobFormOptions';

// Usage example in your main app:
// import { CreateJobModal } from './components/jobs';
// import { FormField, Dropdown, ErrorAlert } from './components/common';
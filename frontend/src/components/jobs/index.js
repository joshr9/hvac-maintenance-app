// components/jobs/index.js
// This file allows for cleaner imports: import { JobsList, JobCard } from 'components/jobs'

export { default as JobsList } from './JobsList';
export { default as JobCard } from './JobCard';
export { default as JobGrid } from './JobGrid';
export { default as JobStats } from './JobStats';
export { default as JobFilters } from './JobFilters';
export { default as JobDetailModal } from './JobDetailModal';
export { default as CreateJobModal } from './CreateJobModal';

// Alternative: If CreateJobModal is elsewhere, comment out the line above
// and import it directly in JobsList.jsx like:
// import CreateJobModal from '../CreateJobModal';  // if it's in parent components folder
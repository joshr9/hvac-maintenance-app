// components/jobs/index.js
// This file allows for cleaner imports: import { JobsList, JobCard } from 'components/jobs'

export { default as JobsList } from './JobsList';
export { default as JobCard } from './JobCard';
export { default as JobGrid } from './JobGrid';
export { default as JobStats } from './JobStats';
export { default as JobFilters } from './JobFilters';
export { default as JobDetailModal } from './JobDetailModal';
export { default as JobDetailView } from './JobDetailView'; 
export { default as CreateJobModal } from './CreateJobModal';

// Job Detail Components (broken out from JobDetailView)
export { default as OverviewTab } from './OverviewTab';
export { default as NotesTab } from './NotesTab';

// Job Action Components
export { default as EditJobModal } from './EditJobModal';
export { default as JobActionsDropdown } from './JobActionsDropdown';

// Service-related exports
export { default as ServicesTab } from './ServicesTab';
export { default as AddServiceModal } from './AddServiceModal';
export { default as EditServiceModal } from './EditServiceModal';

// Sub-component exports (services folder)
export { default as ServicesList } from './services/ServicesList';
export { default as ServiceRow } from './services/ServiceRow';
export { default as EmptyServicesState } from './services/EmptyServicesState';
export { default as ServicesSummary } from './services/ServicesSummary';
export { default as ServiceCatalogSelector } from './services/ServiceCatalogSelector';
export { default as ServicePreviewCard } from './services/ServicePreviewCard';
export { default as ServiceDetailsForm } from './services/ServiceDetailsForm';
export { default as ServiceTotalsPreview } from './services/ServiceTotalsPreview';

// Alternative: If CreateJobModal is elsewhere, comment out the line above
// and import it directly in JobsList.jsx like:
// import CreateJobModal from '../CreateJobModal';  // if it's in parent components folder
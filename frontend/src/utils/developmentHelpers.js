// src/utils/developmentHelpers.js
export const isDevelopmentFeatureEnabled = (feature) => {
  if (process.env.NODE_ENV !== 'development') return false;
  
  const flags = {
    authTester: true,
    dragDropDebug: true,
    performanceLogging: true
  };
  
  return flags[feature] || false;
};
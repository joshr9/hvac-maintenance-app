// scripts/startScheduler.js - Start the recurring job scheduler
require('dotenv').config();

console.log('🚀 Starting Recurring Job Scheduler...');
console.log(`📅 Current time: ${new Date().toLocaleString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Import and start the scheduler
require('./jobScheduler');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

console.log('✅ Scheduler started successfully!');
console.log('💡 Press Ctrl+C to stop the scheduler');
console.log('\n' + '='.repeat(50) + '\n');
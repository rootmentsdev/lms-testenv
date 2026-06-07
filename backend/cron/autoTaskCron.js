/**
 * autoTaskCron.js
 *
 * Runs every hour. Checks all active AutoTaskTemplates and generates
 * real Task documents for any that are due today.
 *
 * Pattern mirrors walkinStatusSyncCron.js exactly.
 */

import cron from 'node-cron';
import { generateAutoTasks } from '../services/autoTaskGenerationService.js';

let isRunning = false;

export const startAutoTaskCron = () => {
  console.log('🕐 Starting Auto Task Generation Scheduler...');

  // Run every hour at the top of the hour
  cron.schedule('0 * * * *', async () => {
    if (isRunning) {
      console.log('⚠️  [AutoTask Cron] Previous run still in progress. Skipping.');
      return;
    }

    isRunning = true;
    try {
      console.log('⏰  Running scheduled Auto Task Generation...');
      const result = await generateAutoTasks();
      console.log(`✅  Auto Task Generation complete:`, result);
    } catch (err) {
      console.error('❌  Auto Task Generation Cron error:', err);
    } finally {
      isRunning = false;
    }
  });

  console.log('✅  Auto Task Generation Scheduler started (runs every hour)');
};

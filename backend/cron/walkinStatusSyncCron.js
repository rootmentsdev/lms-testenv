import cron from 'node-cron';
import { syncWalkinStatuses } from '../services/walkinStatusSyncService.js';

let isRunning = false;

export const startWalkinStatusSyncCron = () => {
    console.log('🕐 Starting Walk-in Status Sync Scheduler...');

    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        if (isRunning) {
            console.log('⚠️ [Walkin Status Sync Cron] Previous sync job is still running. Skipping this execution.');
            return;
        }

        isRunning = true;
        try {
            console.log('⏰ Running scheduled Walk-in Status Sync...');
            await syncWalkinStatuses();
        } catch (error) {
            console.error('❌ Scheduled Walk-in Status Sync Cron encountered an error:', error);
        } finally {
            isRunning = false;
        }
    });

    console.log('✅ Walk-in Status Sync Scheduler started (runs every 15 minutes)');
};

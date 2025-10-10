import cron from 'node-cron';
import { runEscalationProcess } from './EscalationSystem.js';
import EscalationSystem from './EscalationSystem.js';

/**
 * Escalation Cron Job Manager
 * 
 * This manages the automated escalation system that runs every 2 minutes for testing.
 * In production, this should be changed to appropriate intervals.
 * 
 * Features:
 * - Configurable cron schedule
 * - Start/stop functionality
 * - Error handling and recovery
 * - Logging and monitoring
 */

class EscalationCronJob {
    constructor() {
        this.cronJob = null;
        this.isRunning = false;
        this.cronSchedule = process.env.ESCALATION_CRON_SCHEDULE || '*/2 * * * *'; // Every 2 minutes
        this.maxConsecutiveFailures = 3;
        this.consecutiveFailures = 0;
        this.escalationSystem = new EscalationSystem();
    }

    /**
     * Start the escalation cron job
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ Escalation cron job is already running');
            return;
        }

        try {
            console.log(`🚀 Starting escalation cron job with schedule: ${this.cronSchedule}`);
            
            this.cronJob = cron.schedule(this.cronSchedule, async () => {
                await this.runEscalationTask();
            }, {
                scheduled: false, // Don't start immediately
                timezone: "Asia/Kolkata"
            });

            this.cronJob.start();
            this.isRunning = true;
            
            console.log('✅ Escalation cron job started successfully');
            console.log('📅 Schedule:', this.cronSchedule);
            console.log('⏰ Next run:', this.getNextRunTime());
            
        } catch (error) {
            console.error('❌ Failed to start escalation cron job:', error);
            throw error;
        }
    }

    /**
     * Stop the escalation cron job
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Escalation cron job is not running');
            return;
        }

        try {
            if (this.cronJob) {
                this.cronJob.stop();
                this.cronJob.destroy();
                this.cronJob = null;
            }
            
            this.isRunning = false;
            console.log('✅ Escalation cron job stopped successfully');
            
        } catch (error) {
            console.error('❌ Failed to stop escalation cron job:', error);
            throw error;
        }
    }

    /**
     * Restart the escalation cron job
     */
    restart() {
        console.log('🔄 Restarting escalation cron job...');
        this.stop();
        this.start();
    }

    /**
     * Run the escalation task with error handling
     */
    async runEscalationTask() {
        const startTime = new Date();
        console.log(`\n🕐 [${startTime.toISOString()}] Starting escalation task...`);
        
        try {
            // Reset failure counter on success
            this.consecutiveFailures = 0;
            
            // Run the escalation process
            await runEscalationProcess();
            
            const endTime = new Date();
            const duration = endTime - startTime;
            console.log(`✅ [${endTime.toISOString()}] Escalation task completed successfully in ${duration}ms`);
            
            // Log statistics
            await this.logTaskStatistics();
            
        } catch (error) {
            this.consecutiveFailures++;
            const endTime = new Date();
            const duration = endTime - startTime;
            
            console.error(`❌ [${endTime.toISOString()}] Escalation task failed after ${duration}ms:`, error);
            console.error(`📊 Consecutive failures: ${this.consecutiveFailures}/${this.maxConsecutiveFailures}`);
            
            // Stop cron job if too many consecutive failures
            if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
                console.error(`🚨 Too many consecutive failures (${this.consecutiveFailures}). Stopping cron job for safety.`);
                this.stop();
            }
        }
    }

    /**
     * Log task statistics
     */
    async logTaskStatistics() {
        try {
            const stats = await this.escalationSystem.getEscalationStats();
            if (stats) {
                console.log('📊 Escalation Statistics:');
                console.log(`   Total Escalations: ${stats.totalEscalations}`);
                console.log(`   Recent (24h): ${stats.recentEscalations}`);
                console.log(`   By Level:`, stats.byLevel);
            }
        } catch (error) {
            console.error('❌ Error logging task statistics:', error);
        }
    }

    /**
     * Get next run time
     */
    getNextRunTime() {
        if (!this.cronJob || !this.isRunning) {
            return 'Not scheduled';
        }
        
        try {
            // This is a simplified calculation - in production you might want to use a proper cron parser
            const now = new Date();
            const nextRun = new Date(now.getTime() + (2 * 60 * 1000)); // Add 2 minutes
            return nextRun.toISOString();
        } catch (error) {
            return 'Unknown';
        }
    }

    /**
     * Get cron job status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            schedule: this.cronSchedule,
            nextRun: this.getNextRunTime(),
            consecutiveFailures: this.consecutiveFailures,
            maxConsecutiveFailures: this.maxConsecutiveFailures
        };
    }

    /**
     * Update cron schedule
     */
    updateSchedule(newSchedule) {
        if (this.isRunning) {
            console.log('🔄 Updating cron schedule while running...');
            this.cronSchedule = newSchedule;
            this.restart();
        } else {
            this.cronSchedule = newSchedule;
            console.log(`📅 Cron schedule updated to: ${newSchedule}`);
        }
    }

    /**
     * Run escalation manually (for testing)
     */
    async runManual() {
        console.log('🔧 Running escalation process manually...');
        await this.runEscalationTask();
    }
}

// Create singleton instance
const escalationCronJob = new EscalationCronJob();

// Export functions for easy access
export const startEscalationCron = () => escalationCronJob.start();
export const stopEscalationCron = () => escalationCronJob.stop();
export const restartEscalationCron = () => escalationCronJob.restart();
export const getEscalationCronStatus = () => escalationCronJob.getStatus();
export const runManualEscalation = () => escalationCronJob.runManual();

// Export the class for advanced usage
export default EscalationCronJob;

import express from 'express';
import {
    startEscalationCron,
    stopEscalationCron,
    restartEscalationCron,
    getEscalationCronStatus,
    runManualEscalation
} from '../lib/EscalationCronJob.js';
import EscalationSystem from '../lib/EscalationSystem.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Escalation Management
 *   description: APIs for managing the training escalation system
 */

/**
 * @swagger
 * /api/escalation/status:
 *   get:
 *     tags: [Escalation Management]
 *     summary: Get escalation cron job status
 *     description: Returns the current status of the escalation cron job including schedule and next run time.
 *     responses:
 *       200:
 *         description: Escalation cron job status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     isRunning:
 *                       type: boolean
 *                     schedule:
 *                       type: string
 *                     nextRun:
 *                       type: string
 *                     consecutiveFailures:
 *                       type: number
 *                     maxConsecutiveFailures:
 *                       type: number
 */
router.get('/status', (req, res) => {
    try {
        const status = getEscalationCronStatus();
        res.status(200).json({
            success: true,
            message: "Escalation cron job status retrieved successfully",
            status: status
        });
    } catch (error) {
        console.error('Error getting escalation status:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get escalation status",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/escalation/start:
 *   post:
 *     tags: [Escalation Management]
 *     summary: Start escalation cron job
 *     description: Starts the automated escalation cron job that runs every 2 minutes for testing.
 *     responses:
 *       200:
 *         description: Escalation cron job started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: object
 *       400:
 *         description: Bad request if cron job is already running.
 */
router.post('/start', (req, res) => {
    try {
        startEscalationCron();
        const status = getEscalationCronStatus();
        
        res.status(200).json({
            success: true,
            message: "Escalation cron job started successfully",
            status: status
        });
    } catch (error) {
        console.error('Error starting escalation cron:', error);
        res.status(500).json({
            success: false,
            message: "Failed to start escalation cron job",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/escalation/stop:
 *   post:
 *     tags: [Escalation Management]
 *     summary: Stop escalation cron job
 *     description: Stops the automated escalation cron job.
 *     responses:
 *       200:
 *         description: Escalation cron job stopped successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: object
 */
router.post('/stop', (req, res) => {
    try {
        stopEscalationCron();
        const status = getEscalationCronStatus();
        
        res.status(200).json({
            success: true,
            message: "Escalation cron job stopped successfully",
            status: status
        });
    } catch (error) {
        console.error('Error stopping escalation cron:', error);
        res.status(500).json({
            success: false,
            message: "Failed to stop escalation cron job",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/escalation/restart:
 *   post:
 *     tags: [Escalation Management]
 *     summary: Restart escalation cron job
 *     description: Restarts the automated escalation cron job.
 *     responses:
 *       200:
 *         description: Escalation cron job restarted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: object
 */
router.post('/restart', (req, res) => {
    try {
        restartEscalationCron();
        const status = getEscalationCronStatus();
        
        res.status(200).json({
            success: true,
            message: "Escalation cron job restarted successfully",
            status: status
        });
    } catch (error) {
        console.error('Error restarting escalation cron:', error);
        res.status(500).json({
            success: false,
            message: "Failed to restart escalation cron job",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/escalation/run-manual:
 *   post:
 *     tags: [Escalation Management]
 *     summary: Run escalation process manually
 *     description: Manually triggers the escalation process once without affecting the cron job schedule.
 *     responses:
 *       200:
 *         description: Manual escalation process completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Error during manual escalation process.
 */
router.post('/run-manual', async (req, res) => {
    try {
        console.log('🔧 Manual escalation triggered via API');
        await runManualEscalation();
        
        res.status(200).json({
            success: true,
            message: "Manual escalation process completed successfully",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error running manual escalation:', error);
        res.status(500).json({
            success: false,
            message: "Failed to run manual escalation process",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/escalation/overdue-users:
 *   get:
 *     tags: [Escalation Management]
 *     summary: Get users with overdue trainings
 *     description: Retrieves a list of all users who have overdue trainings, grouped by escalation level.
 *     responses:
 *       200:
 *         description: Overdue users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     level1:
 *                       type: array
 *                       description: Users for Level 1 escalation (1-2 days overdue)
 *                     level2:
 *                       type: array
 *                       description: Users for Level 2 escalation (3-4 days overdue)
 *                     level3:
 *                       type: array
 *                       description: Users for Level 3 escalation (5+ days overdue)
 *                     total:
 *                       type: number
 *                       description: Total number of users with overdue trainings
 *       500:
 *         description: Error retrieving overdue users.
 */
router.get('/overdue-users', async (req, res) => {
    try {
        const escalationSystem = new EscalationSystem();
        const overdueUsers = await escalationSystem.getOverdueUsers();
        
        // Categorize users by escalation level
        const level1Users = overdueUsers.filter(user => 
            user.overdueTrainings.some(training => training.daysOverdue >= 1 && training.daysOverdue < 3)
        );
        
        const level2Users = overdueUsers.filter(user => 
            user.overdueTrainings.some(training => training.daysOverdue >= 3 && training.daysOverdue < 5)
        );
        
        const level3Users = overdueUsers.filter(user => 
            user.overdueTrainings.some(training => training.daysOverdue >= 5)
        );
        
        res.status(200).json({
            success: true,
            message: "Overdue users retrieved successfully",
            data: {
                level1: level1Users,
                level2: level2Users,
                level3: level3Users,
                total: overdueUsers.length,
                summary: {
                    level1Count: level1Users.length,
                    level2Count: level2Users.length,
                    level3Count: level3Users.length,
                    totalCount: overdueUsers.length
                }
            }
        });
    } catch (error) {
        console.error('Error retrieving overdue users:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve overdue users",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/escalation/stats:
 *   get:
 *     tags: [Escalation Management]
 *     summary: Get escalation statistics
 *     description: Retrieves comprehensive statistics about escalations including total counts and recent activity.
 *     responses:
 *       200:
 *         description: Escalation statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEscalations:
 *                       type: number
 *                     recentEscalations:
 *                       type: number
 *                     byLevel:
 *                       type: array
 *       500:
 *         description: Error retrieving escalation statistics.
 */
router.get('/stats', async (req, res) => {
    try {
        const escalationSystem = new EscalationSystem();
        const stats = await escalationSystem.getEscalationStats();
        
        res.status(200).json({
            success: true,
            message: "Escalation statistics retrieved successfully",
            data: stats
        });
    } catch (error) {
        console.error('Error retrieving escalation stats:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve escalation statistics",
            error: error.message
        });
    }
});

export default router;

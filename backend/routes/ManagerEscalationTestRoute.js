import express from 'express';
import Admin from '../model/Admin.js';
import User from '../model/User.js';
import Branch from '../model/Branch.js';
import { sendWhatsAppMessage } from '../lib/WhatsAppMessage.js';

const router = express.Router();

/**
 * @swagger
 * /api/test/managers:
 *   get:
 *     tags: [Testing]
 *     summary: Get all managers for escalation testing
 *     description: Get list of all managers (Store, Cluster, HR) with their phone numbers and branches
 *     responses:
 *       200:
 *         description: Successfully retrieved manager data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 storeManagers:
 *                   type: array
 *                   description: List of store managers
 *                 clusterManagers:
 *                   type: array
 *                   description: List of cluster managers
 *                 hrManagers:
 *                   type: array
 *                   description: List of HR managers
 *                 trainingManagers:
 *                   type: array
 *                   description: List of training managers
 */
router.get('/managers', async (req, res) => {
    try {
        console.log('🔍 Fetching all managers for escalation testing...');

        // Get all managers by role
        const storeManagers = await Admin.find({ role: "store_admin" }).populate('branches');
        const clusterManagers = await Admin.find({ role: "cluster_admin" }).populate('branches');
        const hrManagers = await Admin.find({ subRole: "Level 2" }); // HR managers
        const trainingManagers = await Admin.find({ subRole: "Level 1" }); // Training managers

        console.log(`📊 Found ${storeManagers.length} store managers`);
        console.log(`📊 Found ${clusterManagers.length} cluster managers`);
        console.log(`📊 Found ${hrManagers.length} HR managers`);
        console.log(`📊 Found ${trainingManagers.length} training managers`);

        // Format the response
        const response = {
            storeManagers: storeManagers.map(manager => ({
                id: manager._id,
                name: manager.name,
                email: manager.email,
                phoneNumber: manager.phoneNumber || 'Not provided',
                role: manager.role,
                branches: manager.branches?.map(branch => ({
                    name: branch.branchName,
                    locCode: branch.locCode
                })) || []
            })),
            clusterManagers: clusterManagers.map(manager => ({
                id: manager._id,
                name: manager.name,
                email: manager.email,
                phoneNumber: manager.phoneNumber || 'Not provided',
                role: manager.role,
                subRole: manager.subRole,
                branches: manager.branches?.map(branch => ({
                    name: branch.branchName,
                    locCode: branch.locCode
                })) || []
            })),
            hrManagers: hrManagers.map(manager => ({
                id: manager._id,
                name: manager.name,
                email: manager.email,
                phoneNumber: manager.phoneNumber || 'Not provided',
                role: manager.role,
                subRole: manager.subRole
            })),
            trainingManagers: trainingManagers.map(manager => ({
                id: manager._id,
                name: manager.name,
                email: manager.email,
                phoneNumber: manager.phoneNumber || 'Not provided',
                role: manager.role,
                subRole: manager.subRole
            }))
        };

        res.status(200).json({
            success: true,
            message: 'Manager data retrieved successfully',
            data: response,
            counts: {
                storeManagers: storeManagers.length,
                clusterManagers: clusterManagers.length,
                hrManagers: hrManagers.length,
                trainingManagers: trainingManagers.length
            }
        });

    } catch (error) {
        console.error('❌ Error fetching managers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manager data',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/test/overdue-users:
 *   get:
 *     tags: [Testing]
 *     summary: Get users with overdue trainings for escalation testing
 *     description: Get list of users who have overdue trainings that need escalation
 *     responses:
 *       200:
 *         description: Successfully retrieved overdue users data
 */
router.get('/overdue-users', async (req, res) => {
    try {
        console.log('🔍 Fetching users with overdue trainings...');

        const currentDate = new Date();
        
        // Get all users with their training data
        const users = await User.find({}).populate('training.trainingId');
        
        const overdueUsers = users.map(user => {
            const overdueTrainings = user.training.filter(training => {
                return !training.pass && new Date(training.deadline) < currentDate;
            });

            if (overdueTrainings.length > 0) {
                return {
                    userId: user._id,
                    empID: user.empID,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    locCode: user.locCode,
                    workingBranch: user.workingBranch,
                    designation: user.designation,
                    overdueTrainings: overdueTrainings.map(training => ({
                        trainingId: training.trainingId?._id,
                        trainingName: training.trainingId?.trainingName,
                        deadline: training.deadline,
                        daysOverdue: Math.floor((currentDate - new Date(training.deadline)) / (1000 * 60 * 60 * 24))
                    }))
                };
            }
            return null;
        }).filter(user => user !== null);

        console.log(`📊 Found ${overdueUsers.length} users with overdue trainings`);

        res.status(200).json({
            success: true,
            message: 'Overdue users retrieved successfully',
            data: overdueUsers,
            count: overdueUsers.length
        });

    } catch (error) {
        console.error('❌ Error fetching overdue users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue users',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/test/send-escalation-test:
 *   post:
 *     tags: [Testing]
 *     summary: Send test escalation messages to managers
 *     description: Send test WhatsApp messages to managers about overdue trainings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               escalationLevel:
 *                 type: string
 *                 enum: [store, cluster, hr]
 *                 description: Which level of managers to notify
 *               phoneNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of phone numbers to send messages to
 *               testMessage:
 *                 type: string
 *                 description: Custom test message (optional)
 *             required:
 *               - escalationLevel
 *               - phoneNumbers
 *     responses:
 *       200:
 *         description: Test messages sent successfully
 */
router.post('/send-escalation-test', async (req, res) => {
    try {
        const { escalationLevel, phoneNumbers, testMessage } = req.body;

        if (!escalationLevel || !phoneNumbers || !Array.isArray(phoneNumbers)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request. escalationLevel and phoneNumbers array are required.'
            });
        }

        console.log(`📱 Sending test escalation messages for level: ${escalationLevel}`);
        console.log(`📱 Target phone numbers: ${phoneNumbers.join(', ')}`);

        const results = [];
        const defaultMessages = {
            store: "🔔 STORE MANAGER ALERT: Employee John Doe (EMP123) at Store Location has overdue training 'Safety Training'. Deadline was 3 days ago. Please follow up immediately.",
            cluster: "⚠️ CLUSTER MANAGER ESCALATION: Store Location has multiple overdue trainings. Store Manager has not resolved this. Please intervene.",
            hr: "🚨 HR MANAGER URGENT: Multiple overdue trainings across stores require HR intervention. Management chain has failed to resolve. HR action required."
        };

        const message = testMessage || defaultMessages[escalationLevel] || "Test escalation message";

        // Send messages to each phone number
        for (const phoneNumber of phoneNumbers) {
            try {
                console.log(`📱 Sending to: ${phoneNumber}`);
                const result = await sendWhatsAppMessage(phoneNumber, message);
                
                results.push({
                    phoneNumber,
                    success: result.success,
                    message: result.success ? 'Message sent successfully' : 'Failed to send message',
                    error: result.error || null
                });
            } catch (error) {
                console.error(`❌ Error sending to ${phoneNumber}:`, error);
                results.push({
                    phoneNumber,
                    success: false,
                    message: 'Failed to send message',
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        res.status(200).json({
            success: true,
            message: `Escalation test completed. ${successCount} successful, ${failureCount} failed.`,
            escalationLevel,
            results,
            summary: {
                totalSent: phoneNumbers.length,
                successful: successCount,
                failed: failureCount
            }
        });

    } catch (error) {
        console.error('❌ Error in escalation test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send escalation test messages',
            error: error.message
        });
    }
});

export default router;

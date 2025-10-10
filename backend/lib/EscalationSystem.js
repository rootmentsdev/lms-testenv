import mongoose from 'mongoose';
import User from '../model/User.js';
import Admin from '../model/Admin.js';
import Escalation from '../model/Escalation.js';
import TrainingProgress from '../model/Trainingprocessschema.js';
import { sendWhatsAppMessage } from './WhatsAppMessage.js';

/**
 * Professional Escalation System for Training Compliance
 * 
 * This system automatically escalates overdue trainings through the management hierarchy:
 * 1. Store Manager (1 day overdue)
 * 2. Cluster Manager (3 days overdue) 
 * 3. HR Manager (5+ days overdue)
 * 
 * Features:
 * - Batch messaging for efficiency
 * - Comprehensive logging
 * - Rate limiting to prevent spam
 * - Error handling and retry logic
 * - Real-time escalation tracking
 */

class EscalationSystem {
    constructor() {
        this.testMode = process.env.ESCALATION_TEST_MODE === 'true';
        this.testPhoneNumber = process.env.TEST_PHONE_NUMBER || '918590292642';
        this.rateLimitDelay = 1000; // 1 second between messages
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 seconds between retries
    }

    /**
     * Main escalation process - runs every 2 minutes
     */
    async runEscalationProcess() {
        try {
            console.log('🚀 Starting escalation process...');
            
            // Get all overdue users
            const overdueUsers = await this.getOverdueUsers();
            
            if (overdueUsers.length === 0) {
                console.log('✅ No overdue trainings found. Escalation process complete.');
                return;
            }

            console.log(`📊 Found ${overdueUsers.length} users with overdue trainings`);

            // Process escalations by level
            await this.processLevel1Escalations(overdueUsers); // Store Managers
            await this.processLevel2Escalations(overdueUsers); // Cluster Managers  
            await this.processLevel3Escalations(overdueUsers); // HR Managers

            console.log('✅ Escalation process completed successfully');

        } catch (error) {
            console.error('❌ Error in escalation process:', error);
            throw error;
        }
    }

    /**
     * Get all users with overdue trainings
     */
    async getOverdueUsers() {
        try {
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

            return overdueUsers;
        } catch (error) {
            console.error('❌ Error getting overdue users:', error);
            throw error;
        }
    }

    /**
     * Level 1: Store Manager Escalations (1 day overdue)
     */
    async processLevel1Escalations(overdueUsers) {
        try {
            console.log('📱 Processing Level 1 escalations (Store Managers)...');
            
            const level1Users = overdueUsers.filter(user => 
                user.overdueTrainings.some(training => training.daysOverdue >= 1 && training.daysOverdue < 3)
            );

            if (level1Users.length === 0) {
                console.log('ℹ️ No Level 1 escalations needed');
                return;
            }

            console.log(`📊 Found ${level1Users.length} users for Level 1 escalation`);

            // Group by store/location for batch messaging
            const storeGroups = this.groupUsersByStore(level1Users);

            for (const [locCode, users] of storeGroups) {
                await this.sendStoreManagerAlerts(locCode, users);
            }

        } catch (error) {
            console.error('❌ Error in Level 1 escalations:', error);
            throw error;
        }
    }

    /**
     * Level 2: Cluster Manager Escalations (3+ days overdue)
     */
    async processLevel2Escalations(overdueUsers) {
        try {
            console.log('📱 Processing Level 2 escalations (Cluster Managers)...');
            
            const level2Users = overdueUsers.filter(user => 
                user.overdueTrainings.some(training => training.daysOverdue >= 3 && training.daysOverdue < 5)
            );

            if (level2Users.length === 0) {
                console.log('ℹ️ No Level 2 escalations needed');
                return;
            }

            console.log(`📊 Found ${level2Users.length} users for Level 2 escalation`);

            await this.sendClusterManagerAlerts(level2Users);

        } catch (error) {
            console.error('❌ Error in Level 2 escalations:', error);
            throw error;
        }
    }

    /**
     * Level 3: HR Manager Escalations (5+ days overdue)
     */
    async processLevel3Escalations(overdueUsers) {
        try {
            console.log('📱 Processing Level 3 escalations (HR Managers)...');
            
            const level3Users = overdueUsers.filter(user => 
                user.overdueTrainings.some(training => training.daysOverdue >= 5)
            );

            if (level3Users.length === 0) {
                console.log('ℹ️ No Level 3 escalations needed');
                return;
            }

            console.log(`📊 Found ${level3Users.length} users for Level 3 escalation`);

            await this.sendHRManagerAlerts(level3Users);

        } catch (error) {
            console.error('❌ Error in Level 3 escalations:', error);
            throw error;
        }
    }

    /**
     * Send alerts to Store Managers
     */
    async sendStoreManagerAlerts(locCode, users) {
        try {
            // Get store manager for this location
            const storeManager = await Admin.findOne({ 
                role: "store_admin",
                branches: { $elemMatch: { locCode: locCode } }
            }).populate('branches');

            if (!storeManager) {
                console.log(`⚠️ No store manager found for location ${locCode}`);
                return;
            }

            const phoneNumber = this.testMode ? this.testPhoneNumber : storeManager.phoneNumber;
            
            if (!phoneNumber) {
                console.log(`⚠️ No phone number for store manager ${storeManager.name}`);
                return;
            }

            // Create consolidated message
            const message = this.createStoreManagerMessage(users, locCode);
            
            // Send message with retry logic
            await this.sendMessageWithRetry(phoneNumber, message, 'Store Manager', storeManager.name);

            // Log escalation
            await this.logEscalation(users, storeManager._id, 1, message);

        } catch (error) {
            console.error(`❌ Error sending store manager alerts for ${locCode}:`, error);
        }
    }

    /**
     * Send alerts to Cluster Managers
     */
    async sendClusterManagerAlerts(users) {
        try {
            // Get all cluster managers
            const clusterManagers = await Admin.find({ role: "cluster_admin" }).populate('branches');

            if (clusterManagers.length === 0) {
                console.log('⚠️ No cluster managers found');
                return;
            }

            // Group users by cluster manager's branches
            for (const clusterManager of clusterManagers) {
                const managerBranches = clusterManager.branches.map(branch => branch.locCode);
                const relevantUsers = users.filter(user => managerBranches.includes(user.locCode));

                if (relevantUsers.length === 0) continue;

                const phoneNumber = this.testMode ? this.testPhoneNumber : clusterManager.phoneNumber;
                
                if (!phoneNumber) {
                    console.log(`⚠️ No phone number for cluster manager ${clusterManager.name}`);
                    continue;
                }

                const message = this.createClusterManagerMessage(relevantUsers);
                
                await this.sendMessageWithRetry(phoneNumber, message, 'Cluster Manager', clusterManager.name);

                await this.logEscalation(relevantUsers, clusterManager._id, 2, message);
            }

        } catch (error) {
            console.error('❌ Error sending cluster manager alerts:', error);
        }
    }

    /**
     * Send alerts to HR Managers
     */
    async sendHRManagerAlerts(users) {
        try {
            // Get HR managers
            const hrManagers = await Admin.find({ subRole: "Level 2" });

            if (hrManagers.length === 0) {
                console.log('⚠️ No HR managers found');
                return;
            }

            // Send to all HR managers
            const phoneNumbers = hrManagers.map(manager => 
                this.testMode ? this.testPhoneNumber : manager.phoneNumber
            ).filter(phone => phone);

            const message = this.createHRManagerMessage(users);
            
            // Send to all HR managers
            await this.sendBatchMessages(phoneNumbers, message, 'HR Manager');

            // Log escalation for all HR managers
            for (const hrManager of hrManagers) {
                await this.logEscalation(users, hrManager._id, 3, message);
            }

        } catch (error) {
            console.error('❌ Error sending HR manager alerts:', error);
        }
    }

    /**
     * Create message for Store Manager
     */
    createStoreManagerMessage(users, locCode) {
        const storeName = users[0]?.workingBranch || `Store ${locCode}`;
        const userCount = users.length;
        
        if (userCount === 1) {
            const user = users[0];
            const training = user.overdueTrainings[0];
            return `🔔 STORE MANAGER ALERT: Employee ${user.username} (${user.empID}) at ${storeName} has overdue training '${training.trainingName}'. Deadline was ${training.daysOverdue} days ago. Please follow up immediately.`;
        } else {
            return `🔔 STORE MANAGER ALERT: ${userCount} employees at ${storeName} have overdue trainings. Please review and follow up immediately.`;
        }
    }

    /**
     * Create message for Cluster Manager
     */
    createClusterManagerMessage(users) {
        const storeGroups = this.groupUsersByStore(users);
        const storeCount = storeGroups.size;
        const userCount = users.length;
        
        let message = `⚠️ CLUSTER MANAGER ESCALATION: ${storeCount} stores have overdue trainings requiring your attention:\n\n`;
        
        for (const [locCode, storeUsers] of storeGroups) {
            const storeName = storeUsers[0]?.workingBranch || `Store ${locCode}`;
            const overdueCount = storeUsers.length;
            message += `📍 ${storeName}: ${overdueCount} employees with overdue trainings\n`;
        }
        
        message += `\nStore Managers have not resolved these. Please intervene immediately.`;
        
        return message;
    }

    /**
     * Create message for HR Manager
     */
    createHRManagerMessage(users) {
        const totalUsers = users.length;
        const criticalUsers = users.filter(user => 
            user.overdueTrainings.some(training => training.daysOverdue >= 14)
        );
        
        const storeCount = new Set(users.map(user => user.locCode)).size;
        
        let message = `🚨 HR MANAGER URGENT: Critical overdue trainings require immediate HR intervention:\n\n`;
        message += `📊 SUMMARY: ${totalUsers} employees with overdue trainings\n`;
        message += `📍 STORES AFFECTED: ${storeCount} different locations\n`;
        
        if (criticalUsers.length > 0) {
            message += `⚠️ CRITICAL CASES (14+ days overdue):\n`;
            criticalUsers.slice(0, 5).forEach(user => {
                const criticalTraining = user.overdueTrainings.find(t => t.daysOverdue >= 14);
                message += `• ${user.username} (${user.empID}) - ${criticalTraining.daysOverdue} days overdue: '${criticalTraining.trainingName}'\n`;
            });
        }
        
        message += `\nManagement chain has failed to resolve these. HR disciplinary action required immediately.`;
        
        return message;
    }

    /**
     * Group users by store/location
     */
    groupUsersByStore(users) {
        const groups = new Map();
        users.forEach(user => {
            const locCode = user.locCode;
            if (!groups.has(locCode)) {
                groups.set(locCode, []);
            }
            groups.get(locCode).push(user);
        });
        return groups;
    }

    /**
     * Send message with retry logic
     */
    async sendMessageWithRetry(phoneNumber, message, recipientType, recipientName) {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`📱 Sending ${recipientType} alert to ${recipientName} (${phoneNumber}) - Attempt ${attempt}`);
                
                const result = await sendWhatsAppMessage(phoneNumber, message);
                
                if (result.success) {
                    console.log(`✅ ${recipientType} alert sent successfully to ${recipientName}`);
                    return result;
                } else {
                    console.log(`⚠️ Failed to send ${recipientType} alert to ${recipientName}: ${result.error}`);
                }
                
            } catch (error) {
                console.error(`❌ Error sending ${recipientType} alert to ${recipientName} (attempt ${attempt}):`, error);
            }
            
            if (attempt < this.maxRetries) {
                console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
                await this.sleep(this.retryDelay);
            }
        }
        
        console.error(`❌ Failed to send ${recipientType} alert to ${recipientName} after ${this.maxRetries} attempts`);
        return { success: false, error: 'Max retries exceeded' };
    }

    /**
     * Send batch messages to multiple recipients
     */
    async sendBatchMessages(phoneNumbers, message, recipientType) {
        console.log(`📱 Sending batch ${recipientType} alerts to ${phoneNumbers.length} recipients`);
        
        const results = [];
        
        for (const phoneNumber of phoneNumbers) {
            try {
                const result = await this.sendMessageWithRetry(phoneNumber, message, recipientType, phoneNumber);
                results.push({ phoneNumber, result });
                
                // Rate limiting - wait between messages
                await this.sleep(this.rateLimitDelay);
                
            } catch (error) {
                console.error(`❌ Error in batch messaging to ${phoneNumber}:`, error);
                results.push({ phoneNumber, result: { success: false, error: error.message } });
            }
        }
        
        const successCount = results.filter(r => r.result.success).length;
        console.log(`✅ Batch ${recipientType} alerts completed: ${successCount}/${phoneNumbers.length} successful`);
        
        return results;
    }

    /**
     * Log escalation in database
     */
    async logEscalation(users, adminId, level, message) {
        try {
            for (const user of users) {
                await Escalation.create({
                    email: user.email,
                    toUser: user.userId,
                    toAdmin: [adminId],
                    context: message,
                    deadline: new Date(), // Current time as escalation time
                    level: level,
                    completed: false
                });
            }
        } catch (error) {
            console.error('❌ Error logging escalation:', error);
        }
    }

    /**
     * Utility function to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get escalation statistics
     */
    async getEscalationStats() {
        try {
            const stats = await Escalation.aggregate([
                {
                    $group: {
                        _id: '$level',
                        count: { $sum: 1 },
                        recent: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            return {
                totalEscalations: stats.reduce((sum, stat) => sum + stat.count, 0),
                recentEscalations: stats.reduce((sum, stat) => sum + stat.recent, 0),
                byLevel: stats
            };
        } catch (error) {
            console.error('❌ Error getting escalation stats:', error);
            return null;
        }
    }
}

// Create singleton instance
const escalationSystem = new EscalationSystem();

// Export the main function for cron job
export const runEscalationProcess = () => escalationSystem.runEscalationProcess();

// Export the class for testing
export default EscalationSystem;

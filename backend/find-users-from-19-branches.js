import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';
import Branch from './model/Branch.js';
import User from './model/User.js';
import TrainingProgress from './model/Trainingprocessschema.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const findUsersFrom19Branches = async () => {
    try {
        await connectDB();
        
        console.log('=== FINDING USERS FROM ADMIN WITH 19 BRANCHES ===');
        
        // Find all admins and populate branches
        const allAdmins = await Admin.find({}).populate('branches');
        let targetAdmin = null;
        
        // Find the first admin with exactly 19 branches
        for (const admin of allAdmins) {
            if (admin.branches && admin.branches.length === 19) {
                targetAdmin = admin;
                break;
            }
        }
        
        if (!targetAdmin) {
            console.log('No admin found with exactly 19 branches');
            return;
        }
        
        console.log('\n1. Admin with 19 branches found:');
        console.log('Name:', targetAdmin.name);
        console.log('Role:', targetAdmin.role);
        console.log('Branches count:', targetAdmin.branches.length);
        
        // Show all 19 branches
        console.log('\n2. All 19 branches:');
        targetAdmin.branches.forEach((branch, index) => {
            console.log(`${index + 1}. ${branch.locCode} - ${branch.workingBranch} (${branch.location})`);
        });
        
        // Extract locCodes
        const allowedLocCodes = targetAdmin.branches.map(branch => branch.locCode);
        console.log('\n3. Allowed locCodes:', allowedLocCodes);
        
        // Find users in these branches
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        console.log('\n4. Users found in allowed branches:', users.length);
        
        if (users.length > 0) {
            console.log('\n5. Sample users:');
            users.slice(0, 10).forEach((user, index) => {
                console.log(`${index + 1}. ${user.username || 'No Name'} - ${user.locCode} - ${user.workingBranch || 'No Branch'}`);
            });
            
            if (users.length > 10) {
                console.log(`... and ${users.length - 10} more users`);
            }
        }
        
        // Check training progress for these users
        console.log('\n6. Checking training progress:');
        const userIds = users.map(user => user._id);
        const trainingProgressData = await TrainingProgress.find({ userId: { $in: userIds } });
        console.log('Total TrainingProgress records for these users:', trainingProgressData.length);
        
        if (trainingProgressData.length > 0) {
            console.log('\n7. Sample training progress records:');
            trainingProgressData.slice(0, 5).forEach((progress, index) => {
                const user = users.find(u => u._id.toString() === progress.userId.toString());
                console.log(`Record ${index + 1}:`);
                console.log('  User:', user ? user.username : 'Unknown');
                console.log('  Branch:', user ? user.locCode : 'Unknown');
                console.log('  Training Name:', progress.trainingName || 'Unknown');
                console.log('  Pass:', progress.pass);
                console.log('  Status:', progress.status);
                console.log('  Modules:', progress.modules ? progress.modules.length : 0);
                if (progress.modules && progress.modules.length > 0) {
                    const completedModules = progress.modules.filter(m => m.pass).length;
                    console.log('  Completed Modules:', `${completedModules}/${progress.modules.length}`);
                }
                console.log('');
            });
        }
        
        // Calculate completion percentages
        console.log('\n8. Training completion analysis:');
        const userTrainingStats = users.map(user => {
            const userTrainingProgress = trainingProgressData.filter(t => t.userId.toString() === user._id.toString());
            
            let totalTrainings = 0;
            let completedTrainings = 0;
            let totalModules = 0;
            let completedModules = 0;
            
            userTrainingProgress.forEach(training => {
                totalTrainings++;
                if (training.pass) completedTrainings++;
                
                if (training.modules && training.modules.length > 0) {
                    totalModules += training.modules.length;
                    completedModules += training.modules.filter(m => m.pass).length;
                }
            });
            
            const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
            const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
            
            return {
                username: user.username || 'No Name',
                branch: user.locCode,
                totalTrainings,
                completedTrainings,
                trainingProgress,
                totalModules,
                completedModules,
                moduleProgress
            };
        });
        
        // Sort by training progress
        const sortedUsers = userTrainingStats.sort((a, b) => b.trainingProgress - a.trainingProgress);
        
        console.log('\n9. Top 10 users by training completion:');
        sortedUsers.slice(0, 10).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.branch})`);
            console.log(`   Training: ${user.completedTrainings}/${user.totalTrainings} (${user.trainingProgress.toFixed(1)}%)`);
            if (user.totalModules > 0) {
                console.log(`   Modules: ${user.completedModules}/${user.totalModules} (${user.moduleProgress.toFixed(1)}%)`);
            }
            console.log('');
        });
        
        // Count users with different completion levels
        const usersWith100Percent = sortedUsers.filter(u => u.trainingProgress === 100);
        const usersWith50PlusPercent = sortedUsers.filter(u => u.trainingProgress >= 50);
        const usersWithSomeProgress = sortedUsers.filter(u => u.trainingProgress > 0);
        
        console.log('\n10. Completion statistics:');
        console.log('Users with 100% completion:', usersWith100Percent.length);
        console.log('Users with 50%+ completion:', usersWith50PlusPercent.length);
        console.log('Users with some progress (>0%):', usersWithSomeProgress.length);
        console.log('Users with no progress (0%):', sortedUsers.length - usersWithSomeProgress.length);
        
    } catch (error) {
        console.error('Error finding users from 19 branches:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

findUsersFrom19Branches();

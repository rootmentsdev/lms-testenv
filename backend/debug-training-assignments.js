// Script to debug training assignments across all users
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';
import TrainingProgress from './model/Trainingprocessschema.js';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

async function debugTrainingAssignments() {
    try {
        await connectMongoDB();
        
        console.log('\n=== TRAINING ASSIGNMENTS DEBUG ===\n');
        
        // Check all users and their training data
        const allUsers = await User.find({});
        console.log(`1. Total users in system: ${allUsers.length}`);
        
        // Count users with training assignments
        const usersWithTraining = allUsers.filter(user => user.training.length > 0);
        const usersWithAssessments = allUsers.filter(user => user.assignedAssessments.length > 0);
        const usersWithModules = allUsers.filter(user => user.assignedModules.length > 0);
        
        console.log(`   Users with training assignments: ${usersWithTraining.length}`);
        console.log(`   Users with assessment assignments: ${usersWithAssessments.length}`);
        console.log(`   Users with module assignments: ${usersWithModules.length}`);
        
        // Check users by branch
        const usersByBranch = {};
        allUsers.forEach(user => {
            if (!usersByBranch[user.workingBranch]) {
                usersByBranch[user.workingBranch] = [];
            }
            usersByBranch[user.workingBranch].push({
                username: user.username,
                locCode: user.locCode,
                trainingCount: user.training.length,
                assessmentCount: user.assignedAssessments.length,
                moduleCount: user.assignedModules.length
            });
        });
        
        console.log('\n2. Users by branch:');
        Object.keys(usersByBranch).forEach(branch => {
            const branchUsers = usersByBranch[branch];
            const usersWithData = branchUsers.filter(u => u.trainingCount > 0 || u.assessmentCount > 0 || u.moduleCount > 0);
            console.log(`   ${branch}: ${branchUsers.length} users (${usersWithData.length} with assignments)`);
            
            if (usersWithData.length > 0) {
                usersWithData.forEach(user => {
                    console.log(`     - ${user.username} (${user.locCode}): T:${user.trainingCount}, A:${user.assessmentCount}, M:${user.moduleCount}`);
                });
            }
        });
        
        // Check TrainingProgress collection
        const allTrainingProgress = await TrainingProgress.find({});
        console.log(`\n3. Training progress records: ${allTrainingProgress.length}`);
        
        if (allTrainingProgress.length > 0) {
            // Group by user
            const progressByUser = {};
            allTrainingProgress.forEach(progress => {
                if (!progressByUser[progress.userId]) {
                    progressByUser[progress.userId] = [];
                }
                progressByUser[progress.userId].push(progress);
            });
            
            console.log(`   Users with training progress: ${Object.keys(progressByUser).length}`);
            
            // Check if these users exist in User collection
            const progressUserIds = Object.keys(progressByUser);
            const progressUsers = await User.find({ _id: { $in: progressUserIds } });
            console.log(`   Progress users found in User collection: ${progressUsers.length}`);
            
            if (progressUsers.length > 0) {
                console.log('   Sample progress users:');
                progressUsers.slice(0, 3).forEach(user => {
                    const userProgress = progressByUser[user._id];
                    console.log(`     - ${user.username} (${user.workingBranch}): ${userProgress.length} training records`);
                    userProgress.forEach((progress, index) => {
                        const completedModules = progress.modules.filter(m => m.pass).length;
                        const totalModules = progress.modules.length;
                        console.log(`       ${index + 1}. Training: ${progress.trainingName}, Pass: ${progress.pass}, Modules: ${completedModules}/${totalModules}`);
                    });
                });
            }
        }
        
        // Check specific admin access
        console.log('\n4. Admin access check:');
        const admins = await Admin.find({}).populate('branches');
        admins.forEach(admin => {
            const branchCount = admin.branches.length;
            const locCodes = admin.branches.map(b => b.locCode);
            const adminUsers = allUsers.filter(user => locCodes.includes(user.locCode));
            const adminUsersWithData = adminUsers.filter(user => 
                user.training.length > 0 || user.assignedAssessments.length > 0 || user.assignedModules.length > 0
            );
            
            console.log(`   ${admin.name} (${admin.role}): ${branchCount} branches, ${adminUsers.length} users, ${adminUsersWithData.length} with assignments`);
            console.log(`     Branches: ${locCodes.join(', ')}`);
        });
        
        console.log('\n=== END OF DEBUG ===\n');
        
    } catch (error) {
        console.error('Error debugging training assignments:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

debugTrainingAssignments();

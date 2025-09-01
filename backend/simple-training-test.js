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

const testTrainingCalculation = async () => {
    try {
        await connectDB();
        
        console.log('=== SIMPLE TRAINING CALCULATION TEST ===');
        
        // Find the admin with 20 branches (javad) without populate first
        const admin = await Admin.findOne({ name: 'javad' });
        
        if (!admin) {
            console.log('Admin javad not found!');
            return;
        }
        
        console.log(`Testing with admin: ${admin.name} (${admin._id})`);
        console.log(`Admin role: ${admin.role}`);
        console.log(`Admin branches array length: ${admin.branches?.length || 0}`);
        
        // Get branch IDs from admin
        const branchIds = admin.branches || [];
        console.log(`Admin has ${branchIds.length} branch IDs:`, branchIds);
        
        // Find branches by ID to get locCodes
        const branches = await Branch.find({ _id: { $in: branchIds } });
        console.log(`Found ${branches.length} branches with details`);
        
        // Extract locCodes from branches
        const allowedLocCodes = branches.map(branch => branch.locCode);
        console.log(`Allowed locCodes:`, allowedLocCodes);
        
        // Find users in allowed branches
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        console.log(`Found ${users.length} local users in allowed branches`);
        
        // Find training progress for these users
        const userIds = users.map(user => user._id);
        const trainingProgressData = await TrainingProgress.find({ userId: { $in: userIds } });
        
        console.log(`\nTotal TrainingProgress records in database: ${trainingProgressData.length}`);
        
        // Show sample training progress records
        console.log('\n=== SAMPLE TRAINING PROGRESS RECORDS ===');
        trainingProgressData.slice(0, 5).forEach((progress, index) => {
            const user = users.find(u => u._id.toString() === progress.userId.toString());
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  User: ${user ? user.username : 'Unknown'}`);
            console.log(`  Branch: ${user ? user.locCode : 'Unknown'}`);
            console.log(`  Training Name: ${progress.trainingName || 'Unknown'}`);
            console.log(`  Pass: ${progress.pass}`);
            console.log(`  Status: ${progress.status}`);
            console.log(`  Modules: ${progress.modules ? progress.modules.length : 0}`);
            if (progress.modules && progress.modules.length > 0) {
                const completedModules = progress.modules.filter(m => m.pass).length;
                console.log(`  Completed Modules: ${completedModules}/${progress.modules.length}`);
            }
        });
        
        // Calculate training completion for each user
        console.log('\n=== CHECKING FOR USERS WITH HIGH COMPLETION ===');
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
        
        console.log(`Users with training records: ${userTrainingStats.filter(u => u.totalTrainings > 0).length}`);
        
        // Sort by training progress
        const sortedUsers = userTrainingStats.sort((a, b) => b.trainingProgress - a.trainingProgress);
        
        console.log('\n=== TOP 10 USERS BY TRAINING COMPLETION ===');
        sortedUsers.slice(0, 10).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.branch})`);
            console.log(`   Completion: ${user.completedTrainings}/${user.totalTrainings} (${user.trainingProgress.toFixed(1)}%)`);
            if (user.totalModules > 0) {
                console.log(`   Modules: ${user.completedModules}/${user.totalModules} (${user.moduleProgress.toFixed(1)}%)`);
            }
        });
        
        const usersWith100Percent = sortedUsers.filter(u => u.trainingProgress === 100);
        console.log(`\nUsers with 100% completion: ${usersWith100Percent.length}`);
        
        // Test the actual calculation logic from getTopUsers
        console.log('\n=== TESTING ACTUAL CALCULATION LOGIC ===');
        
        // Calculate scores similar to getTopUsers function
        const scores = users.map((user) => {
            const userTrainingProgress = trainingProgressData.filter(t => t.userId.toString() === user._id.toString());
            
            let completedTrainings = 0;
            let totalTrainings = 0;
            let trainingProgress = 0;
            
            if (userTrainingProgress.length > 0) {
                totalTrainings = userTrainingProgress.length;
                completedTrainings = userTrainingProgress.filter(t => t.pass).length;
                trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
            }
            
            // Assessment progress (simplified for this test)
            const assessmentProgress = 0;
            
            // Module progress
            let completedModules = 0;
            let totalModules = 0;
            let moduleProgress = 0;
            
            if (userTrainingProgress.length > 0) {
                userTrainingProgress.forEach(training => {
                    if (training.modules && training.modules.length > 0) {
                        totalModules += training.modules.length;
                        completedModules += training.modules.filter(m => m.pass).length;
                    }
                });
                moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
            }
            
            // Total score based on training, assessments, and modules
            const totalScore = (trainingProgress * 0.6) + (assessmentProgress * 0.3) + (moduleProgress * 0.1);
            
            return {
                username: user.username || 'No Name',
                branch: user.locCode,
                completedTrainings,
                totalTrainings,
                trainingProgress,
                completedModules,
                totalModules,
                moduleProgress,
                totalScore
            };
        });
        
        // Sort by total score
        const sortedScores = scores.sort((a, b) => b.totalScore - a.totalScore);
        
        console.log('\n=== TOP 5 USERS BY CALCULATED SCORE ===');
        sortedScores.slice(0, 5).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.branch})`);
            console.log(`   Training Progress: ${user.trainingProgress.toFixed(1)}%`);
            console.log(`   Completed: ${user.completedTrainings}/${user.totalTrainings}`);
            console.log(`   Score: ${user.totalScore.toFixed(2)}`);
            if (user.totalModules > 0) {
                console.log(`   Modules: ${user.completedModules}/${user.totalModules} (${user.moduleProgress.toFixed(1)}%)`);
            }
            console.log('');
        });
        
        // Show users with actual training progress
        const usersWithProgress = sortedScores.filter(u => u.trainingProgress > 0);
        console.log(`\nUsers with actual training progress (>0%): ${usersWithProgress.length}`);
        
        if (usersWithProgress.length > 0) {
            console.log('\n=== USERS WITH TRAINING PROGRESS ===');
            usersWithProgress.forEach((user, index) => {
                console.log(`${index + 1}. ${user.username} (${user.branch})`);
                console.log(`   Training: ${user.completedTrainings}/${user.totalTrainings} (${user.trainingProgress.toFixed(1)}%)`);
                console.log(`   Score: ${user.totalScore.toFixed(2)}`);
            });
        }
        
    } catch (error) {
        console.error('Error testing training calculation:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

testTrainingCalculation();

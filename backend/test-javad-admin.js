import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';
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

const testJavadAdmin = async () => {
    try {
        await connectDB();
        
        console.log('=== TESTING JAVAD ADMIN (YOUR CURRENT ADMIN) ===');
        
        // Test with your current admin ID
        const adminId = '6825c098da59fba58e6e0132'; // javad admin
        console.log(`Testing with admin ID: ${adminId}`);
        
        // Get admin details
        const admin = await Admin.findById(adminId);
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`✅ Admin found: ${admin.name} (${admin.role})`);
        console.log(`   Branches: ${admin.branches?.length || 0}`);
        
        if (!admin.branches || admin.branches.length === 0) {
            console.log('❌ Admin has no branches!');
            return;
        }
        
        // Get branch details
        const Branch = mongoose.model('Branch');
        const branches = await Branch.find({ _id: { $in: admin.branches } });
        const locCodes = branches.map(b => b.locCode);
        
        console.log(`   Branch locCodes: ${locCodes.join(', ')}`);
        
        // Find users in these branches
        const users = await User.find({ locCode: { $in: locCodes } });
        console.log(`\nTotal users found: ${users.length}`);
        
        // Find RANOOP R specifically
        const ranoop = users.find(u => u.username === 'RANOOP R');
        if (ranoop) {
            console.log(`✅ RANOOP R found in branch: ${ranoop.locCode} (${ranoop.workingBranch})`);
        } else {
            console.log('❌ RANOOP R NOT FOUND in your admin branches!');
            console.log('Available users:');
            users.slice(0, 10).forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.username} (${user.locCode})`);
            });
            return;
        }
        
        // Check RANOOP R's training progress
        console.log('\n=== RANOOP R TRAINING PROGRESS ===');
        const ranoopTraining = await TrainingProgress.find({ userId: ranoop._id });
        console.log(`Training records: ${ranoopTraining.length}`);
        
        if (ranoopTraining.length > 0) {
            ranoopTraining.forEach((training, index) => {
                console.log(`Training ${index + 1}: ${training.trainingName}`);
                console.log(`  Pass: ${training.pass}`);
                console.log(`  Status: ${training.status}`);
                if (training.modules && training.modules.length > 0) {
                    const completedModules = training.modules.filter(m => m.pass).length;
                    console.log(`  Modules: ${completedModules}/${training.modules.length} completed`);
                }
            });
            
            // Calculate completion percentage
            const completed = ranoopTraining.filter(t => t.pass).length;
            const total = ranoopTraining.length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            console.log(`\nOverall completion: ${completed}/${total} (${percentage.toFixed(1)}%)`);
        }
        
        // Now check ALL users' training progress to see who should be in top performers
        console.log('\n=== ALL USERS TRAINING PROGRESS ===');
        const userTrainingStats = [];
        
        for (const user of users) {
            const userTraining = await TrainingProgress.find({ userId: user._id });
            if (userTraining.length > 0) {
                const completed = userTraining.filter(t => t.pass).length;
                const total = userTraining.length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;
                
                userTrainingStats.push({
                    username: user.username,
                    branch: user.locCode,
                    totalTrainings: total,
                    completedTrainings: completed,
                    percentage: percentage
                });
            }
        }
        
        // Sort by percentage (highest first)
        userTrainingStats.sort((a, b) => b.percentage - a.percentage);
        
        console.log(`Users with training records: ${userTrainingStats.length}`);
        console.log('\n=== TOP 10 PERFORMERS ===');
        userTrainingStats.slice(0, 10).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.branch}): ${user.completedTrainings}/${user.totalTrainings} (${user.percentage.toFixed(1)}%)`);
        });
        
        // Check RANOOP R's position
        const ranoopPosition = userTrainingStats.findIndex(u => u.username === 'RANOOP R') + 1;
        if (ranoopPosition > 0) {
            console.log(`\n✅ RANOOP R is at position ${ranoopPosition} in top performers`);
        } else {
            console.log('\n❌ RANOOP R is NOT in the top performers list!');
        }
        
        // Check what the frontend API should return
        console.log('\n=== WHAT FRONTEND API SHOULD RETURN ===');
        console.log('Your frontend should show:');
        console.log(`1. Total users: ${users.length}`);
        console.log(`2. Total branches: ${branches.length}`);
        console.log(`3. Top performers: ${userTrainingStats.slice(0, 3).map(u => u.username).join(', ')}`);
        
        if (ranoopPosition <= 3) {
            console.log(`4. RANOOP R should be in top 3 (position ${ranoopPosition})`);
        } else {
            console.log(`4. RANOOP R is at position ${ranoopPosition} (not in top 3)`);
        }
        
    } catch (error) {
        console.error('Error testing javad admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

testJavadAdmin();

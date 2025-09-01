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

const checkCurrentAdminData = async () => {
    try {
        await connectDB();
        
        console.log('=== CHECKING CURRENT ADMIN DATA ===');
        
        // First, let's see ALL admins and their branch access
        console.log('\n1. ALL ADMINS IN SYSTEM:');
        const allAdmins = await Admin.find({});
        
        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.name} (${admin.role}) - ${admin.branches?.length || 0} branches`);
        });
        
        // Now let's specifically check the javad admin (who we know has 19 branches)
        console.log('\n2. CHECKING JAVAD ADMIN (who should have 19 branches):');
        const javadAdmin = await Admin.findOne({ name: 'javad' });
        
        if (javadAdmin) {
            console.log(`✅ Found javad admin: ${javadAdmin.name} (${javadAdmin._id})`);
            console.log(`   Role: ${javadAdmin.role}`);
            console.log(`   Branches: ${javadAdmin.branches?.length || 0}`);
            
            if (javadAdmin.branches && javadAdmin.branches.length > 0) {
                console.log(`   Branch IDs: ${javadAdmin.branches.slice(0, 10).join(', ')}${javadAdmin.branches.length > 10 ? '...' : ''}`);
                
                // Get branch details without populate
                const Branch = mongoose.model('Branch');
                const branches = await Branch.find({ _id: { $in: javadAdmin.branches } });
                const locCodes = branches.map(b => b.locCode);
                console.log(`   Branch locCodes: ${locCodes.join(', ')}`);
                
                // Find users in these branches
                const users = await User.find({ locCode: { $in: locCodes } });
                console.log(`   Users found: ${users.length}`);
                
                // Find RANOOP R specifically
                const ranoop = users.find(u => u.username === 'RANOOP R');
                if (ranoop) {
                    console.log(`   ✅ RANOOP R found in branch: ${ranoop.locCode} (${ranoop.workingBranch})`);
                } else {
                    console.log(`   ❌ RANOOP R NOT FOUND in javad admin's branches`);
                }
                
                // Check training progress for RANOOP R
                if (ranoop) {
                    const ranoopTraining = await TrainingProgress.find({ userId: ranoop._id });
                    console.log(`   RANOOP R training records: ${ranoopTraining.length}`);
                    
                    if (ranoopTraining.length > 0) {
                        ranoopTraining.forEach((training, index) => {
                            console.log(`     Training ${index + 1}: ${training.trainingName} - Pass: ${training.pass} - Status: ${training.status}`);
                        });
                    }
                }
            }
        } else {
            console.log('❌ javad admin not found!');
        }
        
        // Let's also check what users are in the branches that are currently showing in your frontend
        console.log('\n3. CHECKING BRANCHES THAT MIGHT BE SHOWING IN FRONTEND:');
        
        // Check some common branch locCodes that might be showing
        const commonBranches = ['1', '3', '5', '9', '10', '11', '12', '15', '14', '16', '18', '17', '13', '19', '20', '21'];
        
        for (const locCode of commonBranches) {
            const usersInBranch = await User.find({ locCode });
            if (usersInBranch.length > 0) {
                console.log(`Branch ${locCode}: ${usersInBranch.length} users`);
                
                // Check if any of these users have training progress
                for (const user of usersInBranch.slice(0, 3)) { // Check first 3 users
                    const userTraining = await TrainingProgress.find({ userId: user._id });
                    if (userTraining.length > 0) {
                        const completed = userTraining.filter(t => t.pass).length;
                        const total = userTraining.length;
                        const percentage = total > 0 ? (completed / total) * 100 : 0;
                        console.log(`  - ${user.username}: ${completed}/${total} trainings completed (${percentage.toFixed(1)}%)`);
                    } else {
                        console.log(`  - ${user.username}: No training records`);
                    }
                }
            }
        }
        
        // Now let's find which admin might be currently logged in (check for store_admin or cluster_admin)
        console.log('\n4. CHECKING FOR STORE/CLUSTER ADMINS:');
        const storeAdmins = await Admin.find({ role: 'store_admin' });
        const clusterAdmins = await Admin.find({ role: 'cluster_admin' });
        
        console.log(`Store admins: ${storeAdmins.length}`);
        storeAdmins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.name} - ${admin.branches?.length || 0} branches`);
        });
        
        console.log(`Cluster admins: ${clusterAdmins.length}`);
        clusterAdmins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.name} - ${admin.branches?.length || 0} branches`);
        });
        
        // Finally, let's check if there are any users with actual training progress
        console.log('\n5. USERS WITH ACTUAL TRAINING PROGRESS:');
        const allTrainingProgress = await TrainingProgress.find();
        const usersWithProgress = [...new Set(allTrainingProgress.map(t => t.userId.toString()))];
        
        console.log(`Total users with training records: ${usersWithProgress.length}`);
        
        for (const userId of usersWithProgress.slice(0, 10)) { // Check first 10
            const user = await User.findById(userId);
            if (user) {
                const userTraining = allTrainingProgress.filter(t => t.userId.toString() === userId);
                const completed = userTraining.filter(t => t.pass).length;
                const total = userTraining.length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;
                
                console.log(`  - ${user.username} (${user.locCode}): ${completed}/${total} trainings completed (${percentage.toFixed(1)}%)`);
            }
        }
        
    } catch (error) {
        console.error('Error checking admin data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

checkCurrentAdminData();

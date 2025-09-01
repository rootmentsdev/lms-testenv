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

const fixAdminIssue = async () => {
    try {
        await connectDB();
        
        console.log('=== FIXING ADMIN ISSUE - FINDING RANOOP R ===');
        
        // First, let's find RANOOP R and see which branch he's in
        console.log('\n1. FINDING RANOOP R:');
        const ranoop = await User.findOne({ username: 'RANOOP R' });
        
        if (ranoop) {
            console.log(`✅ Found RANOOP R in branch: ${ranoop.locCode} (${ranoop.workingBranch})`);
            
            // Check RANOOP R's training progress
            const ranoopTraining = await TrainingProgress.find({ userId: ranoop._id });
            console.log(`   Training records: ${ranoopTraining.length}`);
            
            if (ranoopTraining.length > 0) {
                const completed = ranoopTraining.filter(t => t.pass).length;
                const total = ranoopTraining.length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;
                console.log(`   Completion: ${completed}/${total} (${percentage.toFixed(1)}%)`);
            }
        } else {
            console.log('❌ RANOOP R not found!');
            return;
        }
        
        // Now let's find which admin has access to RANOOP R's branch
        console.log('\n2. FINDING ADMIN WITH ACCESS TO RANOOP R:');
        const ranoopBranch = ranoop.locCode;
        
        const allAdmins = await Admin.find({});
        let adminWithAccess = null;
        
        for (const admin of allAdmins) {
            if (admin.branches && admin.branches.length > 0) {
                // Get branch details for this admin
                const Branch = mongoose.model('Branch');
                const branches = await Branch.find({ _id: { $in: admin.branches } });
                const locCodes = branches.map(b => b.locCode);
                
                if (locCodes.includes(ranoopBranch)) {
                    adminWithAccess = admin;
                    console.log(`✅ Admin ${admin.name} (${admin.role}) has access to RANOOP R's branch ${ranoopBranch}`);
                    console.log(`   Total branches: ${admin.branches.length}`);
                    console.log(`   Branch locCodes: ${locCodes.join(', ')}`);
                    break;
                }
            }
        }
        
        if (!adminWithAccess) {
            console.log('❌ No admin found with access to RANOOP R!');
            return;
        }
        
        // Now let's check what users this admin can see
        console.log('\n3. USERS THIS ADMIN CAN SEE:');
        const Branch = mongoose.model('Branch');
        const adminBranches = await Branch.find({ _id: { $in: adminWithAccess.branches } });
        const adminLocCodes = adminBranches.map(b => b.locCode);
        
        const users = await User.find({ locCode: { $in: adminLocCodes } });
        console.log(`Total users: ${users.length}`);
        
        // Check training progress for these users
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
        
        console.log('\n4. TOP PERFORMERS FOR THIS ADMIN:');
        userTrainingStats.slice(0, 10).forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.branch}): ${user.completedTrainings}/${user.totalTrainings} (${user.percentage.toFixed(1)}%)`);
        });
        
        // Check if RANOOP R is in the top performers
        const ranoopInTop = userTrainingStats.find(u => u.username === 'RANOOP R');
        if (ranoopInTop) {
            console.log(`\n✅ RANOOP R is in the top performers for admin ${adminWithAccess.name}`);
            console.log(`   Position: ${userTrainingStats.findIndex(u => u.username === 'RANOOP R') + 1}`);
        } else {
            console.log(`\n❌ RANOOP R is NOT in the top performers for admin ${adminWithAccess.name}`);
        }
        
        // Now let's check what might be showing in your frontend
        console.log('\n5. WHAT MIGHT BE SHOWING IN YOUR FRONTEND:');
        console.log('If you\'re logged in as a different admin, you might see:');
        
        // Check store admins (who might be currently logged in)
        const storeAdmins = allAdmins.filter(a => a.role === 'store_admin');
        storeAdmins.forEach((admin, index) => {
            console.log(`\nStore Admin ${index + 1}: ${admin.name}`);
            console.log(`   Branches: ${admin.branches?.length || 0}`);
            
            if (admin.branches && admin.branches.length > 0) {
                // Get branch details
                Branch.find({ _id: { $in: admin.branches } }).then(branches => {
                    const locCodes = branches.map(b => b.locCode);
                    console.log(`   Branch locCodes: ${locCodes.join(', ')}`);
                    
                    // Find users in these branches
                    User.find({ locCode: { $in: locCodes } }).then(users => {
                        console.log(`   Users found: ${users.length}`);
                        
                        // Check first few users
                        users.slice(0, 5).forEach(user => {
                            console.log(`     - ${user.username} (${user.locCode})`);
                        });
                    });
                });
            }
        });
        
        console.log('\n6. SOLUTION:');
        console.log(`To see RANOOP R and all 19+ branches, you need to log in as admin: ${adminWithAccess.name}`);
        console.log(`Admin ID: ${adminWithAccess._id}`);
        console.log(`Role: ${adminWithAccess.role}`);
        
        if (adminWithAccess.role === 'super_admin') {
            console.log('✅ This is a super_admin who can see all branches and users');
        } else {
            console.log('⚠️  This admin has limited access');
        }
        
    } catch (error) {
        console.error('Error fixing admin issue:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

fixAdminIssue();

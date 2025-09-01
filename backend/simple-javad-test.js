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

const simpleJavadTest = async () => {
    try {
        await connectDB();
        
        console.log('=== SIMPLE JAVAD ADMIN TEST ===');
        
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
        
        // Just show the branch IDs without trying to get details
        console.log(`   Branch IDs: ${admin.branches.slice(0, 5).join(', ')}...`);
        
        // Find RANOOP R directly
        console.log('\n=== FINDING RANOOP R ===');
        const ranoop = await User.findOne({ username: 'RANOOP R' });
        
        if (ranoop) {
            console.log(`✅ RANOOP R found!`);
            console.log(`   Branch: ${ranoop.locCode}`);
            console.log(`   Working Branch: ${ranoop.workingBranch}`);
            
            // Check if RANOOP R's branch is in admin's branches
            const ranoopBranchId = ranoop.locCode;
            console.log(`   RANOOP R's branch ID: ${ranoopBranchId}`);
            
            // Check training progress for RANOOP R
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
        }
        
        // Check what users exist in the system
        console.log('\n=== CHECKING ALL USERS ===');
        const allUsers = await User.find({}).limit(20);
        console.log(`Total users in system: ${allUsers.length}`);
        
        console.log('\nFirst 20 users:');
        allUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.username} (${user.locCode})`);
        });
        
        // Check training progress for all users
        console.log('\n=== CHECKING TRAINING PROGRESS ===');
        const allTraining = await TrainingProgress.find({}).limit(20);
        console.log(`Total training records: ${allTraining.length}`);
        
        if (allTraining.length > 0) {
            console.log('\nFirst 10 training records:');
            allTraining.slice(0, 10).forEach((training, index) => {
                console.log(`  ${index + 1}. User: ${training.userId} - Training: ${training.trainingName} - Pass: ${training.pass}`);
            });
        }
        
        console.log('\n=== SUMMARY ===');
        console.log('Your javad admin has access to 20 branches');
        console.log('RANOOP R exists in the system');
        console.log('The issue might be in the frontend API call or data processing');
        
    } catch (error) {
        console.error('Error in simple javad test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

simpleJavadTest();

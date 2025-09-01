// Increase training percentage to 50% to test frontend data fetching
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';
import Admin from './model/Admin.js';
import User from './model/User.js';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

async function increaseTrainingPercentageHigher() {
    try {
        await connectMongoDB();
        
        console.log('\n🚀 INCREASING TRAINING PERCENTAGE TO 50%\n');
        console.log('========================================\n');
        
        // Get admin and populate their branches
        const adminId = '67bc02e686396dca5cd6b064';
        const admin = await Admin.findById(adminId).populate('branches');
        
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`👤 Admin: ${admin.name}`);
        
        // Get users in admin's allowed branches
        const allowedLocCodes = admin.branches
            .filter(branch => branch.locCode)
            .map(branch => branch.locCode);
        
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        const userIDs = users.map(user => user._id);
        
        console.log(`👥 Users in admin's branches: ${users.length}`);
        console.log(`📍 Allowed location codes: [${allowedLocCodes.join(', ')}]`);
        
        // Get training progress records that admin can see
        const adminTrainings = await TrainingProgress.find({ userId: { $in: userIDs } });
        
        console.log(`📚 Training records admin can see: ${adminTrainings.length}`);
        
        // Calculate current completion rate
        let totalModules = 0;
        let completedModules = 0;
        
        adminTrainings.forEach(progress => {
            if (progress.modules && Array.isArray(progress.modules)) {
                progress.modules.forEach(module => {
                    totalModules++;
                    if (module.pass) completedModules++;
                });
            }
        });
        
        const currentPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        
        console.log('\n📊 CURRENT STATUS:');
        console.log('==================');
        console.log(`Total modules: ${totalModules}`);
        console.log(`Completed modules: ${completedModules}`);
        console.log(`Current completion rate: ${currentPercentage.toFixed(2)}%`);
        
        // Target: Increase to 50%
        const targetPercentage = 50;
        const targetCompleted = Math.ceil((totalModules * targetPercentage) / 100);
        const needToComplete = targetCompleted - completedModules;
        
        console.log(`\n🎯 TARGET: ${targetPercentage}%`);
        console.log(`Target completed modules: ${targetCompleted}`);
        console.log(`Need to complete: ${needToComplete} more modules`);
        
        if (needToComplete <= 0) {
            console.log('✅ Already reached target percentage!');
            return;
        }
        
        // Update training records to reach target
        console.log('\n🔄 COMPLETING MORE TRAININGS...');
        
        let updatedCount = 0;
        let modulesUpdated = 0;
        
        for (const training of adminTrainings) {
            if (modulesUpdated >= needToComplete) break;
            
            if (training.modules && Array.isArray(training.modules)) {
                for (const module of training.modules) {
                    if (modulesUpdated >= needToComplete) break;
                    
                    if (!module.pass && module.videos && Array.isArray(module.videos)) {
                        // Mark module as completed
                        module.pass = true;
                        
                        // Mark all videos as completed
                        module.videos.forEach(video => {
                            video.pass = true;
                        });
                        
                        modulesUpdated++;
                        updatedCount++;
                        
                        if (updatedCount <= 20) { // Show first 20 updates
                            console.log(`   ✅ Updated: ${training.trainingName || 'N/A'} - Module ${module.moduleName || 'N/A'}`);
                        } else if (updatedCount === 21) {
                            console.log(`   ... and ${needToComplete - 20} more modules`);
                        }
                    }
                }
                
                // Save the updated training record
                if (updatedCount > 0) {
                    await training.save();
                }
            }
        }
        
        console.log(`\n📈 UPDATE SUMMARY:`);
        console.log(`===================`);
        console.log(`Training records updated: ${updatedCount}`);
        console.log(`Modules marked as completed: ${modulesUpdated}`);
        
        // Verify the new percentage
        const updatedAdminTrainings = await TrainingProgress.find({ userId: { $in: userIDs } });
        
        let newTotalModules = 0;
        let newCompletedModules = 0;
        
        updatedAdminTrainings.forEach(progress => {
            if (progress.modules && Array.isArray(progress.modules)) {
                progress.modules.forEach(module => {
                    newTotalModules++;
                    if (module.pass) newCompletedModules++;
                });
            }
        });
        
        const newPercentage = newTotalModules > 0 ? (newCompletedModules / newTotalModules) * 100 : 0;
        
        console.log(`\n🎉 NEW STATUS:`);
        console.log(`===============`);
        console.log(`Total modules: ${newTotalModules}`);
        console.log(`Completed modules: ${newCompletedModules}`);
        console.log(`New completion rate: ${newPercentage.toFixed(2)}%`);
        console.log(`Dashboard should now show: ${Math.round(newPercentage)}%`);
        
        if (newPercentage >= targetPercentage) {
            console.log(`\n✅ SUCCESS! Reached target of ${targetPercentage}%`);
            console.log(`   Old: ${currentPercentage.toFixed(2)}%`);
            console.log(`   New: ${newPercentage.toFixed(2)}%`);
            console.log(`   Improvement: +${(newPercentage - currentPercentage).toFixed(2)} percentage points`);
            
            console.log(`\n🎯 NEXT STEPS:`);
            console.log(`===============`);
            console.log(`1. Refresh your dashboard (Ctrl + F5)`);
            console.log(`2. Check if "Training progress" shows ${Math.round(newPercentage)}%`);
            console.log(`3. If still showing old percentage, restart backend server`);
        } else {
            console.log(`\n⚠️  Close but not quite there. Current: ${newPercentage.toFixed(2)}%`);
        }
        
    } catch (error) {
        console.error('❌ Error increasing training percentage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

increaseTrainingPercentageHigher();

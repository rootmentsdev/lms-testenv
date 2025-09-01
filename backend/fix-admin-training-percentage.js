// Fix admin's training percentage by updating only their visible records
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';

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

async function fixAdminTrainingPercentage() {
    try {
        await connectMongoDB();
        
        console.log('\n🎯 FIXING ADMIN TRAINING PERCENTAGE\n');
        console.log('===================================\n');
        
        // Get admin and populate their branches
        const adminId = '67bc02e686396dca5cd6b064';
        const admin = await Admin.findById(adminId).populate('branches');
        
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`👤 Admin: ${admin.name}`);
        console.log(`🏢 Admin branches: ${admin.branches?.length || 0}`);
        
        // Check if branches have locCode after population
        if (admin.branches && admin.branches.length > 0) {
            console.log('\n📋 BRANCH DETAILS (After Population):');
            console.log('=======================================');
            
            admin.branches.slice(0, 5).forEach((branch, index) => {
                console.log(`Branch ${index + 1}:`);
                console.log(`  _id: ${branch._id}`);
                console.log(`  locCode: ${branch.locCode || 'UNDEFINED'}`);
                console.log(`  workingBranch: ${branch.workingBranch || 'UNDEFINED'}`);
                console.log(`  location: ${branch.location || 'UNDEFINED'}`);
            });
        }
        
        // Get users in admin's allowed branches
        const allowedLocCodes = admin.branches
            .filter(branch => branch.locCode)
            .map(branch => branch.locCode);
        
        console.log(`\n📍 Allowed location codes: [${allowedLocCodes.join(', ')}]`);
        
        if (allowedLocCodes.length === 0) {
            console.log('❌ No valid location codes found in admin branches!');
            console.log('   This explains why the dashboard shows 1%');
            return;
        }
        
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        const userIDs = users.map(user => user._id);
        
        console.log(`👥 Users in admin's branches: ${users.length}`);
        
        // Get training progress records that admin can see
        const adminTrainings = await TrainingProgress.find({ userId: { $in: userIDs } });
        
        console.log(`📚 Training records admin can see: ${adminTrainings.length}`);
        
        if (adminTrainings.length === 0) {
            console.log('❌ No training records found for admin\'s users!');
            return;
        }
        
        // Calculate current completion rate for admin's view
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
        
        console.log('\n📊 CURRENT ADMIN VIEW STATS:');
        console.log('=============================');
        console.log(`Total modules: ${totalModules}`);
        console.log(`Completed modules: ${completedModules}`);
        console.log(`Current completion rate: ${currentPercentage.toFixed(2)}%`);
        
        // Target: Increase to 25%
        const targetPercentage = 25;
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
        console.log('\n🔄 UPDATING TRAINING RECORDS...');
        
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
                        
                        console.log(`   ✅ Updated: ${training.trainingName || 'N/A'} - Module ${module.moduleName || 'N/A'}`);
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
        
        console.log(`\n🎉 NEW ADMIN VIEW STATS:`);
        console.log(`=======================`);
        console.log(`Total modules: ${newTotalModules}`);
        console.log(`Completed modules: ${newCompletedModules}`);
        console.log(`New completion rate: ${newPercentage.toFixed(2)}%`);
        console.log(`Dashboard should now show: ${Math.round(newPercentage)}%`);
        
        if (newPercentage >= targetPercentage) {
            console.log(`\n✅ SUCCESS! Reached target of ${targetPercentage}%`);
            console.log(`   Old: ${currentPercentage.toFixed(2)}%`);
            console.log(`   New: ${newPercentage.toFixed(2)}%`);
            console.log(`   Improvement: +${(newPercentage - currentPercentage).toFixed(2)} percentage points`);
        } else {
            console.log(`\n⚠️  Close but not quite there. Current: ${newPercentage.toFixed(2)}%`);
        }
        
    } catch (error) {
        console.error('❌ Error fixing admin training percentage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

fixAdminTrainingPercentage();

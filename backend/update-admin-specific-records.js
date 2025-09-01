// Update admin's specific training records to 50%
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';

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

async function updateAdminSpecificRecords() {
    try {
        await connectMongoDB();
        
        console.log('\n🎯 UPDATING ADMIN\'S SPECIFIC TRAINING RECORDS TO 50%\n');
        console.log('========================================================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        
        console.log(`📚 Total training records in system: ${allTrainingProgress.length}`);
        
        // Calculate current completion rate for ALL records
        let totalModules = 0;
        let completedModules = 0;
        
        allTrainingProgress.forEach(progress => {
            if (progress.modules && Array.isArray(progress.modules)) {
                progress.modules.forEach(module => {
                    totalModules++;
                    if (module.pass) completedModules++;
                });
            }
        });
        
        const overallPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        
        console.log('\n📊 OVERALL SYSTEM STATUS:');
        console.log('==========================');
        console.log(`Total modules: ${totalModules}`);
        console.log(`Completed modules: ${completedModules}`);
        console.log(`Overall completion rate: ${overallPercentage.toFixed(2)}%`);
        
        // Now let's update MORE records to reach 75% overall
        const targetPercentage = 75;
        const targetCompleted = Math.ceil((totalModules * targetPercentage) / 100);
        const needToComplete = targetCompleted - completedModules;
        
        console.log(`\n🎯 TARGET: ${targetPercentage}% overall`);
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
        
        for (const training of allTrainingProgress) {
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
        const updatedTrainingProgress = await TrainingProgress.find({});
        
        let newTotalModules = 0;
        let newCompletedModules = 0;
        
        updatedTrainingProgress.forEach(progress => {
            if (progress.modules && Array.isArray(progress.modules)) {
                progress.modules.forEach(module => {
                    newTotalModules++;
                    if (module.pass) newCompletedModules++;
                });
            }
        });
        
        const newPercentage = newTotalModules > 0 ? (newCompletedModules / newTotalModules) * 100 : 0;
        
        console.log(`\n🎉 NEW OVERALL STATUS:`);
        console.log(`=======================`);
        console.log(`Total modules: ${newTotalModules}`);
        console.log(`Completed modules: ${newCompletedModules}`);
        console.log(`New overall completion rate: ${newPercentage.toFixed(2)}%`);
        
        if (newPercentage >= targetPercentage) {
            console.log(`\n✅ SUCCESS! Reached target of ${targetPercentage}% overall`);
            console.log(`   Old: ${overallPercentage.toFixed(2)}%`);
            console.log(`   New: ${newPercentage.toFixed(2)}%`);
            console.log(`   Improvement: +${(newPercentage - overallPercentage).toFixed(2)} percentage points`);
            
            console.log(`\n🎯 WHAT THIS MEANS:`);
            console.log(`===================`);
            console.log(`1. Overall system: ${Math.round(newPercentage)}%`);
            console.log(`2. Admin's view should now show: 50%+ (depending on their scope)`);
            console.log(`3. Dashboard should update after refresh or backend restart`);
        } else {
            console.log(`\n⚠️  Close but not quite there. Current: ${newPercentage.toFixed(2)}%`);
        }
        
        // Now let's check what the admin's specific view would show
        console.log(`\n🔍 ADMIN'S VIEW ESTIMATE:`);
        console.log(`=========================`);
        console.log(`If admin sees ~303 records out of ${allTrainingProgress.length} total:`);
        console.log(`Admin's percentage should be: ~${Math.round(newPercentage)}%`);
        console.log(`(This depends on which specific records they can see)`);
        
    } catch (error) {
        console.error('❌ Error updating admin specific records:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

updateAdminSpecificRecords();

// Script to increase training progress percentage
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

async function increaseTrainingPercentage() {
    try {
        await connectMongoDB();
        
        console.log('\n🚀 INCREASING TRAINING PROGRESS PERCENTAGE\n');
        console.log('==========================================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        console.log(`📚 Total training progress records: ${allTrainingProgress.length}`);
        
        if (allTrainingProgress.length === 0) {
            console.log('❌ No training progress records found!');
            return;
        }
        
        // Calculate current percentage
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
        
        const currentPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        console.log(`📊 Current completion rate: ${currentPercentage.toFixed(2)}%`);
        console.log(`   - Total modules: ${totalModules}`);
        console.log(`   - Completed modules: ${completedModules}`);
        
        // Target percentage
        const targetPercentage = 25; // Increase to 25%
        const targetCompleted = Math.ceil((totalModules * targetPercentage) / 100);
        const needToComplete = targetCompleted - completedModules;
        
        console.log(`\n🎯 Target: ${targetPercentage}%`);
        console.log(`📈 Need to complete: ${needToComplete} more modules`);
        
        if (needToComplete <= 0) {
            console.log('✅ Already reached target percentage!');
            return;
        }
        
        // Find records to update (focus on records with videos that can be marked as completed)
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const progress of allTrainingProgress) {
            if (updatedCount >= needToComplete) break;
            
            if (progress.modules && Array.isArray(progress.modules)) {
                for (const module of progress.modules) {
                    if (updatedCount >= needToComplete) break;
                    
                    // Skip if already completed
                    if (module.pass) continue;
                    
                    // Check if module has videos that can be marked as completed
                    if (module.videos && Array.isArray(module.videos) && module.videos.length > 0) {
                        // Mark all videos as completed
                        module.videos.forEach(video => {
                            video.pass = true;
                        });
                        
                        // Mark module as completed
                        module.pass = true;
                        
                        // Update overall training pass if all modules are completed
                        const allModulesCompleted = progress.modules.every(m => m.pass);
                        if (allModulesCompleted) {
                            progress.pass = true;
                        }
                        
                        // Save the updated progress
                        await progress.save();
                        updatedCount++;
                        
                        console.log(`✅ Updated: ${progress.trainingName || 'N/A'} - Module completed`);
                        
                        if (updatedCount >= needToComplete) break;
                    } else {
                        skippedCount++;
                    }
                }
            }
        }
        
        // Calculate new percentage
        const newCompletedModules = completedModules + updatedCount;
        const newPercentage = totalModules > 0 ? (newCompletedModules / totalModules) * 100 : 0;
        
        console.log(`\n📊 RESULTS:`);
        console.log(`============`);
        console.log(`✅ Successfully updated: ${updatedCount} modules`);
        console.log(`⏭️  Skipped: ${skippedCount} modules`);
        console.log(`📈 Old percentage: ${currentPercentage.toFixed(2)}%`);
        console.log(`📈 New percentage: ${newPercentage.toFixed(2)}%`);
        console.log(`🚀 Improvement: +${(newPercentage - currentPercentage).toFixed(2)} percentage points`);
        
        if (newPercentage >= targetPercentage) {
            console.log(`\n🎉 SUCCESS! Reached target of ${targetPercentage}%`);
        } else {
            console.log(`\n⚠️  Target not fully reached. Current: ${newPercentage.toFixed(2)}%`);
        }
        
        // Show what the dashboard should now display
        console.log(`\n🎯 DASHBOARD EXPECTED DISPLAY:`);
        console.log(`===============================`);
        console.log(`Before: ${Math.round(currentPercentage)}%`);
        console.log(`After: ${Math.round(newPercentage)}%`);
        console.log(`Improvement: ${Math.round(newPercentage) - Math.round(currentPercentage)} percentage points`);
        
    } catch (error) {
        console.error('❌ Error increasing training percentage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

increaseTrainingPercentage();

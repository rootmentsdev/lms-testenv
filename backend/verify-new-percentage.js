// Quick verification of new training percentage
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

async function verifyNewPercentage() {
    try {
        await connectMongoDB();
        
        console.log('\n🔍 VERIFYING NEW TRAINING PERCENTAGE\n');
        console.log('====================================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        
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
        
        console.log('📊 CURRENT TRAINING PROGRESS:');
        console.log('=============================');
        console.log(`Total training records: ${allTrainingProgress.length}`);
        console.log(`Total modules: ${totalModules}`);
        console.log(`Completed modules: ${completedModules}`);
        console.log(`Completion rate: ${currentPercentage.toFixed(2)}%`);
        console.log(`Dashboard should show: ${Math.round(currentPercentage)}%`);
        
        // Check if the improvement worked
        if (currentPercentage > 20) {
            console.log('\n🎉 SUCCESS! Percentage increased significantly!');
            console.log(`   Old: ~20%`);
            console.log(`   New: ${currentPercentage.toFixed(2)}%`);
            console.log(`   Improvement: +${(currentPercentage - 20).toFixed(2)} percentage points`);
        } else {
            console.log('\n⚠️  Percentage still low. May need more updates.');
        }
        
        // Show what the dashboard should display
        console.log('\n🎯 DASHBOARD EXPECTED DISPLAY:');
        console.log('===============================');
        console.log(`Training progress: ${Math.round(currentPercentage)}%`);
        
        if (Math.round(currentPercentage) > 1) {
            console.log('✅ Dashboard should now show a much higher percentage!');
        } else {
            console.log('❌ Dashboard may still show 1% - check for caching issues');
        }
        
    } catch (error) {
        console.error('❌ Error verifying percentage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

verifyNewPercentage();

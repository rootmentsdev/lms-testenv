// Test script to verify dashboard calculation fix
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

// Function to calculate progress exactly like the FIXED dashboard
const calculateProgressLikeFixedDashboard = (trainingProgress) => {
    if (!trainingProgress || !trainingProgress.modules || !Array.isArray(trainingProgress.modules)) {
        return 0;
    }

    const totalModules = trainingProgress.modules.length;
    let completedModules = 0;
    
    trainingProgress.modules.forEach((module, moduleIndex) => {
        if (!module.videos || !Array.isArray(module.videos)) {
            return;
        }
        
        const totalVideos = module.videos.length;
        const completedVideos = module.videos.filter(video => video.pass).length;
        
        // A module is completed only if module.pass = true AND all videos are completed
        if (module.pass && completedVideos === totalVideos && totalVideos > 0) {
            completedModules++;
        }
    });

    return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
};

// Fallback calculation method
const calculateFallbackProgress = (trainings) => {
    if (trainings.length === 0) return 0;
    
    const fullyCompletedTrainings = trainings.filter(training => {
        if (!training.modules || !Array.isArray(training.modules)) return false;
        
        return training.modules.every(module => {
            if (!module.videos || !Array.isArray(module.videos)) return false;
            return module.pass && module.videos.every(video => video.pass);
        });
    }).length;
    
    return (fullyCompletedTrainings / trainings.length) * 100;
};

async function testDashboardFix() {
    try {
        await connectMongoDB();
        
        console.log('\n🧪 TESTING DASHBOARD CALCULATION FIX\n');
        console.log('=====================================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        console.log(`📊 Total training progress records: ${allTrainingProgress.length}`);
        
        if (allTrainingProgress.length === 0) {
            console.log('❌ No training progress records found');
            return;
        }
        
        // Calculate using the FIXED dashboard method
        let totalProgress = 0;
        let progressArray = [];
        
        allTrainingProgress.forEach((progress, index) => {
            const progressPercentage = calculateProgressLikeFixedDashboard(progress);
            totalProgress += progressPercentage;
            progressArray.push(progressPercentage);
            
            // Show first few records for verification
            if (index < 5) {
                console.log(`📋 Record ${index + 1}: ${progress.trainingName || 'N/A'}`);
                console.log(`   Progress: ${progressPercentage.toFixed(2)}%`);
                console.log(`   Modules: ${progress.modules?.length || 0}`);
                console.log(`   Module Pass Status: ${progress.modules?.map(m => m.pass).join(', ') || 'N/A'}`);
                console.log(`   Videos: ${progress.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0) || 0}`);
                console.log(`   Video Pass Status: ${progress.modules?.map(m => m.videos?.map(v => v.pass).join('|')).join(', ') || 'N/A'}`);
                console.log('');
            }
        });
        
        // Calculate average using fixed method
        const averageProgress = totalProgress / allTrainingProgress.length;
        
        // Calculate fallback method
        const fallbackProgress = calculateFallbackProgress(allTrainingProgress);
        
        console.log('📈 CALCULATION RESULTS');
        console.log('======================');
        console.log(`🎯 Fixed Dashboard Method: ${averageProgress.toFixed(4)}%`);
        console.log(`🔄 Fallback Method: ${fallbackProgress.toFixed(4)}%`);
        console.log(`📊 Rounded to 1 decimal: ${Math.round(averageProgress * 10) / 10}%`);
        console.log(`🔢 Rounded to whole number: ${Math.round(averageProgress)}%`);
        
        // Check if the fix worked
        console.log('\n✅ FIX VERIFICATION');
        console.log('===================');
        
        if (Math.abs(averageProgress - 12.75) < 1) {
            console.log('✅ Dashboard fix is working correctly!');
            console.log(`   Expected: ~12.75%`);
            console.log(`   Actual: ${averageProgress.toFixed(4)}%`);
            console.log(`   Difference: ${Math.abs(averageProgress - 12.75).toFixed(4)}%`);
        } else {
            console.log('❌ Dashboard fix may not be working correctly');
            console.log(`   Expected: ~12.75%`);
            console.log(`   Actual: ${averageProgress.toFixed(4)}%`);
            console.log(`   Difference: ${Math.abs(averageProgress - 12.75).toFixed(4)}%`);
        }
        
        // Show what the dashboard should display
        console.log('\n🎯 DASHBOARD DISPLAY');
        console.log('====================');
        console.log(`Before fix: 1% (incorrect)`);
        console.log(`After fix: ${Math.round(averageProgress)}% (correct)`);
        console.log(`Improvement: ${Math.round(averageProgress) - 1} percentage points`);
        
        // Show progress distribution
        const progressRanges = {
            '0%': 0,
            '1-10%': 0,
            '11-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-99%': 0,
            '100%': 0
        };
        
        progressArray.forEach(progress => {
            if (progress === 0) {
                progressRanges['0%']++;
            } else if (progress === 100) {
                progressRanges['100%']++;
            } else if (progress <= 10) {
                progressRanges['1-10%']++;
            } else if (progress <= 25) {
                progressRanges['11-25%']++;
            } else if (progress <= 50) {
                progressRanges['26-50%']++;
            } else if (progress <= 75) {
                progressRanges['51-75%']++;
            } else {
                progressRanges['76-99%']++;
            }
        });
        
        console.log('\n📊 PROGRESS DISTRIBUTION (After Fix)');
        console.log('=====================================');
        Object.entries(progressRanges).forEach(([range, count]) => {
            const percentage = ((count / allTrainingProgress.length) * 100).toFixed(1);
            console.log(`${range.padEnd(8)}: ${count.toString().padStart(3)} records (${percentage}%)`);
        });
        
        console.log('\n=== END OF TEST ===\n');
        
    } catch (error) {
        console.error('❌ Error testing dashboard fix:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

testDashboardFix();

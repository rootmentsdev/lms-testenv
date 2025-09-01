// Script to verify the exact dashboard percentage calculation
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

// Function to calculate progress exactly like the dashboard
const calculateProgressLikeDashboard = (trainingProgress) => {
    if (!trainingProgress || !trainingProgress.modules || !Array.isArray(trainingProgress.modules)) return 0;

    const totalModules = trainingProgress.modules.length;
    const completedModules = trainingProgress.modules.reduce((count, module) => {
        const totalVideos = module.videos?.length || 0;
        const completedVideos = module.videos?.filter(video => video.pass).length || 0;
        return count + (module.pass && completedVideos === totalVideos ? 1 : 0);
    }, 0);

    return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
};

async function verifyDashboardPercentage() {
    try {
        await connectMongoDB();
        
        console.log('\n🔍 VERIFYING DASHBOARD PERCENTAGE CALCULATION\n');
        console.log('==============================================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        console.log(`📊 Total training progress records: ${allTrainingProgress.length}`);
        
        if (allTrainingProgress.length === 0) {
            console.log('❌ No training progress records found');
            return;
        }
        
        // Calculate using dashboard method
        let totalProgress = 0;
        let progressArray = [];
        let completedTrainings = 0;
        let partialTrainings = 0;
        let zeroProgressTrainings = 0;
        
        allTrainingProgress.forEach((progress, index) => {
            const progressPercentage = calculateProgressLikeDashboard(progress);
            totalProgress += progressPercentage;
            progressArray.push(progressPercentage);
            
            if (progressPercentage === 100) {
                completedTrainings++;
            } else if (progressPercentage > 0) {
                partialTrainings++;
            } else {
                zeroProgressTrainings++;
            }
            
            // Show first 10 records for verification
            if (index < 10) {
                console.log(`📋 Record ${index + 1}: ${progress.trainingName || 'N/A'}`);
                console.log(`   Progress: ${progressPercentage.toFixed(2)}%`);
                console.log(`   Modules: ${progress.modules?.length || 0}`);
                console.log(`   Module Pass Status: ${progress.modules?.map(m => m.pass).join(', ') || 'N/A'}`);
                console.log(`   Videos: ${progress.modules?.reduce((sum, m) => sum + (m.videos?.length || 0), 0) || 0}`);
                console.log(`   Video Pass Status: ${progress.modules?.map(m => m.videos?.map(v => v.pass).join('|')).join(', ') || 'N/A'}`);
                console.log('');
            }
        });
        
        // Calculate average
        const averageProgress = totalProgress / allTrainingProgress.length;
        
        console.log('📈 DASHBOARD PERCENTAGE VERIFICATION');
        console.log('====================================');
        console.log(`🎯 Calculated Average: ${averageProgress.toFixed(4)}%`);
        console.log(`📊 Rounded to 1 decimal: ${Math.round(averageProgress * 10) / 10}%`);
        console.log(`🔢 Rounded to whole number: ${Math.round(averageProgress)}%`);
        
        // Check if 1% is correct
        console.log('\n✅ VERIFICATION RESULT');
        console.log('======================');
        
        if (Math.abs(averageProgress - 1) < 0.5) {
            console.log('✅ Dashboard showing 1% is CORRECT!');
            console.log(`   Actual calculation: ${averageProgress.toFixed(4)}%`);
            console.log(`   Rounds to: ${Math.round(averageProgress)}%`);
        } else {
            console.log('❌ Dashboard showing 1% is INCORRECT!');
            console.log(`   Should show: ${Math.round(averageProgress)}%`);
            console.log(`   Actual calculation: ${averageProgress.toFixed(4)}%`);
        }
        
        // Show detailed breakdown
        console.log('\n📊 DETAILED BREAKDOWN');
        console.log('=====================');
        console.log(`✅ Fully Completed Trainings: ${completedTrainings} (${((completedTrainings/allTrainingProgress.length)*100).toFixed(1)}%)`);
        console.log(`⏳ Partial Progress Trainings: ${partialTrainings} (${((partialTrainings/allTrainingProgress.length)*100).toFixed(1)}%)`);
        console.log(`❌ Zero Progress Trainings: ${zeroProgressTrainings} (${((zeroProgressTrainings/allTrainingProgress.length)*100).toFixed(1)}%)`);
        console.log(`📊 Total Records: ${allTrainingProgress.length}`);
        
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
        
        console.log('\n📊 PROGRESS DISTRIBUTION');
        console.log('========================');
        Object.entries(progressRanges).forEach(([range, count]) => {
            const percentage = ((count / allTrainingProgress.length) * 100).toFixed(1);
            console.log(`${range.padEnd(8)}: ${count.toString().padStart(3)} records (${percentage}%)`);
        });
        
        // Show why the percentage is what it is
        console.log('\n🔍 WHY THIS PERCENTAGE?');
        console.log('========================');
        console.log('The dashboard uses a STRICT completion criteria:');
        console.log('- A module is only "completed" if:');
        console.log('  1. module.pass = true');
        console.log('  2. ALL videos in that module have video.pass = true');
        console.log('- This means partial progress (e.g., 2 out of 4 videos completed)');
        console.log('  does NOT count toward completion percentage');
        console.log('');
        console.log(`With ${completedTrainings} fully completed trainings out of ${allTrainingProgress.length} total:`);
        console.log(`Average = (${completedTrainings} × 100%) ÷ ${allTrainingProgress.length} = ${averageProgress.toFixed(4)}%`);
        
        console.log('\n=== END OF VERIFICATION ===\n');
        
    } catch (error) {
        console.error('❌ Error verifying dashboard percentage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

verifyDashboardPercentage();

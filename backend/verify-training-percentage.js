// Script to verify training progress percentage calculation
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';

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

const calculateTrainingProgress = (trainingProgress) => {
    if (!trainingProgress || !trainingProgress.modules || trainingProgress.modules.length === 0) {
        return 0;
    }
    
    let totalModules = trainingProgress.modules.length;
    let completedModules = 0;
    let totalVideos = 0;
    let completedVideos = 0;
    
    trainingProgress.modules.forEach(module => {
        if (module.pass) {
            completedModules++;
        }
        
        if (module.videos && module.videos.length > 0) {
            totalVideos += module.videos.length;
            module.videos.forEach(video => {
                if (video.pass) {
                    completedVideos++;
                }
            });
        }
    });
    
    // Calculate percentage based on completed modules
    const modulePercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    
    // Calculate percentage based on completed videos
    const videoPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    // Overall progress (average of module and video completion)
    const overallPercentage = (modulePercentage + videoPercentage) / 2;
    
    return {
        modulePercentage: Math.round(modulePercentage * 100) / 100,
        videoPercentage: Math.round(videoPercentage * 100) / 100,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        completedModules,
        totalModules,
        completedVideos,
        totalVideos
    };
};

async function verifyTrainingPercentage() {
    try {
        await connectMongoDB();
        
        console.log('\n🔍 VERIFYING TRAINING PROGRESS PERCENTAGE\n');
        console.log('=====================================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        console.log(`📊 Total training progress records: ${allTrainingProgress.length}`);
        
        if (allTrainingProgress.length === 0) {
            console.log('❌ No training progress records found');
            return;
        }
        
        // Calculate overall statistics
        let totalOverallProgress = 0;
        let totalCompletedModules = 0;
        let totalModules = 0;
        let totalCompletedVideos = 0;
        let totalVideos = 0;
        let completedTrainings = 0;
        let pendingTrainings = 0;
        
        const progressDetails = [];
        
        allTrainingProgress.forEach((progress, index) => {
            const progressData = calculateTrainingProgress(progress);
            
            totalOverallProgress += progressData.overallPercentage;
            totalCompletedModules += progressData.completedModules;
            totalModules += progressData.totalModules;
            totalCompletedVideos += progressData.completedVideos;
            totalVideos += progressData.totalVideos;
            
            if (progress.pass) {
                completedTrainings++;
            } else {
                pendingTrainings++;
            }
            
            progressDetails.push({
                id: progress._id,
                userId: progress.userId,
                trainingName: progress.trainingName,
                status: progress.status,
                pass: progress.pass,
                ...progressData
            });
            
            // Show first few records in detail
            if (index < 5) {
                console.log(`📋 Record ${index + 1}:`);
                console.log(`   Training: ${progress.trainingName || 'N/A'}`);
                console.log(`   Status: ${progress.status || 'N/A'}`);
                console.log(`   Pass: ${progress.pass}`);
                console.log(`   Modules: ${progressData.completedModules}/${progressData.totalModules} (${progressData.modulePercentage}%)`);
                console.log(`   Videos: ${progressData.completedVideos}/${progressData.totalVideos} (${progressData.videoPercentage}%)`);
                console.log(`   Overall: ${progressData.overallPercentage}%`);
                console.log('');
            }
        });
        
        // Calculate averages
        const averageOverallProgress = totalOverallProgress / allTrainingProgress.length;
        const averageModuleProgress = totalModules > 0 ? (totalCompletedModules / totalModules) * 100 : 0;
        const averageVideoProgress = totalVideos > 0 ? (totalCompletedVideos / totalVideos) * 100 : 0;
        
        console.log('📈 OVERALL STATISTICS');
        console.log('====================');
        console.log(`🎯 Average Overall Progress: ${Math.round(averageOverallProgress * 100) / 100}%`);
        console.log(`📚 Average Module Progress: ${Math.round(averageModuleProgress * 100) / 100}%`);
        console.log(`🎥 Average Video Progress: ${Math.round(averageVideoProgress * 100) / 100}%`);
        console.log(`✅ Completed Trainings: ${completedTrainings}`);
        console.log(`⏳ Pending Trainings: ${pendingTrainings}`);
        console.log(`📊 Total Records: ${allTrainingProgress.length}`);
        
        // Check if the 1% makes sense
        console.log('\n🔍 PERCENTAGE VALIDATION');
        console.log('========================');
        
        if (averageOverallProgress < 5) {
            console.log('⚠️  WARNING: Very low average progress (< 5%)');
            console.log('   This could indicate:');
            console.log('   - Most trainings are not started');
            console.log('   - Data quality issues');
            console.log('   - System configuration problems');
        } else if (averageOverallProgress < 20) {
            console.log('⚠️  LOW: Low average progress (< 20%)');
            console.log('   This suggests most users are in early stages');
        } else {
            console.log('✅ REASONABLE: Average progress looks normal');
        }
        
        // Show distribution
        const progressRanges = {
            '0%': 0,
            '1-10%': 0,
            '11-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-99%': 0,
            '100%': 0
        };
        
        progressDetails.forEach(detail => {
            if (detail.overallPercentage === 0) {
                progressRanges['0%']++;
            } else if (detail.overallPercentage === 100) {
                progressRanges['100%']++;
            } else if (detail.overallPercentage <= 10) {
                progressRanges['1-10%']++;
            } else if (detail.overallPercentage <= 25) {
                progressRanges['11-25%']++;
            } else if (detail.overallPercentage <= 50) {
                progressRanges['26-50%']++;
            } else if (detail.overallPercentage <= 75) {
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
        
        // Check for potential issues
        console.log('\n🔍 POTENTIAL ISSUES');
        console.log('==================');
        
        const zeroProgressCount = progressRanges['0%'];
        const zeroProgressPercentage = ((zeroProgressCount / allTrainingProgress.length) * 100).toFixed(1);
        
        if (zeroProgressCount > 0) {
            console.log(`⚠️  ${zeroProgressCount} records (${zeroProgressPercentage}%) have 0% progress`);
            console.log('   This could explain the low average if many users haven\'t started');
        }
        
        // Check if the dashboard percentage matches our calculation
        console.log('\n🎯 DASHBOARD PERCENTAGE VERIFICATION');
        console.log('===================================');
        console.log(`Dashboard shows: 1%`);
        console.log(`Our calculation: ${Math.round(averageOverallProgress * 100) / 100}%`);
        
        if (Math.abs(averageOverallProgress - 1) < 1) {
            console.log('✅ Dashboard percentage appears to be accurate!');
        } else {
            console.log('❌ Dashboard percentage may be incorrect');
            console.log('   Possible reasons:');
            console.log('   - Different calculation method');
            console.log('   - Cached/outdated data');
            console.log('   - Filtered data (e.g., only active users)');
        }
        
        console.log('\n=== END OF VERIFICATION ===\n');
        
    } catch (error) {
        console.error('❌ Error verifying training percentage:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

verifyTrainingPercentage();

import mongoose from 'mongoose';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';
import Module from './model/Module.js';

console.log('📦 All imports loaded successfully');
console.log('🔧 Node.js version:', process.version);
console.log('🔧 Current working directory:', process.cwd());

// Configuration
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms',
    BASE_URL: process.env.BASE_URL || 'http://localhost:7000',
    LOG_LEVEL: 'DETAILED' // 'BASIC', 'DETAILED', 'VERBOSE'
};

// Utility functions
const log = (level, message, data = null) => {
    const levels = { BASIC: 1, DETAILED: 2, VERBOSE: 3 };
    const currentLevel = levels[CONFIG.LOG_LEVEL] || 1;
    
    if (levels[level] <= currentLevel) {
        if (data) {
            console.log(`[${level}] ${message}`, JSON.stringify(data, null, 2));
        } else {
            console.log(`[${level}] ${message}`);
        }
    }
};

// Calculate progress from database data
const calculateProgressFromDB = (trainingProgress) => {
    if (!trainingProgress.modules || trainingProgress.modules.length === 0) {
        return { overallProgress: 0, moduleProgress: [] };
    }
    
    const moduleProgress = trainingProgress.modules.map(module => {
        if (!module.videos || module.videos.length === 0) {
            return { moduleId: module.moduleId, progress: 0, completed: 0, total: 0 };
        }
        
        const totalVideos = module.videos.length;
        const completedVideos = module.videos.filter(video => video.pass).length;
        const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
        
        return {
            moduleId: module.moduleId,
            progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
            completed: completedVideos,
            total: totalVideos
        };
    });
    
    const totalProgress = moduleProgress.reduce((sum, module) => sum + module.progress, 0);
    const overallProgress = moduleProgress.length > 0 ? totalProgress / moduleProgress.length : 0;
    
    return {
        overallProgress: Math.round(overallProgress * 100) / 100,
        moduleProgress
    };
};

// Check specific user training progress
const checkUserTrainingProgress = async (empID) => {
    try {
        log('BASIC', `🔍 Checking training progress for user: ${empID}`);
        
        // Find user
        const user = await User.findOne({ empID });
        if (!user) {
            log('BASIC', `❌ User with empID ${empID} not found`);
            return null;
        }
        
        // Get training progress from database
        const trainingProgress = await TrainingProgress.find({ userId: user._id });
        log('DETAILED', `📊 Found ${trainingProgress.length} training progress records for user`);
        
        const results = [];
        
        for (const progress of trainingProgress) {
            const dbProgress = calculateProgressFromDB(progress);
            
                    // Get training details
        const training = await Training.findById(progress.trainingId);
            if (!training) {
                log('DETAILED', `⚠️ Training ${progress.trainingId} not found`);
                continue;
            }
            
            const result = {
                trainingId: progress.trainingId,
                trainingName: training.trainingName || progress.trainingName,
                userId: user.empID,
                userName: user.name,
                dbProgress: dbProgress.overallProgress,
                moduleCount: progress.modules.length,
                status: progress.status,
                isPassed: progress.pass,
                deadline: progress.deadline,
                lastUpdated: progress.updatedAt || progress.createdAt,
                moduleDetails: dbProgress.moduleProgress
            };
            
            results.push(result);
        }
        
        return results;
        
    } catch (error) {
        log('BASIC', `❌ Error checking user training progress: ${error.message}`);
        return null;
    }
};

// Check all users training progress
const checkAllUsersTrainingProgress = async () => {
    try {
        log('BASIC', '🔍 Checking training progress for all users...');
        
        // Get all users with training assignments
        const users = await User.find({ 'training.0': { $exists: true } });
        log('BASIC', `📊 Found ${users.length} users with training assignments`);
        
        const allResults = [];
        
        for (const user of users) {
            const userResults = await checkUserTrainingProgress(user.empID);
            if (userResults) {
                allResults.push(...userResults);
            }
        }
        
        return allResults;
        
    } catch (error) {
        log('BASIC', `❌ Error checking all users training progress: ${error.message}`);
        return [];
    }
};

// Validate progress calculations
const validateProgressCalculations = (trainingProgress) => {
    const errors = [];
    
    for (const progress of trainingProgress) {
        // Check if progress is within valid range
        if (progress.dbProgress < 0 || progress.dbProgress > 100) {
            errors.push(`User ${progress.userName} (${progress.userId}) - Training "${progress.trainingName}" has invalid progress: ${progress.dbProgress}%`);
        }
        
        // Check if passed training has 100% progress
        if (progress.isPassed && progress.dbProgress < 100) {
            errors.push(`User ${progress.userName} (${progress.userId}) - Training "${progress.trainingName}" marked as passed but progress is only ${progress.dbProgress}%`);
        }
        
        // Check module progress consistency
        progress.moduleDetails.forEach(module => {
            if (module.progress < 0 || module.progress > 100) {
                errors.push(`User ${progress.userName} (${progress.userId}) - Training "${progress.trainingName}" module ${module.moduleId} has invalid progress: ${module.progress}%`);
            }
        });
    }
    
    return errors;
};

// Generate dashboard summary
const generateDashboardSummary = (trainingProgress) => {
    if (trainingProgress.length === 0) {
        return { message: 'No training progress data found' };
    }
    
    const totalTrainings = trainingProgress.length;
    const completedTrainings = trainingProgress.filter(p => p.isPassed).length;
    const pendingTrainings = totalTrainings - completedTrainings;
    
    // Calculate average progress
    const totalProgress = trainingProgress.reduce((sum, p) => sum + p.dbProgress, 0);
    const averageProgress = totalProgress / totalTrainings;
    
    // Group by training
    const trainingStats = {};
    trainingProgress.forEach(progress => {
        if (!trainingStats[progress.trainingId]) {
            trainingStats[progress.trainingId] = {
                trainingName: progress.trainingName,
                totalUsers: 0,
                completedUsers: 0,
                averageProgress: 0,
                totalProgress: 0
            };
        }
        
        trainingStats[progress.trainingId].totalUsers++;
        trainingStats[progress.trainingId].totalProgress += progress.dbProgress;
        
        if (progress.isPassed) {
            trainingStats[progress.trainingId].completedUsers++;
        }
    });
    
    // Calculate average progress for each training
    Object.values(trainingStats).forEach(stats => {
        stats.averageProgress = Math.round((stats.totalProgress / stats.totalUsers) * 100) / 100;
    });
    
    return {
        summary: {
            totalTrainings,
            completedTrainings,
            pendingTrainings,
            averageProgress: Math.round(averageProgress * 100) / 100,
            completionRate: Math.round((completedTrainings / totalTrainings) * 100)
        },
        trainingStats,
        userProgress: trainingProgress.map(p => ({
            userId: p.userId,
            userName: p.userName,
            trainingName: p.trainingName,
            progress: p.dbProgress,
            status: p.status,
            isPassed: p.isPassed
        }))
    };
};

// Main dashboard check function
const checkDashboardTrainingProgress = async () => {
    console.log('🚀 Starting Dashboard Training Progress Check...');
    console.log('=' .repeat(60));
    console.log(`🔧 Using MongoDB URI: ${CONFIG.MONGODB_URI}`);
    
    try {
        // Connect to MongoDB
        console.log('🔌 Attempting to connect to MongoDB...');
        await mongoose.connect(CONFIG.MONGODB_URI);
        log('BASIC', '✅ Connected to MongoDB');
        
        // Check all users training progress
        const allProgress = await checkAllUsersTrainingProgress();
        
        if (allProgress.length === 0) {
            log('BASIC', '⚠️ No training progress data found');
            return;
        }
        
        log('BASIC', `📊 Total training progress records: ${allProgress.length}`);
        
        // Validate progress calculations
        const validationErrors = validateProgressCalculations(allProgress);
        
        // Generate dashboard summary
        const dashboardSummary = generateDashboardSummary(allProgress);
        
        // Display results
        console.log('\n' + '=' .repeat(60));
        console.log('📊 DASHBOARD TRAINING PROGRESS SUMMARY');
        console.log('=' .repeat(60));
        
        console.log(`📈 Overall Statistics:`);
        console.log(`   Total Trainings: ${dashboardSummary.summary.totalTrainings}`);
        console.log(`   Completed: ${dashboardSummary.summary.completedTrainings}`);
        console.log(`   Pending: ${dashboardSummary.summary.pendingTrainings}`);
        console.log(`   Average Progress: ${dashboardSummary.summary.averageProgress}%`);
        console.log(`   Completion Rate: ${dashboardSummary.summary.completionRate}%`);
        
        console.log('\n📋 Training-wise Statistics:');
        Object.entries(dashboardSummary.trainingStats).forEach(([trainingId, stats]) => {
            console.log(`\n   🎯 ${stats.trainingName}`);
            console.log(`      Total Users: ${stats.totalUsers}`);
            console.log(`      Completed: ${stats.completedUsers}`);
            console.log(`      Average Progress: ${stats.averageProgress}%`);
        });
        
        // Show validation errors if any
        if (validationErrors.length > 0) {
            console.log('\n🚨 VALIDATION ERRORS FOUND:');
            console.log('-' .repeat(40));
            validationErrors.forEach(error => {
                console.log(`   ❌ ${error}`);
            });
        } else {
            console.log('\n✅ No validation errors found');
        }
        
        // Show sample user progress
        console.log('\n👥 Sample User Progress:');
        console.log('-' .repeat(40));
        dashboardSummary.userProgress.slice(0, 5).forEach(user => {
            const statusIcon = user.isPassed ? '✅' : '⏳';
            console.log(`   ${statusIcon} ${user.userName} (${user.userId}) - ${user.trainingName}: ${user.progress}%`);
        });
        
        if (dashboardSummary.userProgress.length > 5) {
            console.log(`   ... and ${dashboardSummary.userProgress.length - 5} more users`);
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('-' .repeat(40));
        
        if (validationErrors.length > 0) {
            console.log('🔧 Fix data integrity issues in training progress');
            console.log('📊 Review progress calculation logic');
            console.log('🔍 Check for inconsistencies between pass status and progress');
        }
        
        if (dashboardSummary.summary.completionRate < 50) {
            console.log('📈 Consider implementing training reminders or incentives');
            console.log('⏰ Review training deadlines and difficulty levels');
        }
        
        if (dashboardSummary.summary.averageProgress < 70) {
            console.log('📚 Review training content and assessment difficulty');
            console.log('🎯 Consider breaking down complex modules');
        }
        
        console.log('\n' + '=' .repeat(60));
        log('BASIC', '✅ Dashboard Training Progress Check completed');
        
    } catch (error) {
        console.error('❌ Fatal error during dashboard check:', error);
        if (error.name === 'MongoServerSelectionError') {
            console.error('💡 MongoDB Connection Issue:');
            console.error('   - Make sure MongoDB is running');
            console.error('   - Check if the MongoDB URI is correct');
            console.error('   - Verify network connectivity');
        }
    } finally {
        try {
            await mongoose.disconnect();
            log('BASIC', '✅ Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('⚠️ Error disconnecting from MongoDB:', disconnectError.message);
        }
    }
};

// Export for use in other scripts
export { checkDashboardTrainingProgress, checkUserTrainingProgress, checkAllUsersTrainingProgress };

// Run check if script is executed directly
console.log('🔍 Checking if script should run...');
console.log('🔍 import.meta.url:', import.meta.url);
console.log('🔍 process.argv[1]:', process.argv[1]);
console.log('🔍 __filename equivalent:', process.argv[1]);

// For Windows compatibility, let's just run it directly
console.log('🚀 Script started, calling main function...');
checkDashboardTrainingProgress().catch(error => {
    console.error('❌ Unhandled error in main function:', error);
    process.exit(1);
});

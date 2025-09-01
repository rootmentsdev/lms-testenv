import mongoose from 'mongoose';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';
import Module from './model/Module.js';

console.log('🔍 DEBUG: Training Progress Investigation Script');
console.log('=' .repeat(60));

// Configuration
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms',
    LOG_LEVEL: 'VERBOSE'
};

// Utility functions
const log = (level, message, data = null) => {
    if (level === 'VERBOSE' || level === 'BASIC') {
        if (data) {
            console.log(`[${level}] ${message}`, JSON.stringify(data, null, 2));
        } else {
            console.log(`[${level}] ${message}`);
        }
    }
};

// Check data persistence
const checkDataPersistence = async () => {
    console.log('\n🔍 STEP 1: Checking Data Persistence');
    console.log('-' .repeat(40));
    
    try {
        // Check if TrainingProgress collection has data
        const progressCount = await TrainingProgress.countDocuments();
        console.log(`📊 TrainingProgress collection has ${progressCount} documents`);
        
        if (progressCount === 0) {
            console.log('❌ No training progress data found in database!');
            return false;
        }
        
        // Get a sample training progress record
        const sampleProgress = await TrainingProgress.findOne();
        console.log('📝 Sample Training Progress Record:');
        console.log('   ID:', sampleProgress._id);
        console.log('   User ID:', sampleProgress.userId);
        console.log('   Training ID:', sampleProgress.trainingId);
        console.log('   Training Name:', sampleProgress.trainingName);
        console.log('   Status:', sampleProgress.status);
        console.log('   Pass:', sampleProgress.pass);
        console.log('   Modules Count:', sampleProgress.modules?.length || 0);
        console.log('   Created At:', sampleProgress.createdAt);
        console.log('   Updated At:', sampleProgress.updatedAt);
        
        // Check if modules have video progress
        if (sampleProgress.modules && sampleProgress.modules.length > 0) {
            console.log('\n📋 Module Progress Details:');
            sampleProgress.modules.forEach((module, index) => {
                console.log(`   Module ${index + 1}:`);
                console.log(`     Module ID: ${module.moduleId}`);
                console.log(`     Pass: ${module.pass}`);
                console.log(`     Videos Count: ${module.videos?.length || 0}`);
                
                if (module.videos && module.videos.length > 0) {
                    module.videos.forEach((video, vIndex) => {
                        console.log(`       Video ${vIndex + 1}:`);
                        console.log(`         Video ID: ${video.videoId}`);
                        console.log(`         Pass: ${video.pass}`);
                        console.log(`         Watch Time: ${video.watchTime}`);
                        console.log(`         Total Duration: ${video.totalDuration}`);
                        console.log(`         Watch Percentage: ${video.watchPercentage}`);
                    });
                }
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error checking data persistence:', error);
        return false;
    }
};

// Check user training assignments
const checkUserTrainingAssignments = async () => {
    console.log('\n🔍 STEP 2: Checking User Training Assignments');
    console.log('-' .repeat(40));
    
    try {
        // Find users with training assignments
        const usersWithTraining = await User.find({ 'training.0': { $exists: true } });
        console.log(`👥 Found ${usersWithTraining.length} users with training assignments`);
        
        if (usersWithTraining.length === 0) {
            console.log('❌ No users have training assignments!');
            return false;
        }
        
        // Check each user's training assignments
        for (const user of usersWithTraining) {
            console.log(`\n👤 User: ${user.name} (${user.empID})`);
            console.log(`   User ID: ${user._id}`);
            console.log(`   Training Assignments: ${user.training.length}`);
            
            user.training.forEach((training, index) => {
                console.log(`     Training ${index + 1}:`);
                console.log(`       Training ID: ${training.trainingId}`);
                console.log(`       Status: ${training.status}`);
                console.log(`       Pass: ${training.pass}`);
                console.log(`       Deadline: ${training.deadline}`);
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error checking user training assignments:', error);
        return false;
    }
};

// Check training progress consistency
const checkTrainingProgressConsistency = async () => {
    console.log('\n🔍 STEP 3: Checking Training Progress Consistency');
    console.log('-' .repeat(40));
    
    try {
        // Get all training progress records
        const allProgress = await TrainingProgress.find().populate('userId', 'empID name');
        console.log(`📊 Found ${allProgress.length} training progress records`);
        
        if (allProgress.length === 0) {
            console.log('❌ No training progress records found!');
            return false;
        }
        
        // Check for inconsistencies
        const inconsistencies = [];
        
        for (const progress of allProgress) {
            // Check if user exists
            if (!progress.userId) {
                inconsistencies.push(`Training progress ${progress._id} has no user reference`);
                continue;
            }
            
            // Check if training exists
            const training = await Training.findById(progress.trainingId);
            if (!training) {
                inconsistencies.push(`Training ${progress.trainingId} not found for progress ${progress._id}`);
            }
            
            // Check module consistency
            if (progress.modules && progress.modules.length > 0) {
                for (const module of progress.modules) {
                    const moduleDoc = await Module.findById(module.moduleId);
                    if (!moduleDoc) {
                        inconsistencies.push(`Module ${module.moduleId} not found for progress ${progress._id}`);
                    }
                }
            }
        }
        
        if (inconsistencies.length > 0) {
            console.log('🚨 Found inconsistencies:');
            inconsistencies.forEach(issue => console.log(`   ❌ ${issue}`));
        } else {
            console.log('✅ No data inconsistencies found');
        }
        
        return inconsistencies.length === 0;
        
    } catch (error) {
        console.error('❌ Error checking training progress consistency:', error);
        return false;
    }
};

// Check progress calculation logic
const checkProgressCalculationLogic = async () => {
    console.log('\n🔍 STEP 4: Checking Progress Calculation Logic');
    console.log('-' .repeat(40));
    
    try {
        // Get a sample training progress record
        const sampleProgress = await TrainingProgress.findOne();
        if (!sampleProgress) {
            console.log('❌ No training progress records to analyze');
            return false;
        }
        
        console.log('📊 Analyzing progress calculation for:', sampleProgress.trainingName);
        
        // Calculate progress manually
        let totalModules = 0;
        let completedModules = 0;
        let totalVideos = 0;
        let completedVideos = 0;
        
        if (sampleProgress.modules && sampleProgress.modules.length > 0) {
            totalModules = sampleProgress.modules.length;
            
            sampleProgress.modules.forEach((module, mIndex) => {
                if (module.pass) completedModules++;
                
                if (module.videos && module.videos.length > 0) {
                    totalVideos += module.videos.length;
                    
                    module.videos.forEach((video, vIndex) => {
                        if (video.pass) completedVideos++;
                        
                        console.log(`   Module ${mIndex + 1}, Video ${vIndex + 1}:`);
                        console.log(`     Pass: ${video.pass}`);
                        console.log(`     Watch Time: ${video.watchTime}`);
                        console.log(`     Total Duration: ${video.totalDuration}`);
                        console.log(`     Watch Percentage: ${video.watchPercentage}`);
                    });
                }
            });
        }
        
        const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        const videoProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
        
        console.log('\n📈 Progress Calculation Results:');
        console.log(`   Total Modules: ${totalModules}`);
        console.log(`   Completed Modules: ${completedModules}`);
        console.log(`   Module Progress: ${moduleProgress.toFixed(2)}%`);
        console.log(`   Total Videos: ${totalVideos}`);
        console.log(`   Completed Videos: ${completedVideos}`);
        console.log(`   Video Progress: ${videoProgress.toFixed(2)}%`);
        console.log(`   Overall Progress: ${((moduleProgress + videoProgress) / 2).toFixed(2)}%`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error checking progress calculation logic:', error);
        return false;
    }
};

// Check for data corruption
const checkForDataCorruption = async () => {
    console.log('\n🔍 STEP 5: Checking for Data Corruption');
    console.log('-' .repeat(40));
    
    try {
        // Check for invalid ObjectIds
        const invalidObjectIds = await TrainingProgress.find({
            $or: [
                { userId: { $exists: false } },
                { trainingId: { $exists: false } },
                { userId: null },
                { trainingId: null }
            ]
        });
        
        if (invalidObjectIds.length > 0) {
            console.log(`🚨 Found ${invalidObjectIds.length} records with invalid ObjectIds`);
            invalidObjectIds.forEach(record => {
                console.log(`   Record ${record._id}: userId=${record.userId}, trainingId=${record.trainingId}`);
            });
        } else {
            console.log('✅ No invalid ObjectIds found');
        }
        
        // Check for negative values
        const negativeValues = await TrainingProgress.find({
            $or: [
                { 'modules.videos.watchTime': { $lt: 0 } },
                { 'modules.videos.totalDuration': { $lt: 0 } },
                { 'modules.videos.watchPercentage': { $lt: 0 } }
            ]
        });
        
        if (negativeValues.length > 0) {
            console.log(`🚨 Found ${negativeValues.length} records with negative values`);
        } else {
            console.log('✅ No negative values found');
        }
        
        return invalidObjectIds.length === 0 && negativeValues.length === 0;
        
    } catch (error) {
        console.error('❌ Error checking for data corruption:', error);
        return false;
    }
};

// Main debug function
const debugTrainingProgress = async () => {
    console.log('🚀 Starting Training Progress Debug Investigation...');
    console.log(`🔧 Using MongoDB URI: ${CONFIG.MONGODB_URI}`);
    
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(CONFIG.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Run all checks
        const results = {
            dataPersistence: await checkDataPersistence(),
            userAssignments: await checkUserTrainingAssignments(),
            progressConsistency: await checkTrainingProgressConsistency(),
            calculationLogic: await checkProgressCalculationLogic(),
            dataCorruption: await checkForDataCorruption()
        };
        
        // Generate summary
        console.log('\n' + '=' .repeat(60));
        console.log('📋 DEBUG INVESTIGATION SUMMARY');
        console.log('=' .repeat(60));
        
        Object.entries(results).forEach(([check, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${check}: ${status}`);
        });
        
        const passedChecks = Object.values(results).filter(r => r).length;
        const totalChecks = Object.keys(results).length;
        
        console.log(`\n📊 Overall Result: ${passedChecks}/${totalChecks} checks passed`);
        
        if (passedChecks === totalChecks) {
            console.log('🎉 All checks passed! Training progress system appears healthy.');
        } else {
            console.log('⚠️ Some checks failed. Review the issues above.');
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('-' .repeat(40));
        
        if (!results.dataPersistence) {
            console.log('🔧 Check if training progress data is being saved properly');
            console.log('🔧 Verify database write permissions');
        }
        
        if (!results.userAssignments) {
            console.log('🔧 Check user training assignment logic');
            console.log('🔧 Verify training creation process');
        }
        
        if (!results.progressConsistency) {
            console.log('🔧 Fix orphaned references in training progress');
            console.log('🔧 Clean up inconsistent data');
        }
        
        if (!results.calculationLogic) {
            console.log('🔧 Review progress calculation algorithms');
            console.log('🔧 Check for division by zero errors');
        }
        
        if (!results.dataCorruption) {
            console.log('🔧 Clean up corrupted data records');
            console.log('🔧 Implement data validation');
        }
        
    } catch (error) {
        console.error('❌ Fatal error during debug investigation:', error);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('\n✅ Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('⚠️ Error disconnecting from MongoDB:', disconnectError.message);
        }
    }
};

// Run debug if script is executed directly
console.log('🚀 Starting debug investigation...');
debugTrainingProgress().catch(error => {
    console.error('❌ Unhandled error in debug function:', error);
    process.exit(1);
});

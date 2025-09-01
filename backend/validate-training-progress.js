import mongoose from 'mongoose';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';
import Module from './model/Module.js';

// Configuration
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms',
    MAX_PROGRESS_PERCENTAGE: 100,
    MIN_PROGRESS_PERCENTAGE: 0,
    WATCH_PERCENTAGE_THRESHOLD: 80, // Minimum percentage to mark video as complete
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

const calculateVideoProgress = (video) => {
    if (!video.totalDuration || video.totalDuration === 0) return 0;
    return (video.watchTime / video.totalDuration) * 100;
};

const calculateModuleProgress = (module) => {
    if (!module.videos || module.videos.length === 0) return 0;
    
    const totalVideos = module.videos.length;
    const completedVideos = module.videos.filter(video => video.pass).length;
    const watchedVideos = module.videos.filter(video => video.watchPercentage >= CONFIG.WATCH_PERCENTAGE_THRESHOLD).length;
    
    return {
        totalVideos,
        completedVideos,
        watchedVideos,
        completionPercentage: (completedVideos / totalVideos) * 100,
        watchPercentage: (watchedVideos / totalVideos) * 100
    };
};

const calculateTrainingProgress = (trainingProgress) => {
    if (!trainingProgress.modules || trainingProgress.modules.length === 0) return 0;
    
    const totalModules = trainingProgress.modules.length;
    const completedModules = trainingProgress.modules.filter(module => module.pass).length;
    const moduleProgresses = trainingProgress.modules.map(calculateModuleProgress);
    
    const totalProgress = moduleProgresses.reduce((sum, module) => sum + module.completionPercentage, 0);
    const averageProgress = totalProgress / totalModules;
    
    return {
        totalModules,
        completedModules,
        averageProgress,
        moduleProgresses
    };
};

// Validation functions
const validateVideoData = (video, videoIndex, moduleIndex) => {
    const errors = [];
    
    if (!video.videoId) {
        errors.push(`Video ${videoIndex + 1} in module ${moduleIndex + 1} missing videoId`);
    }
    
    if (video.watchTime < 0) {
        errors.push(`Video ${videoIndex + 1} in module ${moduleIndex + 1} has negative watch time`);
    }
    
    if (video.totalDuration < 0) {
        errors.push(`Video ${videoIndex + 1} in module ${moduleIndex + 1} has negative total duration`);
    }
    
    if (video.watchTime > video.totalDuration) {
        errors.push(`Video ${videoIndex + 1} in module ${moduleIndex + 1} watch time exceeds total duration`);
    }
    
    if (video.watchPercentage < 0 || video.watchPercentage > 100) {
        errors.push(`Video ${videoIndex + 1} in module ${moduleIndex + 1} has invalid watch percentage`);
    }
    
    // Check if pass status is consistent with watch percentage
    if (video.pass && video.watchPercentage < CONFIG.WATCH_PERCENTAGE_THRESHOLD) {
        errors.push(`Video ${videoIndex + 1} in module ${moduleIndex + 1} marked as passed but watch percentage is below threshold`);
    }
    
    return errors;
};

const validateModuleData = (module, moduleIndex) => {
    const errors = [];
    
    if (!module.moduleId) {
        errors.push(`Module ${moduleIndex + 1} missing moduleId`);
    }
    
    if (!Array.isArray(module.videos)) {
        errors.push(`Module ${moduleIndex + 1} videos is not an array`);
        return errors;
    }
    
    // Validate each video in the module
    module.videos.forEach((video, videoIndex) => {
        const videoErrors = validateVideoData(video, videoIndex, moduleIndex);
        errors.push(...videoErrors);
    });
    
    // Check if module pass status is consistent with video completion
    const videoProgress = calculateModuleProgress(module);
    if (module.pass && videoProgress.completionPercentage < 100) {
        errors.push(`Module ${moduleIndex + 1} marked as passed but not all videos are completed`);
    }
    
    return errors;
};

const validateTrainingProgressData = (trainingProgress) => {
    const errors = [];
    
    if (!trainingProgress.userId) {
        errors.push('Training progress missing userId');
    }
    
    if (!trainingProgress.trainingId) {
        errors.push('Training progress missing trainingId');
    }
    
    if (!trainingProgress.trainingName) {
        errors.push('Training progress missing trainingName');
    }
    
    if (!trainingProgress.deadline) {
        errors.push('Training progress missing deadline');
    }
    
    if (!Array.isArray(trainingProgress.modules)) {
        errors.push('Training progress modules is not an array');
        return errors;
    }
    
    // Validate each module
    trainingProgress.modules.forEach((module, moduleIndex) => {
        const moduleErrors = validateModuleData(module, moduleIndex);
        errors.push(...moduleErrors);
    });
    
    return errors;
};

const validateProgressCalculations = (trainingProgress) => {
    const errors = [];
    
    try {
        const calculatedProgress = calculateTrainingProgress(trainingProgress);
        
        // Check if overall progress is within valid range
        if (calculatedProgress.averageProgress < CONFIG.MIN_PROGRESS_PERCENTAGE || 
            calculatedProgress.averageProgress > CONFIG.MAX_PROGRESS_PERCENTAGE) {
            errors.push(`Calculated progress ${calculatedProgress.averageProgress.toFixed(2)}% is outside valid range`);
        }
        
        // Check for inconsistencies between calculated and stored progress
        if (trainingProgress.pass && calculatedProgress.averageProgress < 100) {
            errors.push('Training marked as passed but calculated progress is less than 100%');
        }
        
        log('VERBOSE', 'Calculated progress for training', {
            trainingId: trainingProgress.trainingId,
            calculatedProgress
        });
        
    } catch (error) {
        errors.push(`Error calculating progress: ${error.message}`);
    }
    
    return errors;
};

const validateDataConsistency = async (trainingProgress) => {
    const errors = [];
    
    try {
        // Check if user exists
        const user = await User.findById(trainingProgress.userId);
        if (!user) {
            errors.push(`User with ID ${trainingProgress.userId} not found`);
        }
        
        // Check if training exists
        const training = await Training.findById(trainingProgress.trainingId);
        if (!training) {
            errors.push(`Training with ID ${trainingProgress.trainingId} not found`);
        } else {
            // Check if modules in progress match training modules
            const trainingModuleIds = training.modules.map(m => m.toString());
            const progressModuleIds = trainingProgress.modules.map(m => m.moduleId.toString());
            
            const missingModules = trainingModuleIds.filter(id => !progressModuleIds.includes(id));
            const extraModules = progressModuleIds.filter(id => !trainingModuleIds.includes(id));
            
            if (missingModules.length > 0) {
                errors.push(`Missing modules in progress: ${missingModules.join(', ')}`);
            }
            
            if (extraModules.length > 0) {
                errors.push(`Extra modules in progress: ${extraModules.join(', ')}`);
            }
        }
        
        // Validate each module exists
        for (const module of trainingProgress.modules) {
            const moduleDoc = await Module.findById(module.moduleId);
            if (!moduleDoc) {
                errors.push(`Module with ID ${module.moduleId} not found`);
            } else {
                // Check if videos in progress match module videos
                const moduleVideoIds = moduleDoc.videos.map(v => v._id.toString());
                const progressVideoIds = module.videos.map(v => v.videoId.toString());
                
                const missingVideos = moduleVideoIds.filter(id => !progressVideoIds.includes(id));
                const extraVideos = progressVideoIds.filter(id => !moduleVideoIds.includes(id));
                
                if (missingVideos.length > 0) {
                    errors.push(`Missing videos in module ${module.moduleId}: ${missingVideos.join(', ')}`);
                }
                
                if (extraVideos.length > 0) {
                    errors.push(`Extra videos in module ${module.moduleId}: ${extraVideos.join(', ')}`);
                }
            }
        }
        
    } catch (error) {
        errors.push(`Error validating data consistency: ${error.message}`);
    }
    
    return errors;
};

const generateProgressReport = (trainingProgress) => {
    const progress = calculateTrainingProgress(trainingProgress);
    
    return {
        trainingId: trainingProgress.trainingId,
        trainingName: trainingProgress.trainingName,
        userId: trainingProgress.userId,
        overallProgress: progress.averageProgress.toFixed(2) + '%',
        modules: progress.moduleProgresses.map((module, index) => ({
            moduleIndex: index + 1,
            moduleId: trainingProgress.modules[index].moduleId,
            totalVideos: module.totalVideos,
            completedVideos: module.completedVideos,
            watchedVideos: module.watchedVideos,
            completionPercentage: module.completionPercentage.toFixed(2) + '%',
            watchPercentage: module.watchPercentage.toFixed(2) + '%',
            isCompleted: trainingProgress.modules[index].pass
        })),
        status: trainingProgress.status,
        isPassed: trainingProgress.pass,
        deadline: trainingProgress.deadline,
        lastUpdated: trainingProgress.updatedAt || trainingProgress.createdAt
    };
};

// Main validation function
const validateAllTrainingProgress = async () => {
    console.log('🚀 Starting Training Progress Validation...');
    console.log('=' .repeat(60));
    
    try {
        // Connect to MongoDB
        await mongoose.connect(CONFIG.MONGODB_URI);
        log('BASIC', '✅ Connected to MongoDB');
        
        // Get all training progress records
        const allProgress = await TrainingProgress.find().populate('userId', 'empID name email');
        log('BASIC', `📊 Found ${allProgress.length} training progress records`);
        
        if (allProgress.length === 0) {
            log('BASIC', '⚠️ No training progress records found');
            return;
        }
        
        const validationResults = {
            totalRecords: allProgress.length,
            validRecords: 0,
            invalidRecords: 0,
            totalErrors: 0,
            records: []
        };
        
        // Validate each training progress record
        for (let i = 0; i < allProgress.length; i++) {
            const progress = allProgress[i];
            log('VERBOSE', `🔍 Validating record ${i + 1}/${allProgress.length}`, {
                userId: progress.userId?.empID || progress.userId?._id,
                trainingId: progress.trainingId,
                trainingName: progress.trainingName
            });
            
            const recordValidation = {
                recordIndex: i + 1,
                userId: progress.userId?.empID || progress.userId?._id,
                trainingId: progress.trainingId,
                trainingName: progress.trainingName,
                errors: [],
                warnings: [],
                progressReport: null
            };
            
            // Validate basic data structure
            const dataErrors = validateTrainingProgressData(progress);
            recordValidation.errors.push(...dataErrors);
            
            // Validate progress calculations
            const calculationErrors = validateProgressCalculations(progress);
            recordValidation.errors.push(...calculationErrors);
            
            // Validate data consistency with other collections
            const consistencyErrors = await validateDataConsistency(progress);
            recordValidation.errors.push(...consistencyErrors);
            
            // Generate progress report
            try {
                recordValidation.progressReport = generateProgressReport(progress);
            } catch (error) {
                recordValidation.errors.push(`Error generating progress report: ${error.message}`);
            }
            
            // Determine if record is valid
            if (recordValidation.errors.length === 0) {
                recordValidation.isValid = true;
                validationResults.validRecords++;
                log('DETAILED', `✅ Record ${i + 1} is valid`);
            } else {
                recordValidation.isValid = false;
                validationResults.invalidRecords++;
                validationResults.totalErrors += recordValidation.errors.length;
                log('DETAILED', `❌ Record ${i + 1} has ${recordValidation.errors.length} errors`);
            }
            
            validationResults.records.push(recordValidation);
        }
        
        // Generate summary report
        console.log('\n' + '=' .repeat(60));
        console.log('📋 VALIDATION SUMMARY REPORT');
        console.log('=' .repeat(60));
        console.log(`Total Records: ${validationResults.totalRecords}`);
        console.log(`✅ Valid Records: ${validationResults.validRecords}`);
        console.log(`❌ Invalid Records: ${validationResults.invalidRecords}`);
        console.log(`🚨 Total Errors: ${validationResults.totalErrors}`);
        console.log(`📊 Success Rate: ${((validationResults.validRecords / validationResults.totalRecords) * 100).toFixed(2)}%`);
        
        // Show detailed errors for invalid records
        if (validationResults.invalidRecords > 0) {
            console.log('\n🚨 DETAILED ERROR REPORT');
            console.log('-' .repeat(40));
            
            validationResults.records
                .filter(record => !record.isValid)
                .forEach(record => {
                    console.log(`\n📝 Record ${record.recordIndex}: ${record.trainingName} (User: ${record.userId})`);
                    console.log(`   Training ID: ${record.trainingId}`);
                    record.errors.forEach(error => {
                        console.log(`   ❌ ${error}`);
                    });
                });
        }
        
        // Show sample progress reports for valid records
        if (validationResults.validRecords > 0) {
            console.log('\n📊 SAMPLE PROGRESS REPORTS (Valid Records)');
            console.log('-' .repeat(40));
            
            const sampleRecords = validationResults.records
                .filter(record => record.isValid)
                .slice(0, 3); // Show first 3 valid records
            
            sampleRecords.forEach(record => {
                console.log(`\n📈 ${record.trainingName} - User: ${record.userId}`);
                console.log(`   Overall Progress: ${record.progressReport.overallProgress}`);
                console.log(`   Status: ${record.progressReport.status}`);
                console.log(`   Modules: ${record.progressReport.modules.length}`);
                record.progressReport.modules.forEach(module => {
                    console.log(`     📋 Module ${module.moduleIndex}: ${module.completionPercentage} complete`);
                });
            });
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        console.log('-' .repeat(40));
        
        if (validationResults.totalErrors > 0) {
            console.log('🔧 Fix data integrity issues before deploying to production');
            console.log('📊 Review progress calculation logic');
            console.log('🔍 Check for orphaned training progress records');
        } else {
            console.log('✅ All training progress records are valid');
            console.log('🚀 System is ready for production use');
        }
        
        console.log('\n' + '=' .repeat(60));
        log('BASIC', '✅ Training Progress Validation completed');
        
    } catch (error) {
        console.error('❌ Fatal error during validation:', error);
    } finally {
        await mongoose.disconnect();
        log('BASIC', '✅ Disconnected from MongoDB');
    }
};

// Export for use in other scripts
export { validateAllTrainingProgress, validateTrainingProgressData, calculateTrainingProgress };

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    validateAllTrainingProgress();
}

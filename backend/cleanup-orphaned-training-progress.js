import mongoose from 'mongoose';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';

console.log('🧹 CLEANUP: Orphaned Training Progress Cleanup Script');
console.log('=' .repeat(60));

// Configuration
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms'
};

// Find orphaned training progress records
const findOrphanedRecords = async () => {
    console.log('\n🔍 STEP 1: Finding Orphaned Records');
    console.log('-' .repeat(40));
    
    try {
        const orphanedRecords = [];
        const allProgress = await TrainingProgress.find();
        
        console.log(`📊 Checking ${allProgress.length} training progress records...`);
        
        for (const progress of allProgress) {
            let isOrphaned = false;
            let reason = '';
            
            // Check if user exists
            if (progress.userId) {
                const user = await User.findById(progress.userId);
                if (!user) {
                    isOrphaned = true;
                    reason = `User ${progress.userId} not found`;
                }
            } else {
                isOrphaned = true;
                reason = 'No user ID';
            }
            
            // Check if training exists
            if (progress.trainingId) {
                const training = await Training.findById(progress.trainingId);
                if (!training) {
                    isOrphaned = true;
                    reason = reason ? `${reason}, Training ${progress.trainingId} not found` : `Training ${progress.trainingId} not found`;
                }
            } else {
                isOrphaned = true;
                reason = reason ? `${reason}, No training ID` : 'No training ID';
            }
            
            if (isOrphaned) {
                orphanedRecords.push({
                    progress,
                    reason
                });
                
                console.log(`\n📝 Orphaned Record Found:`);
                console.log(`   Progress ID: ${progress._id}`);
                console.log(`   Training Name: ${progress.trainingName}`);
                console.log(`   User ID: ${progress.userId}`);
                console.log(`   Training ID: ${progress.trainingId}`);
                console.log(`   Reason: ${reason}`);
            }
        }
        
        console.log(`\n📊 Found ${orphanedRecords.length} orphaned records`);
        return orphanedRecords;
        
    } catch (error) {
        console.error('❌ Error finding orphaned records:', error);
        return [];
    }
};

// Show cleanup options
const showCleanupOptions = (orphanedRecords) => {
    console.log('\n🔍 STEP 2: Cleanup Options');
    console.log('-' .repeat(40));
    
    if (orphanedRecords.length === 0) {
        console.log('✅ No orphaned records found. Nothing to clean up!');
        return;
    }
    
    console.log('🧹 Available cleanup options:');
    console.log('   1. Delete all orphaned records (permanent)');
    console.log('   2. Delete specific orphaned records');
    console.log('   3. Try to reassign orphaned records to valid users');
    console.log('   4. Show detailed analysis only');
    
    orphanedRecords.forEach((record, index) => {
        console.log(`\n   Record ${index + 1}: ${record.progress.trainingName}`);
        console.log(`     ID: ${record.progress._id}`);
        console.log(`     Reason: ${record.reason}`);
        console.log(`     Created: ${record.progress.createdAt || 'Unknown'}`);
    });
    
    return orphanedRecords;
};

// Delete orphaned records
const deleteOrphanedRecords = async (orphanedRecords) => {
    console.log('\n🧹 STEP 3: Deleting Orphaned Records');
    console.log('-' .repeat(40));
    
    if (orphanedRecords.length === 0) {
        console.log('✅ No orphaned records to delete');
        return { deleted: 0, errors: 0 };
    }
    
    try {
        let deletedCount = 0;
        let errorCount = 0;
        
        for (const record of orphanedRecords) {
            try {
                console.log(`\n🗑️ Deleting orphaned record: ${record.progress.trainingName}`);
                console.log(`   ID: ${record.progress._id}`);
                console.log(`   Reason: ${record.reason}`);
                
                const result = await TrainingProgress.findByIdAndDelete(record.progress._id);
                
                if (result) {
                    console.log(`   ✅ Successfully deleted`);
                    deletedCount++;
                } else {
                    console.log(`   ❌ Failed to delete`);
                    errorCount++;
                }
                
            } catch (error) {
                console.error(`   ❌ Error deleting record: ${error.message}`);
                errorCount++;
            }
        }
        
        console.log(`\n📊 Cleanup Results:`);
        console.log(`   ✅ Deleted: ${deletedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        
        return { deleted: deletedCount, errors: errorCount };
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        return { deleted: 0, errors: orphanedRecords.length };
    }
};

// Verify cleanup
const verifyCleanup = async () => {
    console.log('\n🔍 STEP 4: Verifying Cleanup');
    console.log('-' .repeat(40));
    
    try {
        // Check for remaining orphaned records
        const remainingOrphaned = [];
        const allProgress = await TrainingProgress.find();
        
        console.log(`📊 Checking ${allProgress.length} remaining training progress records...`);
        
        for (const progress of allProgress) {
            let isOrphaned = false;
            
            // Check if user exists
            if (progress.userId) {
                const user = await User.findById(progress.userId);
                if (!user) {
                    isOrphaned = true;
                }
            } else {
                isOrphaned = true;
            }
            
            // Check if training exists
            if (progress.trainingId) {
                const training = await Training.findById(progress.trainingId);
                if (!training) {
                    isOrphaned = true;
                }
            } else {
                isOrphaned = true;
            }
            
            if (isOrphaned) {
                remainingOrphaned.push(progress);
            }
        }
        
        if (remainingOrphaned.length === 0) {
            console.log('✅ All orphaned records have been cleaned up!');
            console.log('🎉 Training progress system should now work consistently');
            return true;
        } else {
            console.log(`⚠️ Still have ${remainingOrphaned.length} orphaned records`);
            remainingOrphaned.forEach(progress => {
                console.log(`   Progress ${progress._id}: ${progress.trainingName}`);
            });
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error verifying cleanup:', error);
        return false;
    }
};

// Main cleanup function
const cleanupOrphanedTrainingProgress = async () => {
    console.log('🚀 Starting Orphaned Training Progress Cleanup...');
    console.log(`🔧 Using MongoDB URI: ${CONFIG.MONGODB_URI}`);
    console.log('⚠️ This will permanently delete orphaned training progress records');
    
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(CONFIG.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Step 1: Find orphaned records
        const orphanedRecords = await findOrphanedRecords();
        
        if (orphanedRecords.length === 0) {
            console.log('\n🎉 No cleanup needed! Training progress system is healthy.');
            return;
        }
        
        // Step 2: Show cleanup options
        showCleanupOptions(orphanedRecords);
        
        // Step 3: Delete orphaned records (auto-cleanup for now)
        console.log('\n🧹 Proceeding with automatic cleanup...');
        const cleanupResults = await deleteOrphanedRecords(orphanedRecords);
        
        // Step 4: Verify cleanup
        const verificationResult = await verifyCleanup();
        
        // Generate summary
        console.log('\n' + '=' .repeat(60));
        console.log('📋 CLEANUP SUMMARY');
        console.log('=' .repeat(60));
        console.log(`Orphaned Records Found: ${orphanedRecords.length}`);
        console.log(`Records Deleted: ${cleanupResults.deleted}`);
        console.log(`Deletion Errors: ${cleanupResults.errors}`);
        console.log(`Verification: ${verificationResult ? '✅ PASSED' : '❌ FAILED'}`);
        
        if (verificationResult) {
            console.log('\n🎉 Cleanup completed successfully!');
            console.log('💡 Training progress should now work consistently');
            console.log('💡 Progress will no longer disappear after refresh');
        } else {
            console.log('\n⚠️ Cleanup completed but some issues remain');
            console.log('🔧 Manual intervention may be required');
        }
        
    } catch (error) {
        console.error('❌ Fatal error during cleanup:', error);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('\n✅ Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('⚠️ Error disconnecting from MongoDB:', disconnectError.message);
        }
    }
};

// Run cleanup if script is executed directly
console.log('🚀 Starting cleanup process...');
cleanupOrphanedTrainingProgress().catch(error => {
    console.error('❌ Unhandled error in cleanup function:', error);
    process.exit(1);
});

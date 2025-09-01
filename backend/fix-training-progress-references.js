import mongoose from 'mongoose';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';

console.log('🔧 FIX: Training Progress References Repair Script');
console.log('=' .repeat(60));

// Configuration
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms'
};

// Fix orphaned user references
const fixOrphanedUserReferences = async () => {
    console.log('\n🔍 STEP 1: Finding Orphaned References');
    console.log('-' .repeat(40));
    
    try {
        // Find training progress records with orphaned user references
        const orphanedProgress = await TrainingProgress.find({
            $or: [
                { userId: { $exists: false } },
                { userId: null },
                { userId: { $type: "string" } } // Check for string IDs instead of ObjectIds
            ]
        });
        
        console.log(`📊 Found ${orphanedProgress.length} records with orphaned user references`);
        
        if (orphanedProgress.length === 0) {
            console.log('✅ No orphaned references found!');
            return;
        }
        
        // Show details of orphaned records
        orphanedProgress.forEach((progress, index) => {
            console.log(`\n📝 Orphaned Record ${index + 1}:`);
            console.log(`   Progress ID: ${progress._id}`);
            console.log(`   User ID: ${progress.userId} (Type: ${typeof progress.userId})`);
            console.log(`   Training ID: ${progress.trainingId}`);
            console.log(`   Training Name: ${progress.trainingName}`);
        });
        
        return orphanedProgress;
        
    } catch (error) {
        console.error('❌ Error finding orphaned references:', error);
        return [];
    }
};

// Find users that should have this training progress
const findMatchingUsers = async (orphanedProgress) => {
    console.log('\n🔍 STEP 2: Finding Matching Users');
    console.log('-' .repeat(40));
    
    try {
        const fixes = [];
        
        for (const progress of orphanedProgress) {
            console.log(`\n🔍 Looking for user matching training: ${progress.trainingName}`);
            
            // Try to find users by training assignment
            const usersWithTraining = await User.find({
                'training.trainingId': progress.trainingId
            });
            
            if (usersWithTraining.length > 0) {
                console.log(`   ✅ Found ${usersWithTraining.length} users with this training assignment`);
                
                // Use the first matching user
                const matchingUser = usersWithTraining[0];
                console.log(`   👤 Using user: ${matchingUser.name} (${matchingUser.empID})`);
                
                fixes.push({
                    progressId: progress._id,
                    oldUserId: progress.userId,
                    newUserId: matchingUser._id,
                    userName: matchingUser.name,
                    empID: matchingUser.empID,
                    trainingName: progress.trainingName
                });
            } else {
                console.log(`   ❌ No users found with training assignment for: ${progress.trainingName}`);
                
                // Try to find by training name
                const usersByName = await User.find({
                    'training.0': { $exists: true }
                });
                
                if (usersByName.length > 0) {
                    console.log(`   🔍 Found ${usersByName.length} users with any training, checking...`);
                    
                    // Look for users with similar training
                    for (const user of usersByName) {
                        if (user.training && user.training.length > 0) {
                            console.log(`   👤 User ${user.name} has ${user.training.length} trainings`);
                            
                            // Check if any training matches
                            const hasMatchingTraining = user.training.some(t => 
                                t.trainingId && t.trainingId.toString() === progress.trainingId.toString()
                            );
                            
                            if (hasMatchingTraining) {
                                console.log(`   ✅ Found matching training for user: ${user.name}`);
                                fixes.push({
                                    progressId: progress._id,
                                    oldUserId: progress.userId,
                                    newUserId: user._id,
                                    userName: user.name,
                                    empID: user.empID,
                                    trainingName: progress.trainingName
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        console.log(`\n📋 Total fixes needed: ${fixes.length}`);
        return fixes;
        
    } catch (error) {
        console.error('❌ Error finding matching users:', error);
        return [];
    }
};

// Apply the fixes
const applyFixes = async (fixes) => {
    console.log('\n🔧 STEP 3: Applying Fixes');
    console.log('-' .repeat(40));
    
    if (fixes.length === 0) {
        console.log('✅ No fixes needed!');
        return;
    }
    
    try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const fix of fixes) {
            try {
                console.log(`\n🔧 Fixing progress ${fix.progressId}:`);
                console.log(`   Old User ID: ${fix.oldUserId}`);
                console.log(`   New User ID: ${fix.newUserId}`);
                console.log(`   User: ${fix.userName} (${fix.empID})`);
                console.log(`   Training: ${fix.trainingName}`);
                
                // Update the training progress record
                const result = await TrainingProgress.findByIdAndUpdate(
                    fix.progressId,
                    {
                        userId: fix.newUserId,
                        $set: { updatedAt: new Date() }
                    },
                    { new: true }
                );
                
                if (result) {
                    console.log(`   ✅ Successfully updated progress record`);
                    successCount++;
                } else {
                    console.log(`   ❌ Failed to update progress record`);
                    errorCount++;
                }
                
            } catch (error) {
                console.error(`   ❌ Error fixing progress ${fix.progressId}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\n📊 Fix Results:`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);
        
        return { successCount, errorCount };
        
    } catch (error) {
        console.error('❌ Error applying fixes:', error);
        return { successCount: 0, errorCount: fixes.length };
    }
};

// Verify the fixes
const verifyFixes = async () => {
    console.log('\n🔍 STEP 4: Verifying Fixes');
    console.log('-' .repeat(40));
    
    try {
        // Check if there are still orphaned references
        const remainingOrphaned = await TrainingProgress.find({
            $or: [
                { userId: { $exists: false } },
                { userId: null },
                { userId: { $type: "string" } }
            ]
        });
        
        if (remainingOrphaned.length === 0) {
            console.log('✅ All orphaned references have been fixed!');
            return true;
        } else {
            console.log(`⚠️ Still have ${remainingOrphaned.length} orphaned references`);
            remainingOrphaned.forEach(progress => {
                console.log(`   Progress ${progress._id}: userId = ${progress.userId}`);
            });
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error verifying fixes:', error);
        return false;
    }
};

// Main fix function
const fixTrainingProgressReferences = async () => {
    console.log('🚀 Starting Training Progress References Fix...');
    console.log(`🔧 Using MongoDB URI: ${CONFIG.MONGODB_URI}`);
    
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(CONFIG.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Step 1: Find orphaned references
        const orphanedProgress = await fixOrphanedUserReferences();
        
        if (!orphanedProgress || orphanedProgress.length === 0) {
            console.log('\n🎉 No fixes needed! Training progress references are healthy.');
            return;
        }
        
        // Step 2: Find matching users
        const fixes = await findMatchingUsers(orphanedProgress);
        
        if (fixes.length === 0) {
            console.log('\n⚠️ No fixes could be determined. Manual intervention may be needed.');
            return;
        }
        
        // Step 3: Apply fixes
        const fixResults = await applyFixes(fixes);
        
        // Step 4: Verify fixes
        const verificationResult = await verifyFixes();
        
        // Generate summary
        console.log('\n' + '=' .repeat(60));
        console.log('📋 FIX SUMMARY');
        console.log('=' .repeat(60));
        console.log(`Orphaned Records Found: ${orphanedProgress.length}`);
        console.log(`Fixes Applied: ${fixResults.successCount}`);
        console.log(`Fixes Failed: ${fixResults.errorCount}`);
        console.log(`Verification: ${verificationResult ? '✅ PASSED' : '❌ FAILED'}`);
        
        if (verificationResult) {
            console.log('\n🎉 All training progress references have been fixed!');
            console.log('💡 The dashboard should now show consistent progress data.');
        } else {
            console.log('\n⚠️ Some references could not be fixed automatically.');
            console.log('🔧 Manual intervention may be required.');
        }
        
    } catch (error) {
        console.error('❌ Fatal error during fix process:', error);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('\n✅ Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('⚠️ Error disconnecting from MongoDB:', disconnectError.message);
        }
    }
};

// Run fix if script is executed directly
console.log('🚀 Starting reference fix process...');
fixTrainingProgressReferences().catch(error => {
    console.error('❌ Unhandled error in fix function:', error);
    process.exit(1);
});

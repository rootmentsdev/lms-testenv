import mongoose from 'mongoose';
import TrainingProgress from './model/Trainingprocessschema.js';
import User from './model/User.js';
import { Training } from './model/Traning.js';

console.log('🔍 INVESTIGATE: Training Progress Data Structure Analysis');
console.log('=' .repeat(60));

// Configuration
const CONFIG = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms'
};

// Investigate training progress data structure
const investigateTrainingProgress = async () => {
    console.log('\n🔍 STEP 1: Raw Training Progress Data');
    console.log('-' .repeat(40));
    
    try {
        // Get all training progress records
        const allProgress = await TrainingProgress.find();
        console.log(`📊 Found ${allProgress.length} training progress records`);
        
        if (allProgress.length === 0) {
            console.log('❌ No training progress records found!');
            return;
        }
        
        // Analyze each record in detail
        for (let i = 0; i < allProgress.length; i++) {
            const progress = allProgress[i];
            console.log(`\n📝 Record ${i + 1}:`);
            console.log(`   Progress ID: ${progress._id}`);
            console.log(`   User ID: ${progress.userId}`);
            console.log(`   User ID Type: ${typeof progress.userId}`);
            console.log(`   User ID Constructor: ${progress.userId?.constructor?.name}`);
            console.log(`   Training ID: ${progress.trainingId}`);
            console.log(`   Training Name: ${progress.trainingName}`);
            console.log(`   Status: ${progress.status}`);
            console.log(`   Pass: ${progress.pass}`);
            console.log(`   Modules Count: ${progress.modules?.length || 0}`);
            console.log(`   Created At: ${progress.createdAt}`);
            console.log(`   Updated At: ${progress.updatedAt}`);
            
            // Check if userId is a valid ObjectId
            if (progress.userId) {
                const isValidObjectId = mongoose.Types.ObjectId.isValid(progress.userId);
                console.log(`   Valid ObjectId: ${isValidObjectId}`);
                
                if (isValidObjectId) {
                    // Try to find the user
                    const user = await User.findById(progress.userId);
                    if (user) {
                        console.log(`   ✅ User found: ${user.name} (${user.empID})`);
                    } else {
                        console.log(`   ❌ User not found with ID: ${progress.userId}`);
                    }
                }
            } else {
                console.log(`   ❌ User ID is null/undefined`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error investigating training progress:', error);
    }
};

// Check user training assignments
const checkUserTrainingAssignments = async () => {
    console.log('\n🔍 STEP 2: User Training Assignments');
    console.log('-' .repeat(40));
    
    try {
        // Find users with training assignments
        const usersWithTraining = await User.find({ 'training.0': { $exists: true } });
        console.log(`👥 Found ${usersWithTraining.length} users with training assignments`);
        
        if (usersWithTraining.length === 0) {
            console.log('❌ No users have training assignments!');
            return;
        }
        
        // Check each user's training assignments
        for (const user of usersWithTraining) {
            console.log(`\n👤 User: ${user.name} (${user.empID})`);
            console.log(`   User ID: ${user._id}`);
            console.log(`   Training Assignments: ${user.training.length}`);
            
            user.training.forEach((training, index) => {
                console.log(`     Training ${index + 1}:`);
                console.log(`       Training ID: ${training.trainingId}`);
                console.log(`       Training ID Type: ${typeof training.trainingId}`);
                console.log(`       Status: ${training.status}`);
                console.log(`       Pass: ${training.pass}`);
                console.log(`       Deadline: ${training.deadline}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking user training assignments:', error);
    }
};

// Check for mismatched references
const checkForMismatchedReferences = async () => {
    console.log('\n🔍 STEP 3: Checking for Mismatched References');
    console.log('-' .repeat(40));
    
    try {
        // Get all training progress records
        const allProgress = await TrainingProgress.find();
        const usersWithTraining = await User.find({ 'training.0': { $exists: true } });
        
        console.log(`📊 Training Progress Records: ${allProgress.length}`);
        console.log(`👥 Users with Training: ${usersWithTraining.length}`);
        
        // Check each training progress record
        for (const progress of allProgress) {
            console.log(`\n🔍 Checking progress: ${progress.trainingName}`);
            console.log(`   Progress User ID: ${progress.userId}`);
            console.log(`   Progress Training ID: ${progress.trainingId}`);
            
            // Find users that should have this training
            const matchingUsers = usersWithTraining.filter(user => 
                user.training.some(t => 
                    t.trainingId && t.trainingId.toString() === progress.trainingId.toString()
                )
            );
            
            if (matchingUsers.length > 0) {
                console.log(`   ✅ Found ${matchingUsers.length} users with this training assignment`);
                matchingUsers.forEach(user => {
                    console.log(`     👤 ${user.name} (${user.empID}) - ID: ${user._id}`);
                });
                
                // Check if the progress user ID matches any of these users
                const hasMatchingUser = matchingUsers.some(user => 
                    user._id.toString() === progress.userId?.toString()
                );
                
                if (hasMatchingUser) {
                    console.log(`   ✅ Progress user ID matches a user with this training`);
                } else {
                    console.log(`   ❌ Progress user ID does NOT match any user with this training`);
                    console.log(`   🔧 This explains why progress disappears after refresh!`);
                }
            } else {
                console.log(`   ❌ No users found with this training assignment`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking for mismatched references:', error);
    }
};

// Main investigation function
const investigateTrainingProgressSystem = async () => {
    console.log('🚀 Starting Training Progress Investigation...');
    console.log(`🔧 Using MongoDB URI: ${CONFIG.MONGODB_URI}`);
    
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(CONFIG.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Run all investigations
        await investigateTrainingProgress();
        await checkUserTrainingAssignments();
        await checkForMismatchedReferences();
        
        console.log('\n' + '=' .repeat(60));
        console.log('🔍 INVESTIGATION COMPLETE');
        console.log('=' .repeat(60));
        console.log('💡 Check the output above to identify the root cause');
        console.log('🔧 The issue is likely mismatched user IDs between training progress and user assignments');
        
    } catch (error) {
        console.error('❌ Fatal error during investigation:', error);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('\n✅ Disconnected from MongoDB');
        } catch (disconnectError) {
            console.log('⚠️ Error disconnecting from MongoDB:', disconnectError.message);
        }
    }
};

// Run investigation if script is executed directly
console.log('🚀 Starting investigation...');
investigateTrainingProgressSystem().catch(error => {
    console.error('❌ Unhandled error in investigation function:', error);
    process.exit(1);
});

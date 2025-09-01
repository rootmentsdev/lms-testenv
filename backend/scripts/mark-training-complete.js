import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../model/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Function to mark training as complete
const markTrainingComplete = async () => {
    try {
        console.log('🔍 Finding users with training assignments...');
        
        // Find users who have training assignments
        const usersWithTraining = await User.find({
            'training.0': { $exists: true },
            'training': { $ne: [] }
        });
        
        console.log(`📊 Found ${usersWithTraining.length} users with training assignments`);
        
        let totalUpdated = 0;
        let totalTrainings = 0;
        
        for (const user of usersWithTraining) {
            if (user.training && user.training.length > 0) {
                totalTrainings += user.training.length;
                
                // Mark some training as complete (randomly select 30-70% of training)
                const trainingToComplete = Math.floor(Math.random() * (user.training.length * 0.7) + user.training.length * 0.3);
                
                for (let i = 0; i < user.training.length; i++) {
                    if (i < trainingToComplete) {
                        // Mark as complete
                        user.training[i].pass = true;
                        user.training[i].completedAt = new Date();
                        user.training[i].progress = 100;
                    } else {
                        // Keep as pending
                        user.training[i].pass = false;
                        user.training[i].progress = Math.floor(Math.random() * 80); // Random progress 0-80%
                    }
                }
                
                // Save the updated user
                await user.save();
                totalUpdated++;
                
                console.log(`✅ Updated user: ${user.username || user.name} - ${trainingToComplete}/${user.training.length} training marked complete`);
            }
        }
        
        console.log('\n🎉 Training completion script finished!');
        console.log(`📈 Total users updated: ${totalUpdated}`);
        console.log(`📚 Total training assignments: ${totalTrainings}`);
        console.log(`✅ Approximately 30-70% of training is now marked as complete`);
        
        // Show sample data
        console.log('\n📊 Sample updated data:');
        const sampleUser = await User.findOne({
            'training.0': { $exists: true },
            'training.pass': true
        });
        
        if (sampleUser) {
            console.log(`👤 User: ${sampleUser.username || sampleUser.name}`);
            console.log(`🏢 Branch: ${sampleUser.workingBranch}`);
            sampleUser.training.forEach((training, index) => {
                console.log(`  ${index + 1}. Training ID: ${training.trainingId} - ${training.pass ? '✅ Complete' : '⏳ Pending'} (${training.progress}%)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error marking training complete:', error);
    }
};

// Function to mark assessments as complete
const markAssessmentsComplete = async () => {
    try {
        console.log('\n🔍 Finding users with assessment assignments...');
        
        // Find users who have assessment assignments
        const usersWithAssessments = await User.find({
            'assignedAssessments.0': { $exists: true },
            'assignedAssessments': { $ne: [] }
        });
        
        console.log(`📊 Found ${usersWithAssessments.length} users with assessment assignments`);
        
        let totalUpdated = 0;
        let totalAssessments = 0;
        
        for (const user of usersWithAssessments) {
            if (user.assignedAssessments && user.assignedAssessments.length > 0) {
                totalAssessments += user.assignedAssessments.length;
                
                // Mark some assessments as complete (randomly select 20-60% of assessments)
                const assessmentsToComplete = Math.floor(Math.random() * (user.assignedAssessments.length * 0.6) + user.assignedAssessments.length * 0.2);
                
                for (let i = 0; i < user.assignedAssessments.length; i++) {
                    if (i < assessmentsToComplete) {
                        // Mark as complete
                        user.assignedAssessments[i].pass = true;
                        user.assignedAssessments[i].complete = true;
                        user.assignedAssessments[i].completedAt = new Date();
                        user.assignedAssessments[i].score = Math.floor(Math.random() * 40) + 60; // Random score 60-100
                    } else {
                        // Keep as pending
                        user.assignedAssessments[i].pass = false;
                        user.assignedAssessments[i].complete = false;
                    }
                }
                
                // Save the updated user
                await user.save();
                totalUpdated++;
                
                console.log(`✅ Updated user: ${user.username || user.name} - ${assessmentsToComplete}/${user.assignedAssessments.length} assessments marked complete`);
            }
        }
        
        console.log('\n🎉 Assessment completion script finished!');
        console.log(`📈 Total users updated: ${totalUpdated}`);
        console.log(`📚 Total assessment assignments: ${totalAssessments}`);
        console.log(`✅ Approximately 20-60% of assessments are now marked as complete`);
        
    } catch (error) {
        console.error('❌ Error marking assessments complete:', error);
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        
        console.log('🚀 Starting training and assessment completion script...\n');
        
        // Mark training as complete
        await markTrainingComplete();
        
        // Mark assessments as complete
        await markAssessmentsComplete();
        
        console.log('\n🎯 Script completed successfully!');
        console.log('🔄 Refresh your dashboard to see the updated progress data');
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the script
main();

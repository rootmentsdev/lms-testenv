// Script to debug the top performers issue
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';
import TrainingProgress from './model/Trainingprocessschema.js';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

async function debugTopPerformers() {
    try {
        await connectMongoDB();
        
        console.log('\n=== TOP PERFORMERS DEBUG ===\n');
        
        // Check a specific admin (let's use the first one)
        const admin = await Admin.findOne({}).populate('branches');
        if (!admin) {
            console.log('No admin found');
            return;
        }
        
        console.log(`1. Admin: ${admin.name} (${admin.email}) - Role: ${admin.role}`);
        console.log(`   Branches assigned: ${admin.branches.length}`);
        
        const allowedLocCodes = admin.branches.map(branch => branch.locCode);
        console.log(`   Allowed location codes: ${allowedLocCodes.join(', ')}`);
        
        // Check users in admin's branches
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        console.log(`\n2. Users found: ${users.length}`);
        
        if (users.length > 0) {
            console.log('   Sample user data:');
            const sampleUser = users[0];
            console.log(`   - Username: ${sampleUser.username}`);
            console.log(`   - Email: ${sampleUser.email}`);
            console.log(`   - LocCode: ${sampleUser.locCode}`);
            console.log(`   - WorkingBranch: ${sampleUser.workingBranch}`);
            console.log(`   - Designation: ${sampleUser.designation}`);
            console.log(`   - Training count: ${sampleUser.training.length}`);
            console.log(`   - Assessments count: ${sampleUser.assignedAssessments.length}`);
            console.log(`   - Modules count: ${sampleUser.assignedModules.length}`);
            
            // Check training data
            if (sampleUser.training.length > 0) {
                console.log('   - Training details:');
                sampleUser.training.forEach((training, index) => {
                    console.log(`     ${index + 1}. Pass: ${training.pass}, Status: ${training.status}`);
                });
            }
            
            // Check assessment data
            if (sampleUser.assignedAssessments.length > 0) {
                console.log('   - Assessment details:');
                sampleUser.assignedAssessments.forEach((assessment, index) => {
                    console.log(`     ${index + 1}. Pass: ${assessment.pass}, Complete: ${assessment.complete}, Status: ${assessment.status}`);
                });
            }
        }
        
        // Check training progress records
        const userIds = users.map(user => user._id);
        const trainingProgress = await TrainingProgress.find({ userId: { $in: userIds } });
        console.log(`\n3. Training progress records: ${trainingProgress.length}`);
        
        if (trainingProgress.length > 0) {
            console.log('   Sample training progress:');
            const sampleProgress = trainingProgress[0];
            console.log(`   - User ID: ${sampleProgress.userId}`);
            console.log(`   - Modules count: ${sampleProgress.modules.length}`);
            if (sampleProgress.modules.length > 0) {
                console.log(`   - First module videos count: ${sampleProgress.modules[0].videos.length}`);
                console.log(`   - First module videos with pass=true: ${sampleProgress.modules[0].videos.filter(v => v.pass).length}`);
            }
        }
        
        // Simulate the getTopUsers logic
        console.log('\n4. Simulating getTopUsers logic...');
        
        const scores = users.map((user) => {
            const completedTrainings = user.training.filter(t => t.pass).length;
            const totalTrainings = user.training.length;
            const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;

            const completedAssessments = user.assignedAssessments.filter(a => a.pass).length;
            const totalAssessments = user.assignedAssessments.length;
            const assessmentCompletion = user.assignedAssessments.reduce((sum, a) => sum + (a.complete || 0), 0);
            const assessmentProgress = totalAssessments > 0 ? (assessmentCompletion / totalAssessments) : 0;

            const completedModules = user.assignedModules.filter(m => m.pass).length;
            const totalModules = user.assignedModules.length;
            const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

            const totalScore = completedTrainings + completedAssessments + completedModules;

            return {
                username: user.username,
                email: user.email,
                branch: user.workingBranch,
                role: user.designation,
                completedTrainings,
                totalTrainings,
                trainingProgress,
                completedAssessments,
                totalAssessments,
                assessmentProgress,
                completedModules,
                totalModules,
                moduleProgress,
                totalScore,
                isExternal: false,
            };
        });
        
        console.log(`   Calculated scores for ${scores.length} users`);
        
        if (scores.length > 0) {
            console.log('   Sample scores:');
            scores.slice(0, 3).forEach((score, index) => {
                console.log(`   ${index + 1}. Username: ${score.username}, Total Score: ${score.totalScore}, Training: ${score.trainingProgress.toFixed(2)}%, Assessment: ${score.assessmentProgress.toFixed(2)}%`);
            });
        }
        
        // Sort by total score
        const sortedScores = scores.sort((a, b) => b.totalScore - a.totalScore);
        const topUsers = sortedScores.slice(0, 3);
        
        console.log('\n5. Top 3 users:');
        topUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username} - Score: ${user.totalScore} (Training: ${user.trainingProgress.toFixed(2)}%, Assessment: ${user.assessmentProgress.toFixed(2)}%)`);
        });
        
        console.log('\n=== END OF DEBUG ===\n');
        
    } catch (error) {
        console.error('Error debugging top performers:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

debugTopPerformers();

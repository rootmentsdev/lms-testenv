import mongoose from 'mongoose';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-testenv')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const debugTopPerformance = async () => {
    try {
        console.log('🔍 Debugging Top Performance Data...\n');

        // 1. Check if there are any admins
        const admins = await Admin.find().populate('branches');
        console.log(`📊 Found ${admins.length} admins:`);
        admins.forEach(admin => {
            console.log(`   - Admin: ${admin.name} (${admin.role})`);
            console.log(`   - Branches: ${admin.branches.length}`);
            admin.branches.forEach(branch => {
                console.log(`     * ${branch.workingBranch} (${branch.locCode})`);
            });
        });

        // 2. Check if there are any users
        const users = await User.find();
        console.log(`\n👥 Found ${users.length} users:`);
        if (users.length > 0) {
            users.slice(0, 5).forEach(user => {
                console.log(`   - User: ${user.username} (${user.empID})`);
                console.log(`   - Branch: ${user.workingBranch}`);
                console.log(`   - LocCode: ${user.locCode}`);
                console.log(`   - Training: ${user.training.length} (${user.training.filter(t => t.pass).length} completed)`);
                console.log(`   - Assessments: ${user.assignedAssessments.length} (${user.assignedAssessments.filter(a => a.pass).length} completed)`);
                console.log(`   - Modules: ${user.assignedModules.length} (${user.assignedModules.filter(m => m.pass).length} completed)`);
            });
        }

        // 3. Check if there are any branches
        const branches = await Branch.find();
        console.log(`\n🏢 Found ${branches.length} branches:`);
        branches.forEach(branch => {
            console.log(`   - Branch: ${branch.workingBranch} (${branch.locCode})`);
        });

        // 4. Check specific admin data (assuming first admin)
        if (admins.length > 0) {
            const admin = admins[0];
            console.log(`\n🔍 Debugging Admin: ${admin.name} (${admin.role})`);
            
            const allowedLocCodes = admin.branches.map(branch => branch.locCode);
            console.log(`   - Allowed Location Codes: ${allowedLocCodes.join(', ')}`);
            
            // Find users for this admin's branches
            const adminUsers = await User.find({ locCode: { $in: allowedLocCodes } });
            console.log(`   - Users in admin's branches: ${adminUsers.length}`);
            
            if (adminUsers.length > 0) {
                console.log(`   - Sample user data:`);
                const sampleUser = adminUsers[0];
                console.log(`     * ${sampleUser.username}: Training=${sampleUser.training.length}, Assessments=${sampleUser.assignedAssessments.length}`);
                
                // Calculate progress for this user
                const completedTrainings = sampleUser.training.filter(t => t.pass).length;
                const totalTrainings = sampleUser.training.length;
                const trainingProgress = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
                
                const completedAssessments = sampleUser.assignedAssessments.filter(a => a.pass).length;
                const totalAssessments = sampleUser.assignedAssessments.length;
                const assessmentProgress = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
                
                console.log(`     * Training Progress: ${completedTrainings}/${totalTrainings} (${trainingProgress.toFixed(2)}%)`);
                console.log(`     * Assessment Progress: ${completedAssessments}/${totalAssessments} (${assessmentProgress.toFixed(2)}%)`);
            }
        }

        // 5. Check if there's any training/assessment data
        const usersWithTraining = await User.find({ 'training.0': { $exists: true } });
        const usersWithAssessments = await User.find({ 'assignedAssessments.0': { $exists: true } });
        
        console.log(`\n📚 Data Summary:`);
        console.log(`   - Users with training: ${usersWithTraining.length}`);
        console.log(`   - Users with assessments: ${usersWithAssessments.length}`);
        
        if (usersWithTraining.length > 0) {
            const totalTraining = usersWithTraining.reduce((sum, user) => sum + user.training.length, 0);
            const completedTraining = usersWithTraining.reduce((sum, user) => sum + user.training.filter(t => t.pass).length, 0);
            console.log(`   - Total training assignments: ${totalTraining}`);
            console.log(`   - Completed training: ${completedTraining}`);
        }
        
        if (usersWithAssessments.length > 0) {
            const totalAssessments = usersWithAssessments.reduce((sum, user) => sum + user.assignedAssessments.length, 0);
            const completedAssessments = usersWithAssessments.reduce((sum, user) => sum + user.assignedAssessments.filter(a => a.pass).length, 0);
            console.log(`   - Total assessment assignments: ${totalAssessments}`);
            console.log(`   - Completed assessments: ${completedAssessments}`);
        }

    } catch (error) {
        console.error('❌ Error during debugging:', error);
    } finally {
        mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

debugTopPerformance();

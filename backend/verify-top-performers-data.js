import mongoose from 'mongoose';
import User from './model/User.js';
import TrainingProgress from './model/Trainingprocessschema.js';
import Admin from './model/Admin.js';
import Branch from './model/Branch.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');
    
    try {
        // Check the specific employees shown in your frontend
        const employeeNames = [
            'MUHAMMED JABIR',
            'JYOTHISH', 
            'KARTHIK MADHUSOODHANAN P V'
        ];
        
        console.log('=== VERIFYING TOP PERFORMERS DATA ===');
        console.log('Checking employees:', employeeNames);
        
        // Find these specific users
        const users = await User.find({ 
            username: { $in: employeeNames } 
        });
        
        console.log(`\nFound ${users.length} users in database:`);
        users.forEach(user => {
            console.log(`- ${user.username} (ID: ${user._id})`);
            console.log(`  Branch: ${user.workingBranch}`);
            console.log(`  LocCode: ${user.locCode}`);
        });
        
        if (users.length === 0) {
            console.log('\n❌ No users found with these names!');
            console.log('This suggests the data might be coming from external employees or there\'s a mismatch.');
            return;
        }
        
        // Check their training progress
        console.log('\n=== TRAINING PROGRESS DATA ===');
        for (const user of users) {
            console.log(`\n--- ${user.username} ---`);
            
            // Check TrainingProgress collection
            const trainingProgress = await TrainingProgress.find({ userId: user._id });
            console.log(`Training Progress Records: ${trainingProgress.length}`);
            
            if (trainingProgress.length > 0) {
                let totalTrainings = trainingProgress.length;
                let completedTrainings = trainingProgress.filter(t => t.pass).length;
                let trainingProgressPercent = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
                
                console.log(`  Total Trainings: ${totalTrainings}`);
                console.log(`  Completed Trainings: ${completedTrainings}`);
                console.log(`  Training Progress: ${trainingProgressPercent.toFixed(1)}%`);
                
                // Check modules
                let totalModules = 0;
                let completedModules = 0;
                trainingProgress.forEach(training => {
                    if (training.modules && training.modules.length > 0) {
                        totalModules += training.modules.length;
                        completedModules += training.modules.filter(m => m.pass).length;
                    }
                });
                
                if (totalModules > 0) {
                    let moduleProgress = (completedModules / totalModules) * 100;
                    console.log(`  Total Modules: ${totalModules}`);
                    console.log(`  Completed Modules: ${completedModules}`);
                    console.log(`  Module Progress: ${moduleProgress.toFixed(1)}%`);
                }
                
                // Show training details
                trainingProgress.forEach((training, index) => {
                    console.log(`  Training ${index + 1}: ${training.trainingName || 'Unknown'} - Pass: ${training.pass}`);
                    if (training.modules && training.modules.length > 0) {
                        console.log(`    Modules: ${training.modules.length} total, ${training.modules.filter(m => m.pass).length} completed`);
                    }
                });
            } else {
                console.log('  ❌ No training progress records found');
            }
            
            // Check assigned assessments
            console.log(`  Assigned Assessments: ${user.assignedAssessments?.length || 0}`);
            if (user.assignedAssessments && user.assignedAssessments.length > 0) {
                const completedAssessments = user.assignedAssessments.filter(a => a.pass).length;
                const assessmentProgress = (completedAssessments / user.assignedAssessments.length) * 100;
                console.log(`  Assessment Progress: ${assessmentProgress.toFixed(1)}%`);
            }
        }
        
        // Check if these might be external employees
        console.log('\n=== CHECKING FOR EXTERNAL EMPLOYEES ===');
        console.log('These names might be coming from external employee data...');
        
        // Check if there are any external employee records with these names
        // (This would require checking your external employee API or database)
        
        console.log('\n=== SUMMARY ===');
        console.log('If the displayed data shows:');
        console.log('- MUHAMMED JABIR: 25% Training Completed, 0% Assessment Score');
        console.log('- JYOTHISH: 0% Training Completed, 0% Assessment Score');
        console.log('- KARTHIK MADHUSOODHANAN P V: 0% Training Completed, 0% Assessment Score');
        
        console.log('\nThis suggests:');
        console.log('1. The backend fix is working (names are displaying)');
        console.log('2. But the training/assessment data calculation might need verification');
        console.log('3. Or these employees genuinely have low completion rates');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
});

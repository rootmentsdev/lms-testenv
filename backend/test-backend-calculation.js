// Test if backend calculation is reading updated data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';
import Admin from './model/Admin.js';
import User from './model/User.js';

dotenv.config();

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Simulate the exact backend calculation logic
async function testBackendCalculation() {
    try {
        await connectMongoDB();
        
        console.log('\n🧪 TESTING BACKEND CALCULATION WITH UPDATED DATA\n');
        console.log('================================================\n');
        
        // Simulate admin access (like in the backend)
        const adminId = '67bc02e686396dca5cd6b064';
        const admin = await Admin.findById(adminId);
        
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`👤 Admin: ${admin.name}`);
        console.log(`🏢 Admin branches: ${admin.branches?.length || 0}`);
        
        // Get users in admin's branches (simplified)
        const users = await User.find({});
        const userIDs = users.map(user => user._id);
        
        console.log(`👥 Users found: ${users.length}`);
        
        // Get training progress for these users (like backend does)
        const trainings = await TrainingProgress.find({ userId: { $in: userIDs } });
        
        console.log(`📚 Training progress records found: ${trainings.length}`);
        
        // Calculate completion percentage exactly like the backend
        const progressArray = trainings.map((training) => {
            if (!training.modules || !Array.isArray(training.modules)) {
                return 0;
            }

            const totalModules = training.modules.length;
            let completedModules = 0;
            
            training.modules.forEach((module) => {
                if (!module.videos || !Array.isArray(module.videos)) {
                    return;
                }
                
                const totalVideos = module.videos.length;
                const completedVideos = module.videos.filter(video => video.pass).length;
                
                // A module is completed only if module.pass = true AND all videos are completed
                if (module.pass && completedVideos === totalVideos && totalVideos > 0) {
                    completedModules++;
                }
            });

            const progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
            return progress;
        });
        
        // Calculate overall average progress
        let averageProgress = 0;
        if (progressArray.length > 0) {
            const totalProgress = progressArray.reduce((sum, progress) => sum + progress, 0);
            averageProgress = totalProgress / progressArray.length;
        }
        
        // Show detailed results
        console.log('\n📊 BACKEND CALCULATION RESULTS:');
        console.log('================================');
        console.log(`Total trainings processed: ${progressArray.length}`);
        console.log(`Progress array sample: [${progressArray.slice(0, 10).map(p => p.toFixed(2)).join(', ')}${progressArray.length > 10 ? '...' : ''}]`);
        console.log(`Sum of all progress: ${progressArray.reduce((sum, p) => sum + p, 0).toFixed(2)}`);
        console.log(`Average progress: ${averageProgress.toFixed(4)}%`);
        console.log(`Rounded average: ${Math.round(averageProgress)}%`);
        
        // Check if this matches our database update
        console.log('\n🎯 VERIFICATION:');
        console.log('=================');
        if (Math.abs(averageProgress - 25) < 5) {
            console.log('✅ SUCCESS! Backend calculation now shows ~25%');
            console.log(`   Expected: ~25%`);
            console.log(`   Actual: ${averageProgress.toFixed(2)}%`);
            console.log(`   Dashboard should show: ${Math.round(averageProgress)}%`);
        } else {
            console.log('❌ Backend calculation still shows low percentage');
            console.log(`   Expected: ~25%`);
            console.log(`   Actual: ${averageProgress.toFixed(2)}%`);
            console.log(`   This explains why dashboard shows 1%`);
        }
        
        // Show what the dashboard should display
        console.log('\n🎯 DASHBOARD EXPECTED DISPLAY:');
        console.log('===============================');
        console.log(`Training progress: ${Math.round(averageProgress)}%`);
        
        if (Math.round(averageProgress) > 1) {
            console.log('✅ Dashboard should now show a higher percentage!');
            console.log('   If still showing 1%, try refreshing the page');
        } else {
            console.log('❌ Dashboard showing 1% is correct - backend calculation is low');
            console.log('   Need to investigate why calculation is still low');
        }
        
    } catch (error) {
        console.error('❌ Error testing backend calculation:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testBackendCalculation();

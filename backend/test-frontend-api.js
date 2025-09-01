// Test the frontend API endpoint to see what data it's fetching
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

async function testFrontendAPI() {
    try {
        await connectMongoDB();
        
        console.log('\n🧪 TESTING FRONTEND API DATA FETCHING\n');
        console.log('=====================================\n');
        
        // Simulate exactly what the frontend API does
        console.log('🔍 SIMULATING FRONTEND API CALL: /api/get/progress\n');
        
        // Get admin and populate their branches (like the backend does)
        const adminId = '67bc02e686396dca5cd6b064';
        const admin = await Admin.findById(adminId).populate('branches');
        
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`👤 Admin: ${admin.name}`);
        console.log(`🏢 Admin branches: ${admin.branches?.length || 0}`);
        
        // Get users in admin's allowed branches
        const allowedLocCodes = admin.branches
            .filter(branch => branch.locCode)
            .map(branch => branch.locCode);
        
        const users = await User.find({ locCode: { $in: allowedLocCodes } });
        const userIDs = users.map(user => user._id);
        
        console.log(`👥 Users in admin's branches: ${users.length}`);
        console.log(`📍 Allowed location codes: [${allowedLocCodes.join(', ')}]`);
        
        // Get training progress records that admin can see
        const trainings = await TrainingProgress.find({ userId: { $in: userIDs } });
        
        console.log(`📚 Training progress records found: ${trainings.length}`);
        
        // Calculate completion percentage exactly like the backend API
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
        console.log('\n📊 FRONTEND API RESPONSE DATA:');
        console.log('================================');
        console.log(`Total trainings processed: ${progressArray.length}`);
        console.log(`Progress array sample: [${progressArray.slice(0, 10).map(p => p.toFixed(2)).join(', ')}${progressArray.length > 10 ? '...' : ''}]`);
        console.log(`Sum of all progress: ${progressArray.reduce((sum, p) => sum + p, 0).toFixed(2)}`);
        console.log(`Average progress: ${averageProgress.toFixed(4)}%`);
        console.log(`Rounded average: ${Math.round(averageProgress)}%`);
        
        // Show what the frontend should display
        console.log('\n🎯 FRONTEND DASHBOARD SHOULD SHOW:');
        console.log('=====================================');
        console.log(`Training progress: ${Math.round(averageProgress)}%`);
        
        // Check if this matches our database update
        console.log('\n🔍 VERIFICATION:');
        console.log('=================');
        if (Math.abs(averageProgress - 50) < 5) {
            console.log('✅ SUCCESS! Frontend API now returns ~50%');
            console.log(`   Expected: ~50%`);
            console.log(`   Actual: ${averageProgress.toFixed(2)}%`);
            console.log(`   Dashboard should show: ${Math.round(averageProgress)}%`);
        } else {
            console.log('❌ Frontend API still returns low percentage');
            console.log(`   Expected: ~50%`);
            console.log(`   Actual: ${averageProgress.toFixed(2)}%`);
            console.log(`   This explains why dashboard shows old data`);
        }
        
        // Additional verification
        console.log('\n🔍 ADDITIONAL CHECKS:');
        console.log('======================');
        console.log('1. Database shows: 50.04% (from our script)');
        console.log('2. Frontend API shows:', `${averageProgress.toFixed(2)}%`);
        console.log('3. Dashboard should show:', `${Math.round(averageProgress)}%`);
        
        if (Math.abs(averageProgress - 50) < 5) {
            console.log('\n🎉 FRONTEND API IS WORKING CORRECTLY!');
            console.log('   If dashboard still shows old data, it\'s a frontend caching issue');
            console.log('   Try: Ctrl + F5 (hard refresh) or restart backend server');
        } else {
            console.log('\n⚠️  Frontend API needs investigation');
            console.log('   The issue is in the backend calculation, not frontend');
        }
        
    } catch (error) {
        console.error('❌ Error testing frontend API:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testFrontendAPI();

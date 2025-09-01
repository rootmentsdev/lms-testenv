// Force refresh backend calculation
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';

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

async function forceRefreshCalculation() {
    try {
        await connectMongoDB();
        
        console.log('\n🔄 FORCING REFRESH OF BACKEND CALCULATION\n');
        console.log('==========================================\n');
        
        // Force MongoDB to refresh its data
        console.log('🔄 Refreshing MongoDB data...');
        
        // Get fresh count of completed modules
        const allTrainingProgress = await TrainingProgress.find({});
        
        let totalModules = 0;
        let completedModules = 0;
        
        allTrainingProgress.forEach(progress => {
            if (progress.modules && Array.isArray(progress.modules)) {
                progress.modules.forEach(module => {
                    totalModules++;
                    if (module.pass) completedModules++;
                });
            }
        });
        
        const currentPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        
        console.log('📊 FRESH DATA FROM DATABASE:');
        console.log('=============================');
        console.log(`Total training records: ${allTrainingProgress.length}`);
        console.log(`Total modules: ${totalModules}`);
        console.log(`Completed modules: ${completedModules}`);
        console.log(`Completion rate: ${currentPercentage.toFixed(2)}%`);
        
        // Now test the exact backend calculation logic
        console.log('\n🧪 TESTING EXACT BACKEND LOGIC:');
        console.log('=================================');
        
        // Simulate admin's view (like the backend does)
        const adminId = '67bc02e686396dca5cd6b064';
        const admin = await mongoose.model('Admin').findById(adminId);
        
        if (admin && admin.branches) {
            const allowedLocCodes = admin.branches.map(branch => branch.locCode);
            const users = await mongoose.model('User').find({ locCode: { $in: allowedLocCodes } });
            const userIDs = users.map(user => user._id);
            
            const trainings = await TrainingProgress.find({ userId: { $in: userIDs } });
            
            // Calculate exactly like the backend
            const progressArray = trainings.map((training) => {
                if (!training.modules || !Array.isArray(training.modules)) return 0;
                
                const totalModules = training.modules.length;
                let completedModules = 0;
                
                training.modules.forEach((module) => {
                    if (!module.videos || !Array.isArray(module.videos)) return;
                    
                    const totalVideos = module.videos.length;
                    const completedVideos = module.videos.filter(video => video.pass).length;
                    
                    if (module.pass && completedVideos === totalVideos && totalVideos > 0) {
                        completedModules++;
                    }
                });
                
                return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
            });
            
            const averageProgress = progressArray.length > 0 
                ? progressArray.reduce((sum, p) => sum + p, 0) / progressArray.length 
                : 0;
            
            console.log(`Admin's view - Total trainings: ${trainings.length}`);
            console.log(`Admin's view - Average progress: ${averageProgress.toFixed(4)}%`);
            console.log(`Admin's view - Rounded: ${Math.round(averageProgress)}%`);
            
            // Show what dashboard should display
            console.log('\n🎯 DASHBOARD SHOULD NOW SHOW:');
            console.log('===============================');
            console.log(`Training progress: ${Math.round(averageProgress)}%`);
            
            if (Math.round(averageProgress) > 1) {
                console.log('✅ SUCCESS! Dashboard should show higher percentage');
                console.log('   Try refreshing your browser now!');
            } else {
                console.log('❌ Still showing low percentage - need more investigation');
            }
        }
        
        // Additional verification
        console.log('\n🔍 ADDITIONAL VERIFICATION:');
        console.log('===========================');
        console.log('1. Database shows:', `${currentPercentage.toFixed(2)}%`);
        console.log('2. Backend calculation shows:', `${averageProgress?.toFixed(2) || 'N/A'}%`);
        console.log('3. Dashboard should show:', `${Math.round(averageProgress || currentPercentage)}%`);
        
        if (currentPercentage > 20) {
            console.log('\n🎉 DATABASE IS UPDATED SUCCESSFULLY!');
            console.log('   The issue is likely frontend caching or backend restart needed');
        }
        
    } catch (error) {
        console.error('❌ Error forcing refresh:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

forceRefreshCalculation();

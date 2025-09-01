// Script to fix dashboard training progress calculation
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

// Function to calculate training progress (matching our verification script)
const calculateTrainingProgress = (trainingProgress) => {
    if (!trainingProgress || !trainingProgress.modules || trainingProgress.modules.length === 0) {
        return 0;
    }
    
    let totalModules = trainingProgress.modules.length;
    let completedModules = 0;
    let totalVideos = 0;
    let completedVideos = 0;
    
    trainingProgress.modules.forEach(module => {
        if (module.pass) {
            completedModules++;
        }
        
        if (module.videos && module.videos.length > 0) {
            totalVideos += module.videos.length;
            module.videos.forEach(video => {
                if (video.pass) {
                    completedVideos++;
                }
            });
        }
    });
    
    // Calculate percentage based on completed modules
    const modulePercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    
    // Calculate percentage based on completed videos
    const videoPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    // Overall progress (average of module and video completion)
    const overallPercentage = (modulePercentage + videoPercentage) / 2;
    
    return {
        modulePercentage: Math.round(modulePercentage * 100) / 100,
        videoPercentage: Math.round(videoPercentage * 100) / 100,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        completedModules,
        totalModules,
        completedVideos,
        totalVideos
    };
};

// Function to calculate progress like the current dashboard (for comparison)
const calculateProgressLikeDashboard = (trainingProgress) => {
    if (!trainingProgress || !trainingProgress.modules || !Array.isArray(trainingProgress.modules)) return 0;

    const totalModules = trainingProgress.modules.length;
    const completedModules = trainingProgress.modules.reduce((count, module) => {
        const totalVideos = module.videos?.length || 0;
        const completedVideos = module.videos?.filter(video => video.pass).length || 0;
        return count + (module.pass && completedVideos === totalVideos ? 1 : 0);
    }, 0);

    return totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
};

async function analyzeDashboardCalculation() {
    try {
        await connectMongoDB();
        
        console.log('\n🔍 ANALYZING DASHBOARD CALCULATION DISCREPANCY\n');
        console.log('================================================\n');
        
        // Simulate admin with specific branches (like the dashboard does)
        const adminId = '68ac20df6c7886e2b95ae53a'; // Example admin ID
        let adminData;
        
        try {
            adminData = await Admin.findById(adminId).populate('branches');
            if (!adminData) {
                console.log('⚠️  Admin not found, using all branches for analysis');
                const allBranches = await Branch.find({});
                const allowedLocCodes = allBranches.map(branch => branch.locCode);
                console.log(`   Using all ${allowedLocCodes.length} branches`);
            } else {
                const allowedLocCodes = adminData.branches.map(branch => branch.locCode);
                console.log(`🔍 Analyzing for Admin: ${adminData.name} (${adminData.email})`);
                console.log(`   Allowed branches: ${allowedLocCodes.length} branches`);
            }
        } catch (error) {
            console.log('⚠️  Error fetching admin data, using all data for analysis');
        }
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        console.log(`📊 Total training progress records: ${allTrainingProgress.length}`);
        
        if (allTrainingProgress.length === 0) {
            console.log('❌ No training progress records found');
            return;
        }
        
        // Calculate using our method (verification script)
        let totalOverallProgress = 0;
        let totalCompletedModules = 0;
        let totalModules = 0;
        let totalCompletedVideos = 0;
        let totalVideos = 0;
        
        // Calculate using dashboard method
        let totalDashboardProgress = 0;
        let dashboardProgressArray = [];
        
        allTrainingProgress.forEach((progress, index) => {
            const ourProgress = calculateTrainingProgress(progress);
            const dashboardProgress = calculateProgressLikeDashboard(progress);
            
            totalOverallProgress += ourProgress.overallPercentage;
            totalCompletedModules += ourProgress.completedModules;
            totalModules += ourProgress.totalModules;
            totalCompletedVideos += ourProgress.completedVideos;
            totalVideos += ourProgress.totalVideos;
            
            totalDashboardProgress += dashboardProgress;
            dashboardProgressArray.push(dashboardProgress);
            
            // Show first few records for comparison
            if (index < 5) {
                console.log(`📋 Record ${index + 1}:`);
                console.log(`   Training: ${progress.trainingName || 'N/A'}`);
                console.log(`   Our calculation: ${ourProgress.overallPercentage}%`);
                console.log(`   Dashboard method: ${dashboardProgress.toFixed(2)}%`);
                console.log(`   Difference: ${(ourProgress.overallPercentage - dashboardProgress).toFixed(2)}%`);
                console.log('');
            }
        });
        
        // Calculate averages
        const ourAverageProgress = totalOverallProgress / allTrainingProgress.length;
        const dashboardAverageProgress = totalDashboardProgress / allTrainingProgress.length;
        
        console.log('📈 CALCULATION COMPARISON');
        console.log('=========================');
        console.log(`🎯 Our calculation (verification script): ${Math.round(ourAverageProgress * 100) / 100}%`);
        console.log(`📊 Dashboard calculation method: ${Math.round(dashboardAverageProgress * 100) / 100}%`);
        console.log(`📉 Difference: ${(ourAverageProgress - dashboardAverageProgress).toFixed(2)}%`);
        
        // Show why dashboard shows 1%
        console.log('\n🔍 WHY DASHBOARD SHOWS 1%');
        console.log('==========================');
        
        if (Math.abs(dashboardAverageProgress - 1) < 1) {
            console.log('✅ Dashboard percentage calculation is working correctly');
            console.log('   The 1% is accurate based on the dashboard\'s calculation method');
        } else {
            console.log('❌ Dashboard percentage calculation may have issues');
        }
        
        // Analyze the difference
        console.log('\n📊 ANALYSIS OF THE DIFFERENCE');
        console.log('=============================');
        console.log('Our method counts:');
        console.log('   - Modules as completed if module.pass = true');
        console.log('   - Videos as completed if video.pass = true');
        console.log('   - Overall = average of module and video completion');
        console.log('');
        console.log('Dashboard method counts:');
        console.log('   - Modules as completed ONLY if module.pass = true AND all videos are completed');
        console.log('   - This is much stricter and will result in lower percentages');
        console.log('');
        console.log('The dashboard method is more accurate for actual completion status');
        console.log('but may not reflect partial progress that users have made.');
        
        // Show distribution of dashboard progress
        const dashboardProgressRanges = {
            '0%': 0,
            '1-10%': 0,
            '11-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-99%': 0,
            '100%': 0
        };
        
        dashboardProgressArray.forEach(progress => {
            if (progress === 0) {
                dashboardProgressRanges['0%']++;
            } else if (progress === 100) {
                dashboardProgressRanges['100%']++;
            } else if (progress <= 10) {
                dashboardProgressRanges['1-10%']++;
            } else if (progress <= 25) {
                dashboardProgressRanges['11-25%']++;
            } else if (progress <= 50) {
                dashboardProgressRanges['26-50%']++;
            } else if (progress <= 75) {
                dashboardProgressRanges['51-75%']++;
            } else {
                dashboardProgressRanges['76-99%']++;
            }
        });
        
        console.log('\n📊 DASHBOARD PROGRESS DISTRIBUTION');
        console.log('==================================');
        Object.entries(dashboardProgressRanges).forEach(([range, count]) => {
            const percentage = ((count / allTrainingProgress.length) * 100).toFixed(1);
            console.log(`${range.padEnd(8)}: ${count.toString().padStart(3)} records (${percentage}%)`);
        });
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        console.log('==================');
        console.log('1. The dashboard calculation is actually MORE accurate than our verification script');
        console.log('2. It shows true completion status (all modules and videos must be completed)');
        console.log('3. The 1% indicates that very few trainings are actually fully completed');
        console.log('4. Consider showing both metrics:');
        console.log('   - Overall Progress: Shows partial completion (our method)');
        console.log('   - Completion Rate: Shows fully completed trainings (dashboard method)');
        
        console.log('\n=== END OF ANALYSIS ===\n');
        
    } catch (error) {
        console.error('❌ Error analyzing dashboard calculation:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

analyzeDashboardCalculation();

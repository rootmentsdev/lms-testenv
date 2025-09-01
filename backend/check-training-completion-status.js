// Script to check training completion status and identify why progress is 0%
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TrainingProgress from './model/Trainingprocessschema.js';
import Admin from './model/Admin.js';
import User from './model/User.js';
import Branch from './model/Branch.js';

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

async function analyzeTrainingProgress() {
    try {
        await connectMongoDB();
        
        console.log('\n🔍 ANALYZING TRAINING PROGRESS ISSUES\n');
        console.log('=====================================\n');
        
        // Get admin data to see which branches they can access
        const adminId = '67bc02e686396dca5cd6b064'; // From your logs
        const admin = await Admin.findById(adminId);
        
        if (!admin) {
            console.log('❌ Admin not found!');
            return;
        }
        
        console.log(`👤 Admin: ${admin.name}`);
        console.log(`🏢 Admin branches: ${admin.branches?.length || 0}\n`);
        
        // Get users in admin's branches (simplified approach)
        const users = await User.find({});
        console.log(`👥 Total users in system: ${users.length}`);
        
        // Get training progress for all users
        const trainingProgress = await TrainingProgress.find({});
        
        console.log(`📚 Total training progress records: ${trainingProgress.length}\n`);
        
        if (trainingProgress.length === 0) {
            console.log('❌ No training progress records found!');
            return;
        }
        
        // Analyze each training progress record
        let totalModules = 0;
        let completedModules = 0;
        let totalVideos = 0;
        let completedVideos = 0;
        let issues = [];
        let sampleRecords = [];
        
        console.log('📊 DETAILED ANALYSIS:\n');
        
        trainingProgress.forEach((progress, index) => {
            if (index < 5) { // Show first 5 records
                const record = {
                    trainingName: progress.trainingName || 'N/A',
                    userId: progress.userId,
                    trainingId: progress.trainingId,
                    overallPass: progress.pass,
                    modules: progress.modules?.length || 0,
                    moduleDetails: []
                };
                
                if (progress.modules && Array.isArray(progress.modules)) {
                    progress.modules.forEach((module, modIndex) => {
                        const moduleInfo = {
                            pass: module.pass,
                            videoCount: module.videos?.length || 0,
                            videosPassed: module.videos?.filter(v => v.pass).length || 0
                        };
                        
                        record.moduleDetails.push(moduleInfo);
                        
                        totalModules++;
                        if (module.pass) completedModules++;
                        
                        if (module.videos) {
                            totalVideos += module.videos.length;
                            completedVideos += module.videos.filter(v => v.pass).length;
                        }
                        
                        // Check for issues
                        if (module.pass && moduleInfo.videosPassed < moduleInfo.videoCount) {
                            issues.push(`Module ${modIndex + 1} marked as passed but videos incomplete`);
                        }
                        if (!module.pass && moduleInfo.videosPassed === moduleInfo.videoCount && moduleInfo.videoCount > 0) {
                            issues.push(`Module ${modIndex + 1} videos complete but module not marked as passed`);
                        }
                    });
                }
                
                sampleRecords.push(record);
            }
        });
        
        // Show sample records
        sampleRecords.forEach((record, index) => {
            console.log(`\n📋 Record ${index + 1}: ${record.trainingName}`);
            console.log(`   User ID: ${record.userId}`);
            console.log(`   Training ID: ${record.trainingId}`);
            console.log(`   Overall Pass: ${record.overallPass}`);
            console.log(`   Total Modules: ${record.modules}`);
            
            record.moduleDetails.forEach((module, modIndex) => {
                console.log(`     Module ${modIndex + 1}: Pass=${module.pass}, Videos=${module.videoCount}, Passed=${module.videosPassed}`);
            });
        });
        
        // Summary statistics
        console.log('\n📈 SUMMARY STATISTICS:');
        console.log('========================');
        console.log(`Total Modules: ${totalModules}`);
        console.log(`Completed Modules: ${completedModules}`);
        console.log(`Module Completion Rate: ${totalModules > 0 ? ((completedModules / totalModules) * 100).toFixed(2) : 0}%`);
        console.log(`Total Videos: ${totalVideos}`);
        console.log(`Completed Videos: ${completedVideos}`);
        console.log(`Video Completion Rate: ${totalVideos > 0 ? ((completedVideos / totalVideos) * 100).toFixed(2) : 0}%`);
        
        // Identify issues
        if (issues.length > 0) {
            console.log('\n⚠️  IDENTIFIED ISSUES:');
            console.log('=====================');
            issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS TO INCREASE PERCENTAGE:');
        console.log('==========================================');
        
        if (completedModules === 0) {
            console.log('1. 🚨 CRITICAL: No modules are marked as completed');
            console.log('   - Check if users are actually completing training');
            console.log('   - Verify training completion logic is working');
            console.log('   - Check if progress updates are being saved');
        }
        
        if (completedVideos === 0) {
            console.log('2. 🚨 CRITICAL: No videos are marked as completed');
            console.log('   - Check video completion tracking');
            console.log('   - Verify video progress is being saved');
        }
        
        if (totalModules > 0 && completedModules > 0) {
            const currentPercentage = (completedModules / totalModules) * 100;
            console.log(`3. 📊 Current progress: ${currentPercentage.toFixed(2)}%`);
            console.log(`   - To reach 10%: Need ${Math.ceil((totalModules * 0.1) - completedModules)} more modules completed`);
            console.log(`   - To reach 25%: Need ${Math.ceil((totalModules * 0.25) - completedModules)} more modules completed`);
        }
        
        console.log('\n4. 🔧 Technical Checks:');
        console.log('   - Verify training completion API endpoints');
        console.log('   - Check if progress updates are being saved to database');
        console.log('   - Verify user training completion workflow');
        
        console.log('\n5. 📝 Data Fixes:');
        console.log('   - Manually update some training progress for testing');
        console.log('   - Check if there are completed trainings not marked as passed');
        
        // Quick fix suggestions
        console.log('\n🚀 QUICK FIXES TO INCREASE PERCENTAGE:');
        console.log('=======================================');
        console.log('1. Update some training progress records manually in database');
        console.log('2. Mark some modules as completed (module.pass = true)');
        console.log('3. Mark some videos as completed (video.pass = true)');
        console.log('4. Check if training completion workflow is working');
        
    } catch (error) {
        console.error('❌ Error analyzing training progress:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

analyzeTrainingProgress();

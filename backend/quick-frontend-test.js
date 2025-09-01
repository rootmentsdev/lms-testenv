// Quick test to see what frontend should display
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

async function quickFrontendTest() {
    try {
        await connectMongoDB();
        
        console.log('\n🚀 QUICK FRONTEND TEST\n');
        console.log('======================\n');
        
        // Get all training progress records
        const allTrainingProgress = await TrainingProgress.find({});
        
        console.log(`📚 Total training records: ${allTrainingProgress.length}`);
        
        // Calculate overall completion rate
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
        
        const overallPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        
        console.log('\n📊 OVERALL SYSTEM STATUS:');
        console.log('==========================');
        console.log(`Total modules: ${totalModules}`);
        console.log(`Completed modules: ${completedModules}`);
        console.log(`Overall completion rate: ${overallPercentage.toFixed(2)}%`);
        
        // Show what the dashboard should display
        console.log('\n🎯 DASHBOARD EXPECTED DISPLAY:');
        console.log('===============================');
        console.log(`Training progress: ${Math.round(overallPercentage)}%`);
        
        if (Math.round(overallPercentage) >= 50) {
            console.log('\n🎉 SUCCESS! Database shows 50%+ completion');
            console.log('   If dashboard still shows old data:');
            console.log('   1. Try Ctrl + F5 (hard refresh)');
            console.log('   2. Restart backend server');
            console.log('   3. Check browser console for errors');
        } else {
            console.log('\n⚠️  Database still shows low percentage');
            console.log('   Need to investigate why updates didn\'t work');
        }
        
        // Test a few specific records to verify updates
        console.log('\n🔍 VERIFYING SPECIFIC RECORDS:');
        console.log('================================');
        
        const sampleRecords = allTrainingProgress.slice(0, 5);
        sampleRecords.forEach((record, index) => {
            const recordModules = record.modules?.length || 0;
            const completedRecordModules = record.modules?.filter(m => m.pass).length || 0;
            const recordPercentage = recordModules > 0 ? (completedRecordModules / recordModules) * 100 : 0;
            
            console.log(`Record ${index + 1}: ${record.trainingName || 'N/A'}`);
            console.log(`  - Modules: ${completedRecordModules}/${recordModules} (${recordPercentage.toFixed(1)}%)`);
        });
        
    } catch (error) {
        console.error('❌ Error in quick frontend test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

quickFrontendTest();

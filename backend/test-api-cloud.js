import mongoose from 'mongoose';
import User from './model/User.js';
import TrainingProgress from './model/Trainingprocessschema.js';
import { Training } from './model/Traning.js';

// Test the GetUserAllTrainings function with cloud database
async function testGetUserAllTrainingsCloud(empID) {
  try {
    console.log('🔍 Testing GetUserAllTrainings for empID:', empID);
    
    // Connect to cloud database
    const mongoUri = 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('✅ Cloud database connected');
    
    // 1. Find user based on empID
    const user = await User.findOne({ empID })
      .populate({
        path: 'training.trainingId',
      });

    if (!user) {
      console.log('❌ User not found for empID:', empID);
      return;
    }
    
    console.log('✅ User found:', {
      _id: user._id,
      username: user.username,
      empID: user.empID,
      designation: user.designation,
      trainingCount: user.training.length
    });

    // 2. Fetch all training progress using user ID
    const trainingProgress = await TrainingProgress.find({ userId: user._id });
    console.log('✅ Training progress found:', trainingProgress.length, 'records');

    // 3. Get user's role/designation for mandatory training filtering
    const userRole = user.designation || user.role || 'generalist';
    console.log('🔍 User role for mandatory training filtering:', userRole);

    // 4. Process assigned trainings (non-mandatory)
    const assignedTrainings = user.training
      .filter(training => {
        // Check if trainingId exists and is populated
        if (!training.trainingId) {
          console.log(`⚠️ Skipping training with null trainingId: ${training._id}`);
          return false;
        }
        
        const trainingType = training.trainingId.Trainingtype;
        const isMandatory = trainingType === 'Mandatory' || trainingType === 'mandatory';
        
        if (isMandatory) {
          console.log(`Skipping mandatory training "${training.trainingId.trainingName}" from assigned trainings`);
          return false;
        }
        
        return true;
      })
      .map(training => {
        const progress = trainingProgress.find(p => p.trainingId.toString() === training.trainingId._id.toString());

        if (!progress) {
          return {
            trainingId: training.trainingId._id,
            name: training.trainingId.trainingName || 'Unknown Training',
            completionPercentage: 0,
            type: 'assigned'
          };
        }

        let totalModules = 0;
        let completedModules = 0;
        let totalVideos = 0;
        let completedVideos = 0;

        progress.modules.forEach(module => {
          totalModules++;
          if (module.pass) completedModules++;

          module.videos.forEach(video => {
            totalVideos++;
            if (video.pass) completedVideos++;
          });
        });

        const moduleCompletionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        const videoCompletionPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
        const overallCompletionPercentage = (moduleCompletionPercentage + videoCompletionPercentage) / 2;

        return {
          trainingId: training.trainingId._id,
          name: training.trainingId.trainingName || 'Unknown Training',
          completionPercentage: overallCompletionPercentage.toFixed(2),
          type: 'assigned',
          totalModules,
          completedModules,
          totalVideos,
          completedVideos
        };
      })
      .filter(training => training !== null); // Remove null values

    console.log('✅ Assigned trainings processed:', assignedTrainings.length);

    // 5. Get mandatory trainings that are assigned to user's role
    const mandatoryTrainings = await Training.find({ 
      Trainingtype: 'Mandatory',
      Assignedfor: { $in: [userRole] }
    });

    console.log('✅ Mandatory trainings found for role:', userRole, mandatoryTrainings.length);

    console.log('✅ Test completed successfully - API should work now!');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testGetUserAllTrainingsCloud('Emp87');

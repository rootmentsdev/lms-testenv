

import TrainingProgress from "../model/Trainingprocessschema.js";  // Ensure the correct import path
import { Training } from "../model/Traning.js";


// Migration Logic: Move training progress from Assigned to Mandatory
export const migrateTrainingProgress = async () => {
  try {
    // Step 1: Find the "Assigned" training for "Foundation of Service"
    const assignedTraining = await Training.findOne({
      trainingName: "foundation of service", // Ensure the correct training name
      Trainingtype: "Assigned", // Ensure the correct type
    });

    if (!assignedTraining) {
      throw new Error('Assigned training for "Foundation of Service" not found.');
    }

    // Step 2: Find the "Mandatory" training for "Foundation of Service"
    const mandatoryTraining = await Training.findOne({
      trainingName: "foundation of service", // Ensure the correct training name
      Trainingtype: "Mandatory", // Ensure the correct type
    });

    if (!mandatoryTraining) {
      throw new Error('Mandatory training for "Foundation of Service" not found.');
    }

    // Step 3: Get the training IDs
    const assignedTrainingId = assignedTraining._id;
    const mandatoryTrainingId = mandatoryTraining._id;

    // Step 4: Update progress for users who completed the "Assigned" training
    const updatedProgress = await TrainingProgress.updateMany(
      { trainingId: assignedTrainingId, progress: 'completed' }, // Ensure we only update completed progress
      { $set: { trainingId: mandatoryTrainingId, Trainingtype: 'Mandatory' } } // Update to Mandatory training
    );

    if (updatedProgress.modifiedCount === 0) {
      console.log('No progress records were updated. Check if there are users who completed the "Assigned" training.');
    } else {
      console.log(`${updatedProgress.modifiedCount} progress records were moved to the "Mandatory" section.`);
    }

    // Step 5: Delete the "Assigned" training progress entries for completed users
    const deletedRecords = await TrainingProgress.deleteMany({
      trainingId: assignedTrainingId,
      progress: 'completed',
    });

    console.log(`${deletedRecords.deletedCount} "Assigned" progress records were deleted.`);

    console.log('Migration completed: Training progress moved from Assigned to Mandatory');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error; // Rethrow to handle it in server.js
  }
};

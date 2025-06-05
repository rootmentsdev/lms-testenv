// controllers/TrainingController.js

import TrainingProgress from '../model/Trainingprocessschema.js';

// Controller function for migrating the "Foundation of Service" training
export const migrateFoundationOfServiceTraining = async (req, res) => {
  try {
    // Step 1: Find users who have completed "Foundation of Service" training in the assigned section
    const usersWithAssignedTraining = await TrainingProgress.find({
      'trainingName': 'Foundation of Service',
      'section': 'Assigned',
      'status': 'Completed',
    }).populate('userId'); // Populate userId to easily access user data

    // Step 2: Migrate their completion data to the mandatory section
    for (let progress of usersWithAssignedTraining) {
      // Check if the training already exists in the mandatory section for this user
      const existingTraining = await TrainingProgress.findOne({
        userId: progress.userId._id,
        trainingName: 'Foundation of Service',
        section: 'Mandatory',
      });

      if (!existingTraining) {
        // Migrate training to mandatory section
        const mandatoryTrainingProgress = new TrainingProgress({
          userId: progress.userId._id,
          trainingName: 'Foundation of Service',
          section: 'Mandatory',
          status: 'Completed', // Training is marked as completed
          pass: progress.pass,
          deadline: progress.deadline, // Retaining the original deadline
          modules: progress.modules, // Copy the modules as they are
        });

        // Save the mandatory progress entry
        await mandatoryTrainingProgress.save();
      }

      // Step 3: Delete the duplicate "Foundation of Service" entry from the assigned section
      await TrainingProgress.deleteOne({
        userId: progress.userId._id,
        trainingName: 'Foundation of Service',
        section: 'Assigned',
      });
    }

    // Step 4: Return success response
    res.status(200).json({
      message: 'Successfully migrated the training from Assigned to Mandatory section and cleaned up duplicates.',
    });
  } catch (error) {
    console.error('Error migrating training progress:', error);
    res.status(500).json({
      message: 'Error during migration process.',
      error: error.message,
    });
  }
};

const TrainingProgress = require('../models/TrainingProgress'); // Adjust the path as needed

// Function to migrate "Foundation of Service" training from assigned to mandatory
const migrateFoundationTraining = async (req, res) => {
  try {
    // Step 1: Identify users who completed the "Foundation of Service" in the assigned section
    const assignedTraining = await TrainingProgress.find({
      trainingName: "Foundation of Service",
      section: "Assigned",
      status: "Completed"
    });

    // Step 2: Migrate data to mandatory section
    for (let user of assignedTraining) {
      // Check if the training exists in the mandatory section for this user
      const mandatoryTraining = await TrainingProgress.findOne({
        userId: user.userId,
        trainingName: "Foundation of Service",
        section: "Mandatory"
      });

      if (!mandatoryTraining) {
        // Migrate the training to the mandatory section if it doesn't already exist
        await TrainingProgress.create({
          userId: user.userId,
          trainingName: "Foundation of Service",
          section: "Mandatory",
          status: "Completed",
          progress: user.progress,
          score: user.score,
          completedDate: new Date()
        });
      }

      // Step 3: Delete the duplicate entry in the assigned section
      await TrainingProgress.deleteOne({
        userId: user.userId,
        trainingName: "Foundation of Service",
        section: "Assigned"
      });
    }

    // Send success response
    res.status(200).json({ message: "Training migration completed successfully." });
  } catch (err) {
    console.error("Migration error: ", err);
    res.status(500).json({ message: "Error during migration process." });
  }
};

module.exports = { migrateFoundationTraining };

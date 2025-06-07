import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Flexible models
const Training = mongoose.model('Training', new mongoose.Schema({}, { strict: false }), 'trainings');
const TrainingProgress = mongoose.model('TrainingProgress', new mongoose.Schema({}, { strict: false }), 'trainingprogresses');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let moved = 0, skipped = 0;

    // Step 1: Get Assigned and Mandatory training IDs by trainingName
    const all = await Training.find({
      trainingName: { $regex: /^foundation of service$/i }
    });

    if (all.length === 0) {
      console.log('❌ No "Foundation of Service" training found');
      return;
    }

    const assignedTraining = all.find(t => t.Trainingtype?.toLowerCase() === 'assigned');
    const mandatoryTraining = all.find(t => t.Trainingtype?.toLowerCase() === 'mandatory');

    if (!assignedTraining || !mandatoryTraining) {
      console.log('❌ Assigned or Mandatory version of "Foundation of Service" not found');
      return;
    }

    const assignedId = assignedTraining._id;
    const mandatoryId = mandatoryTraining._id;

    // Step 2: Get progresses from trainingprogresses where trainingId = assignedId
    const progresses = await TrainingProgress.find({
      trainingId: assignedId,
      status: { $regex: '^completed$', $options: 'i' }
    });

    if (progresses.length === 0) {
      console.log('⚠️ No completed progress records found for Assigned training');
      return;
    }

    // Step 3: Migrate each progress
    for (const progress of progresses) {
      const alreadyExists = await TrainingProgress.findOne({
        userId: progress.userId,
        trainingId: mandatoryId
      });

      if (!alreadyExists) {
        const newDoc = progress.toObject();
        delete newDoc._id;
        newDoc.trainingId = mandatoryId;

        // Create new document for the mandatory section
        await TrainingProgress.create(newDoc);
        moved++;
      } else {
        skipped++;
      }

      // Step 4: Delete old assigned progress
      await TrainingProgress.deleteOne({ _id: progress._id });
    }

    console.log(`✅ Migration complete: Inserted: ${moved}, Skipped: ${skipped}`);
  } catch (error) {
    console.error('❌ Error occurred during migration:', error);
  } finally {
    await mongoose.disconnect();
  }
})();






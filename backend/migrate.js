import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Update collection name to "trainingprogresses"
const TrainingProgress = mongoose.model('TrainingProgress', new mongoose.Schema({}, { strict: false }), 'trainingprogresses');
const Training = mongoose.model('Training', new mongoose.Schema({}, { strict: false }), 'trainings');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  let moved = 0, skipped = 0;

  // Step 1: Find all "Foundation of Service" trainings
  const allTrainings = await Training.find({ trainingName: { $regex: /^foundation of service$/i } });

  const assigned = allTrainings.find(t => t.Trainingtype?.toLowerCase() === 'assigned');
  const mandatory = allTrainings.find(t => t.Trainingtype?.toLowerCase() === 'mandatory');

  if (!assigned || !mandatory) {
    console.log('❌ Either Assigned or Mandatory version of "Foundation of Service" not found');
    return;
  }

  // Step 2: Fetch all progress entries for the Assigned training
  const progresses = await TrainingProgress.find({ trainingId: assigned._id });

  if (progresses.length === 0) {
    console.log('⚠️ No progress records found for the Assigned training');
    return;
  }

  for (const progress of progresses) {
    const exists = await TrainingProgress.findOne({
      userId: progress.userId,
      trainingId: mandatory._id
    });

    if (!exists) {
      const copy = progress.toObject();
      delete copy._id;
      copy.trainingId = mandatory._id;
      await TrainingProgress.create(copy);
      moved++;
    } else {
      skipped++;
    }

    await TrainingProgress.deleteOne({ _id: progress._id });
  }

  console.log(`✅ Migrated "Foundation of Service" => Inserted: ${moved}, Skipped: ${skipped}`);
  await mongoose.disconnect();
})();

// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

// // ✅ Update collection name to "trainingprogresses"
// const TrainingProgress = mongoose.model('TrainingProgress', new mongoose.Schema({}, { strict: false }), 'trainingprogresses');
// const Training = mongoose.model('Training', new mongoose.Schema({}, { strict: false }), 'trainings');

// (async () => {
//   await mongoose.connect(process.env.MONGODB_URI);
//   console.log('✅ Connected to MongoDB');

//   let moved = 0, skipped = 0;

//   // Step 1: Find all "Foundation of Service" trainings
//   const allTrainings = await Training.find({ trainingName: { $regex: /^foundation of service$/i } });

//   const assigned = allTrainings.find(t => t.Trainingtype?.toLowerCase() === 'assigned');
//   const mandatory = allTrainings.find(t => t.Trainingtype?.toLowerCase() === 'mandatory');

//   if (!assigned || !mandatory) {
//     console.log('❌ Either Assigned or Mandatory version of "Foundation of Service" not found');
//     return;
//   }

//   // Step 2: Fetch all progress entries for the Assigned training
//   const progresses = await TrainingProgress.find({ trainingId: assigned._id });

//   if (progresses.length === 0) {
//     console.log('⚠️ No progress records found for the Assigned training');
//     return;
//   }

//   for (const progress of progresses) {
//     const exists = await TrainingProgress.findOne({
//       userId: progress.userId,
//       trainingId: mandatory._id
//     });

//     if (!exists) {
//       const copy = progress.toObject();
//       delete copy._id;
//       copy.trainingId = mandatory._id;
//       await TrainingProgress.create(copy);
//       moved++;
//     } else {
//       skipped++;
//     }

//     await TrainingProgress.deleteOne({ _id: progress._id });
//   }

//   console.log(`✅ Migrated "Foundation of Service" => Inserted: ${moved}, Skipped: ${skipped}`);
//   await mongoose.disconnect();
// })();



// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

// // Flexible models
// const Training = mongoose.model('Training', new mongoose.Schema({}, { strict: false }), 'trainings');
// const TrainingProgress = mongoose.model('TrainingProgress', new mongoose.Schema({}, { strict: false }), 'trainingprogresses');

// (async () => {
//   await mongoose.connect(process.env.MONGODB_URI);
//   console.log('✅ Connected to MongoDB');

//   let moved = 0, skipped = 0;

//   // Step 1: Get Assigned and Mandatory training IDs by trainingName
//   const all = await Training.find({
//     trainingName: { $regex: /^foundation of service$/i }
//   });

//   const assignedTraining = all.find(t => t.Trainingtype?.toLowerCase() === 'assigned');
//   const mandatoryTraining = all.find(t => t.Trainingtype?.toLowerCase() === 'mandatory');

//   if (!assignedTraining || !mandatoryTraining) {
//     console.log('❌ Assigned or Mandatory version of "Foundation of Service" not found');
//     return;
//   }

//   const assignedId = assignedTraining._id;
//   const mandatoryId = mandatoryTraining._id;

//   // Step 2: Get progresses from trainingprogresses where trainingId = assignedId
//   const progresses = await TrainingProgress.find({
//     trainingId: assignedId,
//     status: { $regex: '^completed$', $options: 'i' }
//   });

//   if (progresses.length === 0) {
//     console.log('⚠️ No completed progress records found for Assigned training');
//     return;
//   }

//   // Step 3: Migrate each progress
//   for (const progress of progresses) {
//     const alreadyExists = await TrainingProgress.findOne({
//       userId: progress.userId,
//       trainingId: mandatoryId
//     });

//     if (!alreadyExists) {
//       const newDoc = progress.toObject();
//       delete newDoc._id;
//       newDoc.trainingId = mandatoryId;

//       await TrainingProgress.create(newDoc);
//       moved++;
//     } else {
//       skipped++;
//     }

//     // Step 4: Delete old assigned progress
//     await TrainingProgress.deleteOne({ _id: progress._id });
//   }

//   console.log(`✅ Migration complete: Inserted: ${moved}, Skipped: ${skipped}`);
//   await mongoose.disconnect();
// })();








// migrate.js (ES Module version)
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('rootments'); // Replace with your DB name
    const trainingProgresses = db.collection('trainingprogresses');
    const trainingCollection = db.collection('training');

    const assignedTraining = await trainingCollection.findOne({
      trainingName: { $regex: '^Foundation of Service$', $options: 'i' },
      Trainingtype: 'Assigned'
    });

    const mandatoryTraining = await trainingCollection.findOne({
      trainingName: { $regex: '^Foundation of Service$', $options: 'i' },
      Trainingtype: 'Mandatory'
    });

    if (!assignedTraining || !mandatoryTraining) {
      console.error('Either Assigned or Mandatory version of Foundation of Service not found.');
      return;
    }

    const assignedTrainingId = assignedTraining._id;
    const mandatoryTrainingId = mandatoryTraining._id;

    const progresses = await trainingProgresses.find({
      trainingId: assignedTrainingId,
      status: 'Completed'
    }).toArray();

    let migratedCount = 0;

    for (const progress of progresses) {
      const { userId } = progress;

      const exists = await trainingProgresses.findOne({
        userId,
        trainingId: mandatoryTrainingId
      });

      if (!exists) {
        await trainingProgresses.insertOne({
          ...progress,
          _id: new ObjectId(),
          trainingId: mandatoryTrainingId,
          migratedFrom: assignedTrainingId,
          migratedAt: new Date()
        });

        await trainingProgresses.deleteOne({ _id: progress._id });

        migratedCount++;
      }
    }

    console.log(`✅ Migrated ${migratedCount} users from assigned to mandatory.`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

run();

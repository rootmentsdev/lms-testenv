import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createMissingTrainingProgress() {
  try {
    await client.connect();
    const db = client.db("LMS");
    const users = db.collection("users");
    const trainings = db.collection("trainings");
    const trainingprogresses = db.collection("trainingprogresses");
    const modules = db.collection("modules");

    console.log('🔍 Starting migration to create missing TrainingProgress records...');

    // Find all users who have trainings assigned
    const usersWithTrainings = await users.find({
      "training": { $exists: true, $ne: [] }
    }).toArray();

    console.log(`📊 Found ${usersWithTrainings.length} users with assigned trainings`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const user of usersWithTrainings) {
      console.log(`\n👤 Processing user: ${user.username} (${user.empID})`);
      
      for (const userTraining of user.training) {
        const trainingId = userTraining.trainingId;
        
        // Check if TrainingProgress already exists for this user and training
        const existingProgress = await trainingprogresses.findOne({
          userId: user._id,
          trainingId: trainingId
        });

        if (existingProgress) {
          console.log(`  ✅ TrainingProgress already exists for training ${trainingId}`);
          skippedCount++;
          continue;
        }

        // Get the training details
        const training = await trainings.findOne({ _id: trainingId });
        if (!training) {
          console.log(`  ⚠️ Training ${trainingId} not found, skipping`);
          continue;
        }

        console.log(`  📚 Creating TrainingProgress for training: ${training.trainingName}`);

        // Get module details with videos
        const moduleDetails = [];
        for (const moduleId of training.modules) {
          const module = await modules.findOne({ _id: moduleId });
          if (module) {
            moduleDetails.push(module);
          }
        }

        // Create TrainingProgress record
        const trainingProgress = {
          userId: user._id,
          trainingId: trainingId,
          trainingName: training.trainingName,
          deadline: userTraining.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          pass: false,
          status: 'Pending',
          modules: moduleDetails.map(module => ({
            moduleId: module._id,
            pass: false,
            videos: (module.videos || []).map(video => ({
              videoId: video._id || video,
              pass: false,
              watchTime: 0,
              totalDuration: 0,
              watchPercentage: 0
            }))
          }))
        };

        await trainingprogresses.insertOne(trainingProgress);
        console.log(`  ✅ Created TrainingProgress for ${training.trainingName} with ${moduleDetails.length} modules`);
        createdCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Created: ${createdCount} TrainingProgress records`);
    console.log(`📊 Skipped: ${skippedCount} (already existed)`);
    console.log(`📊 Total processed: ${createdCount + skippedCount}`);

  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await client.close();
  }
}

// Run the migration
createMissingTrainingProgress();

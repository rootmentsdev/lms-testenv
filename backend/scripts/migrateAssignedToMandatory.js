
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrateTraining() {
  try {
    await client.connect();
    const db = client.db("LMS");
    const trainingprogresses = db.collection("trainingprogresses");

    const assignedCompleted = await trainingprogresses.find({
      trainingName: "Foundation of Service",
      trainingType: "Assigned",
      status: "Completed"
    }).toArray();

    for (const record of assignedCompleted) {
      const alreadyExists = await trainingprogresses.findOne({
        userId: record.userId,
        trainingName: "Foundation of Service",
        trainingType: "Mandatory"
      });

      if (!alreadyExists) {
        const mandatoryCopy = {
          ...record,
          _id: new ObjectId(),
          trainingType: "Mandatory"
        };
        await trainingprogresses.insertOne(mandatoryCopy);
      }

      await trainingprogresses.deleteOne({ _id: record._id });
    }

    console.log("✅ Migration complete.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

migrateTraining();

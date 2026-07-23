import mongoose from 'mongoose';

async function inspectSalesDb() {
  try {
    const mongoUri = "mongodb+srv://rootmentsdev:Gg8jA35x6w!e%23F7@cluster0.hsg48.mongodb.net/lms?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Look for sales / shoes / shirts collections
    for (const c of collections) {
      if (c.name.toLowerCase().includes("sale") || c.name.toLowerCase().includes("shoe") || c.name.toLowerCase().includes("shirt") || c.name.toLowerCase().includes("product")) {
        const sample = await db.collection(c.name).find({}).limit(3).toArray();
        console.log(`\nCollection "${c.name}" (${sample.length} sample items):`);
        if (sample.length > 0) {
          console.log("Sample 0:", JSON.stringify(sample[0], null, 2));
        }
      }
    }

  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectSalesDb();

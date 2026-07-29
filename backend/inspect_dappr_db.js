import mongoose from 'mongoose';

async function inspectDappr() {
  try {
    const mongoUri = "mongodb+srv://rootmentsdev:Gg8jA35x6w!e%23F7@cluster0.hsg48.mongodb.net/lms?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    const dapprColl = collections.find(c => c.name.toLowerCase().includes("dappr"));
    if (dapprColl) {
      const docs = await db.collection(dapprColl.name).find({}).toArray();
      console.log(`\nFound ${docs.length} docs in "${dapprColl.name}":`);
      console.log(JSON.stringify(docs, null, 2));
    } else {
      console.log("No dappr collection found");
    }

  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectDappr();

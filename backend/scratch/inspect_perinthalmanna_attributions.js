import mongoose from 'mongoose';

async function run() {
  const mongoUri = "mongodb+srv://rootmentsdev:Gg8jA35x6w!e%23F7@cluster0.hsg48.mongodb.net/lms?retryWrites=true&w=majority";
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const storeName = "G.Perinthalmanna";
  const month = "July";
  const year = 2026;
  const week = 1; // let's find all weeks

  console.log(`--- Dappr Attributions for ${storeName} in ${month} ${year} ---`);
  const dappr = await db.collection("dapprattributions").find({ storeName, month, year }).toArray();
  console.log(JSON.stringify(dappr, null, 2));

  console.log(`\n--- Customization Attributions for ${storeName} in ${month} ${year} ---`);
  const cust = await db.collection("customizationattributions").find({ storeName, month, year }).toArray();
  console.log(JSON.stringify(cust, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);

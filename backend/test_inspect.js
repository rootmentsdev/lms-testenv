import mongoose from 'mongoose';

async function checkWalkinAndEmpData() {
  try {
    const mongoUri = "mongodb+srv://rootmentsdev:Gg8jA35x6w!e%23F7@cluster0.hsg48.mongodb.net/lms?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB lms database!");

    const db = mongoose.connection.db;

    // Check Walkins collection sample
    const walkins = await db.collection("walkins").find({}).limit(2).toArray();
    console.log(`\nWalkins count sample (${walkins.length}):`);
    if (walkins.length > 0) {
      console.log("Walkin sample 0:", JSON.stringify(walkins[0], null, 2));
    }

    // Print all user names for SG.Perinthalmanna (loc 16)
    const storeUsers = await db.collection("users").find({ workingBranch: { $regex: /perinthalmanna/i } }).toArray();
    console.log(`\nUsers registered for Perinthalmanna (${storeUsers.length}):`);
    storeUsers.forEach(u => {
      console.log(`- username: "${u.username}", empID: "${u.empID}", email: "${u.email}", role: "${u.role}"`);
    });

  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

checkWalkinAndEmpData();

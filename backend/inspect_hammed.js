import mongoose from 'mongoose';

async function inspectHammed() {
  try {
    const mongoUri = "mongodb+srv://rootmentsdev:Gg8jA35x6w!e%23F7@cluster0.hsg48.mongodb.net/lms?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const users = await db.collection("users").find({ username: { $regex: /hammed/i } }).toArray();
    console.log("Users matching 'hammed':", users.map(u => ({ username: u.username, role: u.role, workingBranch: u.workingBranch })));

  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectHammed();

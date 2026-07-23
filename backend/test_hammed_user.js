import mongoose from 'mongoose';

async function testUser() {
  try {
    const mongoUri = "mongodb+srv://rootmentsdev:Gg8jA35x6w!e%23F7@cluster0.hsg48.mongodb.net/lms?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const users = await db.collection("users").find({}).toArray();
    console.log(`Total users: ${users.length}`);
    users.forEach(u => {
      if (u.username && (u.username.toLowerCase().includes("hammed") || u.username.toLowerCase().includes("ajal") || u.username.toLowerCase().includes("krishna"))) {
        console.log(`User: ${u.username}, role: ${u.role}, workingBranch: "${u.workingBranch}"`);
      }
    });

  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testUser();

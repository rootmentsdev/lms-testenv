import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://abhijithgkaimal0240_db_user:JrFuLL0YdZW0XCcK@cluster0.utxjdfx.mongodb.net/?appName=Cluster0";

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const usersCol = db.collection('users');

    const vbUser = await usersCol.findOne({ username: 'MUHAMMED ASLAM VB' });
    console.log("VB User:", vbUser);

    // Re-insert Mohamed Aslam A S
    const existingAS = await usersCol.findOne({ username: 'Mohamed Aslam A S' });
    if (!existingAS) {
      const newUser = {
        _id: new mongoose.Types.ObjectId('6a2002983b2846f333690344'),
        username: 'Mohamed Aslam A S',
        workingBranch: 'G.Chavakkad'
      };
      await usersCol.insertOne(newUser);
      console.log("Re-inserted Mohamed Aslam A S user!");
    } else {
      console.log("Mohamed Aslam A S already exists.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();

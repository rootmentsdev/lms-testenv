import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = 'mongodb+srv://abhijithgkaimal0240_db_user:JrFuLL0YdZW0XCcK@cluster0.utxjdfx.mongodb.net/?appName=Cluster0';

await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
console.log('Connected to DB:', mongoose.connection.db.databaseName);

const branches = await mongoose.connection.db
  .collection('branches')
  .find({ workingBranch: /perinthalmanna/i })
  .project({ workingBranch: 1, locCode: 1 })
  .toArray();

console.log('G.Perinthalmanna branches:');
console.log(JSON.stringify(branches, null, 2));
await mongoose.disconnect();
process.exit(0);

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const db = mongoose.connection.db;

  // Let's find MUHAMMED JASIR. V in users
  const user = await db.collection('users').findOne({ empID: 'EMP104' });
  console.log('User record:', JSON.stringify(user, null, 2));

  // Let's find if there's any admin record matching email or EmpId
  const admins = await db.collection('admins').find({}).toArray();
  console.log('All admins in DB:');
  console.log(JSON.stringify(admins, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);

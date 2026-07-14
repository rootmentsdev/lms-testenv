import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const branch = await db.collection('branches').findOne({ workingBranch: 'G-Trivandrum' });
    console.log('Branch details:', branch);

    await mongoose.disconnect();
}

main().catch(console.error);

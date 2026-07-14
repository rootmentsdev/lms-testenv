import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const doc = await db.collection('walkins').findOne({ _id: new mongoose.Types.ObjectId('6a43bf26e30e6ea6b98abf6d') });
    console.log('Amit doc:', doc);

    await mongoose.disconnect();
}

main().catch(console.error);

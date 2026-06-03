import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const admins = await db.collection('admins').find({}).toArray();
        console.log(`Total documents in 'admins' collection: ${admins.length}`);
        console.log(JSON.stringify(admins, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

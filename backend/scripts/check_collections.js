import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections in database:');
        for (const col of collections) {
            console.log(`- ${col.name}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

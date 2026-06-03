import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('\n--- Admins Collection documents ---');
        const admins = await db.collection('admins').find({}).toArray();
        console.log(JSON.stringify(admins, null, 2));

        console.log('\n--- Users Collection documents ---');
        const users = await db.collection('users').find({}).toArray();
        console.log(JSON.stringify(users, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

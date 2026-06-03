import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../model/Branch.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const branches = await Branch.find().lean();
        console.log('Branches in db:');
        console.log(JSON.stringify(branches, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();

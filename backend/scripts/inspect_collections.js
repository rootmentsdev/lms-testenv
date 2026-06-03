import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('No MONGODB_URI found in environment variables');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(mongoUri);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\nAvailable Collections:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name} (${count} documents)`);
        }

        // Search for collections with "employee" or similar names
        const targets = collections.filter(c => c.name.toLowerCase().includes('employee') || c.name.toLowerCase().includes('walkin') || c.name.toLowerCase().includes('import'));
        
        for (const target of targets) {
            console.log(`\n--- Sample from "${target.name}" ---`);
            const docs = await db.collection(target.name).find().limit(3).toArray();
            console.log(JSON.stringify(docs, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

run();

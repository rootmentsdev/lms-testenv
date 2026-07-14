import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'walkincamerachecks');

    if (collectionExists) {
        const indexes = await db.collection('walkincamerachecks').indexes();
        console.log('Current Indexes:', indexes);
        const indexToDrop = indexes.find(idx => idx.name === 'date_1_storeId_1_statusKey_1_timeDuration_1');
        if (indexToDrop) {
            console.log('Dropping unique index...');
            await db.collection('walkincamerachecks').dropIndex('date_1_storeId_1_statusKey_1_timeDuration_1');
            console.log('Index dropped successfully!');
        } else {
            console.log('Unique index date_1_storeId_1_statusKey_1_timeDuration_1 not found.');
        }
    } else {
        console.log('Collection walkincamerachecks does not exist.');
    }

    await mongoose.disconnect();
}

main().catch(console.error);

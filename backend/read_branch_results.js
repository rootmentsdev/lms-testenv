import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const doc = await db.collection('storetargets').findOne({ storeName: "All" });
    console.log('--- ALL RECORD ---');
    console.log(JSON.stringify(doc, null, 2));

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
});

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Walkin from './model/Walkin.js';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected');

    const start = new Date("2026-07-09T08:15:00Z");
    const end = new Date("2026-07-09T08:15:10Z");

    const walkins = await Walkin.find({
        updatedAt: { $gte: start, $lte: end }
    });

    console.log(`Found ${walkins.length} walk-ins updated in the window:`);
    for (const w of walkins) {
        console.log(`- ID: ${w._id}, Name: ${w.customerName}, Contact: ${w.contact}, Status: ${w.status}, Store: ${w.store}`);
        console.log('  StatusHistory:', JSON.stringify(w.statusHistory, null, 2));
    }

    await mongoose.disconnect();
}

main().catch(console.error);

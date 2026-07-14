import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Walkin from '../model/Walkin.js';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected');

    // Find RASHID's walkin by contact number
    const walkins = await Walkin.find({
        contact: { $in: ['9497084338', '+919497084338', '919497084338'] }
    });

    console.log(`Found ${walkins.length} walkin(s) for 9497084338`);

    for (const w of walkins) {
        console.log(`\nWalkin ID: ${w._id}`);
        console.log(`  Current status: ${w.status}`);
        console.log(`  rentalStatus: ${w.rentalStatus}`);
        console.log(`  StatusHistory (${w.statusHistory.length} entries):`);

        if (!w.statusHistory || w.statusHistory.length === 0) {
            console.log('  No statusHistory found, skipping.');
            continue;
        }

        // Get the latest statusHistory entry
        const sorted = [...w.statusHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestEntry = sorted[0];
        console.log(`  Latest history entry: status='${latestEntry.status}' | date=${latestEntry.date} | source=${latestEntry.source}`);

        if (w.status === latestEntry.status) {
            console.log(`  ✅ Status already matches latest history. No fix needed.`);
            continue;
        }

        // Fix: set status to match the latest statusHistory entry
        await Walkin.collection.updateOne(
            { _id: w._id },
            { $set: { status: latestEntry.status } }
        );
        console.log(`  ✅ Fixed: status updated from '${w.status}' → '${latestEntry.status}'`);
    }

    await mongoose.disconnect();
    console.log('\nDone.');
}

main().catch(console.error);

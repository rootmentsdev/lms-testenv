import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    // Count walkins with store matching different strings
    const cnt1 = await db.collection('walkins').countDocuments({ store: 'Edappally Dapper Squad' });
    const cnt2 = await db.collection('walkins').countDocuments({ store: /dapper/i });
    const cnt3 = await db.collection('walkins').countDocuments({ store: /dappr/i });
    
    console.log('Edappally Dapper Squad Count:', cnt1);
    console.log('Any dapper match Count:', cnt2);
    console.log('Any dappr match Count:', cnt3);

    // Let's print some of these documents
    const sample = await db.collection('walkins').find({ store: /dapper/i }).limit(5).toArray();
    console.log('Sample documents matching /dapper/i:');
    sample.forEach(s => {
        console.log(`- ID: ${s._id}, store: "${s.store}", storeId: ${s.storeId}, customerName: "${s.customerName}", createdAt: ${s.createdAt}`);
    });

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(console.error);

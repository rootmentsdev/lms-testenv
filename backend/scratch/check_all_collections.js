import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function checkAllCollections() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  for (const col of collections) {
    const records = await db.collection(col.name).find({
      $or: [
        { name: { $regex: /shan|shamil|shabir|faris|basil/i } },
        { username: { $regex: /shan|shamil|shabir|faris|basil/i } },
        { staffName: { $regex: /shan|shamil|shabir|faris|basil/i } },
        { bookingBy: { $regex: /shan|shamil|shabir|faris|basil/i } }
      ]
    }).limit(10).toArray();

    if (records.length > 0) {
      console.log(`\n=== Collection: ${col.name} (${records.length} matches) ===`);
      records.forEach(r => {
        console.log(`ID: ${r._id} | name: "${r.name || r.username || r.staffName || r.bookingBy}" | empID: "${r.empID || r.EmpId || r.employeeId || r.empCode}"`);
      });
    }
  }

  process.exit(0);
}

checkAllCollections();

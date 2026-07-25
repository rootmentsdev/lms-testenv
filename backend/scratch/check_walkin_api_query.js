import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';
import Admin from '../model/Admin.js';
import { buildWalkinFilter } from '../lib/permissions.js';
import { getISTRangeBetween } from '../utils/dateRange.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Find the "Rivas" admin (seen in screenshot)
  const admins = await Admin.find({}).select('_id name username role').lean();
  console.log('All admins (first 10):');
  admins.slice(0, 10).forEach(a => {
    console.log(`  _id: ${a._id} | name: "${a.name || a.username}" | role: ${a.role}`);
  });

  // Find Rivas specifically
  const rivasAdmin = admins.find(a => 
    (a.name && a.name.toLowerCase().includes('rivas')) ||
    (a.username && a.username.toLowerCase().includes('rivas'))
  );

  if (!rivasAdmin) {
    console.log('\n⚠️  "Rivas" admin not found. Using first super_admin...');
  }

  const testAdmin = rivasAdmin || admins.find(a => a.role === 'super_admin') || admins[0];
  console.log(`\nTesting with admin: "${testAdmin.name || testAdmin.username}" (role: ${testAdmin.role})`);

  // Simulate TY MTD walkin query
  const tyStart = '2026-07-01';
  const tyEnd = '2026-07-25';

  const { startUTC, nextDayStartUTC } = getISTRangeBetween(tyStart, tyEnd);
  console.log(`\nTY MTD date range:`);
  console.log(`  startUTC: ${startUTC.toISOString()}`);
  console.log(`  nextDayStartUTC: ${nextDayStartUTC.toISOString()}`);

  const baseQuery = { createdAt: { $gte: startUTC, $lt: nextDayStartUTC } };
  const secureQuery = await buildWalkinFilter(testAdmin._id.toString(), baseQuery);

  console.log('\nSecure query:', JSON.stringify(secureQuery, null, 2));

  const count = await Walkin.countDocuments(secureQuery);
  console.log(`\nWalkin count with buildWalkinFilter: ${count}`);

  if (count === 0) {
    console.log('\n⚠️  buildWalkinFilter is restricting walkins to 0!');
    // Test without RBAC
    const rawCount = await Walkin.countDocuments(baseQuery);
    console.log(`Raw count (no RBAC): ${rawCount}`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

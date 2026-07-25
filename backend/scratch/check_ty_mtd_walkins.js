import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';

const mongoUri = process.env.MONGODB_URI;

function getISTDateStr(date) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  const y = istDate.getUTCFullYear();
  const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(istDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB\n');

  // TY MTD = July 2026: 2026-07-01 to 2026-07-25
  const tyStart = '2026-07-01';
  const tyEnd = '2026-07-25';

  // Fetch all walkins from DB (no date filter)
  const allWalkins = await Walkin.find({}).select('createdAt store storeId').lean();
  console.log(`Total walkins in DB: ${allWalkins.length}`);

  // Find walkins in TY MTD range (2026-07-01 to 2026-07-25)
  const tyWalkins = allWalkins.filter(w => {
    const raw = w.createdAt;
    if (!raw) return false;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return false;
    const ymd = getISTDateStr(d);
    return ymd >= tyStart && ymd <= tyEnd;
  });

  console.log(`TY MTD (${tyStart} to ${tyEnd}) walkins: ${tyWalkins.length}`);

  if (tyWalkins.length > 0) {
    console.log('\nSample TY walkins (first 5):');
    tyWalkins.slice(0, 5).forEach(w => {
      console.log(`  createdAt: ${w.createdAt} | store: "${w.store}" | storeId: "${w.storeId}"`);
    });

    // Group by store
    const storeCounts = {};
    tyWalkins.forEach(w => {
      const key = w.store || '(no store)';
      storeCounts[key] = (storeCounts[key] || 0) + 1;
    });
    console.log('\nTY MTD walkins grouped by store:');
    Object.entries(storeCounts).sort((a, b) => b[1] - a[1]).forEach(([store, count]) => {
      console.log(`  "${store}": ${count}`);
    });
  } else {
    console.log('\n⚠️  NO TY MTD (2026) walkins found!');
    console.log('Checking latest createdAt dates to understand data range...\n');

    const latestWalkins = await Walkin.find({}).sort({ createdAt: -1 }).limit(5).select('createdAt store').lean();
    console.log('Latest 5 walkins in DB:');
    latestWalkins.forEach(w => {
      console.log(`  createdAt: ${w.createdAt} (IST: ${getISTDateStr(new Date(w.createdAt))}) | store: "${w.store}"`);
    });
  }

  // Also check branches
  const branches = await Branch.find({}).select('workingBranch _id').lean();
  console.log(`\nTotal branches in DB: ${branches.length}`);
  branches.slice(0, 5).forEach(b => {
    console.log(`  Branch: "${b.workingBranch}" | _id: ${b._id}`);
  });

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

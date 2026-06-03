import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';

function locationKey(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function resolveBranch(rawStore, branches) {
  const input = String(rawStore || '').trim();
  const normalizedInput = locationKey(input);
  const direct = branches.find((b) => locationKey(b.workingBranch) === normalizedInput || String(b.locCode) === input);
  if (direct) return direct;

  const aliases = [
    ['edappally', 'ZORUCCI Edappally'],
    ['edappal', 'ZORUCCI Edappal'],
    ['perinthalmanna', 'ZORUCCI Perinthalmanna'],
    ['kottakkal', 'ZORUCCI Kottakkal'],
    ['kochi', 'GROOMS Kochi'],
    ['calicut', 'GROOMS Calicut'],
    ['trivandrum', 'GROOMS Trivandrum'],
    ['kottayam', 'GROOMS Kottayam'],
    ['perumbavoor', 'GROOMS Perumbavoor'],
    ['thrissur', 'GROOMS Thrissur'],
    ['chavakkad', 'GROOMS Chavakkad'],
    ['kozhikode', 'GROOMS Kozhikode'],
    ['vatakara', 'GROOMS Vatakara'],
    ['manjery', 'GROOMS Manjery'],
    ['palakkad', 'GROOMS Palakkad'],
    ['kalpetta', 'GROOMS Kalpetta'],
    ['kannur', 'GROOMS Kannur'],
  ];

  const hit = aliases.find(([needle]) => normalizedInput.includes(needle));
  if (!hit) return null;
  return branches.find((b) => locationKey(b.workingBranch) === locationKey(hit[1])) || null;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const branches = await Branch.find({ isActive: true }).select('_id workingBranch locCode').lean();
  const docs = await Walkin.find({}).select('_id store storeId').lean();

  let updated = 0;
  for (const doc of docs) {
    const branch = await resolveBranch(doc.store, branches);
    if (!branch) continue;
    const nextStore = branch.workingBranch;
    const nextStoreId = branch._id;
    const currentStore = String(doc.store || '');
    const currentStoreId = String(doc.storeId || '');
    if (currentStore !== nextStore || currentStoreId !== String(nextStoreId)) {
      await Walkin.updateOne(
        { _id: doc._id },
        { $set: { store: nextStore, storeId: nextStoreId } }
      );
      updated += 1;
    }
  }

  console.log(`Normalized ${updated} walk-in store names to branch names.`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Failed to normalize walk-in stores:', error);
  process.exit(1);
});

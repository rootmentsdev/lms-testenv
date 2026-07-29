import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';

import Walkin from './model/Walkin.js';
import Branch from './model/Branch.js';

function norm(str) {
  if (!str) return "";
  return String(str).toLowerCase().trim().replace(/\s+/g, " ");
}

function isHiddenBranch(name) {
  const normalized = norm(name);
  const nonSalesBranches = ["office", "production", "warehouse"];
  if (nonSalesBranches.includes(normalized)) return true;
  if (normalized.startsWith("test ") || normalized.startsWith("test")) {
    const afterTest = normalized.replace(/^test\s*/, "").trim();
    if (afterTest.length > 0) return true;
  }
  return (
    normalized === norm("Suitor Guy Kochi") ||
    normalized === norm("GROOMS Kochi") ||
    normalized === norm("Grooms Kochi") ||
    normalized === norm("Suitor Guy Calicut") ||
    normalized === norm("GROOMS Calicut") ||
    normalized === norm("Grooms Calicut")
  );
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
  
  try {
    const startDate = '2026-07-01';
    const endDate = '2026-07-13';
    
    const walkins = await Walkin.find().lean();
    console.log(`Total walkins in DB: ${walkins.length}`);
    
    const matchedWalkins = walkins.filter(w => {
      if (!w.createdAt) return false;
      const d = new Date(w.createdAt);
      if (isNaN(d.getTime())) return false;
      const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
      const y = istDate.getUTCFullYear();
      const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
      const dayStr = String(istDate.getUTCDate()).padStart(2, '0');
      const ymd = `${y}-${m}-${dayStr}`;
      return ymd >= startDate && ymd <= endDate;
    });
    
    console.log(`Matched walkins: ${matchedWalkins.length}`);
    
    const branches = await Branch.find().lean();
    console.log(`Total branches: ${branches.length}\n`);
    
    console.log('--- DB Branches list and their walkin match stats ---');
    let totalVisibleWalkins = 0;
    let totalHiddenWalkins = 0;
    
    branches.forEach(b => {
      const isHidden = isHiddenBranch(b.workingBranch);
      const isDappr = b.locCode === '25';
      
      // Filter walkins that strictly match this branch (storeId === _id || store === workingBranch)
      const branchWalkins = matchedWalkins.filter(w => 
        w.storeId?.toString() === b._id.toString() || w.store === b.workingBranch
      );
      
      console.log(`Branch: "${b.workingBranch}" | ID: ${b._id} | locCode: "${b.locCode}" | isHidden: ${isHidden} | isDappr: ${isDappr} | count: ${branchWalkins.length}`);
      
      if (!isHidden && !isDappr) {
        totalVisibleWalkins += branchWalkins.length;
      } else {
        totalHiddenWalkins += branchWalkins.length;
      }
    });
    
    console.log(`\nVisible stores walkins sum: ${totalVisibleWalkins}`);
    console.log(`Hidden stores walkins sum: ${totalHiddenWalkins}`);
    console.log(`Grand total: ${totalVisibleWalkins + totalHiddenWalkins}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';

const mongoUri = process.env.MONGODB_URI;

function getISTDateString(dateVal) {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    const istTime = d.getTime() + (5.5 * 60 * 60 * 1000);
    const istDate = new Date(istTime);
    const y = istDate.getUTCFullYear();
    const m = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(istDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  } catch {
    return null;
  }
}

async function run() {
  try {
    await mongoose.connect(mongoUri);

    const branch = await Branch.findOne({ workingBranch: /kottayam/i }).lean();

    const walkins = await Walkin.find({
      $or: [
        { store: /kottayam/i },
        { storeId: branch ? branch._id : null }
      ]
    }).lean();

    const abhijithWalkins = walkins.filter(w => {
      const s = String(w.staff || '').toLowerCase();
      return s.includes('abhijith');
    });

    const julyCreated = abhijithWalkins.filter(w => {
      const d = getISTDateString(w.createdAt);
      return d && d >= '2026-07-01' && d <= '2026-07-29';
    });

    const autoCreatedJuly = julyCreated.filter(w => w.legacyMeta && w.legacyMeta.autoCreated);
    const manuallyCreatedJuly = julyCreated.filter(w => !w.legacyMeta || !w.legacyMeta.autoCreated);

    console.log(`=== AUTO-CREATE ANALYSIS FOR ABHIJITH @ G.KOTTAYAM (JULY 01-29) ===`);
    console.log(`Total July Created Walkins in DB: ${julyCreated.length}`);
    console.log(`Auto-created from POS Sync: ${autoCreatedJuly.length}`);
    console.log(`Manually added by Staff: ${manuallyCreatedJuly.length}`);

    console.log('\nList of Auto-Created Walkins:');
    autoCreatedJuly.forEach((w, i) => {
      console.log(`[${i + 1}] Customer: ${w.customerName} | Phone: ${w.contact} | Inv: ${w.invoiceNo} | Date: ${getISTDateString(w.createdAt)}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

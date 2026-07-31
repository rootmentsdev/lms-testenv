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

    // 1. Total Walkins
    const totalWalkins = julyCreated.length; // 44

    // 2. Count Unique Rental Invoices (Primary Customer Bills)
    const uniqueRentalInvoices = new Set(
      julyCreated
        .filter(w => w.invoiceNo && w.invoiceNo !== '-' && w.invoiceNo !== '')
        .map(w => w.invoiceNo)
    );

    // 3. Count Loss Walkins
    const lossWalkins = julyCreated.filter(w => {
      const s = String(w.status || '').toLowerCase();
      const rentalS = String(w.rentalStatus || '').toLowerCase();
      return s === 'loss' || s.includes('loss') || rentalS === 'loss';
    });

    // 4. Count New / Pending Walkins
    const pendingWalkins = julyCreated.filter(w => {
      const s = String(w.status || '').toLowerCase();
      return s === 'new walkin';
    });

    console.log('=== PROPOSED UNIQUE BILLING CALCULATION ===');
    console.log(`Total Walk-in Leads: ${totalWalkins}`);
    console.log(`Unique Primary Customer Bills (Rental Invoices): ${uniqueRentalInvoices.size}`);
    console.log(`Actual Loss Customer Leads: ${lossWalkins.length}`);
    console.log(`Pending / New Walk-in Leads: ${pendingWalkins.length}`);
    console.log(`Check Sum (${uniqueRentalInvoices.size} + ${lossWalkins.length} + ${pendingWalkins.length}): ${uniqueRentalInvoices.size + lossWalkins.length + pendingWalkins.length}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

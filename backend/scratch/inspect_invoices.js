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
    console.log('✅ Connected to MongoDB');

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

    console.log(`July Created Walkins for Abhijith @ G.Kottayam: ${julyCreated.length}`);

    // Inspect invoice fields on these 44 walkins
    const withRentalInvoice = julyCreated.filter(w => w.invoiceNo && w.invoiceNo !== '-' && w.invoiceNo !== '');
    const withShoeInvoice = julyCreated.filter(w => w.shoeInvoiceNo && w.shoeInvoiceNo !== '-' && w.shoeInvoiceNo !== '');
    const withAnyInvoice = julyCreated.filter(w => (w.invoiceNo && w.invoiceNo !== '-') || (w.shoeInvoiceNo && w.shoeInvoiceNo !== '-'));
    const withoutAnyInvoice = julyCreated.filter(w => (!w.invoiceNo || w.invoiceNo === '-') && (!w.shoeInvoiceNo || w.shoeInvoiceNo === '-'));

    console.log(`Walkins with Rental invoiceNo: ${withRentalInvoice.length}`);
    console.log(`Walkins with Shoe shoeInvoiceNo: ${withShoeInvoice.length}`);
    console.log(`Walkins with ANY invoice number attached: ${withAnyInvoice.length}`);
    console.log(`Walkins WITHOUT ANY invoice number attached: ${withoutAnyInvoice.length}`);

    console.log('\n--- Detailed List of July Walkins with Invoice Info ---');
    julyCreated.forEach((w, idx) => {
      console.log(`[${idx + 1}] ID: ${w._id} | Customer: ${w.customerName} | Status: ${w.status} | RentalStatus: ${w.rentalStatus} | InvoiceNo: ${w.invoiceNo || '-'} | ShoeInvoiceNo: ${w.shoeInvoiceNo || '-'}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

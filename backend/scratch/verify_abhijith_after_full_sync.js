import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Walkin from '../model/Walkin.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const startDate = new Date('2026-07-01T00:00:00.000Z');
  const endDate = new Date('2026-07-29T23:59:59.999Z');

  const walkins = await Walkin.find({
    store: 'G.Kottayam',
    staff: 'ABHIJITH KUMAR P A',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const lossCount = walkins.filter(w => w.status === 'Loss').length;
  const bookedCount = walkins.filter(w => w.status === 'Booked').length;
  const rentoutCount = walkins.filter(w => w.status === 'Rentout').length;
  const returnCount = walkins.filter(w => w.status === 'Return').length;
  const newCount = walkins.filter(w => w.status === 'New Walkin').length;
  const cancelledCount = walkins.filter(w => w.status === 'Cancelled').length;
  const autoCreatedCount = walkins.filter(w => w.legacyMeta?.autoCreated).length;

  console.log(`\n===============================================================`);
  console.log(`📊 ABHIJITH KUMAR P A (G.KOTTAYAM) - JULY 01 TO JULY 29, 2026`);
  console.log(`===============================================================`);
  console.log(`Total Walk-in Leads Created in July: ${walkins.length}`);
  console.log(`- Loss: ${lossCount}`);
  console.log(`- Booked / Rentout / Return (Converted): ${bookedCount + rentoutCount + returnCount}`);
  console.log(`  └ Booked: ${bookedCount}, Rentout: ${rentoutCount}, Return: ${returnCount}`);
  console.log(`- New Walkin: ${newCount}`);
  console.log(`- Cancelled: ${cancelledCount}`);
  console.log(`- Auto-Created from POS: ${autoCreatedCount}`);

  await mongoose.disconnect();
}

run();

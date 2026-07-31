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
  const endDate = new Date('2026-07-31T23:59:59.999Z');

  const walkins = await Walkin.find({
    store: 'G.Kottayam',
    staff: 'ABHIJITH KUMAR P A',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const lossWalkins = walkins.filter(w => w.status === 'Loss');
  const bookedWalkins = walkins.filter(w => w.status === 'Booked');
  const rentoutWalkins = walkins.filter(w => w.status === 'Rentout');
  const returnWalkins = walkins.filter(w => w.status === 'Return');
  const newWalkins = walkins.filter(w => w.status === 'New Walkin');
  const cancelledWalkins = walkins.filter(w => w.status === 'Cancelled');

  console.log(`\n===============================================================`);
  console.log(`📊 ABHIJITH KUMAR P A (G.KOTTAYAM) - JULY 01 TO JULY 31, 2026`);
  console.log(`===============================================================`);
  console.log(`Total Walk-in Leads Created in July: ${walkins.length}`);
  console.log(`- Loss Walk-ins: ${lossWalkins.length}`);
  console.log(`- Booked: ${bookedWalkins.length}`);
  console.log(`- Rentout: ${rentoutWalkins.length}`);
  console.log(`- Return: ${returnWalkins.length}`);
  console.log(`- New Walkin: ${newWalkins.length}`);
  console.log(`- Cancelled: ${cancelledWalkins.length}`);
  console.log(`\nDetailed Loss List:`);
  lossWalkins.forEach((w, i) => {
    console.log(`${i+1}. ${w.name} | Phone: ${w.contact} | Date: ${w.createdAt.toISOString().slice(0,10)} | ID: ${w._id}`);
  });

  await mongoose.disconnect();
}

run();

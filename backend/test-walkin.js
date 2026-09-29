import mongoose from 'mongoose';
import { Walkin } from './model/WalkinModel.js';
import dotenv from 'dotenv';
import { getISTDayRange } from './utils/dateUtils.js';

dotenv.config();
mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/lms');

async function test() {
  const { startUTC, nextDayStartUTC } = getISTDayRange('2026-09-02');
  
  const activityQuery = {
    $or: [
        { createdAt:            { $gte: startUTC, $lt: nextDayStartUTC } },
        { updatedAt:            { $gte: startUTC, $lt: nextDayStartUTC } },
        { bookingDate:          { $gte: startUTC, $lt: nextDayStartUTC } },
        { rentoutDate:          { $gte: startUTC, $lt: nextDayStartUTC } },
        { returnDate:           { $gte: startUTC, $lt: nextDayStartUTC } },
        { cancelDate:           { $gte: startUTC, $lt: nextDayStartUTC } },
        { billedDate:           { $gte: startUTC, $lt: nextDayStartUTC } },
        { billReturnedDate:     { $gte: startUTC, $lt: nextDayStartUTC } },
        { lastStatusChangeDate: { $gte: startUTC, $lt: nextDayStartUTC } },
        { statusHistory:        { $elemMatch: { date: { $gte: startUTC, $lt: nextDayStartUTC } } } }
    ]
  };

  const walkins = await Walkin.find(activityQuery).lean();
  console.log(`Total Walkins found by activity query: ${walkins.length}`);
  
  // Now filter by store SG Edappal (naive string match)
  const sgEdappal = walkins.filter(w => w.store && w.store.toLowerCase().includes('edappal'));
  console.log(`Walkins for SG Edappal (activity query): ${sgEdappal.length}`);
  
  const sgEdappalAll = await Walkin.find({ store: /edappal/i }).lean();
  console.log(`Total walkins for edappal ever: ${sgEdappalAll.length}`);

  // Deduplicate using the exact logic
  const seenKeys = new Set();
  const deduped = [];
  for (const w of sgEdappal) {
      const key = w.invoiceNo
          ? `inv_${w.invoiceNo}`
          : `key_${(w.customerName || '').toLowerCase().trim()}_${(w.contact || '').toLowerCase().trim()}_${(w.date || '').toLowerCase().trim()}_${(w.store || '').toLowerCase().trim()}_${(w.status || '').toLowerCase().trim()}`;
      if (!seenKeys.has(key)) {
          seenKeys.add(key);
          deduped.push(w);
      }
  }
  console.log(`Deduplicated Walkins for SG Edappal (activity query): ${deduped.length}`);
  console.log(`Names of deduplicated: ${deduped.map(w => w.customerName).join(', ')}`);

  process.exit(0);
}
test();

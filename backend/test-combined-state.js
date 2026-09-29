import mongoose from 'mongoose';
import Walkin from './model/Walkin.js';
import dotenv from 'dotenv';
import { getISTDayRange } from './utils/dateRange.js';

dotenv.config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms');

// Helper from frontend
const getCombinedStatus = (rental, shoe) => {
    let r = String(rental || '').trim();
    let s = String(shoe || '').trim();
    if (s === '-' || s === '') return r || '-';
    if (r === '-' || r === '') return s || '-';
    if (r === s) return r;
    return `${r}, ${s}`;
};

const getCombinedStateAt = (w, endDateStr) => {
  if (!endDateStr) return { status: w.status, date: w.updatedAt || w.date };

  const timeline = [];
  let rentalStatus = 'New Walkin';
  let shoeStatus = '-';
  let initialDate = w.createdAt || w.date;
  
  timeline.push({ status: getCombinedStatus(rentalStatus, shoeStatus), rentalStatus, shoeStatus, date: initialDate });

  const milestones = [];
  if (w.bookingDate) milestones.push({ status: 'Booked', date: w.bookingDate });
  if (w.rentoutDate) milestones.push({ status: 'Rentout', date: w.rentoutDate });
  if (w.returnDate) milestones.push({ status: 'Return', date: w.returnDate });
  if (w.cancelDate || w.cancellationDate) milestones.push({ status: 'Cancelled', date: w.cancelDate || w.cancellationDate });
  if (w.billedDate) milestones.push({ status: 'Billed', date: w.billedDate });
  if (w.billReturnedDate) milestones.push({ status: 'Bill Returned', date: w.billReturnedDate });
  if (w.lastStatusChangeDate && w.status) milestones.push({ status: w.status, date: w.lastStatusChangeDate });

  const rawEvents = [
    ...(w.statusHistory || []).map(h => ({ status: h.status, category: h.category, date: h.date })),
    ...milestones
  ];

  rawEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  const rentalStatuses = ['New Walkin', 'Booked', 'Rentout', 'Return', 'Cancelled', 'Cancel', 'Loss', 'Revisit Loss'];

  rawEvents.forEach(h => {
    const s = String(h.status || '').trim();
    const isRental = rentalStatuses.includes(s) || (h.category && h.category !== 'Sales');
    if (isRental) rentalStatus = s;
    else shoeStatus = s;
    timeline.push({ status: getCombinedStatus(rentalStatus, shoeStatus), rentalStatus, shoeStatus, date: h.date });
  });

  const { nextDayStartUTC } = getISTDayRange(endDateStr);
  const cutoff = nextDayStartUTC.getTime();
  const statesBeforeCutoff = timeline.filter(s => new Date(s.date).getTime() < cutoff);
  
  if (statesBeforeCutoff.length === 0) return null;
  return statesBeforeCutoff[statesBeforeCutoff.length - 1];
};

async function test() {
  const { startUTC, nextDayStartUTC } = getISTDayRange('2026-09-02');
  const activityQuery = {
    $or: [
        { createdAt:            { $gte: startUTC, $lt: nextDayStartUTC } },
        { updatedAt:            { $gte: startUTC, $lt: nextDayStartUTC } }
    ]
  };

  const walkins = await Walkin.find({ 
    store: /edappal/i, 
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
  }).lean();
  
  const deduped = [];
  const seenKeys = new Set();
  for (const w of walkins) {
      const key = w.invoiceNo
          ? `inv_${w.invoiceNo}`
          : `key_${(w.customerName || '').toLowerCase().trim()}_${(w.contact || '').toLowerCase().trim()}_${(w.date || '').toLowerCase().trim()}_${(w.store || '').toLowerCase().trim()}_${(w.status || '').toLowerCase().trim()}`;
      if (!seenKeys.has(key)) {
          seenKeys.add(key);
          deduped.push(w);
      }
  }

  console.log(`Deduplicated Walkins for SG Edappal (activity query): ${deduped.length}`);
  
  const targetNames = ['YASIR', 'Mirshad', 'tesd', 'JISHNU'];
  
  // See which ones survive the frontend "showOnlyActivity" or getCombinedStateAt filter
  const isDateInFilterRange = (dateVal) => {
    if(!dateVal) return false;
    const dStr = (new Date(dateVal).toISOString()).substring(0, 10);
    return dStr === '2026-09-02';
  };

  const hasActivityInRange = (w) => {
    if (isDateInFilterRange(w.createdAt)) return true;
    if (isDateInFilterRange(w.date)) return true;
    if (Array.isArray(w.statusHistory) && w.statusHistory.some(h => isDateInFilterRange(h.date))) return true;
    if (isDateInFilterRange(w.bookingDate)) return true;
    if (isDateInFilterRange(w.rentoutDate)) return true;
    if (isDateInFilterRange(w.returnDate)) return true;
    if (isDateInFilterRange(w.billedDate)) return true;
    if (isDateInFilterRange(w.billReturnedDate)) return true;
    if (isDateInFilterRange(w.cancelDate || w.cancellationDate)) return true;
    return false;
  };

  const surviving = deduped.filter(w => hasActivityInRange(w) && getCombinedStateAt(w, '2026-09-02') !== null);
  console.log(`Surviving frontend filters: ${surviving.length}`);
  console.log(`Surviving names: ${surviving.map(w=>w.customerName).join(', ')}`);
  
  process.exit(0);
}
test();

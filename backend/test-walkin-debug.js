import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Walkin from './model/Walkin.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/lms')
  .then(async () => {
    console.log("Connected");
    
    const date = '2026-09-02';
    // Emulate getISTRangeBetween
    const startUTC = new Date('2026-09-01T18:30:00.000Z');
    const nextDayStartUTC = new Date('2026-09-02T18:30:00.000Z');
    
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
    
    const storeRegex = new RegExp(`SG Edappal`, 'i');
    
    const query = {
        $and: [
            activityQuery,
            { store: { $regex: storeRegex } }
        ]
    };

    const records = await Walkin.find(query).lean();
    console.log(`Found ${records.length} records with activity on ${date} for SG Edappal`);
    
    // Deduplicate
    const seenKeys = new Set();
    const walkins = [];
    for (const w of records) {
        const key = w.invoiceNo
            ? `inv_${w.invoiceNo}`
            : `key_${(w.customerName || '').toLowerCase().trim()}_${(w.contact || '').toLowerCase().trim()}_${(w.date || '').toLowerCase().trim()}_${(w.store || '').toLowerCase().trim()}_${(w.status || '').toLowerCase().trim()}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            walkins.push(w);
        }
    }
    
    console.log(`Deduplicated count: ${walkins.length}`);
    mongoose.disconnect();
  });

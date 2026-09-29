import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Walkin from './model/Walkin.js';
import { getISTDayRange, isInISTRange } from './utils/dateRange.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms')
  .then(async () => {
    console.log("Connected");
    
    const date = '2026-09-02';
    const { startUTC, nextDayStartUTC } = getISTDayRange(date);
    
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
    
    const storeRegex = new RegExp(`edappal`, 'i');
    
    const query = {
        $and: [
            activityQuery,
            { store: { $regex: storeRegex } }
        ]
    };

    const records = await Walkin.find(query).lean();
    console.log(`Found ${records.length} records with activity on ${date} for edappal`);
    
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
    
    let total_walkin = 0;
    for (const w of walkins) {
        const isDateInRange = (dateVal) => {
            return isInISTRange(dateVal, startUTC, nextDayStartUTC);
        };
        const hasAnyActivity = isDateInRange(w.createdAt) || 
                               isDateInRange(w.date) || 
                               (Array.isArray(w.statusHistory) && w.statusHistory.some(h => isDateInRange(h.date))) ||
                               isDateInRange(w.bookingDate) ||
                               isDateInRange(w.rentoutDate) ||
                               isDateInRange(w.returnDate) ||
                               isDateInRange(w.billedDate) ||
                               isDateInRange(w.billReturnedDate) ||
                               isDateInRange(w.cancelDate || w.cancellationDate);

        if (!hasAnyActivity) {
            console.log(`Skipped: ${w.customerName} (Matched via updatedAt only)`);
            continue;
        }
        total_walkin++;
        console.log(`Included: ${w.customerName} | createdAt: ${w.createdAt} | date: ${w.date} | statusHistory: ${w.statusHistory ? w.statusHistory.map(h => h.date).join(', ') : 'none'}`);
    }
    
    console.log(`Total Walkin after filter: ${total_walkin}`);
    mongoose.disconnect();
  });

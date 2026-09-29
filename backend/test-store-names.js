import mongoose from 'mongoose';
import Walkin from './model/Walkin.js';
import dotenv from 'dotenv';
import { getISTDayRange } from './utils/dateRange.js';

dotenv.config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms');

async function test() {
  const { startUTC, nextDayStartUTC } = getISTDayRange('2026-09-02');
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
  
  const targetNames = ['YASIR', 'Mirshad', 'tesd', 'JISHNU'];
  
  console.log("Store names of target 4:");
  walkins.filter(w => targetNames.includes(w.customerName)).forEach(w => console.log(w.customerName, w.store));

  console.log("\nStore names of the rest:");
  walkins.filter(w => !targetNames.includes(w.customerName)).forEach(w => console.log(w.customerName, w.store));
  
  process.exit(0);
}
test();

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function main() {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const date = '2026-06-30';
    // Single date case range in IST
    const startISTStr = `${date}T00:00:00`;
    const endISTStr = `${date}T23:59:59`;
    const startUTC = new Date(new Date(startISTStr).getTime() - (5.5 * 60 * 60 * 1000));
    const nextDayStartUTC = new Date(new Date(endISTStr).getTime() + 1000 - (5.5 * 60 * 60 * 1000));

    console.log('UTC Range:', startUTC.toISOString(), 'to', nextDayStartUTC.toISOString());

    // 1. Search imported_walkins
    console.log('\n--- imported_walkins ---');
    const imported = await db.collection('imported_walkins').find({
        $or: [
            { date: { $gte: date, $lte: date + ' 23:59:59' } },
            { createdAt: { $gte: startUTC, $lt: nextDayStartUTC } }
        ]
    }).toArray();
    console.log('Count in imported_walkins:', imported.length);
    imported.forEach(i => console.log(i));

    // 2. Search externaldata
    console.log('\n--- externaldata ---');
    const extData = await db.collection('externaldata').find({
        $or: [
            { date: { $gte: date, $lte: date + ' 23:59:59' } },
            { createdAt: { $gte: startUTC, $lt: nextDayStartUTC } },
            { bookingDate: { $gte: startUTC, $lt: nextDayStartUTC } },
            { rentoutDate: { $gte: startUTC, $lt: nextDayStartUTC } },
            { returnDate: { $gte: startUTC, $lt: nextDayStartUTC } },
            { billedDate: { $gte: startUTC, $lt: nextDayStartUTC } }
        ]
    }).toArray();
    console.log('Count in externaldata:', extData.length);
    extData.forEach(e => {
        console.log({
            _id: e._id,
            store: e.store,
            customerName: e.customerName || e.customerPhone || e.name,
            rentalStatus: e.rentalStatus,
            bookingDate: e.bookingDate,
            rentoutDate: e.rentoutDate,
            returnDate: e.returnDate,
            billedDate: e.billedDate,
            invoiceNo: e.invoiceNo,
            createdAt: e.createdAt
        });
    });

    await mongoose.disconnect();
}

main().catch(console.error);

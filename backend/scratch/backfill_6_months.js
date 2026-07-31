import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';

const mongoUri = process.env.MONGODB_URI;

const isDryRun = !process.argv.includes('--execute');

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

function cleanPhone(raw) {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
}

function extractDateValue(obj, keys) {
  for (const k of keys) {
    if (obj[k]) {
      const d = new Date(obj[k]);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

async function run() {
  console.log(`\n===============================================================`);
  console.log(`🚀 6-MONTH HISTORICAL BACKFILL & SYNC (FEB 01 TO JUL 31, 2026)`);
  console.log(`MODE: ${isDryRun ? '🔍 DRY RUN (SIMULATION ONLY - NO DB WRITES)' : '⚡ EXECUTE MODE (APPLYING DB UPDATES)'}`);
  console.log(`===============================================================\n`);

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const branches = await Branch.find({ isActive: true }).lean();
    console.log(`🏬 Active Branches Found: ${branches.length}\n`);

    const monthRanges = [
      { name: 'February 2026', from: '2026-02-01', to: '2026-02-28' },
      { name: 'March 2026',    from: '2026-03-01', to: '2026-03-31' },
      { name: 'April 2026',    from: '2026-04-01', to: '2026-04-30' },
      { name: 'May 2026',      from: '2026-05-01', to: '2026-05-31' },
      { name: 'June 2026',     from: '2026-06-01', to: '2026-06-30' },
      { name: 'July 2026',     from: '2026-07-01', to: '2026-07-31' }
    ];

    let totalPosBookingsFetched = 0;
    let totalAlreadyInLms = 0;
    let totalMissingPosBookingsToCreate = 0;
    let totalSuccessfullyCreated = 0;

    const branchSummary = {};
    branches.forEach(b => {
      branchSummary[b.workingBranch || b.locCode] = { posBookings: 0, existingMatches: 0, missingToCreate: 0, created: 0 };
    });

    for (const range of monthRanges) {
      console.log(`\n📅 Processing Chunk: ${range.name} (${range.from} to ${range.to})...`);

      // Fetch all branches in parallel for this month
      const branchPromises = branches.map(async (branch) => {
        const { locCode, workingBranch, _id: storeId } = branch;
        const bName = workingBranch || locCode;

        try {
          const bookingUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${range.from}&DateTo=${range.to}`;
          const res = await fetch(bookingUrl);
          if (!res.ok) return;

          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || json.dataSet?.data || []);
          if (list.length === 0) return;

          branchSummary[bName].posBookings += list.length;
          totalPosBookingsFetched += list.length;

          for (const item of list) {
            const invNo = String(item.invoiceNo || item.invoice_no || item.billNo || item.bill_no || '').trim();
            const rawPhone = item.phoneNo || item.phone_no || item.phone || item.contact || '';
            const phone = cleanPhone(rawPhone);

            if (!invNo && !phone) continue;

            let existingWalkin = null;
            if (invNo) {
              existingWalkin = await Walkin.findOne({ invoiceNo: invNo });
            }
            if (!existingWalkin && phone && phone.length >= 10) {
              const matchingWalkins = await Walkin.find({
                $or: [{ storeId }, { store: bName }],
                contact: new RegExp(phone + '$')
              }).sort({ createdAt: -1 });

              if (matchingWalkins.length > 0) {
                existingWalkin = matchingWalkins[0];
              }
            }

            if (existingWalkin) {
              totalAlreadyInLms++;
              branchSummary[bName].existingMatches++;
              if (invNo && !existingWalkin.invoiceNo) {
                if (!isDryRun) {
                  await Walkin.updateOne({ _id: existingWalkin._id }, { $set: { invoiceNo: invNo } });
                }
              }
            } else {
              totalMissingPosBookingsToCreate++;
              branchSummary[bName].missingToCreate++;

              const autoCustomerName = String(item.customerName || '').trim() || 'Auto-Sync Customer';
              const autoStaff = String(item.bookingBy || '').trim() || 'None';
              const autoStore = String(workingBranch || item.locName || '').trim() || '-';
              const autoBookingDate = extractDateValue(item, ['bookingDate', 'bookingdate', 'booking_date', 'bookeddate']) || new Date(range.from);
              const autoDateStr = getISTDateString(autoBookingDate);

              if (!isDryRun) {
                try {
                  const newWalkin = new Walkin({
                    customerName: autoCustomerName,
                    contact: phone || '0000000000',
                    invoiceNo: invNo || null,
                    storeId: storeId,
                    store: autoStore,
                    staff: autoStaff,
                    date: autoDateStr,
                    status: 'Booked',
                    rentalStatus: 'Booked',
                    repeatCount: 1,
                    statusHistory: [{
                      status: 'Booked',
                      category: 'Product',
                      subCategory: '-',
                      date: autoBookingDate,
                      source: 'historical_auto_sync'
                    }],
                    legacyMeta: {
                      autoCreated: true,
                      autoCreatedAt: new Date(),
                      autoCreatedReason: 'historical_missing_pos_booking'
                    }
                  });

                  await newWalkin.save();

                  if (autoBookingDate) {
                    await Walkin.collection.updateOne(
                      { _id: newWalkin._id },
                      { $set: { createdAt: autoBookingDate, updatedAt: autoBookingDate } }
                    );
                  }

                  totalSuccessfullyCreated++;
                  branchSummary[bName].created++;
                } catch (createErr) {
                  console.error(`❌ Failed to create walkin for Inv: ${invNo}:`, createErr.message);
                }
              }
            }
          }

        } catch (err) {
          console.error(`Error in branch ${bName}:`, err.message);
        }
      });

      await Promise.all(branchPromises);
    }

    console.log(`\n===============================================================`);
    console.log(`📊 6-MONTH HISTORICAL BACKFILL SUMMARY`);
    console.log(`===============================================================`);
    console.log(`Total POS Rental Bookings Fetched: ${totalPosBookingsFetched}`);
    console.log(`Bookings Already Matched in LMS: ${totalAlreadyInLms}`);
    console.log(`Missing POS Bookings ${isDryRun ? 'To Be Auto-Created' : 'Successfully Created'}: ${isDryRun ? totalMissingPosBookingsToCreate : totalSuccessfullyCreated}`);

    console.log(`\n--- Breakdown By Branch ---`);
    console.table(branchSummary);

  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

run();

import fetch from 'node-fetch';
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

    const locCode = '701';
    const dateFrom = '2026-07-01';
    const dateTo = '2026-07-29';

    // 1. Get 36 POS Rental Bookings from GetBookingList
    const bookingUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
    const res = await fetch(bookingUrl);
    const resJson = await res.json();
    const list = Array.isArray(resJson) ? resJson : (resJson.data || resJson.dataSet?.data || []);

    const abhijithBookings = list.filter(b => {
      const staff = String(b.bookingBy || '').toLowerCase();
      return staff.includes('abhijith');
    });

    console.log(`Total POS Rental Bills for Abhijith in July: ${abhijithBookings.length}`);

    // 2. Fetch all Walkins from DB
    const branch = await Branch.findOne({ workingBranch: /kottayam/i }).lean();
    const allWalkins = await Walkin.find({
      $or: [
        { store: /kottayam/i },
        { storeId: branch ? branch._id : null }
      ]
    }).lean();

    const abhijithWalkins = allWalkins.filter(w => {
      const s = String(w.staff || '').toLowerCase();
      return s.includes('abhijith');
    });

    console.log(`Total All-time Walkins for Abhijith in LMS DB: ${abhijithWalkins.length}`);

    // 3. Map each POS Rental Bill to LMS Walkins
    let matchedInJulyCreated = 0;
    let matchedInEarlierCreated = 0;
    let notInLms = 0;

    abhijithBookings.forEach((b, idx) => {
      const inv = b.invoiceNo;
      const phone = b.phoneNo;

      const matchedWalkin = abhijithWalkins.find(w => w.invoiceNo === inv || w.contact === phone);

      if (matchedWalkin) {
        const createdDateStr = getISTDateString(matchedWalkin.createdAt);
        const isJulyCreated = createdDateStr >= dateFrom && createdDateStr <= dateTo;
        if (isJulyCreated) {
          matchedInJulyCreated++;
          console.log(`[Bill ${idx + 1}] Inv: ${inv} | Phone: ${phone} | Customer: ${b.customerName} -> Matched LMS Walkin CREATED IN JULY (${createdDateStr})`);
        } else {
          matchedInEarlierCreated++;
          console.log(`[Bill ${idx + 1}] Inv: ${inv} | Phone: ${phone} | Customer: ${b.customerName} -> Matched LMS Walkin CREATED EARLIER (${createdDateStr})`);
        }
      } else {
        notInLms++;
        console.log(`[Bill ${idx + 1}] Inv: ${inv} | Phone: ${phone} | Customer: ${b.customerName} -> Direct POS Bill (Not in LMS)`);
      }
    });

    console.log('\n=== MATCHING SUMMARY ===');
    console.log(`POS Rental Bills created for Walkins CREATED IN JULY: ${matchedInJulyCreated}`);
    console.log(`POS Rental Bills created for Walkins CREATED BEFORE JULY (June/May): ${matchedInEarlierCreated}`);
    console.log(`POS Rental Bills created directly in POS (No LMS walkin record): ${notInLms}`);
    console.log(`Total POS Rental Bills: ${matchedInJulyCreated + matchedInEarlierCreated + notInLms}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

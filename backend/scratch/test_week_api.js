import dotenv from 'dotenv';
import mongoose from 'mongoose';
import StoreTarget from '../model/StoreTarget.js';

dotenv.config();

function parseWeekRange(rangeStr) {
  if (!rangeStr || rangeStr === 'Select Days') return null;
  const parts = rangeStr.split('-');
  if (parts.length < 2) return null;
  const start = parseInt(parts[0].trim(), 10);
  const endPart = parts[1].trim().split(' ')[0];
  const end = parseInt(endPart, 10);
  if (isNaN(start) || isNaN(end)) return null;
  return { start, end, days: end - start + 1 };
}

async function runTest() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected successfully!");

  const testStoreName = "TestStore-Weekly";
  const testMonth = "July";
  const testYear = 2026;

  // Clean up any old test targets
  await StoreTarget.deleteOne({ storeName: testStoreName, month: testMonth, year: testYear });

  // Create a mock store target config with specific week ranges
  const mockTarget = new StoreTarget({
    storeName: testStoreName,
    month: testMonth,
    year: testYear,
    weekRanges: {
      1: "01 - 09 July",
      2: "10 - 16 July",
      3: "17 - 23 July",
      4: "24 - 31 July"
    },
    weeklyTargets: { 1: 100, 2: 150, 3: 200, 4: 250 }
  });
  await mockTarget.save();
  console.log("Saved test StoreTarget.");

  // Helper to run date test logic matching route logic
  const testDateClassify = async (dateStr, store, testMonthVal = "July") => {
    const parsedDate = new Date(dateStr);
    const day = parsedDate.getDate();
    const month = testMonthVal;
    const year = testYear;

    const [storeDoc, globalDoc] = await Promise.all([
      StoreTarget.findOne({ storeName: store, month, year }).lean(),
      StoreTarget.findOne({ storeName: 'All', month, year }).lean()
    ]);

    const weekRanges = {
      1: storeDoc?.weekRanges?.[1] || globalDoc?.weekRanges?.[1] || 'Select Days',
      2: storeDoc?.weekRanges?.[2] || globalDoc?.weekRanges?.[2] || 'Select Days',
      3: storeDoc?.weekRanges?.[3] || globalDoc?.weekRanges?.[3] || 'Select Days',
      4: storeDoc?.weekRanges?.[4] || globalDoc?.weekRanges?.[4] || 'Select Days',
    };

    let matchedWeek = null;
    let matchedRangeStr = null;
    let isConfigured = false;

    for (const wk of [1, 2, 3, 4]) {
      const rangeStr = weekRanges[wk];
      const range = parseWeekRange(rangeStr);
      if (range && day >= range.start && day <= range.end) {
        matchedWeek = wk;
        matchedRangeStr = rangeStr;
        isConfigured = true;
        break;
      }
    }

    if (matchedWeek === null) {
      if (day <= 7) {
        matchedWeek = 1;
        matchedRangeStr = `01 - 07 ${month.substring(0, 3)}`;
      } else if (day <= 14) {
        matchedWeek = 2;
        matchedRangeStr = `08 - 14 ${month.substring(0, 3)}`;
      } else if (day <= 21) {
        matchedWeek = 3;
        matchedRangeStr = `15 - 21 ${month.substring(0, 3)}`;
      } else {
        matchedWeek = 4;
        const lastDay = new Date(year, parsedDate.getMonth() + 1, 0).getDate();
        matchedRangeStr = `22 - ${lastDay} ${month.substring(0, 3)}`;
      }
      isConfigured = false;
    }

    console.log(`Input Date: ${dateStr} | Day: ${day} | Store: ${store} | Month: ${month}`);
    console.log(`-> Week: ${matchedWeek} | Label: Week ${matchedWeek} | Range: ${matchedRangeStr} | Configured: ${isConfigured}`);
    console.log("-----------------------------------------");
    return { matchedWeek, matchedRangeStr, isConfigured };
  };

  // Test Cases for configured store
  console.log("\n--- Testing configured store: TestStore-Weekly ---");
  const t1 = await testDateClassify("2026-07-05", testStoreName); // should be Week 1 (01 - 09 July)
  const t2 = await testDateClassify("2026-07-15", testStoreName); // should be Week 2 (10 - 16 July)
  const t3 = await testDateClassify("2026-07-17", testStoreName); // should be Week 3 (17 - 23 July)
  const t4 = await testDateClassify("2026-07-28", testStoreName); // should be Week 4 (24 - 31 July)

  // Asserting values for configured store
  if (t1.matchedWeek !== 1 || t1.matchedRangeStr !== "01 - 09 July" || !t1.isConfigured) throw new Error("t1 failed");
  if (t2.matchedWeek !== 2 || t2.matchedRangeStr !== "10 - 16 July" || !t2.isConfigured) throw new Error("t2 failed");
  if (t3.matchedWeek !== 3 || t3.matchedRangeStr !== "17 - 23 July" || !t3.isConfigured) throw new Error("t3 failed");
  if (t4.matchedWeek !== 4 || t4.matchedRangeStr !== "24 - 31 July" || !t4.isConfigured) throw new Error("t4 failed");

  // Test Cases for non-existent store (fallback to global "All" config for July 2026)
  // Note: We know global config "All" for July 2026 exists and is:
  // Week 1: 01 - 10 July, Week 2: 11 - 17 July, Week 3: 18 - 24 July, Week 4: 25 - 31 July
  console.log("\n--- Testing global store fallback (No store config, but global config exists) ---");
  const g1 = await testDateClassify("2026-07-05", "NonExistentStore"); // Week 1 (01 - 10 July or similar)
  const g2 = await testDateClassify("2026-07-15", "NonExistentStore"); // Week 2 (11 - 17 July or similar)
  const g3 = await testDateClassify("2026-07-20", "NonExistentStore"); // Week 3 (18 - 24 July or similar)
  const g4 = await testDateClassify("2026-07-28", "NonExistentStore"); // Week 4 (25 - 31 July or similar)

  if (g1.matchedWeek !== 1 || !g1.isConfigured) throw new Error("g1 failed");
  if (g2.matchedWeek !== 2 || !g2.isConfigured) throw new Error("g2 failed");
  if (g3.matchedWeek !== 3 || !g3.isConfigured) throw new Error("g3 failed");
  if (g4.matchedWeek !== 4 || !g4.isConfigured) throw new Error("g4 failed");

  // Test Cases for absolute fallback (neither store nor global config exists - using "December")
  console.log("\n--- Testing absolute fallback (neither store nor global exists) ---");
  const f1 = await testDateClassify("2026-12-05", "NonExistentStore", "December"); // should be Week 1 (01 - 07 Dec)
  const f2 = await testDateClassify("2026-12-10", "NonExistentStore", "December"); // should be Week 2 (08 - 14 Dec)
  const f3 = await testDateClassify("2026-12-20", "NonExistentStore", "December"); // should be Week 3 (15 - 21 Dec)
  const f4 = await testDateClassify("2026-12-25", "NonExistentStore", "December"); // should be Week 4 (22 - 31 Dec)

  // Asserting values for fallback store
  if (f1.matchedWeek !== 1 || f1.matchedRangeStr !== "01 - 07 Dec" || f1.isConfigured) throw new Error("f1 failed");
  if (f2.matchedWeek !== 2 || f2.matchedRangeStr !== "08 - 14 Dec" || f2.isConfigured) throw new Error("f2 failed");
  if (f3.matchedWeek !== 3 || f3.matchedRangeStr !== "15 - 21 Dec" || f3.isConfigured) throw new Error("f3 failed");
  if (f4.matchedWeek !== 4 || f4.matchedRangeStr !== "22 - 31 Dec" || f4.isConfigured) throw new Error("f4 failed");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");

  // Clean up
  await StoreTarget.deleteOne({ storeName: testStoreName, month: testMonth, year: testYear });
  await mongoose.disconnect();
}

runTest().catch(async (err) => {
  console.error("Test failed: ", err);
  await mongoose.disconnect();
  process.exit(1);
});

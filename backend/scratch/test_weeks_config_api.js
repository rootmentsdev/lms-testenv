import dotenv from 'dotenv';
import mongoose from 'mongoose';
import StoreTarget from '../model/StoreTarget.js';
import Branch from '../model/Branch.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in env file");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected successfully!");

  try {
    const today = new Date();
    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];

    const defaultMonth = monthNames[today.getMonth()];
    const defaultYear = today.getFullYear();

    const month = defaultMonth;
    const year = defaultYear;

    console.log(`🔍 Querying targets for month: ${month}, year: ${year}`);

    // Fetch active branches and existing store targets
    const [branches, targets] = await Promise.all([
      Branch.find({ isActive: true }).select('workingBranch locCode').lean(),
      StoreTarget.find({ month, year }).lean()
    ]);

    console.log(`Found ${branches.length} active branches and ${targets.length} store targets for this month.`);

    // Create a map of store target documents by store name
    const targetsByStore = {};
    targets.forEach(t => {
      targetsByStore[t.storeName] = t;
    });

    const globalDoc = targetsByStore['All'] || null;

    // Helper to resolve short month name and last day of month
    const shortMonth = month.substring(0, 3);
    const monthIndex = monthNames.indexOf(month);
    const lastDay = new Date(year, monthIndex !== -1 ? monthIndex + 1 : today.getMonth() + 1, 0).getDate();

    // Map each active store to its configuration
    const storesList = branches.map(branch => {
      const storeName = branch.workingBranch;
      const storeDoc = targetsByStore[storeName];

      const weekRanges = {
        1: storeDoc?.weekRanges?.[1] || globalDoc?.weekRanges?.[1] || 'Select Days',
        2: storeDoc?.weekRanges?.[2] || globalDoc?.weekRanges?.[2] || 'Select Days',
        3: storeDoc?.weekRanges?.[3] || globalDoc?.weekRanges?.[3] || 'Select Days',
        4: storeDoc?.weekRanges?.[4] || globalDoc?.weekRanges?.[4] || 'Select Days',
      };

      // Resolve fallback ranges if any are "Select Days" or empty
      const resolvedWeekRanges = {
        1: (weekRanges[1] && weekRanges[1] !== 'Select Days') ? weekRanges[1] : `01 - 07 ${shortMonth}`,
        2: (weekRanges[2] && weekRanges[2] !== 'Select Days') ? weekRanges[2] : `08 - 14 ${shortMonth}`,
        3: (weekRanges[3] && weekRanges[3] !== 'Select Days') ? weekRanges[3] : `15 - 21 ${shortMonth}`,
        4: (weekRanges[4] && weekRanges[4] !== 'Select Days') ? weekRanges[4] : `22 - ${lastDay} ${shortMonth}`,
      };

      const weeklyTargets = {
        1: storeDoc?.weeklyTargets?.[1] ?? 0,
        2: storeDoc?.weeklyTargets?.[2] ?? 0,
        3: storeDoc?.weeklyTargets?.[3] ?? 0,
        4: storeDoc?.weeklyTargets?.[4] ?? 0,
      };

      return {
        storeName,
        locCode: branch.locCode,
        isConfigured: !!storeDoc,
        weekRanges: resolvedWeekRanges,
        weeklyTargets
      };
    });

    // Also resolve global config fallback ranges for display
    const globalWeekRanges = {
      1: globalDoc?.weekRanges?.[1] || 'Select Days',
      2: globalDoc?.weekRanges?.[2] || 'Select Days',
      3: globalDoc?.weekRanges?.[3] || 'Select Days',
      4: globalDoc?.weekRanges?.[4] || 'Select Days',
    };

    const resolvedGlobalWeekRanges = {
      1: (globalWeekRanges[1] && globalWeekRanges[1] !== 'Select Days') ? globalWeekRanges[1] : `01 - 07 ${shortMonth}`,
      2: (globalWeekRanges[2] && globalWeekRanges[2] !== 'Select Days') ? globalWeekRanges[2] : `08 - 14 ${shortMonth}`,
      3: (globalWeekRanges[3] && globalWeekRanges[3] !== 'Select Days') ? globalWeekRanges[3] : `15 - 21 ${shortMonth}`,
      4: (globalWeekRanges[4] && globalWeekRanges[4] !== 'Select Days') ? globalWeekRanges[4] : `22 - ${lastDay} ${shortMonth}`,
    };

    const globalWeeklyTargets = {
      1: globalDoc?.weeklyTargets?.[1] ?? 0,
      2: globalDoc?.weeklyTargets?.[2] ?? 0,
      3: globalDoc?.weeklyTargets?.[3] ?? 0,
      4: globalDoc?.weeklyTargets?.[4] ?? 0,
    };

    const resolvedGlobalConfig = {
      storeName: 'All',
      isConfigured: !!globalDoc,
      weekRanges: resolvedGlobalWeekRanges,
      weeklyTargets: globalWeeklyTargets
    };

    const output = {
      success: true,
      month,
      year,
      storesCount: storesList.length,
      stores: storesList,
      globalConfig: resolvedGlobalConfig,
      rawConfigsCount: targets.length
    };

    console.log("-----------------------------------------");
    console.log("📋 MAPPED OUTPUT SAMPLE (First 2 stores):");
    console.log(JSON.stringify(storesList.slice(0, 2), null, 2));
    console.log("-----------------------------------------");
    console.log("📋 GLOBAL CONFIG RESOLVED:");
    console.log(JSON.stringify(resolvedGlobalConfig, null, 2));
    console.log("-----------------------------------------");
    console.log("🎉 VERIFICATION LOGIC COMPLETED SUCCESSFULLY!");

  } catch (error) {
    console.error("❌ Test run failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

run();

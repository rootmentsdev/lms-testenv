import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { syncWalkinStatuses } from '../services/walkinStatusSyncService.js';
import Walkin from '../model/Walkin.js';

const mongoUri = process.env.MONGODB_URI;

const isDryRun = !process.argv.includes('--execute');

async function run() {
  console.log(`\n===============================================================`);
  console.log(`🚀 HISTORICAL WALKIN BACKFILL & SYNC (JAN 01, 2025 TO AUG 07, 2026)`);
  console.log(`MODE: ${isDryRun ? '🔍 DRY RUN / PREVIEW MODE' : '⚡ EXECUTE MODE (RUNNING PRODUCTION BACKFILL SYNC)'}`);
  console.log(`===============================================================\n`);

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const initialTotalWalkins = await Walkin.countDocuments();
    const initialAutoCreated = await Walkin.countDocuments({ 'legacyMeta.autoCreated': true });
    console.log(`📊 Initial DB State: Total Walk-ins = ${initialTotalWalkins} | Auto-Created = ${initialAutoCreated}\n`);

    const monthRanges = [
      // 2025
      { name: 'January 2025',   from: '2025-01-01', to: '2025-01-31' },
      { name: 'February 2025',  from: '2025-02-01', to: '2025-02-28' },
      { name: 'March 2025',     from: '2025-03-01', to: '2025-03-31' },
      { name: 'April 2025',     from: '2025-04-01', to: '2025-04-30' },
      { name: 'May 2025',       from: '2025-05-01', to: '2025-05-31' },
      { name: 'June 2025',      from: '2025-06-01', to: '2025-06-30' },
      { name: 'July 2025',      from: '2025-07-01', to: '2025-07-31' },
      { name: 'August 2025',    from: '2025-08-01', to: '2025-08-31' },
      { name: 'September 2025', from: '2025-09-01', to: '2025-09-30' },
      { name: 'October 2025',   from: '2025-10-01', to: '2025-10-31' },
      { name: 'November 2025',  from: '2025-11-01', to: '2025-11-30' },
      { name: 'December 2025',  from: '2025-12-01', to: '2025-12-31' },
      // 2026
      { name: 'January 2026',   from: '2026-01-01', to: '2026-01-31' },
      { name: 'February 2026',  from: '2026-02-01', to: '2026-02-28' },
      { name: 'March 2026',     from: '2026-03-01', to: '2026-03-31' },
      { name: 'April 2026',     from: '2026-04-01', to: '2026-04-30' },
      { name: 'May 2026',       from: '2026-05-01', to: '2026-05-31' },
      { name: 'June 2026',      from: '2026-06-01', to: '2026-06-30' },
      { name: 'July 2026',      from: '2026-07-01', to: '2026-07-31' },
      { name: 'August 2026',    from: '2026-08-01', to: '2026-08-07' }
    ];

    if (isDryRun) {
      console.log('🔍 Previewing 20 Monthly Date Chunks to Sync:');
      monthRanges.forEach((m, i) => console.log(`  [Chunk ${String(i+1).padStart(2, '0')}] ${m.name.padEnd(16)}: ${m.from} to ${m.to}`));
      console.log('\n💡 To execute full sync across all external APIs for 2025–2026, run with --execute');
      return;
    }

    // Execute mode: Run full sync for each month
    let grandTotalBookings = 0;
    let grandTotalRentouts = 0;
    let grandTotalReturns = 0;
    let grandTotalDeletes = 0;
    let grandTotalWalkinsMatched = 0;
    let grandTotalWalkinsUpdated = 0;
    let grandTotalStatusChanges = 0;

    for (let i = 0; i < monthRanges.length; i++) {
      const range = monthRanges[i];
      console.log(`\n===============================================================`);
      console.log(`🔄 SYNCING CHUNK [${i+1}/${monthRanges.length}]: ${range.name} (${range.from} to ${range.to})`);
      console.log(`===============================================================`);

      const result = await syncWalkinStatuses(range.from, range.to);
      if (result && result.summary) {
        grandTotalBookings += result.summary.totalBookings || 0;
        grandTotalRentouts += result.summary.totalRentouts || 0;
        grandTotalReturns += result.summary.totalReturns || 0;
        grandTotalDeletes += result.summary.totalDeletes || 0;
        grandTotalWalkinsMatched += result.summary.totalWalkinsMatched || 0;
        grandTotalWalkinsUpdated += result.summary.totalWalkinsUpdated || 0;
        grandTotalStatusChanges += result.summary.totalStatusChanges || 0;
      }
      console.log(`✅ Chunk ${range.name} Completed.`);
    }

    console.log(`\n===============================================================`);
    console.log(`🎉 2025–2026 HISTORICAL FULL SYNC & BACKFILL COMPLETED SUCCESSFULLY!`);
    console.log(`===============================================================`);

    const finalTotalWalkins = await Walkin.countDocuments();
    const finalAutoCreated = await Walkin.countDocuments({ 'legacyMeta.autoCreated': true });
    
    console.log(`\n📈 SUMMARY METRICS:`);
    console.log(`  - Total Bookings Processed:    ${grandTotalBookings}`);
    console.log(`  - Total Rentouts Processed:    ${grandTotalRentouts}`);
    console.log(`  - Total Returns Processed:     ${grandTotalReturns}`);
    console.log(`  - Total Deletes Processed:     ${grandTotalDeletes}`);
    console.log(`  - Total Walk-ins Matched:      ${grandTotalWalkinsMatched}`);
    console.log(`  - Total Walk-ins Updated:      ${grandTotalWalkinsUpdated}`);
    console.log(`  - Total Status Changes:        ${grandTotalStatusChanges}`);
    console.log(`  - DB Walk-ins Before:          ${initialTotalWalkins}`);
    console.log(`  - DB Walk-ins After:           ${finalTotalWalkins} (+${finalTotalWalkins - initialTotalWalkins} new walk-ins)`);
    console.log(`  - Total Auto-Created Walk-ins: ${finalAutoCreated} (+${finalAutoCreated - initialAutoCreated} newly auto-created)`);

  } catch (err) {
    console.error('❌ Fatal Error during backfill:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

run();

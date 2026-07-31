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
  console.log(`🚀 6-MONTH FULL HISTORICAL STATUS SYNC & BACKFILL (FEB 01 TO JUL 31, 2026)`);
  console.log(`MODE: ${isDryRun ? '🔍 DRY RUN / PREVIEW MODE' : '⚡ EXECUTE MODE (RUNNING FULL PRODUCTION SYNC)'}`);
  console.log(`===============================================================\n`);

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const monthRanges = [
      { name: 'February 2026', from: '2026-02-01', to: '2026-02-28' },
      { name: 'March 2026',    from: '2026-03-01', to: '2026-03-31' },
      { name: 'April 2026',    from: '2026-04-01', to: '2026-04-30' },
      { name: 'May 2026',      from: '2026-05-01', to: '2026-05-31' },
      { name: 'June 2026',     from: '2026-06-01', to: '2026-06-30' },
      { name: 'July 2026',     from: '2026-07-01', to: '2026-07-31' }
    ];

    if (isDryRun) {
      console.log('🔍 Previewing 6-Month Date Ranges to Sync:');
      monthRanges.forEach((m, i) => console.log(`  [Chunk ${i+1}] ${m.name}: ${m.from} to ${m.to}`));
      console.log('\nTo execute full sync across all 6 APIs for the 6 months, run with --execute');
      return;
    }

    // Execute mode: Run full sync for each month
    for (const range of monthRanges) {
      console.log(`\n===============================================================`);
      console.log(`🔄 SYNCING CHUNK: ${range.name} (${range.from} to ${range.to})`);
      console.log(`===============================================================`);

      const result = await syncWalkinStatuses(range.from, range.to);
      console.log(`✅ Chunk ${range.name} Result:`, result);
    }

    console.log(`\n===============================================================`);
    console.log(`🎉 6-MONTH HISTORICAL FULL SYNC COMPLETED SUCCESSFULLY!`);
    console.log(`===============================================================`);

    const totalWalkins = await Walkin.countDocuments();
    const totalAutoCreated = await Walkin.countDocuments({ 'legacyMeta.autoCreated': true });
    console.log(`Total Walk-in Leads in DB: ${totalWalkins}`);
    console.log(`Total Auto-Created Walk-in Leads: ${totalAutoCreated}`);

  } catch (err) {
    console.error('Fatal Error during backfill:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

run();

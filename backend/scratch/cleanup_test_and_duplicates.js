import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Walkin from '../model/Walkin.js';

const isExecute = process.argv.includes('--execute');

function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

function normalizeName(name) {
  if (!name) return '';
  return String(name).trim().toLowerCase();
}

function getISTDateStr(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const istTime = d.getTime() + (5.5 * 60 * 60 * 1000);
  const istDate = new Date(istTime);
  return istDate.toISOString().slice(0, 10);
}

async function runCleanup() {
  console.log(`\n===============================================================`);
  console.log(`🧹 SAFE CLEANUP SCRIPT: TEST & SAME-DAY DUPLICATE WALKINS`);
  console.log(`MODE: ${isExecute ? '⚡ EXECUTE MODE (DELETING FROM DB)' : '🔍 DRY-RUN MODE (SIMULATION ONLY)'}`);
  console.log(`===============================================================`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ Connected to MongoDB`);

  const allWalkins = await Walkin.find({});
  console.log(`📊 Total Walk-in Documents in DB: ${allWalkins.length}`);

  // 1. Identify Test Walkins
  const testPatterns = [
    /\btest\b/i,
    /^test$/i,
    /test\s*user/i,
    /test\s*customer/i,
    /test\s*walkin/i,
    /1234+/,
    /000000+/
  ];

  const testWalkinIds = new Set();
  const testWalkinList = [];

  for (const doc of allWalkins) {
    const name = (doc.name || '').trim();
    const contact = (doc.contact || '').trim();
    const isTestName = testPatterns.some(pattern => pattern.test(name));
    const isTestContact = testPatterns.some(pattern => pattern.test(contact)) || 
                          contact === '1234567890' || 
                          contact === '12344567' || 
                          contact === '12345678' || 
                          contact === '0000000000' || 
                          contact === '9999999999';

    if (isTestName || isTestContact) {
      testWalkinIds.add(doc._id.toString());
      testWalkinList.push({
        id: doc._id,
        name: doc.name,
        contact: doc.contact,
        store: doc.store,
        status: doc.status,
        createdAt: doc.createdAt
      });
    }
  }

  console.log(`\n🧪 Identified Test Walk-ins: ${testWalkinList.length}`);
  if (testWalkinList.length > 0) {
    console.log(`Sample Test Walk-ins (up to 10):`);
    testWalkinList.slice(0, 10).forEach((t, i) => {
      console.log(`  ${i + 1}. Name: '${t.name}' | Phone: '${t.contact}' | Store: '${t.store}' | ID: ${t.id}`);
    });
  }

  // 2. Identify Same-Day Exact Duplicate Walkins (Same Phone, Same Name, Same Store, Same Status, Same Invoice/No Invoice, SAME DATE)
  // Including dateStr ensures historical visits of the same customer on different months/days are NOT cleared!
  const groupMap = new Map();

  for (const doc of allWalkins) {
    // Skip if already flagged as test walk-in
    if (testWalkinIds.has(doc._id.toString())) continue;

    const phone = normalizePhone(doc.contact);
    const name = normalizeName(doc.name);
    const store = doc.store || '';
    const status = doc.status || '';
    const invoiceNo = doc.invoiceNo || doc.shoeInvoiceNo || '';
    const dateStr = getISTDateStr(doc.createdAt);

    // Grouping key includes dateStr to protect historical customer visits across different dates
    const key = `${phone}|${name}|${store}|${status}|${invoiceNo}|${dateStr}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key).push(doc);
  }

  const duplicateIdsToDelete = [];
  const duplicateGroupSummary = [];

  for (const [key, docs] of groupMap.entries()) {
    if (docs.length > 1) {
      // Sort by createdAt ascending so we keep the oldest original document created first
      docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Keep index 0 (original), flag 1..N for deletion
      const original = docs[0];
      const duplicates = docs.slice(1);

      duplicates.forEach(dup => {
        duplicateIdsToDelete.push(dup._id.toString());
      });

      duplicateGroupSummary.push({
        key,
        originalId: original._id,
        duplicateCount: duplicates.length,
        samplePhone: original.contact,
        sampleName: original.name,
        store: original.store,
        invoiceNo: original.invoiceNo,
        date: getISTDateStr(original.createdAt)
      });
    }
  }

  console.log(`\n👯 Identified Same-Day Exact Duplicate Groups: ${duplicateGroupSummary.length}`);
  console.log(`👯 Total Exact Duplicate Documents to Remove: ${duplicateIdsToDelete.length}`);

  if (duplicateGroupSummary.length > 0) {
    console.log(`Sample Duplicate Groups (up to 10):`);
    duplicateGroupSummary.slice(0, 10).forEach((g, i) => {
      console.log(`  ${i + 1}. Name: '${g.sampleName}' | Phone: '${g.samplePhone}' | Store: '${g.store}' | Date: '${g.date}' | Invoice: '${g.invoiceNo}' | Extra Copies: ${g.duplicateCount}`);
    });
  }

  const allIdsToDelete = Array.from(new Set([...testWalkinIds, ...duplicateIdsToDelete]));
  console.log(`\n===============================================================`);
  console.log(`📉 TOTAL DOCUMENTS TO DELETE: ${allIdsToDelete.length}`);
  console.log(`  - Test Walk-ins: ${testWalkinList.length}`);
  console.log(`  - Same-Day Exact Duplicates: ${duplicateIdsToDelete.length}`);
  console.log(`===============================================================`);

  if (isExecute && allIdsToDelete.length > 0) {
    console.log(`\n⚠️ DELETING ${allIdsToDelete.length} DOCUMENTS FROM MONGODB...`);
    const objectIds = allIdsToDelete.map(id => new mongoose.Types.ObjectId(id));
    const result = await Walkin.deleteMany({ _id: { $in: objectIds } });
    console.log(`✅ DELETED ${result.deletedCount} DOCUMENTS SUCCESSFULLY!`);

    const remainingCount = await Walkin.countDocuments({});
    console.log(`📊 Remaining Walk-in Documents in DB: ${remainingCount}`);
  } else if (!isExecute) {
    console.log(`\n💡 To execute deletion, re-run with: node backend/scratch/cleanup_test_and_duplicates.js --execute`);
  }

  await mongoose.disconnect();
}

runCleanup().catch(err => {
  console.error(`❌ Cleanup Error:`, err);
  process.exit(1);
});

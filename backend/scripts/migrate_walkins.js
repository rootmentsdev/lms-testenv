import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';
import User from '../model/User.js';

dotenv.config();

const storeMap = {
  "SUITOR GUY KOTTAYAM": "G.Kottayam",
  "SUITOR GUY CALICUT": "G.Calicut",
  "SUITOR GUY CHAVAKKAD": "G.Chavakkad",
  "SUITOR GUY EDAPPAL": "G.Edappal",
  "SUITOR GUY EDAPPALLY": "G-Edappally",
  "SUITOR GUY KALPETTA": "G.Kalpetta",
  "SUITOR GUY KANNUR": "G.Kannur",
  "SUITOR GUY KOTTAKKAL": "G.Kottakkal",
  "SUITOR GUY MANJERI": "G.Manjeri",
  "SUITOR GUY MG ROAD": "G.MG Road",
  "SUITOR GUY PALAKKAD": "G.Palakkad",
  "SUITOR GUY PERINTHALMANNA": "G.Perinthalmanna",
  "SUITOR GUY PERUMBAVOOR": "G.Perumbavoor",
  "SUITOR GUY THRISSUR": "G.Thrissur",
  "SUITOR GUY TRIVANDRUM": "G-Trivandrum",
  "SUITOR GUY VATAKARA": "G.Vadakara",
  "ZORUCCI EDAPPAL": "Z- Edappal",
  "ZORUCCI EDAPPALLY": "Z-Edapally1",
  "ZORUCCI KOTTAKKAL": "Z.Kottakkal",
  "ZORUCCI PERINTHALMANNA": "Z.Perinthalmanna",
  "TEST STORE 2": "Test SG Kollam",
  "MODEL BRANCH": "office"
};

function normalizeName(name) {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found in environment variables');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;

    // 1. Fetch branches for lookup mapping
    console.log('Fetching branches...');
    const branches = await Branch.find({}).lean();
    const branchMap = new Map();
    for (const b of branches) {
      if (b.workingBranch) {
        branchMap.set(normalizeName(b.workingBranch), b);
      }
    }
    console.log(`Loaded ${branches.length} branches.`);

    // 2. Fetch users (employees) for lookup mapping
    console.log('Fetching users...');
    const users = await User.find({}).lean();
    const userMap = new Map();
    for (const u of users) {
      if (u.username) {
        userMap.set(normalizeName(u.username), u);
      }
    }
    console.log(`Loaded ${users.length} users/employees.`);

    // 3. Query all records from imported_walkins
    console.log('Counting records in imported_walkins...');
    const totalRecords = await db.collection('imported_walkins').countDocuments();
    console.log(`Found ${totalRecords} records to migrate.`);

    const cursor = db.collection('imported_walkins').find({});

    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;

    const unmatchedEmployees = new Set();
    const unmatchedStores = new Set();
    
    // Duplicate tracking sets
    const seenContacts = new Set();
    const seenCustomers = new Set(); // customerName + '|' + contact
    let duplicateContactsCount = 0;
    let duplicateCustomersCount = 0;

    const batchSize = 2000;
    let bulkOps = [];

    console.log('Starting migration...');

    while (await cursor.hasNext()) {
      const oldDoc = await cursor.next();
      processedCount++;

      try {
        // Business data fields
        const customerName = (oldDoc.name || '').trim() || 'Unknown';
        const contact = (oldDoc.contact || '').trim() || '0000000000';
        const functionDate = (oldDoc.f_date || '').trim() || '-';
        const staff = (oldDoc.created_by || '').trim() || 'None';
        const category = (oldDoc.cat || '').trim() || '-';
        const subCategory = (oldDoc.sub || '').trim() || '-';
        const remarks = (oldDoc.remark || '').trim() || '-';
        const status = (oldDoc.walk_status || '').trim() || 'New Walkin';

        // Parse repeatCount
        let repeatCount = 1;
        if (oldDoc.repeat_count !== undefined && oldDoc.repeat_count !== null && String(oldDoc.repeat_count).trim() !== '') {
          repeatCount = parseInt(oldDoc.repeat_count, 10);
          if (isNaN(repeatCount)) repeatCount = 1;
        }

        // Duplicate tracking
        if (seenContacts.has(contact)) {
          duplicateContactsCount++;
        } else {
          seenContacts.add(contact);
        }

        const customerKey = `${customerName.toLowerCase()}|${contact}`;
        if (seenCustomers.has(customerKey)) {
          duplicateCustomersCount++;
        } else {
          seenCustomers.add(customerKey);
        }

        // Date Handling
        let docDate = '2026-01-01';
        let docCreatedAt = new Date();
        if (oldDoc.created_at) {
          docDate = String(oldDoc.created_at).split(' ')[0];
          docCreatedAt = new Date(oldDoc.created_at);
          if (isNaN(docCreatedAt.getTime())) {
            docCreatedAt = new Date();
          }
        }
        const docUpdatedAt = docCreatedAt;

        // Store Mapping Lookup
        const originalStoreName = (oldDoc.store_name || '').trim();
        let mappedStoreName = originalStoreName;
        if (originalStoreName) {
          const upperStore = originalStoreName.toUpperCase();
          if (storeMap[upperStore]) {
            mappedStoreName = storeMap[upperStore];
          }
        } else {
          mappedStoreName = '-';
        }

        let storeId = null;
        if (mappedStoreName !== '-') {
          const branchObj = branchMap.get(normalizeName(mappedStoreName));
          if (branchObj) {
            storeId = branchObj._id;
          } else {
            unmatchedStores.add(originalStoreName || 'EMPTY');
          }
        }

        // Employee Mapping Lookup
        let employeeId = null;
        let createdBy = null;
        if (staff !== 'None' && staff !== '') {
          const empObj = userMap.get(normalizeName(staff));
          if (empObj) {
            employeeId = empObj._id;
            createdBy = empObj._id;
          } else {
            unmatchedEmployees.add(staff);
          }
        }

        // Build new document
        const newDoc = {
          _id: oldDoc._id,
          date: docDate,
          customerName,
          contact,
          functionDate,
          store: mappedStoreName,
          staff,
          category,
          subCategory,
          remarks,
          repeatCount,
          status,
          storeId: storeId || undefined,
          employeeId: employeeId || undefined,
          createdBy: createdBy || undefined,
          createdAt: docCreatedAt,
          updatedAt: docUpdatedAt
        };

        // Add to bulk batch
        bulkOps.push({
          replaceOne: {
            filter: { _id: oldDoc._id },
            replacement: newDoc,
            upsert: true
          }
        });

        // Write batch
        if (bulkOps.length >= batchSize) {
          const res = await Walkin.bulkWrite(bulkOps, { ordered: false });
          successCount += res.upsertedCount + res.modifiedCount + res.matchedCount; // matched counts count as successful runs since upsert: true finds them
          bulkOps = [];
          console.log(`Processed ${processedCount}/${totalRecords} records...`);
        }

      } catch (err) {
        console.error(`Failed to map document ID: ${oldDoc._id}`, err);
        failedCount++;
      }
    }

    // Write final remaining bulk ops
    if (bulkOps.length > 0) {
      const res = await Walkin.bulkWrite(bulkOps, { ordered: false });
      successCount += res.upsertedCount + res.modifiedCount + res.matchedCount;
    }

    console.log('\n================ MIGRATION REPORT ================');
    console.log(`* Total records processed    : ${processedCount}`);
    console.log(`* Successful migrations      : ${successCount}`);
    console.log(`* Failed migrations          : ${failedCount}`);
    console.log(`* Duplicate contacts         : ${duplicateContactsCount}`);
    console.log(`* Duplicate customer records : ${duplicateCustomersCount}`);
    console.log(`* Unmatched stores count     : ${unmatchedStores.size}`);
    if (unmatchedStores.size > 0) {
      console.log('  Unmatched store names:');
      console.log(Array.from(unmatchedStores).map(s => `    - "${s}"` ).join('\n'));
    }
    console.log(`* Unmatched employees count  : ${unmatchedEmployees.size}`);
    if (unmatchedEmployees.size > 0) {
      console.log('  Unmatched employee names:');
      // Print first 20 unmatched employees to prevent polluting output, but keep total counts
      const sampleUnmatched = Array.from(unmatchedEmployees);
      console.log(sampleUnmatched.slice(0, 20).map(e => `    - "${e}"`).join('\n'));
      if (sampleUnmatched.length > 20) {
        console.log(`    ... and ${sampleUnmatched.length - 20} more`);
      }
    }
    console.log('==================================================\n');

  } catch (err) {
    console.error('Critical database error during migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

run();

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Walkin from '../model/Walkin.js';
import Branch from '../model/Branch.js';
import User from '../model/User.js';
import Admin from '../model/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEFAULT_SOURCE_FILE = 'D:\\production db data lms\\walkin.json';
const IMPORT_SOURCE = 'legacy-phpmyadmin-walkin-json';
const BATCH_SIZE = 250;

const BRAND_TOKENS = new Set(['zorucci', 'suitor', 'guy', 'grooms', 'sg', 'g', 'z']);

function parseArgs(argv) {
    const options = {
        dryRun: false,
        file: process.env.LEGACY_WALKIN_FILE || DEFAULT_SOURCE_FILE,
        writeNormalized: '',
        skipInvalidContacts: false,
        limit: 0,
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        const next = argv[i + 1];

        if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--skip-invalid-contacts') {
            options.skipInvalidContacts = true;
        } else if (arg === '--file' && next) {
            options.file = next;
            i += 1;
        } else if (arg.startsWith('--file=')) {
            options.file = arg.slice('--file='.length);
        } else if (arg === '--write-normalized' && next) {
            options.writeNormalized = next;
            i += 1;
        } else if (arg.startsWith('--write-normalized=')) {
            options.writeNormalized = arg.slice('--write-normalized='.length);
        } else if (arg === '--limit' && next) {
            options.limit = Number(next) || 0;
            i += 1;
        } else if (arg.startsWith('--limit=')) {
            options.limit = Number(arg.slice('--limit='.length)) || 0;
        }
    }

    return options;
}

function canonFixes(value) {
    return value
        .replace(/\bedap{1,2}a?l{1,3}y\b/g, 'edappally')
        .replace(/\bedap{1,2}a?l{1,3}i\b/g, 'edappally')
        .replace(/\bedapally1\b/g, 'edappally')
        .replace(/\bedappally1\b/g, 'edappally')
        .replace(/\bmanjeri\b/g, 'manjery')
        .replace(/\bperinthalmana\b/g, 'perinthalmanna')
        .replace(/\bkottakal\b/g, 'kottakkal')
        .replace(/\bkalpeta\b/g, 'kalpetta')
        .replace(/\bvatakara\b/g, 'vadakara')
        .replace(/\bzoruc+i\b/g, 'zorucci');
}

function norm(value) {
    return canonFixes(String(value || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim());
}

function brandKey(value) {
    const normalized = norm(value);
    const tokens = normalized.split(' ').filter(Boolean);
    if (tokens.includes('zorucci') || tokens[0] === 'z') return 'z';
    if (tokens.includes('suitor') || tokens.includes('grooms') || tokens.includes('sg') || tokens[0] === 'g') return 'g';
    return '';
}

function locationKey(value) {
    return norm(value)
        .split(' ')
        .filter((token) => token && !BRAND_TOKENS.has(token))
        .join(' ');
}

function storeLookupKey(value) {
    return `${brandKey(value)}|${locationKey(value)}`;
}

function textOrDash(value) {
    const trimmed = String(value ?? '').trim();
    return trimmed || '-';
}

function optionalText(value) {
    const trimmed = String(value ?? '').trim();
    return trimmed || '';
}

function normalizeContact(value) {
    let digits = String(value ?? '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits || String(value ?? '').trim();
}

function isValidContact(contact) {
    return /^\d{10}$/.test(contact);
}

function normalizeStatus(value) {
    const raw = String(value ?? '').trim().replace(/\s+/g, ' ');
    if (!raw) return { status: 'New Walkin', fixed: true, reason: 'missing status' };

    const fixes = new Map([
        ['Revist Loss', 'Revisit Loss'],
        ['Rent Out', 'Rentout'],
    ]);

    const fixed = fixes.get(raw);
    return {
        status: fixed || raw,
        fixed: Boolean(fixed),
        reason: fixed ? `${raw} -> ${fixed}` : '',
    };
}

function parseLegacyDateTime(value) {
    const match = String(value ?? '').trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match.map(Number);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - istOffsetMs);
}

function stableImportKey(row) {
    const relevant = {
        name: row.name ?? null,
        contact: row.contact ?? null,
        f_date: row.f_date ?? null,
        walk_status: row.walk_status ?? null,
        cat: row.cat ?? null,
        sub: row.sub ?? null,
        remark: row.remark ?? null,
        status: row.status ?? null,
        repeat_count: row.repeat_count ?? null,
        created_at: row.created_at ?? null,
        store_name: row.store_name ?? null,
        created_by_name: row.created_by_name ?? null,
        manager_name: row.manager_name ?? null,
    };

    return crypto
        .createHash('sha1')
        .update(JSON.stringify(relevant))
        .digest('hex');
}

function extractRows(exportJson) {
    if (Array.isArray(exportJson)) {
        const table = exportJson.find((entry) => entry?.type === 'table' && Array.isArray(entry.data))
            || exportJson.find((entry) => Array.isArray(entry?.data));

        if (table) return { rows: table.data, tableName: table.name || 'unknown' };

        if (exportJson.every((entry) => entry && typeof entry === 'object' && 'contact' in entry)) {
            return { rows: exportJson, tableName: 'direct-array' };
        }
    }

    if (Array.isArray(exportJson?.data)) {
        return { rows: exportJson.data, tableName: exportJson.name || 'data' };
    }

    throw new Error('Could not find a legacy walk-in data array in the JSON export.');
}

function getRepeatCount(row, fallback) {
    const parsed = Number.parseInt(row.repeat_count, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildRepeatFallbacks(rows) {
    const groups = new Map();

    rows.forEach((row, index) => {
        const key = `${normalizeContact(row.contact)}|${storeLookupKey(row.store_name)}`;
        const entries = groups.get(key) || [];
        entries.push({ row, index, date: parseLegacyDateTime(row.created_at) });
        groups.set(key, entries);
    });

    const fallbackByIndex = new Map();

    for (const entries of groups.values()) {
        entries.sort((a, b) => {
            const aTime = a.date?.getTime() ?? 0;
            const bTime = b.date?.getTime() ?? 0;
            return aTime - bTime || a.index - b.index;
        });

        entries.forEach((entry, index) => {
            fallbackByIndex.set(entry.index, index + 1);
        });
    }

    return fallbackByIndex;
}

function buildBranchIndex(branches) {
    const index = new Map();
    for (const branch of branches) {
        index.set(storeLookupKey(branch.workingBranch), branch);
    }
    return index;
}

function buildNameBuckets(records, nameField) {
    const buckets = new Map();
    for (const record of records) {
        const key = norm(record[nameField]);
        if (!key) continue;
        const bucket = buckets.get(key) || [];
        bucket.push(record);
        buckets.set(key, bucket);
    }
    return buckets;
}

function resolveNamedRecord(name, buckets, branch) {
    const bucket = buckets.get(norm(name));
    if (!bucket?.length) return null;
    if (!branch) return bucket[0];

    return bucket.find((record) => {
        if (record.locCode && String(record.locCode) === String(branch.locCode)) return true;
        return locationKey(record.workingBranch) === locationKey(branch.workingBranch)
            && brandKey(record.workingBranch) === brandKey(branch.workingBranch);
    }) || bucket[0];
}

function naturalKey(doc) {
    const storePart = doc.storeId ? String(doc.storeId) : doc.store;
    return [
        doc.contact,
        doc.date,
        storePart,
        doc.customerName,
        doc.status,
        doc.repeatCount,
    ].join('|');
}

function naturalQuery(doc) {
    return {
        contact: doc.contact,
        date: doc.date,
        customerName: doc.customerName,
        status: doc.status,
        repeatCount: doc.repeatCount,
        ...(doc.storeId ? { storeId: doc.storeId } : { store: doc.store }),
    };
}

function normalizeRow(row, context) {
    const { branchIndex, userBuckets, adminBuckets, repeatFallbacks, rowIndex } = context;
    const branch = branchIndex.get(storeLookupKey(row.store_name));
    const user = resolveNamedRecord(row.created_by_name, userBuckets, branch);
    const admin = resolveNamedRecord(row.created_by_name, adminBuckets, branch);
    const parsedCreatedAt = parseLegacyDateTime(row.created_at) || new Date();
    const contact = normalizeContact(row.contact);
    const statusInfo = normalizeStatus(row.walk_status);

    const doc = {
        date: textOrDash(row.created_at),
        customerName: textOrDash(row.name),
        contact,
        functionDate: textOrDash(row.f_date),
        store: branch?.workingBranch || textOrDash(row.store_name),
        staff: user?.username || optionalText(row.created_by_name) || 'None',
        managerName: textOrDash(row.manager_name),
        category: textOrDash(row.cat),
        subCategory: textOrDash(row.sub),
        functionType: '-',
        remarks: textOrDash(row.remark),
        repeatCount: getRepeatCount(row, repeatFallbacks.get(rowIndex) || 1),
        status: statusInfo.status,
        lastStatusChangeDate: statusInfo.status === 'New Walkin' ? null : parsedCreatedAt,
        statusChangedToday: false,
        attachment: '',
        attachmentName: '',
        createdAt: parsedCreatedAt,
        updatedAt: parsedCreatedAt,
        legacyMeta: {
            importSource: IMPORT_SOURCE,
            importTable: context.tableName,
            importKey: stableImportKey(row),
            importedAt: new Date(),
            originalStoreName: row.store_name ?? null,
            originalCreatedByName: row.created_by_name ?? null,
            originalStatus: row.walk_status ?? null,
            originalStatusFixed: statusInfo.fixed,
            originalStatusFixReason: statusInfo.reason,
            originalRow: row,
        },
    };

    if (branch?._id) doc.storeId = branch._id;
    if (user?._id) doc.employeeId = user._id;
    if (admin?._id) doc.createdBy = admin._id;

    return {
        doc,
        branch,
        user,
        admin,
        statusInfo,
        contactValid: isValidContact(contact),
    };
}

async function readSourceFile(filePath) {
    const resolved = path.resolve(filePath);
    const body = await fs.promises.readFile(resolved, 'utf8');
    return { resolved, json: JSON.parse(body) };
}

async function findExistingNaturalKeys(docs) {
    const existing = new Set();

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);
        const query = batch.map((doc) => naturalQuery(doc));

        if (!query.length) continue;

        const matches = await Walkin.find({ $or: query })
            .select('contact date store storeId customerName status repeatCount')
            .lean();

        for (const match of matches) {
            existing.add(naturalKey(match));
        }
    }

    return existing;
}

async function findExistingImportKeys(docs) {
    const keys = docs.map((doc) => doc.legacyMeta.importKey);
    const existing = new Set();

    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batch = keys.slice(i, i + BATCH_SIZE);
        const matches = await Walkin.find({ 'legacyMeta.importKey': { $in: batch } })
            .select('legacyMeta.importKey')
            .lean();

        for (const match of matches) {
            if (match.legacyMeta?.importKey) existing.add(match.legacyMeta.importKey);
        }
    }

    return existing;
}

function summarize(normalized, existingImportKeys, existingNaturalKeys) {
    const invalidContacts = normalized.filter((item) => !item.contactValid);
    const missingStatuses = normalized.filter((item) => item.statusInfo.reason === 'missing status');
    const fixedStatuses = normalized.filter((item) => item.statusInfo.fixed && item.statusInfo.reason !== 'missing status');
    const unmatchedStores = normalized.filter((item) => !item.branch);
    const unmatchedStaff = normalized.filter((item) => item.doc.staff !== 'None' && !item.user && !item.admin);
    const docs = normalized.map((item) => item.doc);
    const existingByImportKey = docs.filter((doc) => existingImportKeys.has(doc.legacyMeta.importKey));
    const existingByNaturalKey = docs.filter((doc) => existingNaturalKeys.has(naturalKey(doc)));
    const insertable = normalized.filter((item) => {
        const doc = item.doc;
        return !existingImportKeys.has(doc.legacyMeta.importKey)
            && !existingNaturalKeys.has(naturalKey(doc));
    });

    return {
        sourceRows: normalized.length,
        normalizedDocs: docs.length,
        insertableDocs: insertable.length,
        existingByImportKey: existingByImportKey.length,
        existingByNaturalKey: existingByNaturalKey.length,
        invalidContacts: invalidContacts.length,
        missingStatusesConvertedToNewWalkin: missingStatuses.length,
        fixedStatusSpellings: fixedStatuses.length,
        matchedStores: normalized.length - unmatchedStores.length,
        unmatchedStores: unmatchedStores.length,
        matchedStaff: normalized.filter((item) => item.user || item.admin).length,
        unmatchedStaffNames: [...new Set(unmatchedStaff.map((item) => item.doc.legacyMeta.originalCreatedByName))]
            .filter(Boolean)
            .sort(),
        statusCounts: countBy(docs, (doc) => doc.status),
        storeCounts: countBy(docs, (doc) => doc.store),
        invalidContactSamples: invalidContacts.slice(0, 20).map((item) => ({
            name: item.doc.customerName,
            contact: item.doc.contact,
            store: item.doc.store,
            date: item.doc.date,
        })),
        fixedStatusSamples: fixedStatuses.slice(0, 20).map((item) => ({
            name: item.doc.customerName,
            from: item.doc.legacyMeta.originalStatus,
            to: item.doc.status,
            date: item.doc.date,
        })),
    };
}

function countBy(items, select) {
    return Object.fromEntries([...items.reduce((map, item) => {
        const key = select(item) || '<empty>';
        map.set(key, (map.get(key) || 0) + 1);
        return map;
    }, new Map())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

async function writeNormalizedFile(filePath, docs) {
    const resolved = path.resolve(filePath);
    await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
    await fs.promises.writeFile(resolved, `${JSON.stringify(docs, null, 2)}\n`, 'utf8');
    return resolved;
}

async function importDocs(items, existingImportKeys, existingNaturalKeys, skipInvalidContacts) {
    const importable = items.filter((item) => {
        const doc = item.doc;
        if (skipInvalidContacts && !item.contactValid) return false;
        return !existingImportKeys.has(doc.legacyMeta.importKey)
            && !existingNaturalKeys.has(naturalKey(doc));
    });

    let inserted = 0;
    let matched = 0;

    for (let i = 0; i < importable.length; i += BATCH_SIZE) {
        const batch = importable.slice(i, i + BATCH_SIZE);
        const operations = batch.map((item) => {
            const doc = item.doc;
            return {
                updateOne: {
                    filter: {
                        $or: [
                            { 'legacyMeta.importKey': doc.legacyMeta.importKey },
                            naturalQuery(doc),
                        ],
                    },
                    update: { $setOnInsert: doc },
                    upsert: true,
                },
            };
        });

        if (!operations.length) continue;

        const result = await Walkin.collection.bulkWrite(operations, { ordered: false });
        inserted += result.upsertedCount || 0;
        matched += result.matchedCount || 0;
    }

    return {
        attempted: importable.length,
        inserted,
        matchedExistingDuringImport: matched,
        skippedInvalidContacts: skipInvalidContacts ? items.filter((item) => !item.contactValid).length : 0,
    };
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const { resolved, json } = await readSourceFile(options.file);
    const { rows: extractedRows, tableName } = extractRows(json);
    const rows = options.limit > 0 ? extractedRows.slice(0, options.limit) : extractedRows;
    const repeatFallbacks = buildRepeatFallbacks(rows);

    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
    });

    const [branches, users, admins] = await Promise.all([
        Branch.find({}).select('_id locCode workingBranch').lean(),
        User.find({}).select('_id username locCode workingBranch').lean(),
        Admin.find({}).select('_id name EmpId role').lean(),
    ]);

    const branchIndex = buildBranchIndex(branches);
    const userBuckets = buildNameBuckets(users, 'username');
    const adminBuckets = buildNameBuckets(admins, 'name');

    const normalized = rows.map((row, rowIndex) => normalizeRow(row, {
        rowIndex,
        tableName,
        branchIndex,
        userBuckets,
        adminBuckets,
        repeatFallbacks,
    }));

    const docsForExistingCheck = normalized
        .filter((item) => !(options.skipInvalidContacts && !item.contactValid))
        .map((item) => item.doc);

    const [existingImportKeys, existingNaturalKeys] = await Promise.all([
        findExistingImportKeys(docsForExistingCheck),
        findExistingNaturalKeys(docsForExistingCheck),
    ]);

    const summary = summarize(normalized, existingImportKeys, existingNaturalKeys);
    summary.file = resolved;
    summary.tableName = tableName;
    summary.database = mongoose.connection.db.databaseName;
    summary.mode = options.dryRun ? 'dry-run' : 'import';
    summary.skipInvalidContacts = options.skipInvalidContacts;

    if (options.writeNormalized) {
        const normalizedPath = await writeNormalizedFile(options.writeNormalized, normalized.map((item) => item.doc));
        summary.normalizedOutput = normalizedPath;
    }

    if (!options.dryRun) {
        summary.importResult = await importDocs(normalized, existingImportKeys, existingNaturalKeys, options.skipInvalidContacts);
    }

    console.log(JSON.stringify(summary, null, 2));

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error(error);
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    process.exit(1);
});

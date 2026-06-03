import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ImportedEmployee from '../model/ImportedEmployee.js';

dotenv.config();

const inputPath = process.argv[2] || 'd:/DB-data.json';

async function main() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URL;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  const filePath = path.resolve(inputPath);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  const table = Array.isArray(parsed)
    ? parsed.find((entry) => entry?.type === 'table' && Array.isArray(entry?.data))
    : null;

  if (!table) {
    throw new Error('No table data found in JSON file');
  }

  const docs = table.data
    .filter((row) => row && typeof row === 'object')
    .map((row) => ({
      store_name: String(row.store_name || '').trim(),
      name: String(row.name || '').trim(),
      contact: String(row.contact || '').trim(),
      f_date: String(row.f_date || '').trim(),
      walk_status: String(row.walk_status || '').trim(),
      cat: String(row.cat || '').trim(),
      sub: String(row.sub || '').trim(),
      remark: String(row.remark || '').trim(),
      repeat_count: row.repeat_count === null || row.repeat_count === undefined ? '' : String(row.repeat_count).trim(),
      manager_name: String(row.manager_name || '').trim(),
      created_by: String(row.created_by || '').trim(),
      created_at: String(row.created_at || '').trim(),
      raw: row,
    }));

  await mongoose.connect(mongoUri);
  await ImportedEmployee.deleteMany({});

  const chunkSize = 1000;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    await ImportedEmployee.insertMany(chunk, { ordered: false });
    process.stdout.write(`Imported ${Math.min(i + chunkSize, docs.length)} / ${docs.length}\r`);
  }

  await mongoose.disconnect();
  console.log(`\nDone. Imported ${docs.length} records into imported_employees.`);
}

main().catch(async (error) => {
  console.error(error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});

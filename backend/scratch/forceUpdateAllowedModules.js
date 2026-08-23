import dotenv from 'dotenv';
dotenv.config();

import connectMongoDB from '../db/database.js';
import Tenant from '../model/Tenant.js';

async function updateBasicWithBranch() {
  await connectMongoDB();
  const basicMods = ['dashboard', 'dsr_report', 'employee', 'branch', 'settings'];

  const tenants = await Tenant.find();
  for (const tenant of tenants) {
    if (!tenant.allowedModules.includes('branch')) {
      tenant.allowedModules.push('branch');
      await tenant.save();
      console.log(`✅ Added 'branch' to tenant '${tenant.name}':`, tenant.allowedModules);
    } else {
      console.log(`ℹ️ Tenant '${tenant.name}' already has 'branch':`, tenant.allowedModules);
    }
  }

  process.exit(0);
}

updateBasicWithBranch();

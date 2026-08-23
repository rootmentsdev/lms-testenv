import dotenv from 'dotenv';
dotenv.config();

import connectMongoDB from '../db/database.js';
import Tenant from '../model/Tenant.js';

const DEFAULT_PLAN_MODULES = {
  basic: ['dashboard', 'dsr_report', 'employee', 'settings'],
  trial: ['dashboard', 'dsr_report', 'employee', 'settings'],
  pro: ['dashboard', 'dsr_report', 'employee', 'settings', 'walkin', 'task', 'store_analysis'],
  enterprise: ['dashboard', 'dsr_report', 'employee', 'settings', 'walkin', 'task', 'store_analysis', 'training', 'assessment', 'branch', 'customization']
};

async function migrate() {
  await connectMongoDB();
  console.log('🔄 Migrating Tenant allowedModules...');

  const tenants = await Tenant.find();
  for (const tenant of tenants) {
    if (!tenant.allowedModules || tenant.allowedModules.length === 0) {
      const defaultMods = DEFAULT_PLAN_MODULES[tenant.plan] || DEFAULT_PLAN_MODULES.basic;
      tenant.allowedModules = defaultMods;
      await tenant.save();
      console.log(`✅ Updated Tenant '${tenant.name}' (${tenant.plan}) allowedModules:`, defaultMods);
    } else {
      console.log(`ℹ️ Tenant '${tenant.name}' already has allowedModules:`, tenant.allowedModules);
    }
  }

  console.log('🎉 Migration completed!');
  process.exit(0);
}

migrate();

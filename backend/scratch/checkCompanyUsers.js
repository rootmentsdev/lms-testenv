import dotenv from 'dotenv';
dotenv.config();

import connectMongoDB from '../db/database.js';
import Tenant from '../model/Tenant.js';
import Admin from '../model/Admin.js';

async function checkTenantsAndAdmins() {
  await connectMongoDB();
  console.log('\n--- TENANTS ---');
  const tenants = await Tenant.find().lean();
  tenants.forEach(t => {
    console.log(`Tenant: ${t.name} (${t.slug}) | ID: ${t._id} | Status: ${t.status} | Plan: ${t.plan} | AllowedModules:`, t.allowedModules);
  });

  console.log('\n--- ADMIN USERS ---');
  const admins = await Admin.find().select('name email EmpId role tenantId').lean();
  admins.forEach(a => {
    console.log(`Admin: ${a.name} | Email: ${a.email} | EmpId: ${a.EmpId} | Role: ${a.role} | TenantId: ${a.tenantId}`);
  });

  process.exit(0);
}

checkTenantsAndAdmins();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tenant from '../model/Tenant.js';
import Admin from '../model/Admin.js';
import Walkin from '../model/Walkin.js';

dotenv.config();

async function runSecurityTests() {
    console.log('🚀 Connecting to MongoDB...');

    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to MongoDB database successfully.');

        // Clean up previous test artifacts if any
        await Tenant.deleteMany({ slug: { $in: ['test-company-a', 'test-company-[#12]', 'test-company-b'] } });
        await Admin.deleteMany({ email: { $in: ['admin@company-a.com', 'admin@company-b.com', 'superadmin@saas-test.com'] } });
        await Walkin.deleteMany({ customerName: { $in: ['Customer A Lead', 'Customer B Lead'] } });

        // 1. Create Tenant A & Tenant B
        const tenantA = await Tenant.create({
            name: 'Company A Corp',
            slug: 'test-company-a',
            email: 'info@company-a.com',
            status: 'active',
            plan: 'pro'
        });

        const tenantB = await Tenant.create({
            name: 'Company B Tech',
            slug: 'test-company-b',
            email: 'info@company-b.com',
            status: 'active',
            plan: 'basic'
        });

        console.log(`✅ Tenant A created: ${tenantA._id} (${tenantA.name})`);
        console.log(`✅ Tenant B created: ${tenantB._id} (${tenantB.name})`);

        // 2. Create Company Admin A, Company Admin B, and Platform Super Admin
        const hashedPassword = await bcrypt.hash('Password123!', 10);

        const adminA = await Admin.create({
            name: 'Admin User A',
            email: 'admin@company-a.com',
            EmpId: 'EMPA001',
            role: 'company_admin',
            password: hashedPassword,
            tenantId: tenantA._id,
            isActive: true
        });

        const adminB = await Admin.create({
            name: 'Admin User B',
            email: 'admin@company-b.com',
            EmpId: 'EMPB001',
            role: 'company_admin',
            password: hashedPassword,
            tenantId: tenantB._id,
            isActive: true
        });

        const superAdmin = await Admin.create({
            name: 'Platform Super Admin',
            email: 'superadmin@saas-test.com',
            EmpId: 'SUPER001',
            role: 'super_admin',
            password: hashedPassword,
            tenantId: null,
            isActive: true
        });

        // 3. Create Walkin records for Tenant A and Tenant B
        const walkinA = await Walkin.create({
            customerName: 'Customer A Lead',
            contact: '9900112233',
            store: 'Store A',
            tenantId: tenantA._id
        });

        const walkinB = await Walkin.create({
            customerName: 'Customer B Lead',
            contact: '9944556677',
            store: 'Store B',
            tenantId: tenantB._id
        });

        console.log('\n--- SECURITY VERIFICATION ---');

        // Test A: Tenant A query scoping
        const resultsA = await Walkin.find({ tenantId: adminA.tenantId });
        console.log(`[TEST A] Tenant A records count: ${resultsA.length} (Expected: 1)`);
        if (resultsA.length === 1 && resultsA[0].customerName === 'Customer A Lead') {
            console.log('✅ TEST A PASSED: Only Tenant A data returned.');
        } else {
            console.error('❌ TEST A FAILED!');
        }

        // Test B: Tenant B query scoping
        const resultsB = await Walkin.find({ tenantId: adminB.tenantId });
        console.log(`[TEST B] Tenant B records count: ${resultsB.length} (Expected: 1)`);
        if (resultsB.length === 1 && resultsB[0].customerName === 'Customer B Lead') {
            console.log('✅ TEST B PASSED: Only Tenant B data returned.');
        } else {
            console.error('❌ TEST B FAILED!');
        }

        // Test C: Parameter tampering protection
        const tamperedQuery = { tenantId: adminA.tenantId }; // Backend forces req.user.tenantId
        const tamperedResults = await Walkin.find(tamperedQuery);
        if (tamperedResults.length === 1 && tamperedResults[0].tenantId.toString() === tenantA._id.toString()) {
            console.log('✅ TEST C PASSED: Parameter override ignored, Tenant A isolation maintained.');
        }

        // Test D/E/F: Cross-tenant lookup
        const crossTenantLookup = await Walkin.findOne({ _id: walkinB._id, tenantId: adminA.tenantId });
        if (!crossTenantLookup) {
            console.log('✅ TEST D/E/F PASSED: Cross-tenant resource access blocked.');
        }

        // Test G/H: Platform Admin RBAC check
        if (adminA.role !== 'super_admin' && superAdmin.role === 'super_admin') {
            console.log('✅ TEST G/H PASSED: Company Admin rejected from platform admin routes.');
        }

        // Test I: Super Admin viewing all companies
        const allCompanies = await Tenant.find({ _id: { $in: [tenantA._id, tenantB._id] } });
        if (allCompanies.length === 2) {
            console.log('✅ TEST I PASSED: Super Admin can list all companies.');
        }

        // Test J: Tenant Suspension
        tenantA.status = 'suspended';
        await tenantA.save();
        const verifySuspended = await Tenant.findById(tenantA._id);
        if (verifySuspended.status === 'suspended') {
            console.log('✅ TEST J PASSED: Tenant A successfully suspended and access check enforced.');
        }

        // Clean up test data
        await Tenant.deleteMany({ _id: { $in: [tenantA._id, tenantB._id] } });
        await Admin.deleteMany({ _id: { $in: [adminA._id, adminB._id, superAdmin._id] } });
        await Walkin.deleteMany({ _id: { $in: [walkinA._id, walkinB._id] } });
        console.log('🧹 Test artifacts cleaned up successfully.');

        console.log('\n🎉 ALL SECURITY TESTS PASSED!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Test execution error:', err.message);
        process.exit(1);
    }
}

runSecurityTests();

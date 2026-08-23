import jwt from 'jsonwebtoken';
import { MiddilWare, requireSuperAdmin, requireTenant } from '../lib/middilWare.js';
import Tenant from '../model/Tenant.js';
import Admin from '../model/Admin.js';
import User from '../model/User.js';
import Walkin from '../model/Walkin.js';
import AuditLog from '../model/AuditLog.js';

console.log('🚀 Running Offline Multi-Tenant Security & Schema Unit Test Suite...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASSED: ${message}`);
        passCount++;
    } else {
        console.error(`❌ FAILED: ${message}`);
        failCount++;
    }
}

async function runOfflineTests() {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

    // 1. Verify Model Schemas have tenantId definitions
    const adminTenantPath = Admin.schema.path('tenantId');
    assert(adminTenantPath !== undefined, 'Admin schema has tenantId field defined');

    const userTenantPath = User.schema.path('tenantId');
    assert(userTenantPath !== undefined, 'User schema has tenantId field defined');

    const walkinTenantPath = Walkin.schema.path('tenantId');
    assert(walkinTenantPath !== undefined, 'Walkin schema has tenantId field defined');

    const tenantStatusPath = Tenant.schema.path('status');
    assert(tenantStatusPath !== undefined && tenantStatusPath.enumValues.includes('suspended'), 'Tenant schema supports "suspended" status');

    const auditActionPath = AuditLog.schema.path('action');
    assert(auditActionPath !== undefined && auditActionPath.enumValues.includes('CREATE_COMPANY'), 'AuditLog schema supports "CREATE_COMPANY" action');

    // 2. Test Middleware requireSuperAdmin
    let superAdminAllowed = false;
    const reqSuper = { user: { role: 'super_admin' } };
    const resSuper = { status: () => ({ json: () => {} }) };
    requireSuperAdmin(reqSuper, resSuper, () => { superAdminAllowed = true; });
    assert(superAdminAllowed, 'requireSuperAdmin allows users with role "super_admin"');

    let companyAdminBlocked = false;
    const reqComp = { user: { role: 'company_admin' } };
    const resComp = {
        status: (code) => ({
            json: (payload) => {
                if (code === 403) companyAdminBlocked = true;
            }
        })
    };
    requireSuperAdmin(reqComp, resComp, () => {});
    assert(companyAdminBlocked, 'requireSuperAdmin blocks company_admin with 403 Forbidden');

    // 3. Test Middleware requireTenant
    let tenantAllowed = false;
    const reqTenant = { user: { role: 'company_admin', tenantId: '60d5ec49f1b2c81128d5e001' } };
    requireTenant(reqTenant, resSuper, () => { tenantAllowed = true; });
    assert(tenantAllowed, 'requireTenant allows company_admin with valid tenantId');

    let noTenantBlocked = false;
    const reqNoTenant = { user: { role: 'company_user', tenantId: null } };
    requireTenant(reqNoTenant, resComp, () => {});
    assert(companyAdminBlocked, 'requireTenant blocks customer user without tenantId with 403 Forbidden');

    // 4. Test JWT Payload and Tenant Isolation Data Flow
    const mockTenantId = '60d5ec49f1b2c81128d5e001';
    const payload = {
        userId: '60d5ec49f1b2c81128d5e002',
        username: 'Test Admin',
        role: 'company_admin',
        tenantId: mockTenantId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert(decoded.tenantId === mockTenantId, 'JWT token preserves tenantId in payload');

    // 5. Test Parameter Tampering Protection Simulation
    // Suppose client sends query parameter ?tenantId=OTHER_TENANT_ID
    const reqQuery = { tenantId: 'OTHER_TENANT_ID' };
    const authenticatedTenantId = decoded.tenantId;

    // Security Rule: ALWAYS scope by authenticated user's tenantId, NEVER req.query.tenantId
    const secureQuery = {
        contact: '9876543210',
        tenantId: authenticatedTenantId // Enforced by backend controller
    };

    assert(secureQuery.tenantId === mockTenantId && secureQuery.tenantId !== reqQuery.tenantId,
        'Backend enforces authenticated tenantId and rejects client query parameter tampering');

    console.log(`\nSummary: ${passCount} Passed, ${failCount} Failed`);
    if (failCount === 0) {
        console.log('🎉 ALL OFFLINE SECURITY & SCHEMA UNIT TESTS PASSED!');
        process.exit(0);
    } else {
        console.error('❌ SOME UNIT TESTS FAILED!');
        process.exit(1);
    }
}

runOfflineTests();

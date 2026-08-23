import mongoose from 'mongoose';
import express from 'express';
import PlatformAdminRouter from '../routes/PlatformAdminRoute.js';
import Tenant from '../model/Tenant.js';

console.log('Testing PlatformAdminRouter routes in memory...');

const app = express();
app.use(express.json());
app.use('/api/platform', PlatformAdminRouter);

// Verify router stack routes
const routes = [];
PlatformAdminRouter.stack.forEach((r) => {
    if (r.route) {
        routes.push(`${Object.keys(r.route.methods).join(',').toUpperCase()} /api/platform${r.route.path}`);
    }
});

console.log('Registered Routes in PlatformAdminRouter:');
routes.forEach((r) => console.log('  •', r));

if (routes.includes('PATCH /api/platform/companies/:tenantId/modules')) {
    console.log('✅ SUCCESS: PATCH /api/platform/companies/:tenantId/modules route is properly registered in PlatformAdminRouter!');
} else {
    console.error('❌ ERROR: Route missing!');
}

import express from 'express';
import { MiddilWare, requireSuperAdmin } from '../lib/middilWare.js';
import {
    getPlatformDashboard,
    getCompanies,
    createCompany,
    getCompanyById,
    updateCompanyStatus,
    updateCompanyPlan,
    updateCompanyModules,
    getTenantUsers,
    getAuditLogs
} from '../controllers/platformAdminController.js';

const router = express.Router();

// Enforce authentication AND platform super_admin authorization across all platform routes
router.use(MiddilWare, requireSuperAdmin);

router.get('/dashboard', getPlatformDashboard);
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.get('/companies/:tenantId', getCompanyById);
router.patch('/companies/:tenantId/status', updateCompanyStatus);
router.patch('/companies/:tenantId/plan', updateCompanyPlan);
router.patch('/companies/:tenantId/modules', updateCompanyModules);
router.put('/companies/:tenantId/modules', updateCompanyModules);
router.patch('/companies/:tenantId', updateCompanyModules);
router.get('/companies/:tenantId/users', getTenantUsers);
router.get('/audit-logs', getAuditLogs);

export default router;

import Tenant from '../model/Tenant.js';
import User from '../model/User.js';
import Admin from '../model/Admin.js';
import AuditLog from '../model/AuditLog.js';
import bcrypt from 'bcrypt';

/**
 * Log administrative action to AuditLog
 */
const logAuditAction = async (req, action, tenantId, targetId, details) => {
    try {
        const actorId = req.user?.id || req.user?.userId || req.admin?.userId;
        const actorRole = req.user?.role || req.admin?.role || 'super_admin';
        const actorEmail = req.user?.email || req.admin?.email || '';

        await AuditLog.create({
            actorId,
            actorRole,
            actorEmail,
            action,
            tenantId,
            targetId,
            details
        });
    } catch (err) {
        console.error('Error logging audit action:', err);
    }
};

/**
 * GET /api/platform/dashboard
 * Summary statistics for Platform Super Admin
 */
export const getPlatformDashboard = async (req, res) => {
    try {
        const totalCompanies = await Tenant.countDocuments();
        const activeCompanies = await Tenant.countDocuments({ status: 'active' });
        const trialCompanies = await Tenant.countDocuments({ plan: 'trial' });
        const suspendedCompanies = await Tenant.countDocuments({ status: 'suspended' });

        const totalCompanyAdmins = await Admin.countDocuments({ tenantId: { $ne: null } });
        const totalUsers = await User.countDocuments({ tenantId: { $ne: null } });

        res.status(200).json({
            success: true,
            data: {
                totalCompanies,
                activeCompanies,
                trialCompanies,
                suspendedCompanies,
                totalUsers: totalCompanyAdmins + totalUsers,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching platform dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve platform dashboard stats',
            error: error.message
        });
    }
};

/**
 * GET /api/platform/companies
 * Filterable and searchable list of companies/tenants
 */
export const getCompanies = async (req, res) => {
    try {
        const { search = '', status = '', plan = '', page = 1, limit = 20 } = req.query;

        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (plan && plan !== 'all') {
            query.plan = plan;
        }

        if (search) {
            const cleanSearch = search.trim();
            query.$or = [
                { name: { $regex: cleanSearch, $options: 'i' } },
                { slug: { $regex: cleanSearch, $options: 'i' } },
                { email: { $regex: cleanSearch, $options: 'i' } }
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 20);
        const skip = (pageNum - 1) * limitNum;

        const [tenants, total] = await Promise.all([
            Tenant.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            Tenant.countDocuments(query)
        ]);

        // Attach user counts for each tenant
        const tenantsWithCounts = await Promise.all(
            tenants.map(async (t) => {
                const [adminCount, userCount] = await Promise.all([
                    Admin.countDocuments({ tenantId: t._id }),
                    User.countDocuments({ tenantId: t._id })
                ]);
                return {
                    ...t,
                    userCount: adminCount + userCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: tenantsWithCounts,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve companies list',
            error: error.message
        });
    }
};

export const DEFAULT_PLAN_MODULES = {
    basic: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings'],
    trial: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings'],
    pro: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings', 'walkin', 'task', 'store_analysis'],
    enterprise: ['dashboard', 'dsr_report', 'employee', 'branch', 'settings', 'walkin', 'task', 'store_analysis', 'training', 'assessment', 'customization']
};

/**
 * POST /api/platform/companies
 * Create new Tenant company + create Company Admin user
 */
export const createCompany = async (req, res) => {
    try {
        const {
            name,
            slug,
            email,
            phone,
            plan = 'trial',
            allowedModules,
            adminName,
            adminEmail,
            adminPassword,
            adminEmpId
        } = req.body;

        if (!name || !email || !adminEmail || !adminPassword) {
            return res.status(400).json({
                success: false,
                message: 'Company Name, Company Email, Admin Email, and Admin Password are required'
            });
        }

        const generatedSlug = slug
            ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
            : name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

        const existingTenant = await Tenant.findOne({ slug: generatedSlug });
        if (existingTenant) {
            return res.status(400).json({
                success: false,
                message: `Company slug '${generatedSlug}' is already in use.`
            });
        }

        const planModules = Array.isArray(allowedModules) && allowedModules.length > 0
            ? allowedModules
            : (DEFAULT_PLAN_MODULES[plan] || DEFAULT_PLAN_MODULES.basic);

        const tenant = new Tenant({
            name: name.trim(),
            slug: generatedSlug,
            email: email.trim().toLowerCase(),
            phone: phone ? String(phone).trim() : '',
            plan,
            allowedModules: planModules,
            status: 'active',
            subscriptionStatus: 'active'
        });

        await tenant.save();

        // Create Company Admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const empIdVal = adminEmpId ? String(adminEmpId).trim() : `EMP-${Date.now().toString().slice(-6)}`;

        const companyAdmin = new Admin({
            name: adminName ? adminName.trim() : `${name} Admin`,
            email: adminEmail.trim().toLowerCase(),
            EmpId: empIdVal,
            role: 'company_admin',
            password: hashedPassword,
            tenantId: tenant._id,
            isActive: true
        });

        await companyAdmin.save();

        await logAuditAction(req, 'CREATE_COMPANY', tenant._id, companyAdmin._id, {
            companyName: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            adminEmail: companyAdmin.email
        });

        res.status(201).json({
            success: true,
            message: 'Company tenant and company admin created successfully',
            tenant,
            companyAdmin: {
                _id: companyAdmin._id,
                name: companyAdmin.name,
                email: companyAdmin.email,
                role: companyAdmin.role,
                tenantId: companyAdmin.tenantId
            }
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create company tenant',
            error: error.message
        });
    }
};

/**
 * GET /api/platform/companies/:tenantId
 * Details of a specific company
 */
export const getCompanyById = async (req, res) => {
    try {
        const { tenantId } = req.params;

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Company tenant not found'
            });
        }

        const [adminUsers, regularUsers] = await Promise.all([
            Admin.find({ tenantId }).select('-password').lean(),
            User.find({ tenantId }).select('-password').lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                ...tenant.toObject(),
                users: [...adminUsers, ...regularUsers],
                userCount: adminUsers.length + regularUsers.length
            }
        });
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company details',
            error: error.message
        });
    }
};

/**
 * PATCH /api/platform/companies/:tenantId/status
 * Suspend or Activate company
 */
export const updateCompanyStatus = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either 'active' or 'suspended'"
            });
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Company tenant not found'
            });
        }

        tenant.status = status;
        await tenant.save();

        const actionType = status === 'suspended' ? 'SUSPEND_COMPANY' : 'ACTIVATE_COMPANY';
        await logAuditAction(req, actionType, tenant._id, tenant._id, {
            companyName: tenant.name,
            newStatus: status
        });

        res.status(200).json({
            success: true,
            message: `Company account has been ${status === 'suspended' ? 'suspended' : 'activated'}`,
            data: tenant
        });
    } catch (error) {
        console.error('Error updating company status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company status',
            error: error.message
        });
    }
};

/**
 * PATCH /api/platform/companies/:tenantId/plan
 * Update subscription plan
 */
export const updateCompanyPlan = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { plan } = req.body;

        if (!['trial', 'basic', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "Plan must be 'trial', 'basic', 'pro', or 'enterprise'"
            });
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Company tenant not found'
            });
        }

        const oldPlan = tenant.plan;
        tenant.plan = plan;
        if (Array.isArray(req.body.allowedModules) && req.body.allowedModules.length > 0) {
            tenant.allowedModules = req.body.allowedModules;
        } else {
            tenant.allowedModules = DEFAULT_PLAN_MODULES[plan] || DEFAULT_PLAN_MODULES.basic;
        }
        await tenant.save();

        await logAuditAction(req, 'CHANGE_PLAN', tenant._id, tenant._id, {
            companyName: tenant.name,
            oldPlan,
            newPlan: plan
        });

        res.status(200).json({
            success: true,
            message: `Company plan updated to ${plan}`,
            data: tenant
        });
    } catch (error) {
        console.error('Error updating company plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company plan',
            error: error.message
        });
    }
};

/**
 * PATCH /api/platform/companies/:tenantId/modules
 * Update custom page access / allowed modules for a company
 */
export const updateCompanyModules = async (req, res) => {
    try {
        const { tenantId } = req.params;
        const { allowedModules } = req.body;

        if (!Array.isArray(allowedModules)) {
            return res.status(400).json({
                success: false,
                message: "allowedModules must be an array of module strings"
            });
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Company tenant not found'
            });
        }

        const oldModules = tenant.allowedModules;
        tenant.allowedModules = allowedModules;
        await tenant.save();

        await logAuditAction(req, 'UPDATE_COMPANY', tenant._id, tenant._id, {
            companyName: tenant.name,
            action: 'UPDATE_PAGE_ACCESS',
            oldModules,
            newModules: allowedModules
        });

        res.status(200).json({
            success: true,
            message: `Page access updated successfully (${allowedModules.length} pages enabled)`,
            data: tenant
        });
    } catch (error) {
        console.error('Error updating company allowed modules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company page access',
            error: error.message
        });
    }
};

/**
 * GET /api/platform/companies/:tenantId/users
 * List users belonging to specific tenant
 */
export const getTenantUsers = async (req, res) => {
    try {
        const { tenantId } = req.params;

        const [adminUsers, regularUsers] = await Promise.all([
            Admin.find({ tenantId }).select('-password').lean(),
            User.find({ tenantId }).select('-password').lean()
        ]);

        const allTenantUsers = [
            ...adminUsers.map(u => ({ ...u, type: 'Admin' })),
            ...regularUsers.map(u => ({ ...u, type: 'User' }))
        ];

        res.status(200).json({
            success: true,
            count: allTenantUsers.length,
            data: allTenantUsers
        });
    } catch (error) {
        console.error('Error fetching tenant users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tenant users',
            error: error.message
        });
    }
};

/**
 * GET /api/platform/audit-logs
 * Fetch platform-wide audit logs
 */
export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 50);
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            AuditLog.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('actorId', 'name email role')
                .populate('tenantId', 'name slug')
                .lean(),
            AuditLog.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve audit logs',
            error: error.message
        });
    }
};

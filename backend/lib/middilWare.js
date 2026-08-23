import jwt from 'jsonwebtoken';
import Admin from '../model/Admin.js';
import Tenant from '../model/Tenant.js';

export const MiddilWare = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Allow the static system API token used by mobile/Flutter apps
    if (token === 'RootX-production-9d17d9485eb772e79df8564004d4a4d4') {
        try {
            const systemAdmin = await Admin.findOne({ role: 'super_admin' }) || await Admin.findOne();
            if (systemAdmin) {
                const userContext = { 
                    userId: systemAdmin._id.toString(),
                    id: systemAdmin._id.toString(), 
                    role: systemAdmin.role,
                    tenantId: systemAdmin.tenantId || null,
                    isSystem: true 
                };
                req.admin = userContext;
                req.user = userContext;
            } else {
                const userContext = { 
                    userId: '000000000000000000000000',
                    id: '000000000000000000000000', 
                    role: 'super_admin',
                    tenantId: null,
                    isSystem: true 
                };
                req.admin = userContext;
                req.user = userContext;
            }
            return next();
        } catch (err) {
            console.error('Error resolving system token admin context:', err);
            return res.status(500).json({ message: 'Internal server error during authorization' });
        }
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        
        // Ensure id is available alongside userId for standardized access
        if (decoded && !decoded.id && decoded.userId) {
            decoded.id = decoded.userId;
        }
        
        req.admin = decoded; // Attach user info to the request object for backwards compatibility
        req.user = decoded;  // Attach standardized user context

        // Check Tenant Status if tenantId exists
        if (decoded.tenantId && decoded.role !== 'super_admin') {
            const tenant = await Tenant.findById(decoded.tenantId).select('status');
            if (tenant && tenant.status === 'suspended') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Your company account has been suspended. Please contact platform administrator.'
                });
            }
        }

        next(); // Pass control to the next middleware/handler
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * Middleware enforcing Platform Super Admin access only.
 */
export const requireSuperAdmin = (req, res, next) => {
    const userRole = req.user?.role || req.admin?.role;
    if (userRole !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden: Super Admin privileges required.'
        });
    }
    next();
};

/**
 * Middleware ensuring a valid tenantId context is present on customer routes.
 */
export const requireTenant = (req, res, next) => {
    const tenantId = req.user?.tenantId || req.admin?.tenantId;
    const role = req.user?.role || req.admin?.role;

    // Super admins can bypass tenant requirement on customer APIs if needed, but company users require a tenantId
    if (!tenantId && role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied: No valid company account associated with user.'
        });
    }
    next();
};

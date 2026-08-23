import jwt from 'jsonwebtoken';
import Admin from '../model/Admin.js';
import Tenant from '../model/Tenant.js';

export const VerifyToken = async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        try {
            const adminUser = await Admin.findById(decoded.userId).populate('branches');
            const tenantId = adminUser?.tenantId || decoded.tenantId || null;
            const role = adminUser?.role || decoded.role;

            let allowedModules = ['ALL'];
            let tenant = null;

            if (tenantId && role !== 'super_admin') {
                tenant = await Tenant.findById(tenantId).select('status plan allowedModules');
                if (tenant && tenant.status === 'suspended') {
                    return res.status(403).json({ 
                        message: 'Company account is suspended. Access denied.',
                        suspended: true 
                    });
                }
                allowedModules = (tenant && Array.isArray(tenant.allowedModules) && tenant.allowedModules.length > 0)
                    ? tenant.allowedModules
                    : ['dashboard', 'dsr_report', 'employee', 'branch', 'settings'];
            }
            
            res.json({ 
                message: 'Token is valid', 
                user: { 
                    ...decoded, 
                    role,
                    tenantId,
                    allowedModules,
                    branches: adminUser?.branches || [] 
                } 
            });
        } catch (error) {
            console.error('Error fetching admin details during token verification:', error);
            res.json({ message: 'Token is valid', user: decoded });
        }
    });
};
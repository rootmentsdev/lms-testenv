import Admin from '../model/Admin.js';
import Branch from '../model/Branch.js';
import Employee from '../model/Employee.js';
import Cluster from '../model/Cluster.js';
import User from '../model/User.js';

/**
 * Validates if the user is a super admin or hr admin (full access)
 */
export const isFullAccessAdmin = (adminRole) => {
    return ['super_admin', 'hr_admin'].includes(adminRole);
};

/**
 * Gets an array of accessible store ObjectIds based on admin role
 */
export const getAccessibleStoreIds = async (adminId) => {
    const admin = await Admin.findById(adminId).populate('branches assignedClusters');
    if (!admin) {
        // Fallback: Check if this is a regular User (employee)
        const user = await User.findById(adminId);
        if (!user) return [];
        
        // Find the Branch matching the user's locCode/workingBranch
        const branch = await Branch.findOne({ 
            $or: [
                { locCode: user.locCode },
                { workingBranch: user.workingBranch }
            ]
        });
        return branch ? [branch._id.toString()] : [];
    }

    if (isFullAccessAdmin(admin.role)) {
        // Full access: return all branch IDs
        const allBranches = await Branch.find({ isActive: true }).select('_id');
        return allBranches.map(b => b._id.toString());
    }

    if (admin.role === 'cluster_admin') {
        // Can access all stores in their assigned clusters, plus any individually assigned stores
        const clusterIds = admin.assignedClusters.map(c => c._id);
        const clusterBranches = await Branch.find({ clusterId: { $in: clusterIds }, isActive: true }).select('_id');

        const branchIds = new Set([
            ...clusterBranches.map(b => b._id.toString()),
            ...admin.branches.map(b => (b._id || b).toString())
        ]);
        return Array.from(branchIds);
    }

    if (admin.role === 'store_admin') {
        // Can access only specifically assigned stores
        return admin.branches.map(b => (b._id || b).toString());
    }

    return [];
};

/**
 * Validates if an admin has access to a specific store
 */
export const validateStoreAccess = async (adminId, storeId) => {
    const accessibleStoreIds = await getAccessibleStoreIds(adminId);
    if (!accessibleStoreIds.includes(storeId.toString())) {
        throw new Error('Access denied: You do not have permission to access this store.');
    }
    return true;
};

/**
 * Gets an array of accessible employee ObjectIds based on admin role
 */
export const getAccessibleEmployeeIds = async (adminId, storeId = null) => {
    const admin = await Admin.findById(adminId);
    let accessibleStoreIds = [];
    
    if (!admin) {
        // Fallback: Check if this is a regular User (employee)
        const user = await User.findById(adminId);
        if (!user) return [];
        
        const branch = await Branch.findOne({ 
            $or: [
                { locCode: user.locCode },
                { workingBranch: user.workingBranch }
            ]
        });
        accessibleStoreIds = branch ? [branch._id.toString()] : [];
    } else {
        if (isFullAccessAdmin(admin.role)) {
            // Full access: all stores are accessible
            const allBranches = await Branch.find({ isActive: true }).select('_id');
            accessibleStoreIds = allBranches.map(b => b._id.toString());
        } else {
            accessibleStoreIds = await getAccessibleStoreIds(adminId);
        }
    }

    // If a specific store is requested, validate it's within accessible stores
    if (storeId) {
        if (!accessibleStoreIds.includes(storeId.toString())) {
            return []; // Access denied to this specific store
        }
        // Restrict to just the requested store
        accessibleStoreIds = [storeId.toString()];
    }

    // Get employees that belong to accessible stores
    const accessibleEmployees = await Employee.find({
        storeId: { $in: accessibleStoreIds },
        status: 'Active'
    }).select('_id');

    // Also get users that belong to accessible stores from User collection (fallback/merge)
    const branches = await Branch.find({ _id: { $in: accessibleStoreIds } });
    const locCodes = branches.map(b => b.locCode);
    const users = await User.find({ locCode: { $in: locCodes } }).select('_id');

    const allIds = new Set([
        ...accessibleEmployees.map(e => e._id.toString()),
        ...users.map(u => u._id.toString())
    ]);

    return Array.from(allIds);
};

/**
 * Validates if an admin has access to a specific employee
 */
export const validateEmployeeAccess = async (adminId, employeeId) => {
    const accessibleEmployeeIds = await getAccessibleEmployeeIds(adminId);
    if (!accessibleEmployeeIds.includes(employeeId.toString())) {
        throw new Error('Access denied: You do not have permission to access this employee.');
    }
    return true;
};

/**
 * Builds a MongoDB query filter for walk-ins based on admin role
 */
export const buildWalkinFilter = async (adminId, baseQuery = {}) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        // Fallback: Check if this is a regular User (employee)
        const user = await User.findById(adminId);
        if (!user) return { _id: null }; // Return impossible query if admin or user not found
        
        // Find the Branch matching the user's locCode/workingBranch
        const branch = await Branch.findOne({ 
            $or: [
                { locCode: user.locCode },
                { workingBranch: user.workingBranch }
            ]
        });
        const accessibleStoreIds = branch ? [branch._id.toString()] : [];
        const locCodes = [user.locCode];
        const workingBranches = [user.workingBranch];
        
        return {
            ...baseQuery,
            $or: [
                { storeId: { $in: accessibleStoreIds } },
                { store: { $in: [...locCodes, ...workingBranches].filter(Boolean) } }
            ]
        };
    }

    if (isFullAccessAdmin(admin.role)) {
        return baseQuery;
    }

    const accessibleStoreIds = await getAccessibleStoreIds(adminId);

    const branches = await Branch.find({ _id: { $in: accessibleStoreIds } });
    const locCodes = branches.map(b => b.locCode);
    const workingBranches = branches.map(b => b.workingBranch);

    return {
        ...baseQuery,
        $or: [
            { storeId: { $in: accessibleStoreIds } },
            { store: { $in: [...locCodes, ...workingBranches] } }
        ]
    };
};

/**
 * Builds a MongoDB query filter for tasks based on admin role
 */
export const buildTaskFilter = async (adminId, baseQuery = {}) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        // Fallback: Check if this is a regular User (employee)
        const user = await User.findById(adminId);
        if (!user) return { _id: null };

        return {
            ...baseQuery,
            $or: [
                { assignedTo: user._id.toString() },
                { storeCode: `Z-${user.locCode}` }
            ]
        };
    }

    if (isFullAccessAdmin(admin.role)) {
        return baseQuery;
    }

    const accessibleStoreIds = await getAccessibleStoreIds(adminId);

    // Note: Task model currently uses storeCode instead of storeId, so we map to locCodes
    const branches = await Branch.find({ _id: { $in: accessibleStoreIds } });
    const locCodes = branches.map(b => b.locCode);

    return {
        ...baseQuery,
        storeCode: { $in: locCodes }
    };
};

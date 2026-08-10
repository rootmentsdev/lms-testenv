import mongoose from 'mongoose';
import Admin from '../model/Admin.js';
import Branch from '../model/Branch.js';
import Employee from '../model/Employee.js';
import Cluster from '../model/Cluster.js';
import User from '../model/User.js';

/**
 * Validates if the user is a super admin or hr admin (full access)
 */
export const isFullAccessAdmin = (adminRole) => {
    return ['super_admin', 'admin', 'hr_admin'].includes(adminRole);
};

/**
 * Resolves a Branch document for a User/Employee by matching locCode and workingBranch robustly.
 * Handles type differences (number/string) and case differences.
 */
async function findBranchForUser(user) {
    if (!user) return null;
    
    const locCodeVal = user.locCode || user.LocCode;
    const branchQuery = { $or: [] };
    
    if (user.workingBranch) {
        branchQuery.$or.push({ workingBranch: { $regex: `^${user.workingBranch.trim()}$`, $options: 'i' } });
    }
    
    if (locCodeVal !== undefined && locCodeVal !== null) {
        const locCodeStr = String(locCodeVal).trim();
        if (locCodeStr) {
            branchQuery.$or.push({ locCode: locCodeStr });
            branchQuery.$or.push({ locCode: locCodeVal });
        }
    }
    
    if (branchQuery.$or.length === 0) {
        return null;
    }
    
    return await Branch.findOne(branchQuery);
}

/**
 * Gets an array of accessible store ObjectIds based on admin role
 */
export const getAccessibleStoreIds = async (adminId) => {
    const admin = await Admin.findById(adminId).populate('branches assignedClusters');
    
    if (admin) {
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

        if (admin.role === 'telecaller') {
            // Telecallers have access to all stores (even if assigned to office)
            const allBranches = await Branch.find({ isActive: true }).select('_id');
            return allBranches.map(b => b._id.toString());
        }

        if (admin.role === 'store_admin' || admin.role === 'warehouse_admin' || admin.role === 'employee') {
            if (admin.branches && admin.branches.length > 0) {
                return admin.branches.map(b => (b._id || b).toString());
            }
        }
    }

    // Fallback: Check if this is a regular User (employee in the User collection)
    const user = admin ? admin : await User.findById(adminId);
    if (!user) return [];
    
    // Find the Branch matching the user's locCode/workingBranch robustly
    const branch = await findBranchForUser(user);
    return branch ? [branch._id.toString()] : [];
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
    
    if (!admin || admin.role === 'employee') {
        // Fallback: Check if this is a regular User (employee)
        const user = admin ? admin : await User.findById(adminId);
        if (!user) return [];
        
        if (admin && admin.branches && admin.branches.length > 0) {
            accessibleStoreIds = admin.branches.map(b => (b._id || b).toString());
        } else {
            const branch = await findBranchForUser(user);
            accessibleStoreIds = branch ? [branch._id.toString()] : [];
        }
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

    // Also get admins (store/cluster admins) associated with accessible stores, and always include the admin themselves
    const admins = await Admin.find({
        $or: [
            { branches: { $in: accessibleStoreIds } },
            { _id: adminId }
        ]
    }).select('_id');

    const allIds = new Set([
        ...accessibleEmployees.map(e => e._id.toString()),
        ...users.map(u => u._id.toString()),
        ...admins.map(a => a._id.toString()),
        adminId.toString()
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
    if (!admin || admin.role === 'employee') {
        // Fallback or Admin employee: Check if this is a regular User (employee)
        const user = admin ? admin : await User.findById(adminId);
        if (!user) return { _id: null }; // Return impossible query if admin or user not found
        
        // Find the Employee document matching the user
        const employee = await Employee.findOne({
            $or: [
                { userId: user._id },
                { employeeId: { $regex: `^${user.empID || user.EmpId || ''}$`, $options: 'i' } }
            ]
        });

        const employeeIds = [user._id.toString()];
        if (employee) {
            employeeIds.push(employee._id.toString());
        }

        const username = user.username || user.name || '';
        const walkinRestriction = {
            $or: [
                { employeeId: { $in: employeeIds } },
                { createdBy: user._id },
                { staff: { $regex: `^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
            ]
        };

        // If baseQuery already has a $or (e.g., from a search filter), combine both using $and
        if (baseQuery.$or) {
            const { $or: existingOr, ...rest } = baseQuery;
            return { ...rest, $and: [{ $or: existingOr }, walkinRestriction] };
        }
        return { ...baseQuery, ...walkinRestriction };
    }

    if (isFullAccessAdmin(admin.role)) {
        return baseQuery;
    }

    const accessibleStoreIds = await getAccessibleStoreIds(adminId);

    const branches = await Branch.find({ _id: { $in: accessibleStoreIds } });
    const locCodes = branches.map(b => b.locCode);
    const workingBranches = branches.map(b => b.workingBranch);

    const storeRestriction = [
        { storeId: { $in: accessibleStoreIds } },
        { store: { $in: [...locCodes, ...workingBranches] } }
    ];

    // If baseQuery already has a $or (e.g., from a search filter), combine both using $and
    if (baseQuery.$or) {
        const { $or: existingOr, ...rest } = baseQuery;
        return { ...rest, $and: [{ $or: existingOr }, { $or: storeRestriction }] };
    }
    return { ...baseQuery, $or: storeRestriction };
};

/**
 * Builds a store-wide MongoDB query filter for walk-ins (irrespective of employee)
 */
export const buildStoreWideWalkinFilter = async (adminId, baseQuery = {}) => {
    const admin = await Admin.findById(adminId);
    
    // Get accessible store IDs for this admin/user
    const accessibleStoreIds = await getAccessibleStoreIds(adminId);
    if (accessibleStoreIds.length === 0) {
        return { _id: null };
    }

    if (admin && isFullAccessAdmin(admin.role)) {
        return baseQuery;
    }

    const branches = await Branch.find({ _id: { $in: accessibleStoreIds } });
    const locCodes = branches.map(b => b.locCode);
    const workingBranches = branches.map(b => b.workingBranch).concat(locCodes);

    const storeRestriction = [
        { storeId: { $in: accessibleStoreIds } },
        { store: { $in: workingBranches } }
    ];

    if (baseQuery.$or) {
        const { $or: existingOr, ...rest } = baseQuery;
        return { ...rest, $and: [{ $or: existingOr }, { $or: storeRestriction }] };
    }
    return { ...baseQuery, $or: storeRestriction };
};

/**
 * Builds a MongoDB query filter for tasks based on admin role.
 *
 * Visibility rules:
 *  - Super Admin / HR Admin  → see all tasks
 *  - Cluster Admin           → see tasks they CREATED or where the assignee
 *                              belongs to one of their cluster's stores
 *  - Store Admin             → see tasks they CREATED or where the assignee
 *                              belongs to their store
 *  - Employee / User         → see only tasks assigned directly to them
 */
export const resolveAllAssignedIds = async (adminDoc, userDoc = null, inputId = null) => {
    const ids = new Set();
    if (adminDoc) ids.add(adminDoc._id.toString());
    if (userDoc) ids.add(userDoc._id.toString());
    if (inputId) ids.add(inputId.toString());

    let extraAdmin = null;
    let extraUser = null;
    let extraEmp = null;

    if (inputId && mongoose.Types.ObjectId.isValid(inputId)) {
        try {
            [extraAdmin, extraUser, extraEmp] = await Promise.all([
                Admin.findById(inputId).lean(),
                User.findById(inputId).lean(),
                Employee.findById(inputId).lean()
            ]);
        } catch (_) {}
    }

    const refAdmin = adminDoc || extraAdmin;
    const refUser = userDoc || extraUser;
    const refEmp = extraEmp;

    const empCode = refAdmin?.EmpId || refAdmin?.employeeId || refUser?.empID || refUser?.EmpId || refEmp?.employeeId || inputId;
    if (empCode) ids.add(empCode.toString());

    const email = refAdmin?.email || refUser?.email || refEmp?.email;
    const name = refAdmin?.name || refUser?.name || (refEmp?.firstName ? `${refEmp.firstName} ${refEmp.lastName || ''}`.trim() : refEmp?.username);
    const username = refAdmin?.username || refUser?.username || refEmp?.username;

    const orConditions = [];
    if (adminDoc) orConditions.push({ _id: adminDoc._id }, { userId: adminDoc._id });
    if (userDoc) orConditions.push({ _id: userDoc._id }, { userId: userDoc._id });
    if (extraEmp) orConditions.push({ _id: extraEmp._id }, { userId: extraEmp._id });
    if (email) orConditions.push({ email: { $regex: `^${email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' } });
    if (empCode) {
        orConditions.push(
            { EmpId: { $regex: `^${empCode}$`, $options: 'i' } },
            { employeeId: { $regex: `^${empCode}$`, $options: 'i' } },
            { empID: { $regex: `^${empCode}$`, $options: 'i' } }
        );
    }
    if (name) {
        orConditions.push(
            { name: { $regex: `^${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' } },
            { username: { $regex: `^${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' } }
        );
    }

    if (orConditions.length > 0) {
        try {
            const [matchedAdmins, matchedUsers, matchedEmps] = await Promise.all([
                Admin.find({ $or: orConditions }).select('_id EmpId').lean(),
                User.find({ $or: orConditions }).select('_id empID').lean(),
                Employee.find({ $or: orConditions }).select('_id employeeId').lean()
            ]);

            matchedAdmins.forEach(a => { ids.add(a._id.toString()); if (a.EmpId) ids.add(a.EmpId.toString()); });
            matchedUsers.forEach(u => { ids.add(u._id.toString()); if (u.empID) ids.add(u.empID.toString()); });
            matchedEmps.forEach(e => { ids.add(e._id.toString()); if (e.employeeId) ids.add(e.employeeId.toString()); });
        } catch (_) {}
    }

    return Array.from(ids);
};

export const buildTaskFilter = async (adminId, baseQuery = {}) => {
    const admin = await Admin.findById(adminId);

    // ── Employee / User ───────────────────────────────────────────────────────
    if (!admin || admin.role === 'employee') {
        const user = admin ? admin : await User.findById(adminId);
        if (!user) return { _id: null };

        const assignedIds = await resolveAllAssignedIds(admin, user);
        const assignedQueryValues = [...assignedIds];
        assignedIds.forEach(id => {
            if (mongoose.Types.ObjectId.isValid(id)) {
                assignedQueryValues.push(new mongoose.Types.ObjectId(id));
            }
        });

        const restriction = {
            $or: [
                { assignedTo: { $in: assignedQueryValues } },
                { createdBy: { $in: [user._id, user._id.toString()] } }
            ]
        };

        if (baseQuery.$or) {
            const { $or: existingOr, ...rest } = baseQuery;
            return { ...rest, $and: [{ $or: existingOr }, restriction] };
        }
        return { ...baseQuery, ...restriction };
    }

    const assignedIds = await resolveAllAssignedIds(admin, null);
    const assignedQueryValues = [...assignedIds];
    assignedIds.forEach(id => {
        if (mongoose.Types.ObjectId.isValid(id)) {
            assignedQueryValues.push(new mongoose.Types.ObjectId(id));
        }
    });
    const creatorIds = [admin._id, admin._id.toString()];

    const adminName = admin?.name || admin?.username;
    const nameRegex = adminName ? new RegExp(`^${adminName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\s|-|$)`, 'i') : null;

    const assignedMatchConditions = [
        { assignedTo: { $in: assignedQueryValues } }
    ];
    if (nameRegex) {
        assignedMatchConditions.push(
            { assignedTo: { $regex: nameRegex } },
            { assignedToLabel: { $regex: nameRegex } }
        );
    }

    // ── Super Admin / Admin / HR Admin → creator, assignee, in approvalChain, or reassigned by admin ─────
    if (['super_admin', 'admin', 'hr_admin'].includes(admin.role)) {
        const restriction = {
            $or: [
                { createdBy: { $in: creatorIds } },
                ...assignedMatchConditions,
                { approvalChain: { $in: assignedQueryValues } },
                { 'workMap.assignedBy': { $in: [admin.name, admin.username].filter(Boolean) } }
            ]
        };

        if (baseQuery.$or) {
            const { $or: existingOr, ...rest } = baseQuery;
            return { ...rest, $and: [{ $or: existingOr }, restriction] };
        }
        return { ...baseQuery, ...restriction };
    }

    // ── HR Admin → creator OR assignee ────────────────────────────────────────
    if (admin.role === 'hr_admin') {
        const restriction = {
            $or: [
                { createdBy: { $in: creatorIds } },
                ...assignedMatchConditions
            ]
        };

        if (baseQuery.$or) {
            const { $or: existingOr, ...rest } = baseQuery;
            return { ...rest, $and: [{ $or: existingOr }, restriction] };
        }
        return { ...baseQuery, ...restriction };
    }

    // ── Telecaller → see only tasks assigned directly to them ──────────────────
    if (admin.role === 'telecaller') {
        const restriction = {
            $or: assignedMatchConditions
        };

        if (baseQuery.$or) {
            const { $or: existingOr, ...rest } = baseQuery;
            return { ...rest, $and: [{ $or: existingOr }, restriction] };
        }
        return { ...baseQuery, ...restriction };
    }

    // ── Cluster Admin / Store Admin → Only creator, direct assignee, store tasks, or active reviewer ─────
    const accessibleStoreIds = await getAccessibleStoreIds(admin._id);
    const accessibleBranches = await Branch.find({ _id: { $in: accessibleStoreIds } }).lean();
    const storeCodes = accessibleBranches.map(b => b.locCode).filter(Boolean);
    const formattedStoreCodes = storeCodes.flatMap(c => [c, `Z-${c}`, `z-${c}`]);
    const storeNames = accessibleBranches.map(b => b.workingBranch).filter(Boolean);

    const restriction = {
        $or: [
            { createdBy: { $in: creatorIds } },
            ...assignedMatchConditions,
            { storeCode: { $in: formattedStoreCodes } },
            { storeName: { $in: storeNames } },
            { 
              $and: [
                { status: 'PENDING REVIEW' },
                { approvalChain: { $in: assignedQueryValues } },
                { 
                  $expr: {
                    $in: [
                      { $arrayElemAt: ["$approvalChain", "$approvalChainIndex"] },
                      assignedQueryValues
                    ]
                  }
                }
              ]
            }
        ]
    };

    if (baseQuery.$or) {
        const { $or: existingOr, ...rest } = baseQuery;
        return { ...rest, $and: [{ $or: existingOr }, restriction] };
    }
    return { ...baseQuery, ...restriction };
};

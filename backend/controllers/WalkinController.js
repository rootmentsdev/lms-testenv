import Walkin from '../model/Walkin.js';
import Admin from '../model/Admin.js';
import User from '../model/User.js';
import Branch from '../model/Branch.js';
import mongoose from 'mongoose';
import { validateStoreAccess, validateEmployeeAccess, buildWalkinFilter } from '../lib/permissions.js';

/* ---------- Location Name Normalization helpers ---------- */
const BRAND_TOKENS = new Set(["zorucci", "grooms", "suitor", "guy", "sg"]);

function canonFixes(s) {
  return s
    .replace(/\bedap{1,2}a?l{1,3}y\b/g, "edappally")
    .replace(/\bedap{1,2}a?l{1,3}i\b/g, "edappally")
    .replace(/\bmanjeri\b/g, "manjery")
    .replace(/\bperinthalmana\b/g, "perinthalmanna")
    .replace(/\bkottakal\b/g, "kottakkal")
    .replace(/\bkalpeta\b/g, "kalpetta")
    .replace(/\bzoruc+i\b/g, "zorucci");
}

function norm(s) {
  const x = String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return canonFixes(x);
}

function locationKey(name) {
  const tokens = norm(name)
    .split(" ")
    .filter((t) => t && !BRAND_TOKENS.has(t));
  return tokens.join(" ");
}

const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Helper to match stores based on normalized location keys
 */
function isStoreAllowed(walkinStore, allowedBranches) {
  const normWalkinStore = locationKey(walkinStore);
  return allowedBranches.some(branch => {
    const normBranchName = locationKey(branch.workingBranch);
    return normBranchName === normWalkinStore || branch.locCode === walkinStore;
  });
}

/**
 * Check if a customer already exists by their contact phone number
 */
export const checkCustomerExists = async (req, res) => {
    try {
        const { contact } = req.params;
        if (!contact) {
            return res.status(400).json({ success: false, message: 'Contact phone number is required' });
        }

        let query = { contact: contact.trim() };

        // Apply role-based filtering if admin token is present
        if (req.admin) {
            const adminId = req.admin.userId;
            query = await buildWalkinFilter(adminId, query);
            if (query._id === null) {
                return res.status(403).json({ success: false, message: 'Admin not found or access denied' });
            }
        }

        // Find the latest walkin record for this customer
        const latestWalkin = await Walkin.findOne(query)
            .sort({ createdAt: -1 });

        if (latestWalkin) {
            return res.status(200).json({
                success: true,
                exists: true,
                message: 'Customer exists',
                data: latestWalkin
            });
        }

        return res.status(200).json({
            success: true,
            exists: false,
            message: 'New customer'
        });
    } catch (error) {
        console.error('Error checking customer existence:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while checking customer',
            error: error.message
        });
    }
};

/**
 * Save a new walk-in record to the database
 */
export const saveWalkin = async (req, res) => {
    try {
        let {
            _id,
            customerName,
            contact,
            functionDate,
            store,
            staff,
            storeId,
            employeeId,
            category,
            subCategory,
            remarks,
            status,
            date
        } = req.body;

        if (!customerName || !contact) {
            return res.status(400).json({
                success: false,
                message: 'customerName and contact are required fields'
            });
        }

        const trimmedContact = contact.trim();
        
        // Automatically fetch current date and time when adding walk-ins
        const todayStr = _id ? (date || getFormattedDateTime()) : getFormattedDateTime();

        // Process token / Role-based overrides
        let finalStore = store ? store.trim() : '-';
        let finalStaff = staff ? staff.trim() : 'None';
        let finalStoreId = storeId;
        let finalEmployeeId = employeeId;
        let createdBy = null;

        // Try to find employee by passed empID / empid or req.admin.userId
        let lookupUser = null;
        
        const passedEmpId = req.body.empID || req.body.empid || req.body.employeeId || req.body.staff;
        if (passedEmpId) {
            lookupUser = await User.findOne({ empID: { $regex: `^${String(passedEmpId).trim()}$`, $options: 'i' } });
            if (!lookupUser) {
                lookupUser = await Admin.findOne({ EmpId: { $regex: `^${String(passedEmpId).trim()}$`, $options: 'i' } }).populate('branches');
            }
            if (!lookupUser && mongoose.Types.ObjectId.isValid(passedEmpId)) {
                lookupUser = await User.findById(passedEmpId);
                if (!lookupUser) {
                    lookupUser = await Admin.findById(passedEmpId).populate('branches');
                }
            }
        }

        if (!lookupUser && req.admin && req.admin.userId) {
            lookupUser = await User.findById(req.admin.userId);
            if (!lookupUser) {
                lookupUser = await Admin.findById(req.admin.userId).populate('branches');
            }
        }

        if (lookupUser) {
            const isUser = lookupUser.empID !== undefined;
            if (isUser) {
                finalStaff = lookupUser.username;
                finalStore = lookupUser.workingBranch;
                finalEmployeeId = lookupUser._id;
                
                const branch = await Branch.findOne({
                    $or: [
                        { locCode: lookupUser.locCode },
                        { workingBranch: lookupUser.workingBranch }
                    ]
                });
                if (branch) {
                    finalStoreId = branch._id;
                }
            } else {
                finalStaff = lookupUser.name;
                finalEmployeeId = lookupUser._id;
                
                const isSuperOrHrAdmin = lookupUser.role === 'super_admin' || lookupUser.role === 'hr_admin';
                if (!isSuperOrHrAdmin || !store || store === '-' || store === '') {
                    if (lookupUser.branches && lookupUser.branches.length > 0) {
                        finalStore = lookupUser.branches[0].workingBranch;
                        finalStoreId = lookupUser.branches[0]._id;
                    } else if (lookupUser.workingBranch) {
                        finalStore = lookupUser.workingBranch;
                        const branch = await Branch.findOne({ workingBranch: lookupUser.workingBranch });
                        if (branch) {
                            finalStoreId = branch._id;
                        }
                    }
                }
            }
            createdBy = req.admin ? req.admin.userId : lookupUser._id;
        } else if (req.admin) {
            createdBy = req.admin.userId;
        }

        if (req.admin && !req.admin.isSystem) {
            const adminId = req.admin.userId;
            const isAdminManager = req.admin.role === 'super_admin' || req.admin.role === 'hr_admin';
            if (!isAdminManager) {
                if (finalStoreId) {
                    await validateStoreAccess(adminId, finalStoreId);
                }
                if (finalEmployeeId) {
                    await validateEmployeeAccess(adminId, finalEmployeeId);
                }
            }
        }

        // Direct update by _id (e.g. edited from list view)
        if (_id) {
            let updateQuery = { _id };
            if (req.admin) {
                const adminId = req.admin.userId;
                updateQuery = await buildWalkinFilter(adminId, updateQuery);
                if (updateQuery._id === null) {
                    return res.status(403).json({ success: false, message: 'Access denied to this walk-in record' });
                }
            }

            const walkinRecord = await Walkin.findOne(updateQuery);
            if (!walkinRecord) {
                return res.status(404).json({ success: false, message: 'Walk-in record not found or access denied' });
            }

            walkinRecord.customerName = customerName.trim();
            walkinRecord.contact = trimmedContact;
            if (functionDate) walkinRecord.functionDate = functionDate.trim();
            if (finalStore) walkinRecord.store = finalStore;
            if (finalStaff) walkinRecord.staff = finalStaff;
            if (finalStoreId) walkinRecord.storeId = finalStoreId;
            if (finalEmployeeId) walkinRecord.employeeId = finalEmployeeId;
            if (category) walkinRecord.category = category.trim();
            if (subCategory) walkinRecord.subCategory = subCategory.trim();
            if (remarks) walkinRecord.remarks = remarks.trim();
            if (status) walkinRecord.status = status.trim();
            if (createdBy) walkinRecord.createdBy = createdBy;
            walkinRecord.date = todayStr; // Update visit date to the requested value

            await walkinRecord.save();
            return res.status(200).json({
                success: true,
                message: 'Walk-in updated successfully',
                data: walkinRecord
            });
        }

        let query = { contact: trimmedContact };
        if (req.admin) {
            const adminId = req.admin.userId;
            query = await buildWalkinFilter(adminId, query);
        }
        let walkinRecord = await Walkin.findOne(query).sort({ createdAt: -1 });

        const isSameStore = walkinRecord && (
            locationKey(walkinRecord.store) === locationKey(finalStore) ||
            (walkinRecord.storeId && finalStoreId && walkinRecord.storeId.toString() === finalStoreId.toString())
        );

        if (walkinRecord && status !== 'New Walkin' && isSameStore) {
            // Update existing record to avoid duplicates and increment repeatCount
            walkinRecord.repeatCount += 1;
            walkinRecord.customerName = customerName.trim();
            if (functionDate) walkinRecord.functionDate = functionDate.trim();
            if (finalStore) walkinRecord.store = finalStore;
            if (finalStaff) walkinRecord.staff = finalStaff;
            if (finalStoreId) walkinRecord.storeId = finalStoreId;
            if (finalEmployeeId) walkinRecord.employeeId = finalEmployeeId;
            if (category) walkinRecord.category = category.trim();
            if (subCategory) walkinRecord.subCategory = subCategory.trim();
            if (remarks) walkinRecord.remarks = remarks.trim();
            if (status) walkinRecord.status = status.trim();
            if (createdBy) walkinRecord.createdBy = createdBy;
            walkinRecord.date = todayStr; // Update to latest visit date
            
            await walkinRecord.save();
            return res.status(200).json({
                success: true,
                message: 'Existing walk-in updated successfully',
                data: walkinRecord
            });
        } else {
            // ALWAYS Create new record if status is 'New Walkin' or if it is a different store, but preserve repeatCount sequence globally
            const globalLatest = await Walkin.findOne({ contact: trimmedContact }).sort({ createdAt: -1 });
            const nextRepeatCount = globalLatest ? globalLatest.repeatCount + 1 : 1;

            const newWalkin = new Walkin({
                customerName: customerName.trim(),
                contact: trimmedContact,
                functionDate: functionDate ? functionDate.trim() : '-',
                store: finalStore,
                staff: finalStaff,
                storeId: finalStoreId || undefined,
                employeeId: finalEmployeeId || undefined,
                createdBy: createdBy || undefined,
                category: category ? category.trim() : '-',
                subCategory: subCategory ? subCategory.trim() : '-',
                remarks: remarks ? remarks.trim() : '-',
                status: status ? status.trim() : 'New Walkin',
                repeatCount: nextRepeatCount,
                date: todayStr
            });
            await newWalkin.save();
            return res.status(201).json({
                success: true,
                message: 'New walk-in saved successfully',
                data: newWalkin
            });
        }
    } catch (error) {
        console.error('Error saving walk-in:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while saving walk-in',
            error: error.message
        });
    }
};

/**
 * Get all walk-in records with role-based filtering and date range support
 */
export const getWalkins = async (req, res) => {
    try {
        const { startDate, endDate, storeId, employeeId, page = 1, limit = 20, search = '', status = '', store = '', dashboard = '', countOnly = '', chartOnly = '' } = req.query;
        const adminId = req.admin.userId;

        // 1. Build Base Query based on date/frontend filters
        let baseQuery = {};
        
        if (storeId) {
            await validateStoreAccess(adminId, storeId);
            baseQuery.storeId = storeId;
        }
        if (employeeId) {
            await validateEmployeeAccess(adminId, employeeId);
            baseQuery.employeeId = employeeId;
        }

        // Date Range Filter
        if (startDate && endDate) {
            const endOfDaySuffix = endDate.includes(' ') ? '' : ' 23:59:59';
            baseQuery.date = { $gte: startDate, $lte: `${endDate}${endOfDaySuffix}` };
        }

        if (status && status !== 'All') {
            baseQuery.status = status;
        }

        if (store && store !== 'All') {
            baseQuery.store = { $regex: `^${store.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
        }

        if (search && search.trim()) {
            const q = search.trim();
            baseQuery.$or = [
                { customerName: { $regex: q, $options: 'i' } },
                { contact: { $regex: q, $options: 'i' } },
                { store: { $regex: q, $options: 'i' } },
                { staff: { $regex: q, $options: 'i' } }
            ];
        }

        // 2. Wrap with RBAC
        const secureQuery = await buildWalkinFilter(adminId, baseQuery);
        if (secureQuery._id === null) {
            return res.status(403).json({ success: false, message: 'Admin not found or access denied' });
        }

        // 3. Fetch filtered walkins directly from MongoDB
        const baseProjection = 'date customerName contact functionDate store staff managerName category subCategory remarks repeatCount status storeId employeeId createdBy createdAt';

        const isCountOnlyFetch = String(countOnly).toLowerCase() === 'true';
        const isChartOnlyFetch = String(chartOnly).toLowerCase() === 'true';

        if (isCountOnlyFetch) {
            const total = await Walkin.countDocuments(secureQuery);
            return res.status(200).json({
                success: true,
                message: 'Walk-in count retrieved successfully',
                count: total,
                page: 1,
                limit: 0,
                data: [],
            });
        }

        if (isChartOnlyFetch) {
            const chartQuery = [
                { $match: secureQuery },
                {
                    $group: {
                        _id: { $substrBytes: ['$date', 0, 10] },
                        walkings: { $sum: 1 },
                        completed: {
                            $sum: {
                                $cond: [
                                    { $in: ['$status', ['Completed', 'Booking']] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            const chartData = await Walkin.aggregate(chartQuery);
            return res.status(200).json({
                success: true,
                message: 'Walk-in chart retrieved successfully',
                count: chartData.length,
                data: chartData,
            });
        }

        const [total, filtered] = await Promise.all([
            Walkin.countDocuments(secureQuery),
            Walkin.find(secureQuery)
                .sort({ createdAt: -1 })
                .select(baseProjection)
                .lean(),
        ]);

        return res.status(200).json({
            success: true,
            message: 'Walk-ins retrieved successfully',
            count: total,
            page: 1,
            limit: total,
            data: filtered
        });

    } catch (error) {
        console.error('Error fetching walk-ins:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching walk-ins',
            error: error.message
        });
    }
};

/**
 * Get all walk-in records for external webpages (No authentication required)
 */
export const getAllWalkinsPublic = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let filtered = await Walkin.find({})
            .sort({ createdAt: -1 })
            .select('date customerName contact functionDate store staff managerName category subCategory remarks repeatCount status storeId employeeId createdBy createdAt')
            .lean();

        // Date Range Filter
        if (startDate && endDate) {
            const endOfDaySuffix = endDate.includes(' ') ? '' : ' 23:59:59';
            filtered = filtered.filter(w => w.date >= startDate && w.date <= `${endDate}${endOfDaySuffix}`);
        }

        return res.status(200).json({
            success: true,
            message: 'All walk-ins retrieved successfully for external view',
            count: filtered.length,
            data: filtered
        });

    } catch (error) {
        console.error('Error fetching public walk-ins:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching public walk-ins',
            error: error.message
        });
    }
};

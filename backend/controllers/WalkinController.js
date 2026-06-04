import Walkin from '../model/Walkin.js';
import Admin from '../model/Admin.js';
import User from '../model/User.js';
import Branch from '../model/Branch.js';
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
        const todayStr = date || new Date().toISOString().split('T')[0];

        // Process token / Role-based overrides
        let finalStore = store ? store.trim() : '-';
        let finalStaff = staff ? staff.trim() : 'None';
        let finalStoreId = storeId;
        let finalEmployeeId = employeeId;
        let createdBy = null;

        if (req.admin) {
            createdBy = req.admin.userId;
            if (req.admin.role === 'user' || !req.admin.role) {
                // Employee app user
                const user = await User.findById(req.admin.userId);
                if (user) {
                    finalStore = user.workingBranch || finalStore;
                    finalStaff = user.username || finalStaff;
                    finalEmployeeId = user._id;
                    
                    // Automatically resolve the storeId from Branch table
                    const branch = await Branch.findOne({
                        $or: [
                            { locCode: user.locCode },
                            { workingBranch: user.workingBranch }
                        ]
                    });
                    if (branch) {
                        finalStoreId = branch._id;
                    }
                }
            } else if (!req.admin.isSystem) {
                // Admin user, validate explicit storeId and employeeId if provided
                const adminId = req.admin.userId;
                
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
        const { startDate, endDate, storeId, employeeId } = req.query;
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
            baseQuery.date = { $gte: startDate, $lte: endDate };
        }

        // 2. Wrap with RBAC
        const secureQuery = await buildWalkinFilter(adminId, baseQuery);
        if (secureQuery._id === null) {
            return res.status(403).json({ success: false, message: 'Admin not found or access denied' });
        }

        // 3. Fetch filtered walkins directly from MongoDB
        const limitVal = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const skipVal = req.query.skip ? parseInt(req.query.skip, 10) : null;

        let queryBuilder = Walkin.find(secureQuery).sort({ createdAt: -1 });
        if (skipVal !== null && !isNaN(skipVal)) {
            queryBuilder = queryBuilder.skip(skipVal);
        }
        if (limitVal !== null && !isNaN(limitVal)) {
            queryBuilder = queryBuilder.limit(limitVal);
        }
        const filtered = await queryBuilder;

        return res.status(200).json({
            success: true,
            message: 'Walk-ins retrieved successfully',
            count: filtered.length,
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

        let filtered = await Walkin.find({}).sort({ createdAt: -1 });

        // Date Range Filter
        if (startDate && endDate) {
            const parseDate = (dStr) => {
                if (!dStr) return new Date();
                const parts = dStr.split('-');
                if (parts.length === 3) {
                    if (parts[2].length === 4) {
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                    return new Date(parts[0], parts[1] - 1, parts[2]);
                }
                return new Date(dStr);
            };

            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filtered = filtered.filter(w => {
                const wDate = parseDate(w.date);
                return wDate >= start && wDate <= end;
            });
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

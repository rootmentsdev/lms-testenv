import axios from 'axios';
import Branch from '../model/Branch.js';
import Walkin from '../model/Walkin.js';
import CronLog from '../model/CronLog.js';
import { normalizePhone } from '../utils/normalizePhone.js';

let isSyncInProgress = false;

/**
 * Returns YYYY-MM-DD format date string for a given offset of days from today
 */
const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const getLocalDateStringIST = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Helper to dynamically extract mobile/phone numbers case-insensitively from an item object
 */
const extractPhoneNumber = (item) => {
    if (!item) return null;
    const phoneKeys = ['mobile', 'mobilenumber', 'phone', 'phonenumber', 'phoneno', 'contact', 'customermobile', 'custmobile', 'customerphone', 'telephone', 'mobile_no', 'phone_no'];
    for (const key of Object.keys(item)) {
        if (phoneKeys.includes(key.toLowerCase())) {
            return String(item[key]);
        }
    }
    return null;
};

/**
 * Helper to define hierarchy rankings for walk-in statuses
 */
const getStatusRank = (status) => {
    const ranks = {
        'New Walkin': 1,
        'Booked': 2,
        'Rentout': 3,
        'Return': 4,
        'Cancel': 5,
        'Cancelled': 5
    };
    return ranks[status] || 1; // Default rank is 1 for any other statuses
};

/**
 * Automatically sync Walkin statuses with the external Rental APIs
 */
export const syncWalkinStatuses = async () => {
    if (isSyncInProgress) {
        console.log('⚠️ [Walkin Status Sync] Previous sync job is still running. Skipping this execution.');
        return {
            success: false,
            message: 'Sync job is already in progress.'
        };
    }

    isSyncInProgress = true;
    const jobStartedAt = new Date();
    console.log('🔄 [Walkin Status Sync] Job started at:', jobStartedAt.toISOString());

    const dateFrom = getPastDateString(7); // Last 7 days (Today - 7)
    const dateTo = getPastDateString(0);   // Today (Today - 0)

    console.log(`📅 [Walkin Status Sync] Range: ${dateFrom} to ${dateTo}`);

    try {
        // Fetch active stores
        const branches = await Branch.find({ isActive: true });
        console.log(`🏬 [Walkin Status Sync] Found ${branches.length} active branches to process.`);

        let totalBookings = 0;
        let totalRentouts = 0;
        let totalReturns = 0;
        let totalDeletes = 0;
        let totalShoeBilled = 0;
        let totalShoeBillReturned = 0;
        let totalWalkinsMatched = 0;
        let totalWalkinsUpdated = 0;
        let totalWalkinsSameStatus = 0;
        let totalWalkinsSameDayRepeat = 0;
        let totalWalkinsSkippedHierarchy = 0;
        const errorsList = [];
        const branchResultsList = [];

        for (const branch of branches) {
            const { locCode, workingBranch, _id: storeId } = branch;
            console.log(`📍 [Walkin Status Sync] Processing branch: ${workingBranch} (locCode: ${locCode})`);

            try {
                // Define endpoints
                const bookingUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
                const rentoutUrl = `https://rentalapi.rootments.live/api/GetBooking/GetRentoutList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
                const returnUrl = `https://rentalapi.rootments.live/api/GetBooking/GetReturnList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
                const deleteUrl = `https://rentalapi.rootments.live/api/GetBooking/GetDeleteList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
                const shoeBilledUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBilledList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
                const shoeBillReturnedUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBillReturnedList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;

                // Fetch from all six APIs in parallel, but handle individual request errors safely
                const fetchListSafe = async (url, typeName) => {
                    try {
                        const response = await axios.get(url, { timeout: 15000 });
                        const rawData = response.data;
                        let list = [];
                        if (rawData) {
                            if (Array.isArray(rawData)) {
                                list = rawData;
                            } else if (rawData.dataSet && Array.isArray(rawData.dataSet.data)) {
                                list = rawData.dataSet.data;
                            } else if (Array.isArray(rawData.data)) {
                                list = rawData.data;
                            }
                        }
                        return list;
                    } catch (err) {
                        console.warn(`⚠️ [Walkin Status Sync] Failed to fetch ${typeName} for branch ${locCode}:`, err.message);
                        errorsList.push({ branch: locCode, type: typeName, error: err.message });
                        return [];
                    }
                };

                const [bookings, rentouts, returns, deletes, shoeBilled, shoeBillReturned] = await Promise.all([
                    fetchListSafe(bookingUrl, 'Booking'),
                    fetchListSafe(rentoutUrl, 'Rentout'),
                    fetchListSafe(returnUrl, 'Return'),
                    fetchListSafe(deleteUrl, 'Delete'),
                    fetchListSafe(shoeBilledUrl, 'ShoeBilled'),
                    fetchListSafe(shoeBillReturnedUrl, 'ShoeBillReturned')
                ]);

                console.log(`📊 [Walkin Status Sync] locCode ${locCode}: Bookings = ${bookings.length}, Rentouts = ${rentouts.length}, Returns = ${returns.length}, Deletes = ${deletes.length}, ShoeBilled = ${shoeBilled.length}, ShoeBillReturned = ${shoeBillReturned.length}`);
                totalBookings += bookings.length;
                totalRentouts += rentouts.length;
                totalReturns += returns.length;
                totalDeletes += deletes.length;
                totalShoeBilled += shoeBilled.length;
                totalShoeBillReturned += shoeBillReturned.length;

                // Specific API maps to source exact dates from their respective endpoints
                const bookingMap = new Map();
                const rentoutMap = new Map();
                const returnMap = new Map();
                const cancelMap = new Map();
                const shoeBilledMap = new Map();
                const shoeBillReturnedMap = new Map();

                // Priority Maps: rental statuses and shoe statuses are independent
                const phoneRentalMap = new Map();
                const phoneShoeMap = new Map();

                // 1. Rental Flow Mapping (Priority: Cancelled > Return > Rentout > Booked)
                for (const item of bookings) {
                    const phone = normalizePhone(extractPhoneNumber(item));
                    if (phone) {
                        bookingMap.set(phone, item);
                        phoneRentalMap.set(phone, { status: 'Booked', item });
                    }
                }
                for (const item of rentouts) {
                    const phone = normalizePhone(extractPhoneNumber(item));
                    if (phone) {
                        rentoutMap.set(phone, item);
                        phoneRentalMap.set(phone, { status: 'Rentout', item });
                    }
                }
                for (const item of returns) {
                    const phone = normalizePhone(extractPhoneNumber(item));
                    if (phone) {
                        returnMap.set(phone, item);
                        phoneRentalMap.set(phone, { status: 'Return', item });
                    }
                }
                for (const item of deletes) {
                    const phone = normalizePhone(extractPhoneNumber(item));
                    if (phone) {
                        cancelMap.set(phone, item);
                        phoneRentalMap.set(phone, { status: 'Cancelled', item });
                    }
                }

                // 2. Shoe Flow Mapping (Priority: Bill Returned > Billed)
                for (const item of shoeBilled) {
                    const phone = normalizePhone(extractPhoneNumber(item));
                    if (phone) {
                        shoeBilledMap.set(phone, item);
                        phoneShoeMap.set(phone, { status: 'Billed', item });
                    }
                }
                for (const item of shoeBillReturned) {
                    const phone = normalizePhone(extractPhoneNumber(item));
                    if (phone) {
                        shoeBillReturnedMap.set(phone, item);
                        phoneShoeMap.set(phone, { status: 'Bill Returned', item });
                    }
                }

                // Gather union of all phones to check walk-ins in DB
                const allPhones = new Set([
                    ...phoneRentalMap.keys(),
                    ...phoneShoeMap.keys()
                ]);
                const normalizedPhones = Array.from(allPhones);

                let branchWalkinsMatched = 0;
                let branchWalkinsUpdated = 0;
                let branchWalkinsSameStatus = 0;
                let branchWalkinsSameDayRepeat = 0;
                let branchWalkinsSkippedHierarchy = 0;

                if (normalizedPhones.length > 0) {
                    const queryPhones = [];
                    for (const p of normalizedPhones) {
                        queryPhones.push(p);
                        queryPhones.push(`+91${p}`);
                        queryPhones.push(`91${p}`);
                        queryPhones.push(`0${p}`);
                    }

                    const walkins = await Walkin.find({
                        contact: { $in: queryPhones },
                        storeId: storeId
                    }).sort({ createdAt: -1 });

                    const walkinMap = new Map();
                    for (const walkin of walkins) {
                        const norm = normalizePhone(walkin.contact);
                        if (norm && !walkinMap.has(norm)) {
                            walkinMap.set(norm, walkin);
                        }
                    }

                    for (const normalizedPhone of normalizedPhones) {
                        const walkin = walkinMap.get(normalizedPhone);
                        if (walkin) {
                            branchWalkinsMatched++;
                            totalWalkinsMatched++;

                            let docUpdated = false;
                            let rentalStatusChanged = false;
                            let shoeStatusChanged = false;

                            // Iterates the priority list first so the most specific field wins.
                            // Case-insensitive: 'rentOutDate' matches key 'rentoutdate' in the list.
                            const extractDateValue = (itm, priorityKeys) => {
                                const itemKeyMap = {};
                                for (const k of Object.keys(itm)) {
                                    itemKeyMap[k.toLowerCase()] = itm[k];
                                }
                                for (const key of priorityKeys) {
                                    const val = itemKeyMap[key.toLowerCase()];
                                    if (val) {
                                        const d = new Date(val);
                                        if (!isNaN(d.getTime())) return d;
                                    }
                                }
                                return null;
                            };

                            // Check Rental update
                            const rentalInfo = phoneRentalMap.get(normalizedPhone);
                            if (rentalInfo) {
                                const targetRentalStatus = rentalInfo.status;
                                const currentRentalStatus = walkin.rentalStatus || walkin.status || 'New Walkin';

                                // Sourced dates strictly from their specific API endpoints
                                const bookingItem = bookingMap.get(normalizedPhone);
                                if (bookingItem) {
                                    const bDate = extractDateValue(bookingItem, ['bookingDate', 'bookingdate', 'booking_date', 'bookeddate']);
                                    if (bDate && (!walkin.bookingDate || walkin.bookingDate.getTime() !== bDate.getTime())) {
                                        walkin.bookingDate = bDate;
                                        docUpdated = true;
                                    }
                                }

                                const rentoutItem = rentoutMap.get(normalizedPhone);
                                if (rentoutItem) {
                                    const roDate = extractDateValue(rentoutItem, ['rentOutDate', 'rentoutdate', 'rent_out_date', 'rentdate']);
                                    if (roDate && (!walkin.rentoutDate || walkin.rentoutDate.getTime() !== roDate.getTime())) {
                                        walkin.rentoutDate = roDate;
                                        docUpdated = true;
                                    }
                                }

                                const returnItem = returnMap.get(normalizedPhone);
                                if (returnItem) {
                                    const retDate = extractDateValue(returnItem, ['returnedDate', 'returneddate', 'returndate', 'return_date']);
                                    if (retDate && (!walkin.returnDate || walkin.returnDate.getTime() !== retDate.getTime())) {
                                        walkin.returnDate = retDate;
                                        docUpdated = true;
                                    }
                                }

                                const cancelItem = cancelMap.get(normalizedPhone);
                                if (cancelItem) {
                                    const cDate = extractDateValue(cancelItem, ['cancelDate', 'canceldate', 'cancellationdate', 'cancelleddate']);
                                    if (cDate && (!walkin.cancelDate || walkin.cancelDate.getTime() !== cDate.getTime())) {
                                        walkin.cancelDate = cDate;
                                        walkin.cancellationDate = cDate;
                                        docUpdated = true;
                                    }
                                }

                                const normalizeStatusForCompare = (s) => {
                                    const val = String(s || '').trim().toLowerCase();
                                    if (val === 'cancel') return 'cancelled';
                                    return val;
                                };

                                if (normalizeStatusForCompare(currentRentalStatus) !== normalizeStatusForCompare(targetRentalStatus)) {
                                    const currentRank = getStatusRank(currentRentalStatus);
                                    const targetRank = getStatusRank(targetRentalStatus);

                                    if (targetRank >= currentRank) {
                                        const oldRental = currentRentalStatus;
                                        walkin.rentalStatus = targetRentalStatus;
                                        rentalStatusChanged = true;
                                        docUpdated = true;

                                        let matchedDate = null;
                                        if (targetRentalStatus === 'Booked') {
                                            matchedDate = walkin.bookingDate;
                                        } else if (targetRentalStatus === 'Rentout') {
                                            matchedDate = walkin.rentoutDate;
                                        } else if (targetRentalStatus === 'Return') {
                                            matchedDate = walkin.returnDate;
                                        } else if (targetRentalStatus === 'Cancelled') {
                                            matchedDate = walkin.cancelDate;
                                        }

                                        if (!walkin.statusHistory) {
                                            walkin.statusHistory = [];
                                        }
                                        walkin.statusHistory.push({
                                            status: targetRentalStatus,
                                            category: walkin.category && walkin.category !== '-' ? walkin.category : 'Product',
                                            date: matchedDate || new Date()
                                        });
                                        console.log(`✅ [Walkin Status Sync] Rental Flow update for ...${normalizedPhone.slice(-4)}: ${oldRental} ➔ ${targetRentalStatus}`);
                                    } else {
                                        branchWalkinsSkippedHierarchy++;
                                        totalWalkinsSkippedHierarchy++;
                                        console.log(`ℹ️ [Walkin Status Sync] Skipped rental update for ...${normalizedPhone.slice(-4)}: current '${currentRentalStatus}' >= target '${targetRentalStatus}'`);
                                    }
                                }
                            }

                            // Check Shoe update
                            const shoeInfo = phoneShoeMap.get(normalizedPhone);
                            if (shoeInfo) {
                                const targetShoeStatus = shoeInfo.status;
                                const currentShoeStatus = walkin.shoeStatus || '-';

                                const shoeBilledItem = shoeBilledMap.get(normalizedPhone);
                                if (shoeBilledItem) {
                                    const bldDate = extractDateValue(shoeBilledItem, ['billedDate', 'billingDate', 'billeddate', 'billdate', 'billingdate']);
                                    if (bldDate && (!walkin.billedDate || walkin.billedDate.getTime() !== bldDate.getTime())) {
                                        walkin.billedDate = bldDate;
                                        docUpdated = true;
                                    }
                                }

                                const shoeBillReturnedItem = shoeBillReturnedMap.get(normalizedPhone);
                                if (shoeBillReturnedItem) {
                                    const brDate = extractDateValue(shoeBillReturnedItem, ['billReturnedDate', 'returnedDate', 'billreturneddate', 'returneddate', 'returndate']);
                                    if (brDate && (!walkin.billReturnedDate || walkin.billReturnedDate.getTime() !== brDate.getTime())) {
                                        walkin.billReturnedDate = brDate;
                                        docUpdated = true;
                                    }
                                }

                                if (currentShoeStatus !== targetShoeStatus) {
                                    const getShoeStatusRank = (s) => {
                                        const ranks = { 'Billed': 1, 'Bill Returned': 2 };
                                        return ranks[s] || 0;
                                    };
                                    const currentShoeRank = getShoeStatusRank(currentShoeStatus);
                                    const targetShoeRank = getShoeStatusRank(targetShoeStatus);

                                    if (targetShoeRank >= currentShoeRank) {
                                        const oldShoe = currentShoeStatus;
                                        walkin.shoeStatus = targetShoeStatus;
                                        shoeStatusChanged = true;
                                        docUpdated = true;

                                        let matchedShoeDate = null;
                                        if (targetShoeStatus === 'Billed') {
                                            matchedShoeDate = walkin.billedDate;
                                        } else if (targetShoeStatus === 'Bill Returned') {
                                            matchedShoeDate = walkin.billReturnedDate;
                                        }

                                        if (!walkin.statusHistory) {
                                            walkin.statusHistory = [];
                                        }
                                        walkin.statusHistory.push({
                                            status: targetShoeStatus,
                                            category: 'Sales',
                                            date: matchedShoeDate || new Date()
                                        });
                                        console.log(`✅ [Walkin Status Sync] Shoe Flow update for ...${normalizedPhone.slice(-4)}: ${oldShoe} ➔ ${targetShoeStatus}`);
                                    } else {
                                        console.log(`ℹ️ [Walkin Status Sync] Skipped shoe update for ...${normalizedPhone.slice(-4)}: current '${currentShoeStatus}' >= target '${targetShoeStatus}'`);
                                    }
                                }
                            }

                            if (docUpdated) {
                                const todayDateStr = getLocalDateStringIST(new Date());
                                const walkinDateStr = walkin.date && walkin.date !== '-' ?
                                    walkin.date.substring(0, 10) :
                                    (walkin.createdAt ? getLocalDateStringIST(walkin.createdAt) : null);

                                let shouldIncrementRepeat = false;
                                if (walkinDateStr && walkinDateStr !== todayDateStr) {
                                    const isCancelledChange = rentalStatusChanged && (walkin.rentalStatus === 'Cancelled');
                                    if (!isCancelledChange) {
                                        shouldIncrementRepeat = true;
                                    }
                                }

                                if (shouldIncrementRepeat) {
                                    walkin.repeatCount = (walkin.repeatCount || 1) + 1;
                                } else if (walkinDateStr === todayDateStr) {
                                    branchWalkinsSameDayRepeat++;
                                    totalWalkinsSameDayRepeat++;
                                }

                                // Recalculate combined status
                                const getCombinedStatus = (rental, shoe) => {
                                    const r = (rental || 'New Walkin').trim();
                                    const s = (shoe || '').trim();
                                    if (!s || s === '-' || s === 'None') return r;
                                    if (r === 'New Walkin' || r === '-') return s;
                                    return `${r}, ${s}`;
                                };

                                walkin.status = getCombinedStatus(walkin.rentalStatus, walkin.shoeStatus);
                                await walkin.save();

                                branchWalkinsUpdated++;
                                totalWalkinsUpdated++;
                            } else {
                                branchWalkinsSameStatus++;
                                totalWalkinsSameStatus++;
                            }
                        }
                    }
                }

                console.log(`📈 [Walkin Status Sync] Branch ${locCode} execution results: Matched = ${branchWalkinsMatched}, Updated = ${branchWalkinsUpdated}, SameStatus = ${branchWalkinsSameStatus}, SameDayRepeatSkip = ${branchWalkinsSameDayRepeat}, Skipped (hierarchy/skipped) = ${branchWalkinsSkippedHierarchy}`);

                branchResultsList.push({
                    locCode,
                    workingBranch,
                    bookings: bookings.length,
                    rentouts: rentouts.length,
                    returns: returns.length,
                    deletes: deletes.length,
                    shoeBilled: shoeBilled.length,
                    shoeBillReturned: shoeBillReturned.length,
                    matched: branchWalkinsMatched,
                    updated: branchWalkinsUpdated,
                    sameStatus: branchWalkinsSameStatus,
                    sameDayRepeatSkip: branchWalkinsSameDayRepeat,
                    skipped: branchWalkinsSkippedHierarchy,
                });

            } catch (error) {
                console.error(`❌ [Walkin Status Sync] Unhandled error for locCode ${locCode}:`, error);
                errorsList.push({ branch: locCode, type: 'All', error: error.message });
            }
        }

        const jobCompletedAt = new Date();
        const durationMs = jobCompletedAt - jobStartedAt;

        console.log('🏁 [Walkin Status Sync] Job completed.');
        console.log(`📝 [Walkin Status Sync] Summary:
          - Total Bookings processed: ${totalBookings}
          - Total Rentouts processed: ${totalRentouts}
          - Total Returns processed: ${totalReturns}
          - Total Deletes processed: ${totalDeletes}
          - Total Shoe Billed processed: ${totalShoeBilled}
          - Total Shoe Bill Returned processed: ${totalShoeBillReturned}
          - Total Walk-ins matched: ${totalWalkinsMatched}
          - Total Walk-ins updated: ${totalWalkinsUpdated}
          - Total Walk-ins skipped (same status): ${totalWalkinsSameStatus}
          - Total Walk-ins skipped (same day repeat): ${totalWalkinsSameDayRepeat}
          - Total Walk-ins skipped (hierarchy): ${totalWalkinsSkippedHierarchy}
          - Total locCode errors encountered: ${errorsList.length}
          - Duration: ${durationMs}ms
        `);

        // ── Persist run log to DB ──
        try {
            await CronLog.create({
                jobType: 'walkin_status_sync',
                status: errorsList.length > 0 && totalWalkinsUpdated === 0 ? 'error' : 'success',
                startedAt: jobStartedAt,
                completedAt: jobCompletedAt,
                durationMs,
                summary: {
                    totalBookings,
                    totalRentouts,
                    totalReturns,
                    totalDeletes,
                    totalShoeBilled,
                    totalShoeBillReturned,
                    totalWalkinsMatched,
                    totalWalkinsUpdated,
                    totalWalkinsSameStatus,
                    totalWalkinsSameDayRepeat,
                    totalWalkinsSkippedHierarchy,
                    errorsCount: errorsList.length,
                },
                branchResults: branchResultsList,
                errorDetails: errorsList,
            });
            console.log('💾 [Walkin Status Sync] Run log saved to DB.');
        } catch (logErr) {
            console.error('⚠️ [Walkin Status Sync] Failed to save run log to DB:', logErr.message);
        }

        return {
            success: true,
            summary: {
                totalBookings,
                totalRentouts,
                totalReturns,
                totalDeletes,
                totalWalkinsUpdated,
                totalWalkinsSameStatus,
                totalWalkinsSameDayRepeat,
                totalWalkinsSkippedHierarchy,
                errorsCount: errorsList.length,
                errors: errorsList
            }
        };

    } finally {
        isSyncInProgress = false;
    }
};

/**
 * Automatically expire walk-ins to 'Loss' if they were created before today,
 * have status 'New Walkin', and have not been updated since creation.
 */
export const expireWalkinsToLoss = async () => {
    const jobStartedAt = new Date();
    console.log('🔄 [Walkin Loss Expiry] Job started at:', jobStartedAt.toISOString());
    try {
        const now = new Date();

        // Calculate the local start of today in Asia/Kolkata timezone (UTC+5:30)
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
        const parts = formatter.formatToParts(now);
        const dateObj = {};
        parts.forEach(p => { dateObj[p.type] = p.value; });

        const startOfToday = new Date(Date.UTC(
            parseInt(dateObj.year, 10),
            parseInt(dateObj.month, 10) - 1,
            parseInt(dateObj.day, 10),
            0, 0, 0, 0
        ));
        startOfToday.setTime(startOfToday.getTime() - (5.5 * 60 * 60 * 1000));

        console.log(`📅 [Walkin Loss Expiry] Expiry threshold: walk-ins created before ${startOfToday.toISOString()} (IST midnight)`);

        // Perform bulk update of walk-ins that:
        // 1. status is 'New Walkin'
        // 2. createdAt < startOfToday
        // 3. updatedAt === createdAt (no updates occurred)
        // Set status to 'Loss' and update updatedAt to the current time.
        const result = await Walkin.updateMany(
            {
                status: 'New Walkin',
                $or: [
                    { repeatCount: 1 },
                    { repeatCount: { $exists: false } }
                ],
                createdAt: { $lt: startOfToday },
                $expr: { $eq: ['$createdAt', '$updatedAt'] }
            },
            {
                $set: {
                    status: 'Loss',
                    updatedAt: now
                }
            }
        );

        const jobCompletedAt = new Date();
        const durationMs = jobCompletedAt - jobStartedAt;

        console.log(`🏁 [Walkin Loss Expiry] Job completed. Updated ${result.modifiedCount} walk-ins to status 'Loss'. Duration: ${durationMs}ms`);

        // ── Persist run log to DB ──
        try {
            await CronLog.create({
                jobType: 'walkin_loss_expiry',
                status: 'success',
                startedAt: jobStartedAt,
                completedAt: jobCompletedAt,
                durationMs,
                expiredCount: result.modifiedCount,
            });
            console.log('💾 [Walkin Loss Expiry] Run log saved to DB.');
        } catch (logErr) {
            console.error('⚠️ [Walkin Loss Expiry] Failed to save run log to DB:', logErr.message);
        }

        return { success: true, expiredCount: result.modifiedCount };
    } catch (error) {
        const jobCompletedAt = new Date();
        console.error('❌ [Walkin Loss Expiry] Error during daily expiry job:', error);

        // Log the failure too
        try {
            await CronLog.create({
                jobType: 'walkin_loss_expiry',
                status: 'error',
                startedAt: jobStartedAt,
                completedAt: jobCompletedAt,
                durationMs: jobCompletedAt - jobStartedAt,
                errorMessage: error.message,
            });
        } catch { /* silent */ }

        return { success: false, error: error.message };
    }
};


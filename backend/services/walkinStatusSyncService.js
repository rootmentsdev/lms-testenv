import axios from 'axios';
import Branch from '../model/Branch.js';
import Walkin from '../model/Walkin.js';
import { normalizePhone } from '../utils/normalizePhone.js';

/**
 * Returns YYYY-MM-DD format date string for a given offset of days from today
 */
const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

/**
 * Helper to dynamically extract mobile/phone numbers case-insensitively from an item object
 */
const extractPhoneNumber = (item) => {
    if (!item) return null;
    const phoneKeys = ['mobile', 'mobilenumber', 'phone', 'phonenumber', 'contact', 'customermobile', 'custmobile', 'customerphone', 'telephone', 'mobile_no', 'phone_no'];
    for (const key of Object.keys(item)) {
        if (phoneKeys.includes(key.toLowerCase())) {
            return String(item[key]);
        }
    }
    return null;
};

/**
 * Automatically sync Walkin statuses with the external Rental APIs
 */
export const syncWalkinStatuses = async () => {
    console.log('🔄 [Walkin Status Sync] Job started at:', new Date().toISOString());

    const dateFrom = getPastDateString(2); // Last 3 days (Today - 2)
    const dateTo = getPastDateString(0);   // Today (Today - 0)

    console.log(`📅 [Walkin Status Sync] Range: ${dateFrom} to ${dateTo}`);

    // Fetch active stores
    const branches = await Branch.find({ isActive: true });
    console.log(`🏬 [Walkin Status Sync] Found ${branches.length} active branches to process.`);

    let totalBookings = 0;
    let totalRentouts = 0;
    let totalReturns = 0;
    let totalWalkinsUpdated = 0;
    const errorsList = [];

    for (const branch of branches) {
        const { locCode, workingBranch, _id: storeId } = branch;
        console.log(`📍 [Walkin Status Sync] Processing branch: ${workingBranch} (locCode: ${locCode})`);

        try {
            // Define endpoints
            const bookingUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
            const rentoutUrl = `https://rentalapi.rootments.live/api/GetBooking/GetRentoutList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
            const returnUrl = `https://rentalapi.rootments.live/api/GetBooking/GetReturnList?LocCode=${locCode}&DateFrom=${dateFrom}&DateTo=${dateTo}`;

            // Fetch from all three APIs in parallel, but handle individual request errors safely
            const fetchListSafe = async (url, typeName) => {
                try {
                    const response = await axios.get(url, { timeout: 15000 });
                    const list = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
                    return list;
                } catch (err) {
                    console.warn(`⚠️ [Walkin Status Sync] Failed to fetch ${typeName} for branch ${locCode}:`, err.message);
                    errorsList.push({ branch: locCode, type: typeName, error: err.message });
                    return [];
                }
            };

            const [bookings, rentouts, returns] = await Promise.all([
                fetchListSafe(bookingUrl, 'Booking'),
                fetchListSafe(rentoutUrl, 'Rentout'),
                fetchListSafe(returnUrl, 'Return')
            ]);

            console.log(`📊 [Walkin Status Sync] locCode ${locCode}: Bookings = ${bookings.length}, Rentouts = ${rentouts.length}, Returns = ${returns.length}`);
            totalBookings += bookings.length;
            totalRentouts += rentouts.length;
            totalReturns += returns.length;

            // Priority Rule: Return > Rentout > Booked
            const phoneStatusMap = new Map();

            // Bookings (Priority 3)
            for (const item of bookings) {
                const phone = normalizePhone(extractPhoneNumber(item));
                if (phone) {
                    phoneStatusMap.set(phone, 'Booked');
                }
            }

            // Rentouts (Priority 2)
            for (const item of rentouts) {
                const phone = normalizePhone(extractPhoneNumber(item));
                if (phone) {
                    phoneStatusMap.set(phone, 'Rentout');
                }
            }

            // Returns (Priority 1)
            for (const item of returns) {
                const phone = normalizePhone(extractPhoneNumber(item));
                if (phone) {
                    phoneStatusMap.set(phone, 'Return');
                }
            }

            // Update matching walk-ins
            for (const [normalizedPhone, targetStatus] of phoneStatusMap.entries()) {
                // Find latest walk-in for this contact and storeId
                const walkin = await Walkin.findOne({
                    $or: [
                        { contact: normalizedPhone },
                        { contact: `+91${normalizedPhone}` },
                        { contact: `91${normalizedPhone}` },
                        { contact: `0${normalizedPhone}` }
                    ],
                    storeId: storeId
                }).sort({ createdAt: -1 });

                if (walkin) {
                    if (walkin.status !== targetStatus) {
                        const oldStatus = walkin.status;
                        
                        // Perform transition logic: update status and increment repeatCount based on saveWalkin logic
                        walkin.status = targetStatus;
                        walkin.repeatCount = (walkin.repeatCount || 1) + 1;
                        
                        // save() will trigger the pre-save hooks (updating updatedAt but leaving createdAt untouched)
                        await walkin.save();
                        
                        totalWalkinsUpdated++;
                        console.log(`✅ [Walkin Status Sync] Updated customer contact ending in ...${normalizedPhone.slice(-4)} at ${workingBranch}: ${oldStatus} ➔ ${targetStatus} (repeatCount: ${walkin.repeatCount})`);
                    }
                }
            }

        } catch (error) {
            console.error(`❌ [Walkin Status Sync] Unhandled error for locCode ${locCode}:`, error);
            errorsList.push({ branch: locCode, type: 'All', error: error.message });
        }
    }

    console.log('🏁 [Walkin Status Sync] Job completed.');
    console.log(`📝 [Walkin Status Sync] Summary:
      - Total Bookings processed: ${totalBookings}
      - Total Rentouts processed: ${totalRentouts}
      - Total Returns processed: ${totalReturns}
      - Total Walk-ins updated: ${totalWalkinsUpdated}
      - Total locCode errors encountered: ${errorsList.length}
    `);

    return {
        success: true,
        summary: {
            totalBookings,
            totalRentouts,
            totalReturns,
            totalWalkinsUpdated,
            errorsCount: errorsList.length,
            errors: errorsList
        }
    };
};

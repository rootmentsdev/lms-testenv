/**
 * dateRange.js
 * ------------
 * IST-aware date range utilities for MongoDB queries.
 *
 * Business timezone: Asia/Kolkata (IST, UTC+5:30).
 *
 * All MongoDB Date values are stored in UTC.
 * All user-selected dates are treated as IST calendar dates.
 *
 * Standard query pattern (inclusive start, exclusive next-day start):
 *   { $gte: startUTC, $lt: nextDayStartUTC }
 *
 * IST midnight conversion:
 *   "2026-07-03" IST 00:00:00 → 2026-07-02T18:30:00.000Z (UTC)
 *   "2026-07-04" IST 00:00:00 → 2026-07-03T18:30:00.000Z (UTC)  ← nextDayStartUTC for July 3
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 19 800 000 ms

/**
 * Parses a "YYYY-MM-DD" string into numeric year, month (1-based), day parts.
 * @param {string} dateStr
 * @returns {{ year: number, month: number, day: number }}
 */
const parseYMD = (dateStr) => {
    const parts = String(dateStr).split('-');
    return {
        year:  parseInt(parts[0], 10),
        month: parseInt(parts[1], 10),   // 1-based
        day:   parseInt(parts[2], 10)
    };
};

/**
 * Given a single YYYY-MM-DD IST calendar date, returns the UTC boundaries
 * for a MongoDB date range query covering that full IST day.
 *
 * @param {string} dateStr  - e.g. "2026-07-03"
 * @returns {{ startUTC: Date, nextDayStartUTC: Date }}
 *
 * Example:
 *   getISTDayRange("2026-07-03") →
 *     startUTC        = 2026-07-02T18:30:00.000Z
 *     nextDayStartUTC = 2026-07-03T18:30:00.000Z
 *
 * Query: { $gte: startUTC, $lt: nextDayStartUTC }
 */
export const getISTDayRange = (dateStr) => {
    const { year, month, day } = parseYMD(dateStr);
    const startUTC       = new Date(Date.UTC(year, month - 1, day,     0, 0, 0, 0) - IST_OFFSET_MS);
    const nextDayStartUTC = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0) - IST_OFFSET_MS);
    return { startUTC, nextDayStartUTC };
};

/**
 * Given an inclusive IST start date and inclusive IST end date (both YYYY-MM-DD),
 * returns UTC boundaries covering the full IST range for a MongoDB query.
 *
 * @param {string} startDateStr  - e.g. "2026-07-01"
 * @param {string} endDateStr    - e.g. "2026-07-03"
 * @returns {{ startUTC: Date, nextDayStartUTC: Date }}
 *
 * Example:
 *   getISTRangeBetween("2026-07-01", "2026-07-03") →
 *     startUTC        = 2026-06-30T18:30:00.000Z
 *     nextDayStartUTC = 2026-07-03T18:30:00.000Z
 *
 * Query: { $gte: startUTC, $lt: nextDayStartUTC }
 */
export const getISTRangeBetween = (startDateStr, endDateStr) => {
    const { year: sy, month: sm, day: sd } = parseYMD(startDateStr);
    const { year: ey, month: em, day: ed } = parseYMD(endDateStr);
    const startUTC        = new Date(Date.UTC(sy, sm - 1, sd,     0, 0, 0, 0) - IST_OFFSET_MS);
    const nextDayStartUTC = new Date(Date.UTC(ey, em - 1, ed + 1, 0, 0, 0, 0) - IST_OFFSET_MS);
    return { startUTC, nextDayStartUTC };
};

/**
 * Returns true if a MongoDB Date value falls within the IST range.
 * Uses inclusive startUTC and exclusive nextDayStartUTC.
 *
 * @param {Date|string|number} mongoDate
 * @param {Date} startUTC
 * @param {Date} nextDayStartUTC
 * @returns {boolean}
 */
export const isInISTRange = (mongoDate, startUTC, nextDayStartUTC) => {
    if (!mongoDate) return false;
    const t = new Date(mongoDate).getTime();
    if (isNaN(t)) return false;
    return t >= startUTC.getTime() && t < nextDayStartUTC.getTime();
};

/**
 * Returns the IST calendar date key "YYYY-MM-DD" for any MongoDB Date value.
 * Handles the 18:30 UTC day boundary correctly.
 *
 * @param {Date|string|number} mongoDate
 * @returns {string|null}  e.g. "2026-07-03"
 */
export const formatISTDateKey = (mongoDate) => {
    if (!mongoDate) return null;
    const d = new Date(mongoDate);
    if (isNaN(d.getTime())) return null;
    const ist = new Date(d.getTime() + IST_OFFSET_MS);
    const y   = ist.getUTCFullYear();
    const m   = String(ist.getUTCMonth() + 1).padStart(2, '0');
    const day = String(ist.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

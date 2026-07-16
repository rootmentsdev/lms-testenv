import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import StoreTarget from '../model/StoreTarget.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: given weekRanges + weeklyTargets, return which week is "current"
// and compute today's proportional daily target
// ─────────────────────────────────────────────────────────────────────────────
function parseWeekRange(rangeStr) {
  if (!rangeStr || rangeStr === 'Select Days') return null;
  const parts = rangeStr.split('-');
  if (parts.length < 2) return null;
  const start = parseInt(parts[0].trim(), 10);
  const endPart = parts[1].trim().split(' ')[0];
  const end = parseInt(endPart, 10);
  if (isNaN(start) || isNaN(end)) return null;
  return { start, end, days: end - start + 1 };
}

function computeTargetSummary(weekRanges, weeklyTargets, todayDate) {
  const todayDay = todayDate.getDate();
  const totalMTD = [1, 2, 3, 4].reduce((sum, w) => sum + (weeklyTargets[w] || 0), 0);

  let currentWeek = null;
  let wtdTarget = 0;
  let dailyTarget = 0;
  let mtdAchievableSoFar = 0; // sum of targets for days 1..today

  for (const wk of [1, 2, 3, 4]) {
    const range = parseWeekRange(weekRanges[wk]);
    if (!range) continue;

    const wTarget = weeklyTargets[wk] || 0;
    const dailyRate = range.days > 0 ? wTarget / range.days : 0;

    // Days elapsed in this week up to today
    if (todayDay >= range.start && todayDay <= range.end) {
      currentWeek = wk;
      wtdTarget = wTarget;
      dailyTarget = Math.round(dailyRate);
      const daysElapsed = todayDay - range.start + 1;
      mtdAchievableSoFar += Math.round(dailyRate * daysElapsed);
    } else if (todayDay > range.end) {
      // This week is fully in the past — count all its days
      mtdAchievableSoFar += wTarget;
    }
  }

  return { totalMTD, wtdTarget, dailyTarget, currentWeek, mtdAchievableSoFar };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/store-targets/flutter
//
// Query params:
//   storeName  (required)  – exact store name, e.g. "G-Edappally"
//   month      (optional)  – e.g. "July"  (defaults to current month)
//   year       (optional)  – e.g. 2026    (defaults to current year)
//
// Returns full target breakdown for the store + all its staff
// ─────────────────────────────────────────────────────────────────────────────
router.get('/flutter', MiddilWare, async (req, res) => {
  try {
    const today = new Date();
    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];

    const { storeName, month = monthNames[today.getMonth()], year = today.getFullYear() } = req.query;

    if (!storeName) {
      return res.status(400).json({ success: false, message: "storeName query param is required" });
    }

    // Fetch store-specific + global ("All") config for week ranges fallback
    const [storeDoc, globalDoc] = await Promise.all([
      StoreTarget.findOne({ storeName, month, year: Number(year) }).lean(),
      StoreTarget.findOne({ storeName: 'All', month, year: Number(year) }).lean()
    ]);

    const doc = storeDoc || globalDoc || null;

    if (!doc) {
      return res.status(200).json({
        success: true,
        storeName,
        month,
        year: Number(year),
        message: "No target configured for this store/month",
        store: null,
        staff: []
      });
    }

    // Merge week ranges: store-level overrides global
    const weekRanges = {
      1: storeDoc?.weekRanges?.[1] || globalDoc?.weekRanges?.[1] || 'Select Days',
      2: storeDoc?.weekRanges?.[2] || globalDoc?.weekRanges?.[2] || 'Select Days',
      3: storeDoc?.weekRanges?.[3] || globalDoc?.weekRanges?.[3] || 'Select Days',
      4: storeDoc?.weekRanges?.[4] || globalDoc?.weekRanges?.[4] || 'Select Days',
    };

    const weeklyTargets = doc.weeklyTargets || { 1: 0, 2: 0, 3: 0, 4: 0 };
    const summary = computeTargetSummary(weekRanges, weeklyTargets, today);

    // Build per-week detail
    const weeks = [1, 2, 3, 4].map(wk => ({
      week: wk,
      dateRange: weekRanges[wk],
      target: weeklyTargets[wk] || 0,
      isCurrent: summary.currentWeek === wk
    }));

    // Build per-staff detail
    const staff = (doc.employeeTargets || []).map(emp => {
      const empWeeklyTargets = emp.weeklyTargets || { 1: 0, 2: 0, 3: 0, 4: 0 };
      const empSummary = computeTargetSummary(weekRanges, empWeeklyTargets, today);
      return {
        staffName: emp.staffName,
        mtdTarget: empSummary.totalMTD,
        wtdTarget: empSummary.wtdTarget,
        dailyTarget: empSummary.dailyTarget,
        currentWeek: empSummary.currentWeek,
        mtdAchievableSoFar: empSummary.mtdAchievableSoFar,
        weeks: [1, 2, 3, 4].map(wk => ({
          week: wk,
          dateRange: weekRanges[wk],
          target: empWeeklyTargets[wk] || 0,
          isCurrent: empSummary.currentWeek === wk
        }))
      };
    });

    return res.status(200).json({
      success: true,
      storeName: doc.storeName,
      month: doc.month,
      year: doc.year,
      store: {
        mtdTarget: summary.totalMTD,
        wtdTarget: summary.wtdTarget,
        dailyTarget: summary.dailyTarget,
        currentWeek: summary.currentWeek,
        mtdAchievableSoFar: summary.mtdAchievableSoFar,
        weeks
      },
      staff
    });
  } catch (error) {
    console.error("Error in /store-targets/flutter:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET & POST /api/store-targets/week-by-date
//
// Parameters (Query or Body):
//   date       (optional) - date string (defaults to today/current date)
//   storeName  (optional) - store name (defaults to "All")
//   month      (optional) - month name (defaults to parsed month from date)
//   year       (optional) - year number (defaults to parsed year from date)
//
// Returns the week number, label, and ranges for the date based on config
// ─────────────────────────────────────────────────────────────────────────────
const getWeekByDateHandler = async (req, res) => {
  try {
    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];
    
    let dateVal = req.query.date || req.body.date;
    let parsedDate = new Date();
    if (dateVal) {
      parsedDate = new Date(dateVal);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format provided" });
      }
    }

    const day = parsedDate.getDate();
    const defaultMonthName = monthNames[parsedDate.getMonth()];
    const defaultYear = parsedDate.getFullYear();

    const storeName = req.query.storeName || req.body.storeName || 'All';
    const month = req.query.month || req.body.month || defaultMonthName;
    const year = Number(req.query.year || req.body.year || defaultYear);

    // Fetch store-specific + global ("All") config for week ranges fallback
    const [storeDoc, globalDoc] = await Promise.all([
      StoreTarget.findOne({ storeName, month, year }).lean(),
      StoreTarget.findOne({ storeName: 'All', month, year }).lean()
    ]);

    const weekRanges = {
      1: storeDoc?.weekRanges?.[1] || globalDoc?.weekRanges?.[1] || 'Select Days',
      2: storeDoc?.weekRanges?.[2] || globalDoc?.weekRanges?.[2] || 'Select Days',
      3: storeDoc?.weekRanges?.[3] || globalDoc?.weekRanges?.[3] || 'Select Days',
      4: storeDoc?.weekRanges?.[4] || globalDoc?.weekRanges?.[4] || 'Select Days',
    };

    let matchedWeek = null;
    let matchedRangeStr = null;
    let isConfigured = false;
    let configSource = 'fallback';

    for (const wk of [1, 2, 3, 4]) {
      // 1. Check store-specific range first
      const storeRangeStr = storeDoc?.weekRanges?.[wk];
      const storeRange = parseWeekRange(storeRangeStr);
      if (storeRange && day >= storeRange.start && day <= storeRange.end) {
        matchedWeek = wk;
        matchedRangeStr = storeRangeStr;
        isConfigured = true;
        configSource = 'store';
        break;
      }

      // 2. Check global "All" range second
      const globalRangeStr = globalDoc?.weekRanges?.[wk];
      const globalRange = parseWeekRange(globalRangeStr);
      if (globalRange && day >= globalRange.start && day <= globalRange.end) {
        matchedWeek = wk;
        matchedRangeStr = globalRangeStr;
        isConfigured = true;
        configSource = 'global';
        break;
      }
    }

    // Fallback standard weekly split
    if (matchedWeek === null) {
      if (day <= 7) {
        matchedWeek = 1;
        matchedRangeStr = `01 - 07 ${month.substring(0, 3)}`;
      } else if (day <= 14) {
        matchedWeek = 2;
        matchedRangeStr = `08 - 14 ${month.substring(0, 3)}`;
      } else if (day <= 21) {
        matchedWeek = 3;
        matchedRangeStr = `15 - 21 ${month.substring(0, 3)}`;
      } else {
        matchedWeek = 4;
        const lastDay = new Date(year, parsedDate.getMonth() + 1, 0).getDate();
        matchedRangeStr = `22 - ${lastDay} ${month.substring(0, 3)}`;
      }
      isConfigured = false;
      configSource = 'fallback';
    }

    // Build details for all weeks in the month
    const allWeeks = [1, 2, 3, 4].map(wk => {
      let rangeStr = weekRanges[wk];
      let isFallbackRange = false;
      if (!rangeStr || rangeStr === 'Select Days') {
        isFallbackRange = true;
        if (wk === 1) rangeStr = `01 - 07 ${month.substring(0, 3)}`;
        else if (wk === 2) rangeStr = `08 - 14 ${month.substring(0, 3)}`;
        else if (wk === 3) rangeStr = `15 - 21 ${month.substring(0, 3)}`;
        else {
          const lastDay = new Date(year, parsedDate.getMonth() + 1, 0).getDate();
          rangeStr = `22 - ${lastDay} ${month.substring(0, 3)}`;
        }
      }
      return {
        week: wk,
        weekLabel: `Week ${wk}`,
        dateRange: rangeStr,
        isFallback: isFallbackRange,
        isCurrent: matchedWeek === wk
      };
    });

    return res.status(200).json({
      success: true,
      storeName,
      month,
      year,
      inputDate: parsedDate.toISOString(),
      day,
      week: matchedWeek,
      weekLabel: `Week ${matchedWeek}`,
      dateRange: matchedRangeStr,
      isConfigured,
      configSource,
      storeConfig: {
        exists: !!storeDoc,
        weekRanges: storeDoc?.weekRanges || null
      },
      globalConfig: {
        exists: !!globalDoc,
        weekRanges: globalDoc?.weekRanges || null
      },
      allWeeks
    });
  } catch (error) {
    console.error("Error in /store-targets/week-by-date:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

router.get('/week-by-date', MiddilWare, getWeekByDateHandler);
router.post('/week-by-date', MiddilWare, getWeekByDateHandler);

// GET all store targets for a month and year
router.get('/', MiddilWare, async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = month;
    if (year) query.year = Number(year);

    const targets = await StoreTarget.find(query).lean();
    return res.status(200).json({ success: true, data: targets });
  } catch (error) {
    console.error("Error fetching StoreTargets:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST save/update a store target config
router.post('/', MiddilWare, async (req, res) => {
  try {
    const { storeName, month, year, weekRanges, weeklyTargets, employeeTargets } = req.body;
    if (!storeName || !month) {
      return res.status(400).json({ success: false, message: "storeName and month are required" });
    }

    const filter = { storeName, month, year: Number(year) || 2026 };
    const update = {
      weekRanges,
      weeklyTargets
    };
    if (employeeTargets !== undefined) {
      update.employeeTargets = employeeTargets;
    }

    const doc = await StoreTarget.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("Error saving StoreTarget:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

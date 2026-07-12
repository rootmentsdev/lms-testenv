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

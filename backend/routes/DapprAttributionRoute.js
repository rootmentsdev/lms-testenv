import express from 'express';
import mongoose from 'mongoose';
import { MiddilWare } from '../lib/middilWare.js';
import DapprAttribution from '../model/DapprAttribution.js';

const router = express.Router();

// GET attribution for specific store (or all stores), week, month, year
router.get('/', MiddilWare, async (req, res) => {
  try {
    const { storeName, month, year, week } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year are required" });
    }

    const query = { month, year: Number(year) };
    if (storeName && storeName !== 'All') {
      query.storeName = storeName;
    }
    if (week !== undefined && week !== null && week !== '' && week !== 'All') {
      query.week = Number(week);
    }

    if (storeName && storeName !== 'All' && week !== undefined && week !== null && week !== '' && week !== 'All') {
      const doc = await DapprAttribution.findOne(query).lean();
      return res.status(200).json({ success: true, data: doc });
    } else {
      const docs = await DapprAttribution.find(query).lean();
      return res.status(200).json({ success: true, data: docs });
    }
  } catch (error) {
    console.error("Error fetching DapprAttribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST save/update attribution
router.post('/', MiddilWare, async (req, res) => {
  try {
    const { storeName, month, year, week, attributions } = req.body;
    if (!storeName || !month || !year || week === undefined) {
      return res.status(400).json({ success: false, message: "storeName, month, year, and week are required" });
    }

    const filter = { storeName, month, year: Number(year), week: Number(week) };
    const update = { attributions };

    const doc = await DapprAttribution.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("Error saving DapprAttribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET mobile attribution details for Dappr data with resolved full user details (Flutter API)
router.get('/mobile-dappr', MiddilWare, async (req, res) => {
  try {
    const { month, year, week } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year are required parameters" });
    }

    const query = { month, year: Number(year) };
    if (week !== undefined && week !== null && week !== '' && week !== 'All') {
      query.week = Number(week);
    }

    // Fetch matching Dappr documents
    const dapprDocs = await DapprAttribution.find(query).lean();

    // Helper map: staffName (lowercase) -> { fullName, empID, storeName }
    const staffResolutionMap = new Map();

    // Fetch all Users to resolve details
    const usersList = await DapprAttribution.db.model('User').find({}, { username: 1, empID: 1, workingBranch: 1 }).lean();
    usersList.forEach(u => {
      if (u.username) {
        staffResolutionMap.set(u.username.trim().toLowerCase(), {
          fullName: u.username,
          empID: u.empID || '',
          storeName: u.workingBranch || ''
        });
      }
    });

    // Fetch all Employees to fallback details
    const employeesList = await DapprAttribution.db.model('Employee').find({}, { firstName: 1, lastName: 1, employeeId: 1, storeId: 1 }).populate('storeId', 'workingBranch').lean();
    employeesList.forEach(e => {
      const fullNameStr = `${e.firstName} ${e.lastName}`.trim();
      if (fullNameStr) {
        staffResolutionMap.set(fullNameStr.toLowerCase(), {
          fullName: fullNameStr,
          empID: e.employeeId || '',
          storeName: e.storeId?.workingBranch || ''
        });
      }
    });

    // Process Dappr Attributions
    const formattedDappr = [];
    dapprDocs.forEach(doc => {
      const store = doc.storeName;
      if (doc.attributions && Array.isArray(doc.attributions)) {
        doc.attributions.forEach(attr => {
          const resolved = staffResolutionMap.get(attr.staffName.trim().toLowerCase()) || {
            fullName: attr.staffName,
            empID: '',
            storeName: store
          };

          formattedDappr.push({
            employeeName: resolved.fullName,
            empID: resolved.empID,
            storeName: resolved.storeName || store,
            week: doc.week,
            month: doc.month,
            year: doc.year,
            billWtd: attr.valWtd ?? 0,
            valWtd: attr.billWtd ?? 0,
            qtyWtd: attr.qtyWtd ?? 0
          });
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: formattedDappr
    });
  } catch (error) {
    console.error("Error inside GET /mobile-dappr:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

export default router;

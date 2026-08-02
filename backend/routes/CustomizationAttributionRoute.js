import express from 'express';
import mongoose from 'mongoose';
import { MiddilWare } from '../lib/middilWare.js';
import CustomizationAttribution from '../model/CustomizationAttribution.js';

const router = express.Router();

// Helper to derive month name and year from date string (YYYY-MM-DD)
const getMonthAndYearFromDate = (dateStr) => {
  if (!dateStr) return { month: 'August', year: new Date().getFullYear(), week: 1 };
  const d = new Date(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[d.getMonth()] || 'August';
  const year = d.getFullYear() || new Date().getFullYear();
  const day = d.getDate();
  let week = 1;
  if (day > 21) week = 4;
  else if (day > 14) week = 3;
  else if (day > 7) week = 2;
  return { month, year, week };
};

// GET attribution entries by date, storeName, month, year, week
router.get('/', MiddilWare, async (req, res) => {
  try {
    const { storeName, date, month, year, week } = req.query;
    const query = {};

    if (date) {
      query.date = date;
    }
    if (month && month !== 'All') {
      query.month = month;
    }
    if (year && year !== 'All') {
      query.year = Number(year);
    }
    if (storeName && storeName !== 'All') {
      const clean = storeName.replace(/[^a-zA-Z0-9]/g, '');
      const edaClean = clean.toLowerCase().replace(/edappally/g, 'edapally');
      query.$or = [
        { storeName: storeName },
        { storeName: { $regex: new RegExp(`^${storeName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, 'i') } },
        { storeName: { $regex: new RegExp(clean.split('').join('[\\s-_.]*'), 'i') } },
        { storeName: { $regex: new RegExp(edaClean.replace(/edapally/g, 'edap?p?ally?1?'), 'i') } }
      ];
    }
    if (week !== undefined && week !== null && week !== '' && week !== 'All') {
      query.week = Number(week);
    }

    const docs = await CustomizationAttribution.find(query).sort({ date: -1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error("Error fetching CustomizationAttribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST save/update customization value entry
router.post('/', MiddilWare, async (req, res) => {
  try {
    const { storeName, date, totalValue, totalBills, totalQuantity, attributions } = req.body;
    let { month, year, week } = req.body;

    if (!storeName) {
      return res.status(400).json({ success: false, message: "storeName is required" });
    }

    const entryDate = date || new Date().toISOString().split('T')[0];
    const derived = getMonthAndYearFromDate(entryDate);

    month = month || derived.month;
    year = year ? Number(year) : derived.year;
    week = (week !== undefined && week !== null && week !== '') ? Number(week) : derived.week;

    const val = Number(totalValue || 0);
    const bills = Number(totalBills || 0);
    const qty = Number(totalQuantity || 0);

    const filter = { storeName, date: entryDate };
    const finalAttributions = (attributions && Array.isArray(attributions) && attributions.length > 0) 
      ? attributions 
      : [{
          staffName: 'Store Total',
          billWtd: val,
          valWtd: bills,
          qtyWtd: qty
        }];

    const update = {
      storeName,
      date: entryDate,
      month,
      year: Number(year),
      week: Number(week),
      totalValue: val,
      totalBills: bills,
      totalQuantity: qty,
      attributions: finalAttributions
    };

    const doc = await CustomizationAttribution.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("Error saving CustomizationAttribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// DELETE entry by ID
router.delete('/:id', MiddilWare, async (req, res) => {
  try {
    const { id } = req.params;
    await CustomizationAttribution.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting CustomizationAttribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET mobile attribution details for Customization data with resolved full user details (Flutter API)
router.get('/mobile-customization', MiddilWare, async (req, res) => {
  try {
    const { month, year, week } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: "month and year are required parameters" });
    }

    const query = { month, year: Number(year) };
    if (week !== undefined && week !== null && week !== '' && week !== 'All') {
      query.week = Number(week);
    }

    const customDocs = await CustomizationAttribution.find(query).lean();

    const staffResolutionMap = new Map();
    const usersList = await mongoose.model('User').find({}, { username: 1, empID: 1, workingBranch: 1 }).lean();
    usersList.forEach(u => {
      if (u.username) {
        staffResolutionMap.set(u.username.trim().toLowerCase(), {
          fullName: u.username,
          empID: u.empID || '',
          storeName: u.workingBranch || ''
        });
      }
    });

    const employeesList = await mongoose.model('Employee').find({}, { firstName: 1, lastName: 1, employeeId: 1, storeId: 1 }).populate('storeId', 'workingBranch').lean();
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

    const formattedCustomization = [];
    customDocs.forEach(doc => {
      const store = doc.storeName;
      if (doc.attributions && Array.isArray(doc.attributions)) {
        doc.attributions.forEach(attr => {
          const resolved = staffResolutionMap.get(attr.staffName.trim().toLowerCase()) || {
            fullName: attr.staffName,
            empID: '',
            storeName: store
          };

          formattedCustomization.push({
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
      data: formattedCustomization
    });
  } catch (error) {
    console.error("Error inside GET /mobile-customization:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

export default router;

import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import DapprAttribution from '../model/DapprAttribution.js';

const router = express.Router();

// GET attribution for specific store (or All stores), week, month, year
router.get('/', MiddilWare, async (req, res) => {
  try {
    const { storeName, month, year, week } = req.query;
    if (!month || !year || week === undefined) {
      return res.status(400).json({ success: false, message: "month, year, and week are required" });
    }

    let filter = { month, year: Number(year), week: Number(week) };
    if (storeName && storeName !== "All") {
      filter.storeName = storeName;
    }

    const docs = await DapprAttribution.find(filter).lean();
    if (!docs || docs.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const combinedAttributions = [];
    docs.forEach(doc => {
      if (Array.isArray(doc.attributions)) {
        combinedAttributions.push(...doc.attributions);
      }
    });

    return res.status(200).json({ 
      success: true, 
      data: {
        attributions: combinedAttributions
      } 
    });
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

export default router;

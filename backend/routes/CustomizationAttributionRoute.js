import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import CustomizationAttribution from '../model/CustomizationAttribution.js';

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
      const doc = await CustomizationAttribution.findOne(query).lean();
      return res.status(200).json({ success: true, data: doc });
    } else {
      const docs = await CustomizationAttribution.find(query).lean();
      return res.status(200).json({ success: true, data: docs });
    }
  } catch (error) {
    console.error("Error fetching CustomizationAttribution:", error);
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

    const doc = await CustomizationAttribution.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("Error saving CustomizationAttribution:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

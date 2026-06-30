import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import StoreTarget from '../model/StoreTarget.js';

const router = express.Router();

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
    const { storeName, month, year, weekRanges, weeklyTargets } = req.body;
    if (!storeName || !month) {
      return res.status(400).json({ success: false, message: "storeName and month are required" });
    }

    const filter = { storeName, month, year: Number(year) || 2026 };
    const update = {
      weekRanges,
      weeklyTargets
    };

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

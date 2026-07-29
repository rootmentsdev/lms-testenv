import express from 'express';
import { MiddilWare } from '../lib/middilWare.js';
import {
  upsertGoogleReview,
  getGoogleReviewDashboard,
  getGoogleReviewHistory,
} from '../controllers/GoogleReviewController.js';

const router = express.Router();

// POST   /api/google-reviews          — create/update today's entry
router.post('/', MiddilWare, upsertGoogleReview);

// GET    /api/google-reviews/dashboard — today/thisWeek/thisMonth/total per branch
router.get('/dashboard', MiddilWare, getGoogleReviewDashboard);

// GET    /api/google-reviews/history   — recent entries (optionally filtered by branchName)
router.get('/history', MiddilWare, getGoogleReviewHistory);

export default router;

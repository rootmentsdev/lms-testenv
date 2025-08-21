import express from 'express';
import {
    trackUserLogin,
    trackUserLogout,
    getLoginAnalytics,
    getUserLoginHistory,
    getActiveUsers
} from '../controllers/UserLoginController.js';
import { verifyJWT } from '../lib/JWT.js';

const router = express.Router();

// Track user login (called after successful authentication)
router.post('/track-login', verifyJWT, trackUserLogin);

// Track user logout
router.post('/track-logout', verifyJWT, trackUserLogout);

// Get login analytics (admin only)
router.get('/analytics', verifyJWT, getLoginAnalytics);

// Get user login history
router.get('/history/:userId', verifyJWT, getUserLoginHistory);

// Get real-time active users
router.get('/active-users', verifyJWT, getActiveUsers);

export default router;

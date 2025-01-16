import express from 'express';
import { handlePermissions, CreatingAdminUsers, getTopUsers, HomeBar, } from '../controllers/DestinationController.js';
import { AdminLogin, ChangeVisibility, getAllNotifications, getNotifications, getVisibility } from '../controllers/moduleController.js';
import { VerifyToken } from '../lib/VerifyJwt.js';

const router = express.Router();

// Route to create a user

router.get('/get/HomeProgressData', HomeBar)
router.get('/get/bestThreeUser', getTopUsers)
router.post('/admin/createadmin', CreatingAdminUsers)
router.post('/admin/permission', handlePermissions)
router.post('/setting/visibility', ChangeVisibility)
router.get('/get/setting/visibility', getVisibility)
router.post('/admin/login', AdminLogin)
router.post('/admin/verifyToken', VerifyToken)
router.get('/home/notification', getNotifications)
router.get('/home/AllNotification', getAllNotifications)
export default router;
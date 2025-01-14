import express from 'express';
import { handlePermissions, CreatingAdminUsers, getTopUsers, HomeBar, } from '../controllers/DestinationController.js';
import { ChangeVisibility, getVisibility } from '../controllers/moduleController.js';

const router = express.Router();

// Route to create a user

router.get('/get/HomeProgressData', HomeBar)
router.get('/get/bestThreeUser', getTopUsers)
router.post('/admin/createadmin', CreatingAdminUsers)
router.post('/admin/permission', handlePermissions)
router.post('/setting/visibility', ChangeVisibility)
router.get('/get/setting/visibility',getVisibility)
export default router;
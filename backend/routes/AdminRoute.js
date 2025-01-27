import express from 'express';
import { handlePermissions, CreatingAdminUsers, getTopUsers, HomeBar, } from '../controllers/DestinationController.js';
import { AdminLogin, ChangeVisibility, getAllNotifications, getEscalationLevel, getNotifications, GetSubroles, getVisibility, Subroles, upsertEscalationLevel } from '../controllers/moduleController.js';
import { VerifyToken } from '../lib/VerifyJwt.js';
import { FindOverDueAssessment } from '../controllers/AssessmentReassign.js';

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
router.post('/subroles', Subroles)
router.get('/getSubrole', GetSubroles)
router.post('/escalation/level', upsertEscalationLevel)
router.get('/escalation/level/get', getEscalationLevel)
router.get('/overdue/Assessment', FindOverDueAssessment)
export default router;